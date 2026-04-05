"use client";

import dynamic from "next/dynamic";
import { CAMPUS_CENTER, CAMPUS_ZOOM } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface MarkerData {
  lat: number;
  lng: number;
  title: string;
  id: string;
}

interface CampusMapProps {
  center?: { lat: number; lng: number };
  zoom?: number;
  markers?: MarkerData[];
  className?: string;
}

function CampusMapInner({
  center = CAMPUS_CENTER,
  zoom = CAMPUS_ZOOM,
  markers = [],
  className,
}: CampusMapProps) {
  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={zoom}
      className={cn("h-[400px] w-full rounded-lg", className)}
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {markers.map((marker) => (
        <Marker
          key={marker.id}
          position={[marker.lat, marker.lng]}
          icon={defaultIcon}
        >
          <Popup>
            <a href={`/items/${marker.id}`} className="font-medium text-sm">
              {marker.title}
            </a>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

const CampusMap = dynamic(() => Promise.resolve(CampusMapInner), {
  ssr: false,
  loading: () => (
    <div className="flex h-[400px] w-full items-center justify-center rounded-lg bg-muted">
      <p className="text-sm text-muted-foreground">Loading map...</p>
    </div>
  ),
});

export default CampusMap;
export { CampusMap };
