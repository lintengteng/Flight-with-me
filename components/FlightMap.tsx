import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Airport } from '../types';
import { TAIPEI_AIRPORT, PLANE_SVG_STRING } from '../constants';

// Fix for default Leaflet markers in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface FlightMapProps {
  destination: Airport | null;
  isFlying: boolean;
  totalDuration: number; // in seconds
  elapsedTime: number; // in seconds
}

// Dark Mode TPE Icon
const tpeIcon = L.divIcon({
  html: `<div class="flex items-center justify-center bg-[#2B2B2B] text-[#EDEDED] rounded-full w-8 h-8 text-[10px] font-bold border border-[#7FA4FF]/30 shadow-[0_0_10px_rgba(127,164,255,0.2)]">TPE</div>`,
  className: 'custom-airport-marker',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

// Dark Mode Destination Icon
const destIcon = (code: string) => L.divIcon({
  html: `<div class="flex items-center justify-center bg-[#1A1A1A] text-[#C8C8C8] rounded-full w-8 h-8 text-[10px] font-bold border border-[#404040] shadow-lg">${code}</div>`,
  className: 'custom-airport-marker',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

// Helper: Calculate bearing between two points
const getBearing = (startLat: number, startLng: number, destLat: number, destLng: number) => {
  const startLatRad = (startLat * Math.PI) / 180;
  const startLngRad = (startLng * Math.PI) / 180;
  const destLatRad = (destLat * Math.PI) / 180;
  const destLngRad = (destLng * Math.PI) / 180;

  const y = Math.sin(destLngRad - startLngRad) * Math.cos(destLatRad);
  const x =
    Math.cos(startLatRad) * Math.sin(destLatRad) -
    Math.sin(startLatRad) * Math.cos(destLatRad) * Math.cos(destLngRad - startLngRad);
  
  const brng = (Math.atan2(y, x) * 180) / Math.PI;
  return (brng + 360) % 360;
};

// Component to handle map view and smooth animation
const MapController: React.FC<{ 
  destination: Airport | null; 
  isFlying: boolean;
  totalDuration: number;
  elapsedTime: number; 
}> = ({ destination, isFlying, totalDuration, elapsedTime }) => {
  const map = useMap();
  const markerRef = useRef<L.Marker | null>(null);
  const reqRef = useRef<number | null>(null);
  const elapsedTimeRef = useRef<number>(elapsedTime);

  // Update ref when prop changes, but don't trigger re-renders of the animation loop
  useEffect(() => {
    elapsedTimeRef.current = elapsedTime;
  }, [elapsedTime]);

  // Handle View Bounds
  useEffect(() => {
    if (destination) {
      const bounds = L.latLngBounds(
        [TAIPEI_AIRPORT.coords.lat, TAIPEI_AIRPORT.coords.lng],
        [destination.coords.lat, destination.coords.lng]
      );
      map.fitBounds(bounds, { padding: [80, 80], animate: true, duration: 1.5 });
    } else {
      map.setView([TAIPEI_AIRPORT.coords.lat, TAIPEI_AIRPORT.coords.lng], 5, { animate: true });
    }
  }, [map, destination]);

  // Animation Loop - High Precision using performance.now()
  useEffect(() => {
    if (!destination || !isFlying) {
        // If not flying, ensure marker is at correct position based on static elapsed time
        if (markerRef.current && destination) {
             const progress = Math.min(1, Math.max(0, elapsedTime / totalDuration));
             const start = TAIPEI_AIRPORT.coords;
             const end = destination.coords;
             const lat = start.lat + (end.lat - start.lat) * progress;
             const lng = start.lng + (end.lng - start.lng) * progress;
             markerRef.current.setLatLng([lat, lng]);
        }
        return;
    }

    const startAnimationTime = performance.now();
    const startElapsed = elapsedTimeRef.current; 

    const animate = (time: number) => {
      if (!markerRef.current) return;

      // Calculate highly precise elapsed time
      // We rely on performance.now() delta added to the snapshot of elapsed time when animation started
      const deltaSeconds = (time - startAnimationTime) / 1000;
      const preciseElapsed = startElapsed + deltaSeconds;

      // Calculate progress (0 to 1)
      const progress = Math.min(1, Math.max(0, preciseElapsed / totalDuration));

      // Interpolate Position
      const start = TAIPEI_AIRPORT.coords;
      const end = destination.coords;
      
      const lat = start.lat + (end.lat - start.lat) * progress;
      const lng = start.lng + (end.lng - start.lng) * progress;

      // Update Marker
      markerRef.current.setLatLng([lat, lng]);

      // Calculate Rotation
      const bearing = getBearing(start.lat, start.lng, end.lat, end.lng);
      
      // Update rotation via DOM transform on icon
      const iconDiv = markerRef.current.getElement()?.querySelector('div');
      if (iconDiv) {
         iconDiv.style.transform = `rotate(${bearing}deg)`;
      }

      if (progress < 1) {
         reqRef.current = requestAnimationFrame(animate);
      }
    };

    reqRef.current = requestAnimationFrame(animate);

    return () => {
      if (reqRef.current) cancelAnimationFrame(reqRef.current);
    };
  }, [isFlying, destination, totalDuration]); // removed elapsedTime to prevent stuttering on 1s updates

  // Initial Marker Setup
  useEffect(() => {
    if (!markerRef.current) {
        const marker = L.marker([TAIPEI_AIRPORT.coords.lat, TAIPEI_AIRPORT.coords.lng], {
            icon: L.divIcon({
                html: `<div style="transition: transform 0.2s linear; filter: drop-shadow(0 0 5px rgba(255,255,255,0.2));">${PLANE_SVG_STRING}</div>`,
                className: 'plane-icon-container',
                iconSize: [20, 20], // Reduced size 50%
                iconAnchor: [10, 10] // Center anchor
            }),
            zIndexOffset: 1000
        });
        marker.addTo(map);
        markerRef.current = marker;
    }
    return () => {
        if (markerRef.current) {
            markerRef.current.remove();
            markerRef.current = null;
        }
    }
  }, [map]);

  return null;
};

const FlightMap: React.FC<FlightMapProps> = ({ destination, isFlying, totalDuration, elapsedTime }) => {
  const start = TAIPEI_AIRPORT.coords;
  const end = destination ? destination.coords : null;

  return (
    <MapContainer 
      center={[start.lat, start.lng]} 
      zoom={5} 
      scrollWheelZoom={false}
      zoomControl={false}
      style={{ height: '100%', width: '100%', background: '#0F0F0F' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      
      <Marker position={[start.lat, start.lng]} icon={tpeIcon} />
      
      {end && (
        <>
          <Marker position={[end.lat, end.lng]} icon={destIcon(destination!.code)} />
          <Polyline 
            positions={[[start.lat, start.lng], [end.lat, end.lng]]} 
            pathOptions={{ color: '#EDEDED', weight: 1.5, dashArray: '8, 12', opacity: 0.3 }} 
          />
        </>
      )}

      <MapController 
        destination={destination} 
        isFlying={isFlying} 
        totalDuration={totalDuration} 
        elapsedTime={elapsedTime} 
      />
      
    </MapContainer>
  );
};

export default FlightMap;