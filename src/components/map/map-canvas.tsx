"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useMemo } from "react";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";

export type LatLng = { latitude: number; longitude: number };

// Default markers reference image files that bundlers don't copy, so draw the pin inline.
const pinIcon = L.divIcon({
  className: "",
  html: `<svg width="34" height="44" viewBox="0 0 34 44" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M17 43s15-14.2 15-26A15 15 0 0 0 2 17c0 11.8 15 26 15 26Z" fill="#2563eb" stroke="#fff" stroke-width="2.5"/>
    <circle cx="17" cy="17" r="5.5" fill="#fff"/>
  </svg>`,
  iconSize: [34, 44],
  iconAnchor: [17, 43],
});

function ClickToPlace({ onPick }: { onPick: (p: LatLng) => void }) {
  useMapEvents({
    click(e) {
      onPick({ latitude: e.latlng.lat, longitude: e.latlng.lng });
    },
  });
  return null;
}

/** Re-centers the map whenever `focus` changes (search result, current location). */
function FlyTo({ focus }: { focus: (LatLng & { key: number }) | null }) {
  const map = useMap();
  useEffect(() => {
    if (focus) map.flyTo([focus.latitude, focus.longitude], Math.max(map.getZoom(), 17), { duration: 0.6 });
  }, [focus, map]);
  return null;
}

export default function MapCanvas({
  initialCenter,
  marker,
  focus,
  onPick,
}: {
  initialCenter: LatLng;
  marker: LatLng | null;
  focus: (LatLng & { key: number }) | null;
  onPick: (p: LatLng) => void;
}) {
  const eventHandlers = useMemo(
    () => ({
      dragend(e: L.DragEndEvent) {
        const ll = (e.target as L.Marker).getLatLng();
        onPick({ latitude: ll.lat, longitude: ll.lng });
      },
    }),
    [onPick],
  );

  return (
    <MapContainer
      center={[initialCenter.latitude, initialCenter.longitude]}
      zoom={marker ? 17 : 13}
      className="h-full w-full"
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClickToPlace onPick={onPick} />
      <FlyTo focus={focus} />
      {marker ? (
        <Marker
          position={[marker.latitude, marker.longitude]}
          icon={pinIcon}
          draggable
          eventHandlers={eventHandlers}
          keyboard={false}
        />
      ) : null}
    </MapContainer>
  );
}
