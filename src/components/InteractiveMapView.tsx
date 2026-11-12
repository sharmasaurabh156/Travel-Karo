import React, { useEffect, useRef } from 'react';
import { TripActivity } from '../types';
import L from 'leaflet';

interface InteractiveMapViewProps {
  destinationName: string;
  activities: TripActivity[];
  centerLat?: number;
  centerLng?: number;
  showRoute?: boolean;
}

// Fallback Indian Destination Coordinates
const DEST_COORDS: Record<string, [number, number]> = {
  'Goa': [15.4989, 73.8278],
  'Varanasi': [25.3176, 82.9739],
  'Manali': [32.2432, 77.1892],
  'Ayodhya': [26.7922, 82.1998],
  'Jaipur': [26.9124, 75.7873],
  'Rishikesh': [30.0869, 78.2676],
  'Munnar': [10.0889, 77.0595],
  'Leh Ladakh': [34.1526, 77.5771],
  'Hampi': [15.3350, 76.4600],
  'Amritsar': [31.6340, 74.8723],
  'Agra (Taj Mahal)': [27.1751, 78.0421]
};

export const InteractiveMapView: React.FC<InteractiveMapViewProps> = ({
  destinationName,
  activities,
  centerLat,
  centerLng,
  showRoute = true
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Cleanup previous map if any
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const defaultCoord: [number, number] = centerLat != null && centerLng != null
      ? [centerLat, centerLng] 
      : (DEST_COORDS[destinationName] || [15.4989, 73.8278]);

    const map = L.map(mapContainerRef.current).setView(defaultCoord, 12);
    mapInstanceRef.current = map;

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(map);

    // Marker coordinates array for polyline route
    const routePoints: [number, number][] = [];

    const mappedActivities = activities.filter(
      (activity): activity is TripActivity & { lat: number; lng: number } =>
        Number.isFinite(activity.lat) && Number.isFinite(activity.lng)
    );

    mappedActivities.forEach((act, idx) => {
      const { lat, lng } = act;
      routePoints.push([lat, lng]);

      // Custom colored HTML icon with stop number
      const markerColor = act.category === 'hotel' ? '#3b82f6' : act.category === 'restaurant' ? '#f97316' : '#0d9488';
      const customHtml = `
        <div style="
          background-color: ${markerColor};
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 11px;
          border: 2px solid white;
          box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        ">
          ${idx + 1}
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-map-pin',
        html: customHtml,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      const popupContent = `
        <div style="font-family: sans-serif; min-width: 180px; padding: 4px;">
          <div style="font-size: 10px; font-weight: bold; text-transform: uppercase; color: ${markerColor};">
            Stop #${idx + 1} • ${act.category}
          </div>
          <div style="font-size: 13px; font-weight: bold; margin-top: 2px; color: #0f172a;">
            ${act.placeName}
          </div>
          ${act.time ? `<div style="font-size: 11px; color: #64748b; margin-top: 4px;">Scheduled: <strong>${act.time}</strong>${act.durationMinutes ? ` (${act.durationMinutes}m)` : ''}</div>` : ''}
          <a 
            href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(act.placeName + ' ' + destinationName)}"
            target="_blank" 
            rel="noopener noreferrer"
            style="display: inline-block; margin-top: 8px; font-size: 11px; font-weight: bold; color: #006b5f; text-decoration: none;"
          >
            Open in Google Maps ↗
          </a>
        </div>
      `;

      L.marker([lat, lng], { icon: customIcon })
        .addTo(map)
        .bindPopup(popupContent);
    });

    // Draw connected path if more than 1 point
    if (showRoute && routePoints.length > 1) {
      const polyline = L.polyline(routePoints, {
        color: '#006b5f',
        weight: 3.5,
        opacity: 0.8,
        dashArray: '6, 8'
      }).addTo(map);

      map.fitBounds(polyline.getBounds(), { padding: [40, 40] });
    } else if (routePoints.length > 1) {
      map.fitBounds(L.latLngBounds(routePoints), { padding: [40, 40] });
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [destinationName, activities, centerLat, centerLng, showRoute]);

  return (
    <div className="w-full h-full min-h-[350px] relative rounded-2xl overflow-hidden shadow-inner border border-slate-200">
      <div ref={mapContainerRef} className="w-full h-full" style={{ minHeight: '380px' }} />
    </div>
  );
};
