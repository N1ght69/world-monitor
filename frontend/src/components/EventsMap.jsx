import React, { useEffect, useRef } from 'react';

const SEV_COLOR = { high: '#f85149', med: '#e3703a', low: '#d29922', base: '#1f6feb' };
const LAYER_COLOR = { conflict: '#8957e5', nuclear: '#d29922', military: '#1f6feb', energy: '#56d364', alerts: '#f85149' };

export default function EventsMap({ events }) {
  const mapRef = useRef(null);
  const leafletMap = useRef(null);
  const layerGroupRef = useRef(null);

  useEffect(() => {
    if (leafletMap.current) return;
    const L = window.L;
    if (!L) return;

    leafletMap.current = L.map(mapRef.current, {
      center: [20, 15], zoom: 3,
      zoomControl: false, attributionControl: false,
      minZoom: 2, maxZoom: 10,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(leafletMap.current);

    const style = document.createElement('style');
    style.textContent = '.map-tiles{filter:saturate(0.2) brightness(0.4) hue-rotate(195deg)} @keyframes pulse{0%{transform:scale(1);opacity:0.8}100%{transform:scale(2.5);opacity:0}}';
    document.head.appendChild(style);

    layerGroupRef.current = L.layerGroup().addTo(leafletMap.current);
  }, []);

  useEffect(() => {
    const L = window.L;
    if (!L || !layerGroupRef.current) return;
    layerGroupRef.current.clearLayers();

    events.forEach(e => {
      const col = LAYER_COLOR[e.layer] || SEV_COLOR[e.severity] || '#8b949e';
      const r = e.severity === 'high' ? 9 : e.severity === 'med' ? 7 : 5;
      const pulse = e.severity === 'high'
        ? `<div style="position:absolute;top:${-r/2}px;left:${-r/2}px;width:${r*3}px;height:${r*3}px;border-radius:50%;border:1.5px solid ${col};animation:pulse 2s ease-out infinite;pointer-events:none"></div>`
        : '';
      const icon = L.divIcon({
        className: '',
        html: `<div style="width:${r*2}px;height:${r*2}px;border-radius:50%;background:${col};opacity:0.9;border:1.5px solid rgba(255,255,255,0.3);box-shadow:0 0 ${r*2}px ${col}66;cursor:pointer;position:relative">${pulse}</div>`,
        iconSize: [r*2, r*2],
        iconAnchor: [r, r],
      });
      const marker = L.marker([e.lat, e.lon], { icon });
      marker.bindTooltip(`<b>${e.name}</b><br/><span style="color:#8b949e;font-size:10px">${e.detail}</span>`, {
        className: 'wm-tooltip', opacity: 1,
      });
      marker.addTo(layerGroupRef.current);
    });
  }, [events]);

  return (
    <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
      <style>{`.wm-tooltip{background:#161b22;border:1px solid #444c56;border-radius:5px;padding:6px 10px;font-family:system-ui;font-size:11px;color:#e6edf3;box-shadow:none}.wm-tooltip::before{display:none}.leaflet-tooltip-bottom::before{border-bottom-color:#444c56}`}</style>
    </div>
  );
}
