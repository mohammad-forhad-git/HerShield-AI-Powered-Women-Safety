"use client";

import * as React from "react";
import { Crosshair, Lock, MapPin, MousePointerClick, Shuffle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Select } from "@/components/ui/form";
import { MapView } from "./map-view";
import { LOCATION_SOURCE_LABEL, MOCK_LOCATIONS, type LocationSource } from "@/lib/constants";
import { cn } from "@/lib/utils";

export interface SharedLocation {
  latitude: number;
  longitude: number;
  label?: string | null;
  source: LocationSource;
  accuracy?: number | null;
}

/**
 * Location sharing control. Browser geolocation is only requested AFTER the
 * student explicitly confirms the consent dialog. Mock & manual options are
 * provided for demonstrations so no real location is required.
 */
export function LocationPicker({
  value,
  onChange,
  height = 280,
  compact = false,
}: {
  value: SharedLocation | null;
  onChange: (v: SharedLocation | null) => void;
  height?: number;
  compact?: boolean;
}) {
  const [consentOpen, setConsentOpen] = React.useState(false);
  const [locating, setLocating] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [mockId, setMockId] = React.useState("");

  function requestGps() {
    setConsentOpen(false);
    setError(null);
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setError("Geolocation is not supported by this browser. Use a mock location or pick on the map.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        onChange({
          latitude: Number(pos.coords.latitude.toFixed(6)),
          longitude: Number(pos.coords.longitude.toFixed(6)),
          accuracy: Math.round(pos.coords.accuracy),
          label: "Current device location",
          source: "GPS",
        });
      },
      (err) => {
        setLocating(false);
        setError(
          err.code === err.PERMISSION_DENIED
            ? "Location permission was denied. You can use a mock location or pick a point on the map instead."
            : "Could not get your location. Try again, use a mock location, or pick on the map.",
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  }

  function selectMock(id: string) {
    setMockId(id);
    const m = MOCK_LOCATIONS.find((x) => x.id === id);
    if (m) onChange({ latitude: m.lat, longitude: m.lng, label: m.label, source: "MOCK", accuracy: null });
  }

  function randomMock() {
    const m = MOCK_LOCATIONS[Math.floor(Math.random() * MOCK_LOCATIONS.length)];
    selectMock(m.id);
  }

  return (
    <div className="space-y-3">
      <div className={cn("grid gap-2", compact ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-1 sm:grid-cols-3")}>
        <Button variant="secondary" onClick={() => setConsentOpen(true)} loading={locating} className="justify-start">
          {!locating && <Crosshair className="h-4 w-4 text-royal" />} Share my current location
        </Button>
        <div className="flex gap-2">
          <Select
            aria-label="Choose a mock demo location"
            value={mockId}
            onChange={(e) => selectMock(e.target.value)}
            className="flex-1"
          >
            <option value="">Mock demo location…</option>
            {MOCK_LOCATIONS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </Select>
          <Button variant="secondary" size="icon" onClick={randomMock} aria-label="Random mock location" title="Random mock location">
            <Shuffle className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-dashed border-slate-300 px-3 text-xs text-slate-500">
          <MousePointerClick className="h-4 w-4 shrink-0" /> Or click on the map to pick manually
        </div>
      </div>

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-700">{error}</p>}

      <MapView
        height={height}
        picked={value ? { lat: value.latitude, lng: value.longitude } : null}
        onMapClick={(lat, lng) =>
          onChange({
            latitude: Number(lat.toFixed(6)),
            longitude: Number(lng.toFixed(6)),
            label: "Manually selected point",
            source: "MANUAL",
            accuracy: null,
          })
        }
      />

      {value ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-blue-50 px-4 py-3 text-sm ring-1 ring-blue-100">
          <div className="flex items-start gap-2.5">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-royal" />
            <div>
              <p className="font-semibold text-navy">
                {value.latitude.toFixed(5)}, {value.longitude.toFixed(5)}
              </p>
              <p className="text-xs text-slate-600">
                {value.label ? `${value.label} · ` : ""}
                {LOCATION_SOURCE_LABEL[value.source]}
                {value.accuracy ? ` · ±${value.accuracy} m` : ""}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => onChange(null)}>
            <Trash2 className="h-3.5 w-3.5" /> Remove
          </Button>
        </div>
      ) : (
        <p className="flex items-center gap-2 text-xs text-slate-500">
          <Lock className="h-3.5 w-3.5" /> No location attached. Coordinates are only visible to you and campus security.
        </p>
      )}

      <Dialog
        open={consentOpen}
        onClose={() => setConsentOpen(false)}
        icon={<Crosshair className="h-6 w-6" />}
        title="Share your device location?"
        description={
          <div className="space-y-2">
            <p>
              HerShield will ask your browser for your current coordinates. They will be attached to this report and
              shown <strong>only to you and authorised campus security</strong>.
            </p>
            <p className="text-xs text-slate-500">
              This is an academic prototype: location is never shared publicly or with any external service. For
              demonstrations you can use a mock location instead.
            </p>
          </div>
        }
        footer={
          <>
            <Button variant="secondary" onClick={() => setConsentOpen(false)}>
              Not now
            </Button>
            <Button onClick={requestGps}>I agree, share location</Button>
          </>
        }
      />
    </div>
  );
}
