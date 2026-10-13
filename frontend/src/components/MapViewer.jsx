import React, { useState, useEffect, useRef } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import { Navigation, MapPin } from 'lucide-react';

// ─── Fix Leaflet default icon paths broken by Vite/Webpack ──────────────────
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// ─── Custom SVG pin factory ──────────────────────────────────────────────────
const makePinIcon = (color, size = 34) =>
  L.divIcon({
    className: '',
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size - 4],
    html: `
      <div style="
        width:${size}px;
        height:${size}px;
        display:flex;
        align-items:center;
        justify-content:center;
        filter: drop-shadow(0 2px 6px rgba(0,0,0,0.35));
        transition: transform 0.15s ease;
      ">
        <svg viewBox="0 0 24 36" fill="none" xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size * 1.3}">
          <path d="M12 0C7.038 0 3 4.038 3 9c0 7.875 9 18 9 18s9-10.125 9-18C21 4.038 16.962 0 12 0z"
            fill="${color}" stroke="white" stroke-width="1.5"/>
          <circle cx="12" cy="9" r="3.5" fill="white" opacity="0.9"/>
        </svg>
      </div>`,
  });

const PIN_COLORS = {
  Tractor: '#22c55e',
  Harvester: '#3b82f6',
  default: '#f97316',
};

// ─── Sub-component: auto-fit bounds when equipments change ───────────────────
const BoundsController = ({ equipments, defaultCenter }) => {
  const map = useMap();

  useEffect(() => {
    if (equipments.length === 0) {
      map.setView(defaultCenter, 12);
      return;
    }
    const latlngs = equipments.map((eq) => {
      const c = eq.location?.coordinates || [77.5946, 12.9716];
      return [c[1], c[0]];
    });
    const bounds = L.latLngBounds(latlngs);
    map.fitBounds(bounds, { padding: [60, 60], maxZoom: 14 });
  }, [equipments]);

  return null;
};

// ─── Main Component ──────────────────────────────────────────────────────────
/**
 * MapViewer – OpenStreetMap powered equipment location viewer.
 *
 * Props:
 *  equipments  Array<Equipment>  – list from API with location.coordinates [lng, lat]
 *  center      [lng, lat]        – fallback center (GeoJSON order)
 *  onSelect    (equipment) => void
 */
const MapViewer = ({ equipments = [], center = [77.5946, 12.9716], onSelect }) => {
  const defaultCenter = { lat: center[1], lng: center[0] };
  const leafletCenter = [center[1], center[0]];

  return (
    <div className="relative w-full h-full min-h-[400px] rounded-3xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-inner">

      {/* ── HUD overlay ─────────────────────────────────────────────── */}
      <div className="absolute top-3 left-3 z-[1000] px-3 py-1.5 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg flex items-center gap-1.5 pointer-events-none">
        <Navigation size={11} className="text-brand-500" />
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-gray-600 dark:text-gray-300">
          Live Discovery Radar
        </span>
      </div>

      {/* ── Coordinate chip ─────────────────────────────────────────── */}
      <div className="absolute top-3 right-3 z-[1000] px-3 py-1.5 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg pointer-events-none">
        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Center</p>
        <p className="text-[10px] font-bold text-gray-700 dark:text-gray-200">
          {center[1].toFixed(4)}°N · {center[0].toFixed(4)}°E
        </p>
      </div>

      {/* ── Legend ──────────────────────────────────────────────────── */}
      <div className="absolute bottom-6 left-3 z-[1000] bg-white/90 dark:bg-gray-900/90 backdrop-blur-md px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg pointer-events-none flex gap-3">
        {[
          { label: 'Tractor', color: PIN_COLORS.Tractor },
          { label: 'Harvester', color: PIN_COLORS.Harvester },
          { label: 'Other', color: PIN_COLORS.default },
        ].map(({ label, color }) => (
          <div key={label} className="flex items-center gap-1">
            <span
              className="inline-block w-2.5 h-2.5 rounded-full border border-white/60 shadow-sm"
              style={{ background: color }}
            />
            <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400">{label}</span>
          </div>
        ))}
      </div>

      {/* ── Leaflet Map ─────────────────────────────────────────────── */}
      <MapContainer
        center={leafletCenter}
        zoom={12}
        style={{ width: '100%', height: '100%', minHeight: 400 }}
        zoomControl={true}
        scrollWheelZoom={true}
        attributionControl={true}
      >
        {/* OpenStreetMap tile layer — 100% free, no key needed */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors'
          maxZoom={19}
        />

        {/* Auto-fit bounds when equipment list changes */}
        <BoundsController equipments={equipments} defaultCenter={leafletCenter} />

        {/* User / center pulse ring */}
        <Circle
          center={leafletCenter}
          radius={300}
          pathOptions={{
            color: '#22c55e',
            fillColor: '#22c55e',
            fillOpacity: 0.12,
            weight: 1.5,
            dashArray: '6 4',
          }}
        />

        {/* Equipment markers */}
        {equipments.map((equip) => {
          const coords = equip.location?.coordinates || [77.5946, 12.9716];
          const position = [coords[1], coords[0]];
          const color = PIN_COLORS[equip.category] || PIN_COLORS.default;

          return (
            <Marker
              key={equip._id}
              position={position}
              icon={makePinIcon(color)}
            >
              <Popup
                minWidth={260}
                maxWidth={280}
                className="agrishare-popup"
              >
                {/* Popup card */}
                <div
                  style={{
                    fontFamily: 'Inter, system-ui, sans-serif',
                    display: 'flex',
                    gap: 10,
                    padding: '4px 2px',
                  }}
                >
                  <img
                    src={
                      equip.images?.[0] ||
                      'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?q=80&w=300'
                    }
                    alt={equip.name}
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: 10,
                      objectFit: 'cover',
                      flexShrink: 0,
                      background: '#f3f4f6',
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <span
                      style={{
                        fontSize: 9,
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        color: color,
                      }}
                    >
                      {equip.category}
                    </span>
                    <p
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: '#111827',
                        margin: '3px 0 2px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {equip.name}
                    </p>
                    <p style={{ fontSize: 10, color: '#6b7280', margin: '0 0 6px' }}>
                      📍 {equip.location?.pincode}
                    </p>
                    {equip.averageRating >= 4.5 && (
                      <p style={{ fontSize: 10, color: '#f59e0b', margin: '0 0 6px' }}>
                        ⭐ {equip.averageRating} · Top Rated
                      </p>
                    )}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderTop: '1px solid #f3f4f6',
                        paddingTop: 6,
                        marginTop: 2,
                      }}
                    >
                      <span style={{ fontSize: 13, fontWeight: 800, color: '#22c55e' }}>
                        ₹{equip.dailyPrice?.toLocaleString()}/day
                      </span>
                      <button
                        onClick={() => {
                          if (onSelect) onSelect(equip);
                        }}
                        style={{
                          padding: '5px 12px',
                          background: '#22c55e',
                          color: '#fff',
                          fontSize: 11,
                          fontWeight: 700,
                          borderRadius: 8,
                          border: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        Details →
                      </button>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* ── Override Leaflet popup chrome ───────────────────────────── */}
      <style>{`
        .agrishare-popup .leaflet-popup-content-wrapper {
          border-radius: 16px;
          padding: 10px;
          box-shadow: 0 8px 30px rgba(0,0,0,0.15);
          border: 1px solid #e5e7eb;
        }
        .agrishare-popup .leaflet-popup-content {
          margin: 0;
        }
        .agrishare-popup .leaflet-popup-tip-container {
          margin-top: -1px;
        }
        .leaflet-control-attribution {
          font-size: 9px !important;
          background: rgba(255,255,255,0.75) !important;
          backdrop-filter: blur(4px);
          border-radius: 8px 0 0 0 !important;
        }
      `}</style>
    </div>
  );
};

export default MapViewer;
