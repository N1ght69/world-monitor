import React, { useEffect, useRef } from 'react';
import useStore from '../store';

const LAYER_COLOR = { conflict: '#8957e5', nuclear: '#d29922', military: '#1f6feb', energy: '#56d364', alerts: '#f85149', sanctions: '#e3703a' };
const SEV_COLOR   = { high: '#f85149', med: '#e3703a', low: '#d29922', base: '#1f6feb' };

function getColor(e) {
  return LAYER_COLOR[e.layer] || SEV_COLOR[e.severity] || '#8b949e';
}

const REGION_POV = {
  'WORLD':        { lat: 20, lng: 15,  altitude: 2.5 },
  'EUROPE':       { lat: 54, lng: 15,  altitude: 1.2 },
  'MIDDLE EAST':  { lat: 27, lng: 42,  altitude: 1.0 },
  'ASIA-PACIFIC': { lat: 20, lng: 115, altitude: 1.5 },
  'AMERICAS':     { lat: 15, lng: -80, altitude: 1.8 },
  'AFRICA':       { lat: 5,  lng: 20,  altitude: 1.5 },
};

export default function GlobeView() {
  const containerRef = useRef(null);
  const globeRef     = useRef(null);

  const events       = useStore((s) => s.events);
  const layers       = useStore((s) => s.layers);
  const searchQuery  = useStore((s) => s.searchQuery);
  const currentRegion= useStore((s) => s.currentRegion);

  const visible = events.filter((e) => {
    if (!layers[e.layer]) return false;
    if (searchQuery && !e.name?.toLowerCase().includes(searchQuery) && !e.detail?.toLowerCase().includes(searchQuery)) return false;
    return true;
  });

  // Init globe once
  useEffect(() => {
    let globe = null;
    import('globe.gl').then((mod) => {
      const Globe = mod.default;
      globe = Globe()(containerRef.current);
      globe
        .globeImageUrl('https://unpkg.com/three-globe/example/img/earth-night.jpg')
        .bumpImageUrl('https://unpkg.com/three-globe/example/img/earth-topology.png')
        .backgroundImageUrl('https://unpkg.com/three-globe/example/img/night-sky.png')
        .atmosphereColor('#1a4a8a')
        .atmosphereAltitude(0.18)
        .pointsData([])
        .pointLat('lat').pointLng('lng')
        .pointColor('color').pointRadius('size').pointAltitude('altitude')
        .pointLabel((d) => `<div style="background:rgba(13,17,23,0.9);border:1px solid #444c56;border-radius:4px;padding:6px 10px;font-family:sans-serif;font-size:11px;max-width:200px"><div style="color:${d.color};font-size:9px;font-weight:700;letter-spacing:1px;margin-bottom:3px">${d.layer?.toUpperCase()}</div><div style="color:#e6edf3;font-weight:600;margin-bottom:2px">${d.label}</div><div style="color:#8b949e;font-size:10px">${d.detail}</div></div>`)
        .ringsData([])
        .ringColor('color').ringMaxRadius('maxR').ringPropagationSpeed('speed').ringRepeatPeriod('period');

      globe.controls().autoRotate = true;
      globe.controls().autoRotateSpeed = 0.4;
      globe.controls().enableZoom = true;
      globe.pointOfView({ lat: 30, lng: 25, altitude: 2.2 }, 0);
      globeRef.current = globe;
    });

    return () => {
      // globe.gl doesn't expose a destroy method; unmount cleans the container
      if (containerRef.current) containerRef.current.innerHTML = '';
      globeRef.current = null;
    };
  }, []);

  // Resize when container changes
  useEffect(() => {
    const ro = new ResizeObserver(() => {
      if (globeRef.current && containerRef.current) {
        globeRef.current.width(containerRef.current.clientWidth);
        globeRef.current.height(containerRef.current.clientHeight);
      }
    });
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // Update points
  useEffect(() => {
    if (!globeRef.current) return;
    const points = visible.map((e) => ({
      lat: e.lat, lng: e.lon,
      label: e.name, detail: e.detail, layer: e.layer,
      color: getColor(e),
      size: e.severity === 'high' ? 0.6 : e.severity === 'med' ? 0.45 : 0.3,
      altitude: e.severity === 'high' ? 0.02 : 0.01,
    }));
    const rings = visible.filter((e) => e.severity === 'high').map((e) => ({
      lat: e.lat, lng: e.lon, color: () => getColor(e), maxR: 3, speed: 1.5, period: 1200,
    }));
    globeRef.current.pointsData(points).ringsData(rings);
  }, [visible]);

  // Fly to region
  useEffect(() => {
    const pov = REGION_POV[currentRegion];
    if (globeRef.current && pov) globeRef.current.pointOfView(pov, 1000);
  }, [currentRegion]);

  return (
    <div ref={containerRef} style={{ flex: 1, height: '100%', background: '#000408', position: 'relative' }} />
  );
}
