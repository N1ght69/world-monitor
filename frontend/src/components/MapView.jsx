import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import useStore from '../store';

const LAYER_COLOR = { conflict: '#8957e5', nuclear: '#d29922', military: '#1f6feb', energy: '#56d364', alerts: '#f85149', sanctions: '#e3703a' };
const SEV_COLOR   = { high: '#f85149', med: '#e3703a', low: '#d29922', base: '#1f6feb' };
const SEV_RADIUS  = { high: 9, med: 7, low: 5, base: 5 };

const REGION_COORDS = {
  'WORLD':        { center: [20, 15],  zoom: 3 },
  'EUROPE':       { center: [54, 15],  zoom: 4 },
  'MIDDLE EAST':  { center: [27, 42],  zoom: 5 },
  'ASIA-PACIFIC': { center: [20, 115], zoom: 4 },
  'AMERICAS':     { center: [15, -80], zoom: 3 },
  'AFRICA':       { center: [5,   20], zoom: 4 },
};

function RegionFlyTo() {
  const map = useMap();
  const currentRegion = useStore((s) => s.currentRegion);
  const prevRegion = useRef(null);

  useEffect(() => {
    if (currentRegion === prevRegion.current) return;
    prevRegion.current = currentRegion;
    const r = REGION_COORDS[currentRegion];
    if (r) map.flyTo(r.center, r.zoom, { duration: 1.2 });
  }, [currentRegion, map]);

  useEffect(() => {
    const handler = () => map.flyTo([20, 15], 3, { duration: 1 });
    window.addEventListener('map:reset', handler);
    return () => window.removeEventListener('map:reset', handler);
  }, [map]);

  return null;
}

export default function MapView() {
  const events      = useStore((s) => s.events);
  const layers      = useStore((s) => s.layers);
  const searchQuery = useStore((s) => s.searchQuery);

  const visible = events.filter((e) => {
    if (!layers[e.layer]) return false;
    if (searchQuery && !e.name?.toLowerCase().includes(searchQuery) && !e.detail?.toLowerCase().includes(searchQuery)) return false;
    return true;
  });

  return (
    <MapContainer
      center={[20, 15]} zoom={3}
      style={{ flex: 1, height: '100%', background: 'var(--bg)' }}
      zoomControl={false}
      attributionControl={false}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
        className="map-tiles"
      />
      <RegionFlyTo />
      {visible.map((e) => {
        const col = LAYER_COLOR[e.layer] || SEV_COLOR[e.severity] || '#8b949e';
        const r   = SEV_RADIUS[e.severity] || 5;
        return (
          <CircleMarker
            key={e.id}
            center={[e.lat, e.lon]}
            radius={r}
            pathOptions={{ color: col, fillColor: col, fillOpacity: 0.85, weight: 1.5 }}>
            <Popup>
              <div style={{ fontFamily: 'var(--font)', minWidth: 180 }}>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: col, marginBottom: 4 }}>{e.layer}</div>
                <div style={{ fontWeight: 600, fontSize: 12, marginBottom: 3 }}>{e.name}</div>
                <div style={{ fontSize: 10, color: 'var(--text2)', lineHeight: 1.5 }}>{e.detail}</div>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
