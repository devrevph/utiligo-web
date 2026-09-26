import { BoltMark } from "@/components/icons";

/** Shown instead of crashing when the build is missing required Firebase settings. */
export function ConfigError({ missing }: { missing: string[] }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-4 text-center">
      <span className="mb-6 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--brand-a)] to-[var(--brand-b)]">
        <BoltMark className="h-6 w-6 text-white" />
      </span>
      <h1 className="font-display text-3xl font-bold tracking-tight">Utiligo isn&apos;t set up yet</h1>
      <p className="mt-2 max-w-md text-muted">
        This deployment was built without its sign-in settings. Add these environment variables to the host, then redeploy:
      </p>
      <ul className="mt-4 rounded-xl border border-border bg-surface px-5 py-3 text-left font-mono text-sm text-ink">
        {missing.map((name) => (
          <li key={name}>{name}</li>
        ))}
      </ul>
    </div>
  );
}
