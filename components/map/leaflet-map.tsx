"use client";

import "leaflet/dist/leaflet.css";
import * as React from "react";
import type { LatLngTuple } from "leaflet";
import { CircleMarker, MapContainer, Popup, TileLayer, Tooltip, useMap, useMapEvents } from "react-leaflet";
import { CAMPUS_CENTER } from "@/lib/constants";

export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  color: string;
  title: string;
  subtitle?: string;
  href?: string;
}

export interface LeafletMapProps {
  markers?: MapMarker[];
  center?: [number, number];
  zoom?: number;
  height?: number | string;
  selectedId?: string | null;
  onMarkerClick?: (id: string) => void;
  onMapClick?: (lat: number, lng: number) => void;
  picked?: { lat: number; lng: number } | null;
  fitToMarkers?: boolean;
}

function ClickHandler({ onMapClick }: { onMapClick?: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onMapClick?.(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function FlyTo({ target }: { target: LatLngTuple | null }) {
  const map = useMap();
  const lat = target?.[0];
  const lng = target?.[1];
  React.useEffect(() => {
    if (lat === undefined || lng === undefined) return;
    map.flyTo([lat, lng], Math.max(map.getZoom(), 16), { duration: 0.6 });
  }, [lat, lng, map]);
  return null;
}

function FitBounds({ points }: { points: LatLngTuple[] }) {
  const map = useMap();
  const key = points.map((p) => p.join(",")).join("|");
  React.useEffect(() => {
    if (points.length > 1) map.fitBounds(points, { padding: [40, 40], maxZoom: 17 });
    else if (points.length === 1) map.setView(points[0], 16);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, map]);
  return null;
}

export function LeafletMap({
  markers = [],
  center,
  zoom = 15,
  height = 360,
  selectedId,
  onMarkerClick,
  onMapClick,
  picked,
  fitToMarkers = false,
}: LeafletMapProps) {
  const start: LatLngTuple = center ?? (picked ? [picked.lat, picked.lng] : [CAMPUS_CENTER.lat, CAMPUS_CENTER.lng]);
  const selected = markers.find((m) => m.id === selectedId);
  const points = React.useMemo(() => markers.map((m) => [m.lat, m.lng] as LatLngTuple), [markers]);

  return (
    <div className="isolate overflow-hidden rounded-xl ring-1 ring-slate-200" style={{ height }}>
      <MapContainer center={start} zoom={zoom} scrollWheelZoom style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {onMapClick && <ClickHandler onMapClick={onMapClick} />}
        {fitToMarkers && <FitBounds points={points} />}
        <FlyTo target={selected ? [selected.lat, selected.lng] : picked ? [picked.lat, picked.lng] : null} />

        {markers.map((m) => {
          const isSel = m.id === selectedId;
          return (
            <CircleMarker
              key={m.id}
              center={[m.lat, m.lng]}
              radius={isSel ? 13 : 9}
              pathOptions={{
                color: "#ffffff",
                weight: isSel ? 3 : 2,
                fillColor: m.color,
                fillOpacity: 0.95,
              }}
              eventHandlers={{ click: () => onMarkerClick?.(m.id) }}
            >
              <Tooltip direction="top" offset={[0, -8]}>
                {m.title}
              </Tooltip>
              <Popup>
                <div style={{ minWidth: 180 }}>
                  <div style={{ fontWeight: 700, color: "#101828" }}>{m.title}</div>
                  {m.subtitle && <div style={{ color: "#475569", marginTop: 2 }}>{m.subtitle}</div>}
                  <div style={{ color: "#64748B", marginTop: 4, fontSize: 11 }}>
                    {m.lat.toFixed(5)}, {m.lng.toFixed(5)}
                  </div>
                  {m.href && (
                    <a href={m.href} style={{ display: "inline-block", marginTop: 6, color: "#2563EB", fontWeight: 600 }}>
                      Open incident details →
                    </a>
                  )}
                </div>
              </Popup>
            </CircleMarker>
          );
        })}

        {picked && (
          <CircleMarker
            center={[picked.lat, picked.lng]}
            radius={11}
            pathOptions={{ color: "#ffffff", weight: 3, fillColor: "#2563EB", fillOpacity: 1 }}
          >
            <Tooltip permanent direction="top" offset={[0, -10]}>
              Shared location
            </Tooltip>
          </CircleMarker>
        )}
      </MapContainer>
    </div>
  );
}
