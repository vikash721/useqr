"use client";

import { useState, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import { MapPin, Search, Loader2, Clipboard, Info } from "lucide-react";
import { useCreateQRStore } from "@/stores/useCreateQRStore";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const GeoLockMap = dynamic(() => import("./GeoLockMap"), { ssr: false });

type NominatimResult = {
  display_name: string;
  lat: string;
  lon: string;
};

export function GeoLockSection() {
  const geoLockEnabled = useCreateQRStore((s) => s.geoLockEnabled);
  const geoLockLat = useCreateQRStore((s) => s.geoLockLat);
  const geoLockLng = useCreateQRStore((s) => s.geoLockLng);
  const geoLockRadius = useCreateQRStore((s) => s.geoLockRadius);
  const setGeoLockEnabled = useCreateQRStore((s) => s.setGeoLockEnabled);
  const setGeoLockLat = useCreateQRStore((s) => s.setGeoLockLat);
  const setGeoLockLng = useCreateQRStore((s) => s.setGeoLockLng);
  const setGeoLockRadius = useCreateQRStore((s) => s.setGeoLockRadius);

  // Manual lat/lng inputs (local strings so user can type freely)
  const [manualLat, setManualLat] = useState(geoLockLat?.toFixed(6) ?? "");
  const [manualLng, setManualLng] = useState(geoLockLng?.toFixed(6) ?? "");
  const [latError, setLatError] = useState<string | null>(null);
  const [lngError, setLngError] = useState<string | null>(null);
  const [coordsInput, setCoordsInput] = useState("");
  const [coordsParsed, setCoordsParsed] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<NominatimResult[]>([]);
  const [searching, setSearching] = useState(false);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // When map is clicked → update manual fields too
  const handleLocationSelect = (lat: number, lng: number) => {
    setGeoLockLat(lat);
    setGeoLockLng(lng);
    setManualLat(lat.toFixed(6));
    setManualLng(lng.toFixed(6));
    setCoordsInput(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    setCoordsParsed(false);
    setLatError(null);
    setLngError(null);
  };

  /**
   * Try to parse a "lat, lng" string (Google Maps format).
   * Supports: "28.484, 77.336" or "28.484 77.336" or "28.484,77.336"
   */
  const tryParseCoordsPair = (value: string): { lat: number; lng: number } | null => {
    const cleaned = value.trim();
    // Match: number (comma or space) number
    const match = cleaned.match(/^(-?\d+\.?\d*)\s*[,\s]\s*(-?\d+\.?\d*)$/);
    if (!match) return null;
    const lat = parseFloat(match[1]);
    const lng = parseFloat(match[2]);
    if (isNaN(lat) || isNaN(lng)) return null;
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
    return { lat, lng };
  };

  const handleCoordsInput = (value: string) => {
    setCoordsInput(value);
    setCoordsParsed(false);
    const parsed = tryParseCoordsPair(value);
    if (parsed) {
      setGeoLockLat(parsed.lat);
      setGeoLockLng(parsed.lng);
      setManualLat(parsed.lat.toFixed(6));
      setManualLng(parsed.lng.toFixed(6));
      setLatError(null);
      setLngError(null);
      setCoordsParsed(true);
    }
  };

  // Validate + apply manual lat
  const applyManualLat = (value: string) => {
    setManualLat(value);
    const num = parseFloat(value);
    if (value.trim() === "" || isNaN(num)) {
      setLatError("Enter a valid number");
      return;
    }
    if (num < -90 || num > 90) {
      setLatError("Must be between -90 and 90");
      return;
    }
    setLatError(null);
    setGeoLockLat(num);
  };

  // Validate + apply manual lng
  const applyManualLng = (value: string) => {
    setManualLng(value);
    const num = parseFloat(value);
    if (value.trim() === "" || isNaN(num)) {
      setLngError("Enter a valid number");
      return;
    }
    if (num < -180 || num > 180) {
      setLngError("Must be between -180 and 180");
      return;
    }
    setLngError(null);
    setGeoLockLng(num);
  };

  // Nominatim search
  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(query.trim())}`,
        { headers: { "Accept-Language": "en", "User-Agent": "UseQR/1.0" } }
      );
      if (res.ok) {
        const data = (await res.json()) as NominatimResult[];
        setSearchResults(data);
      }
    } catch (err) {
      console.error("[GeoLock] Nominatim search failed:", err);
    } finally {
      setSearching(false);
    }
  }, []);

  const onSearchInput = (value: string) => {
    setSearchQuery(value);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => handleSearch(value), 400);
  };

  const onSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
      handleSearch(searchQuery);
    }
  };

  const pickSearchResult = (r: NominatimResult) => {
    const lat = parseFloat(r.lat);
    const lng = parseFloat(r.lon);
    setGeoLockLat(lat);
    setGeoLockLng(lng);
    setManualLat(lat.toFixed(6));
    setManualLng(lng.toFixed(6));
    setCoordsInput(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    setCoordsParsed(false);
    setLatError(null);
    setLngError(null);
    setSearchQuery(r.display_name);
    setSearchResults([]);
  };

  const formatRadius = (r: number) => {
    if (r >= 1000) return `${(r / 1000).toFixed(1)} km`;
    return `${r} m`;
  };

  return (
    <section
      className="rounded-xl border border-border bg-card p-6 shadow-sm ring-1 ring-border/50"
      aria-labelledby="qr-geolock-heading"
    >
      {/* Toggle header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-emerald-500/15 text-emerald-500">
            <MapPin className="size-4" aria-hidden />
          </div>
          <div>
            <h2
              id="qr-geolock-heading"
              className="text-sm font-semibold tracking-wide text-foreground"
            >
              Location lock
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Restrict this QR so it only works within a specific area. Scanners outside the radius are blocked.
            </p>
          </div>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={geoLockEnabled}
          aria-labelledby="qr-geolock-heading"
          onClick={() => setGeoLockEnabled(!geoLockEnabled)}
          className={cn(
            "relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            geoLockEnabled
              ? "border-emerald-500 bg-emerald-500"
              : "border-border bg-muted"
          )}
        >
          <span
            className={cn(
              "pointer-events-none inline-block size-6 translate-y-0 rounded-full bg-white shadow-sm ring-0 transition-transform",
              geoLockEnabled ? "translate-x-5" : "translate-x-0.5"
            )}
          />
        </button>
      </div>

      {/* Expanded content */}
      {geoLockEnabled && (
        <div className="mt-5 space-y-4">
          {/* Search location */}
          <div className="relative">
            <label htmlFor="geo-search" className="mb-1.5 block text-sm font-medium text-foreground">
              Search location
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="geo-search"
                  type="text"
                  placeholder="Search city, address, or place…"
                  value={searchQuery}
                  onChange={(e) => onSearchInput(e.target.value)}
                  onKeyDown={onSearchKeyDown}
                  className="pl-9 border-border bg-background focus-visible:border-emerald-500/50 focus-visible:ring-emerald-500/25"
                />
                {searching && (
                  <Loader2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
                )}
              </div>
              <button
                type="button"
                onClick={() => handleSearch(searchQuery)}
                disabled={searching || !searchQuery.trim()}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg px-4 text-sm font-medium transition-colors",
                  "bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                <Search className="size-3.5" />
                Search
              </button>
            </div>
            {searchResults.length > 0 && (
              <ul className="absolute z-50 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-border bg-card shadow-lg">
                {searchResults.map((r, i) => (
                  <li key={i}>
                    <button
                      type="button"
                      onClick={() => pickSearchResult(r)}
                      className="flex w-full items-start gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-accent"
                    >
                      <MapPin className="mt-0.5 size-3.5 shrink-0 text-emerald-500" />
                      <span className="line-clamp-2 text-foreground">{r.display_name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Map */}
          <div>
            <p className="mb-2 text-xs text-muted-foreground">
              Click on the map to set the allowed location, or enter coordinates manually below.
            </p>
            <GeoLockMap
              lat={geoLockLat}
              lng={geoLockLng}
              radius={geoLockRadius}
              onLocationSelect={handleLocationSelect}
            />
          </div>

          {/* Paste coordinates from Google Maps */}
          <div className="rounded-lg border border-dashed border-emerald-500/40 bg-emerald-500/5 p-3">
            <label htmlFor="geo-coords" className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground">
              <Clipboard className="size-3.5 text-emerald-500" />
              Paste coordinates
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="size-3.5 cursor-help text-muted-foreground/60 transition-colors hover:text-foreground" />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-[240px]">
                    Copy coordinates from Google Maps and paste them here. Format: lat, lng (e.g. 28.4848, 77.3369). Both fields below will fill automatically.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </label>
            <div className="relative">
              <Input
                id="geo-coords"
                type="text"
                placeholder="e.g. 28.48480, 77.33689"
                value={coordsInput}
                onChange={(e) => handleCoordsInput(e.target.value)}
                className={cn(
                  "border-border bg-background focus-visible:border-emerald-500/50 focus-visible:ring-emerald-500/25",
                  coordsParsed && "border-emerald-500/50 ring-1 ring-emerald-500/20"
                )}
              />
              {coordsParsed && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-emerald-500">
                  ✓ Parsed
                </span>
              )}
            </div>
            <p className="mt-1.5 text-[11px] text-muted-foreground">
              Right-click on Google Maps → <span className="font-medium">Copy coordinates</span> → Paste here.
            </p>
          </div>

          {/* Individual lat/lng for fine-tuning */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="geo-lat" className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground">
                Latitude
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="size-3.5 cursor-help text-muted-foreground/60 transition-colors hover:text-foreground" />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-[200px]">
                      Shows the vertical position of a location on the map (up or down).
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </label>
              <Input
                id="geo-lat"
                type="text"
                inputMode="decimal"
                placeholder="e.g. 28.6139"
                value={manualLat}
                onChange={(e) => applyManualLat(e.target.value)}
                className={cn(
                  "border-border bg-background focus-visible:border-emerald-500/50 focus-visible:ring-emerald-500/25",
                  latError && "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/25"
                )}
              />
              {latError && <p className="mt-1 text-xs text-destructive">{latError}</p>}
            </div>
            <div>
              <label htmlFor="geo-lng" className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground">
                Longitude
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="size-3.5 cursor-help text-muted-foreground/60 transition-colors hover:text-foreground" />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-[200px]">
                      Shows the horizontal position of a location on the map (left or right).
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </label>
              <Input
                id="geo-lng"
                type="text"
                inputMode="decimal"
                placeholder="e.g. 77.2090"
                value={manualLng}
                onChange={(e) => applyManualLng(e.target.value)}
                className={cn(
                  "border-border bg-background focus-visible:border-emerald-500/50 focus-visible:ring-emerald-500/25",
                  lngError && "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/25"
                )}
              />
              {lngError && <p className="mt-1 text-xs text-destructive">{lngError}</p>}
            </div>
          </div>

          {/* Radius slider */}
          <div>
            <label
              htmlFor="geo-radius"
              className="mb-1.5 flex items-center justify-between text-sm font-medium text-foreground"
            >
              <span>Allowed radius</span>
              <span className="text-xs font-normal text-muted-foreground">
                {formatRadius(geoLockRadius)}
              </span>
            </label>
            <input
              id="geo-radius"
              type="range"
              min={30}
              max={5000}
              step={10}
              value={geoLockRadius}
              onChange={(e) => setGeoLockRadius(Number(e.target.value))}
              className="w-full accent-emerald-500"
            />
            <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
              <span>30 m</span>
              <span>5 km</span>
            </div>
          </div>

          {/* Status message */}
          <p className="flex items-center gap-2 rounded-md border border-border/80 bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
            {geoLockLat != null && geoLockLng != null ? (
              <>
                <span className="size-1.5 shrink-0 rounded-full bg-emerald-500" />
                Location lock active — only scanners within {formatRadius(geoLockRadius)} of the marker can access this QR.
              </>
            ) : (
              <>
                <span className="size-1.5 shrink-0 rounded-full bg-amber-500" />
                Search for a place, click on the map, or enter coordinates to set a location.
              </>
            )}
          </p>
        </div>
      )}
    </section>
  );
}
