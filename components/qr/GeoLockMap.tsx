"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet's default icon paths (broken in Next.js bundling)
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

type GeoLockMapProps = {
  lat: number | null;
  lng: number | null;
  radius: number;
  onLocationSelect: (lat: number, lng: number) => void;
};

export default function GeoLockMap({ lat, lng, radius, onLocationSelect }: GeoLockMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const circleRef = useRef<L.Circle | null>(null);

  // Initialize map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const defaultCenter: [number, number] = lat != null && lng != null ? [lat, lng] : [20, 0];
    const defaultZoom = lat != null ? 14 : 2;

    const map = L.map(containerRef.current, {
      center: defaultCenter,
      zoom: defaultZoom,
      scrollWheelZoom: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
      maxZoom: 19,
    }).addTo(map);

    map.on("click", (e: L.LeafletMouseEvent) => {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    });

    // If no location set, try to get user's location for centering
    if (lat == null || lng == null) {
      if (typeof navigator !== "undefined" && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            map.setView([pos.coords.latitude, pos.coords.longitude], 14);
          },
          () => {
            // Silently fail — map stays at world view
          },
          { enableHighAccuracy: false, timeout: 5000 }
        );
      }
    }

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update marker + circle when lat/lng/radius change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear old markers
    if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }
    if (circleRef.current) {
      circleRef.current.remove();
      circleRef.current = null;
    }

    if (lat != null && lng != null) {
      markerRef.current = L.marker([lat, lng]).addTo(map);
      circleRef.current = L.circle([lat, lng], {
        radius,
        color: "#10b981",
        fillColor: "#10b981",
        fillOpacity: 0.15,
        weight: 2,
      }).addTo(map);

      // Fit map to circle bounds
      map.fitBounds(circleRef.current.getBounds(), { padding: [30, 30], maxZoom: 17 });
    }
  }, [lat, lng, radius]);

  return (
    <div
      ref={containerRef}
      className="h-[300px] w-full rounded-lg border border-border overflow-hidden"
      style={{ zIndex: 0 }}
    />
  );
}
