"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { CAMPUS_CENTER, CAMPUS_ZOOM } from "@/lib/constants";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix leaflet default marker icon
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface LocationDisplayProps {
  lat: number;
  lng: number;
  title: string;
}

export function LocationDisplay({ lat, lng, title }: LocationDisplayProps) {
  return (
    <MapContainer
      center={[lat || CAMPUS_CENTER.lat, lng || CAMPUS_CENTER.lng]}
      zoom={CAMPUS_ZOOM}
      className="h-full w-full"
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[lat, lng]} icon={icon}>
        <Popup>{title}</Popup>
      </Marker>
    </MapContainer>
  );
}
