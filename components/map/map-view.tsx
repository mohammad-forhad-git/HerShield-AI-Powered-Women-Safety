"use client";

import dynamic from "next/dynamic";
import type { LeafletMapProps } from "./leaflet-map";

export type { MapMarker } from "./leaflet-map";

/** Leaflet needs `window`, so the map is only rendered in the browser. */
const LeafletMap = dynamic(() => import("./leaflet-map").then((m) => m.LeafletMap), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-[240px] w-full animate-pulse items-center justify-center rounded-xl bg-slate-100 text-sm text-slate-400">
      Loading map…
    </div>
  ),
});

export function MapView(props: LeafletMapProps) {
  return <LeafletMap {...props} />;
}
