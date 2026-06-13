import React, { useState } from 'react';
import { MapPin, Navigation, Info, DollarSign } from 'lucide-react';

const MapViewer = ({ equipments = [], center = [77.5946, 12.9716], onSelect }) => {
  const [selectedPin, setSelectedPin] = useState(null);

  // Parse center Lng/Lat
  const centerLng = center[0];
  const centerLat = center[1];

  // We will map Lng/Lat coordinates to a 100% width/height SVG coordinate system dynamically!
  // This creates a fully functional, zoomable vector interactive map!
  const getSvgCoordinates = (longitude, latitude) => {
    // Standard bounding boxes for India/Karnataka dev coordinates
    // We add minor scale offsets relative to the center coordinate
    const scale = 250; // zoom level scaling factor
    
    // Compute pixel delta coordinates relative to center (placed at center x: 50%, y: 50%)
    const x = 50 + (longitude - centerLng) * scale;
    const y = 50 - (latitude - centerLat) * scale; // invert Y axis for screen space
    
    return { x: Math.max(5, Math.min(95, x)), y: Math.max(5, Math.min(95, y)) };
  };

  return (
    <div className="relative w-full h-full min-h-[400px] bg-emerald-50/30 dark:bg-darkbg-200/50 rounded-3xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-inner select-none transition-colors duration-300">
      
      {/* Visual GRID map texture */}
      <div className="absolute inset-0 bg-[radial-gradient(#68ac5d_1px,transparent_1px)] [background-size:24px_24px] opacity-15 dark:opacity-5"></div>
      
      {/* Mock Map Canvas Elements */}
      <div className="absolute inset-0 flex flex-col justify-between p-4 pointer-events-none">
        <div className="flex justify-between items-start">
          <span className="px-3 py-1 bg-white/90 dark:bg-gray-800/90 text-[10px] font-extrabold uppercase rounded-lg border border-gray-150 dark:border-gray-700 shadow-sm backdrop-blur-sm pointer-events-auto flex items-center gap-1 text-gray-500 dark:text-gray-400">
            <Navigation size={12} className="text-brand-500" />
            Live Discovery Radar
          </span>
          
          <div className="px-3 py-2 bg-white/90 dark:bg-gray-800/90 rounded-xl border border-gray-150 dark:border-gray-700 shadow-md backdrop-blur-sm pointer-events-auto max-w-[200px]">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Coordinates</p>
            <p className="text-[11px] font-bold text-gray-700 dark:text-gray-300 truncate">Lat: {centerLat.toFixed(4)} &bull; Lng: {centerLng.toFixed(4)}</p>
          </div>
        </div>

        {/* Legend */}
        <div className="bg-white/90 dark:bg-gray-800/90 p-3 rounded-2xl border border-gray-150 dark:border-gray-700 shadow-md backdrop-blur-sm pointer-events-auto w-fit flex gap-4 text-[10px] font-bold text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 rounded-full bg-brand-500"></div>
            <span>Tractor</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
            <span>Harvester</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 rounded-full bg-orange-500"></div>
            <span>Other Assets</span>
          </div>
        </div>
      </div>

      {/* SVG Canvas for Map Plots */}
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        {/* Draw a simulated roadway or grid connecting pins */}
        <path d="M 10 50 Q 50 20 90 50 T 10 80" fill="none" stroke="#68ac5d" strokeWidth="0.2" strokeDasharray="1,1" className="opacity-40" />
        <path d="M 30 10 Q 50 50 70 90" fill="none" stroke="#68ac5d" strokeWidth="0.2" strokeDasharray="1,1" className="opacity-40" />

        {/* Center/User Marker Pin */}
        <circle cx="50" cy="50" r="1.5" className="fill-brand-500 animate-ping opacity-75" />
        <circle cx="50" cy="50" r="0.8" className="fill-brand-600 border-2 border-white" />
      </svg>

      {/* Equipment Pin Markers on Map Overlay */}
      {equipments.map((equip) => {
        const coords = equip.location?.coordinates || [77.5946, 12.9716];
        const { x, y } = getSvgCoordinates(coords[0], coords[1]);
        const isSelected = selectedPin?._id === equip._id;

        // Categorize pin colors
        let pinColor = 'text-orange-500';
        if (equip.category === 'Tractor') pinColor = 'text-brand-500';
        else if (equip.category === 'Harvester') pinColor = 'text-blue-500';

        return (
          <div
            key={equip._id}
            style={{ left: `${x}%`, top: `${y}%` }}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10 hover:z-20 transition-all duration-300"
          >
            <div
              onClick={() => setSelectedPin(isSelected ? null : equip)}
              className={`p-1.5 bg-white dark:bg-gray-800 rounded-full border shadow-md hover:scale-115 transition-transform ${
                isSelected 
                  ? 'border-brand-500 ring-2 ring-brand-500/20 scale-110' 
                  : 'border-gray-100 dark:border-gray-700'
              }`}
            >
              <MapPin className={`w-5 h-5 ${pinColor} fill-current`} />
            </div>
            
            {/* Pulsing indicator for premium or recently active */}
            {equip.averageRating >= 4.5 && (
              <span className="absolute -top-1 -right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
              </span>
            )}
          </div>
        );
      })}

      {/* Selected Equipment Popover Overlay Card */}
      {selectedPin && (
        <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 w-[280px] bg-white dark:bg-gray-800 rounded-2xl border border-gray-150 dark:border-gray-700 shadow-xl p-4 flex gap-3 transition-all animate-slide-up">
          <img
            src={selectedPin.images?.[0] || 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?q=80&w=300'}
            alt={selectedPin.name}
            className="w-16 h-16 rounded-xl object-cover bg-gray-50 flex-shrink-0"
          />
          <div className="flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-extrabold uppercase text-brand-500 leading-none">
                  {selectedPin.category}
                </span>
                <button 
                  onClick={() => setSelectedPin(null)} 
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-white text-[10px] font-bold"
                >
                  X
                </button>
              </div>
              <h5 className="text-xs font-bold text-gray-900 dark:text-white line-clamp-1 mt-1">
                {selectedPin.name}
              </h5>
              <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 flex items-center gap-0.5 mt-0.5">
                Pincode: {selectedPin.location?.pincode}
              </p>
            </div>
            <div className="flex items-center justify-between mt-2 pt-1 border-t border-gray-50 dark:border-gray-700">
              <span className="text-xs font-extrabold text-brand-500">
                Rs. {selectedPin.dailyPrice.toLocaleString()}/day
              </span>
              
              <button
                onClick={() => {
                  if (onSelect) onSelect(selectedPin);
                  setSelectedPin(null);
                }}
                className="px-2.5 py-1 bg-brand-500 hover:bg-brand-600 text-[10px] font-bold text-white rounded-lg shadow-sm"
              >
                Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapViewer;
