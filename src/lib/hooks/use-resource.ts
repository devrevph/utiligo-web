"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type State<T> = { data: T | null; error: string | null; loading: boolean };

/**
 * Fetches on mount and whenever `key` changes; `reload()` refetches (keeping
 * the current data on screen). Late responses from a superseded request are
 * ignored, so a slow first load can't overwrite a newer one.
 */
export function useResource<T>(fetcher: () => Promise<T>, key: string, errorFallback = "Something went wrong.") {
  const [state, setState] = useState<State<T>>({ data: null, error: null, loading: true });
  const [nonce, setNonce] = useState(0);
  const fetcherRef = useRef(fetcher);
  useEffect(() => {
    fetcherRef.current = fetcher;
  });

  useEffect(() => {
    let ignore = false;
    fetcherRef.current().then(
      (data) => {
        if (!ignore) setState({ data, error: null, loading: false });
      },
      (e: unknown) => {
        if (ignore) return;
        const message = e instanceof Error && e.message ? e.message : errorFallback;
        setState((s) => ({ ...s, error: message, loading: false }));
      },
    );
    return () => {
      ignore = true;
    };
  }, [key, nonce, errorFallback]);

  const reload = useCallback(() => {
    setState((s) => ({ ...s, error: null, loading: true }));
    setNonce((n) => n + 1);
  }, []);

  const setData = useCallback((update: (prev: T | null) => T | null) => {
    setState((s) => ({ ...s, data: update(s.data) }));
  }, []);

  return { ...state, reload, setData };
}
