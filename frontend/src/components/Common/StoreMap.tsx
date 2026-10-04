// src/components/Common/StoreMap.tsx
import React from 'react';
import { MapPinIcon, TruckIcon } from './Icons';

interface StoreMapProps {
  storeName: string;
  storeAddress: string;
  distanceKm: number;
  deliveryAddress?: string;
  courierLocation?: {
    lat: number;
    lng: number;
    courierName: string;
    stepText: string;
    etaMinutes: number;
  };
  height?: string;
}

export const StoreMap: React.FC<StoreMapProps> = ({
  storeName,
  storeAddress,
  distanceKm,
  deliveryAddress = 'Shevchenka Blvd, 18, Kyiv',
  courierLocation,
  height = 'h-56',
}) => {
  return (
    <div className={`relative w-full ${height} rounded-2xl overflow-hidden bg-[#F3E8FF]/40 border border-[#A78BFA]/30 select-none shadow-inner`}>
      {/* SVG Stylized Vector City Map */}
      <svg className="w-full h-full" viewBox="0 0 600 320" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="mapWater" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E0F2FE" />
            <stop offset="100%" stopColor="#BAE6FD" />
          </linearGradient>
          <linearGradient id="routeGlow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#A78BFA" />
            <stop offset="50%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#4C1D95" />
          </linearGradient>
          <pattern id="gridBlocks" width="50" height="50" patternUnits="userSpaceOnUse">
            <rect width="44" height="44" rx="6" fill="#FFFFFF" fillOpacity="0.8" />
          </pattern>
        </defs>

        {/* Base ground & city block grids */}
        <rect width="100%" height="100%" fill="#F5F3FF" />
        <rect x="10" y="10" width="580" height="300" fill="url(#gridBlocks)" />

        {/* River curve */}
        <path
          d="M 0,220 C 180,240 320,180 600,190 L 600,240 C 320,230 180,290 0,270 Z"
          fill="url(#mapWater)"
          opacity="0.75"
        />

        {/* Avenues and streets */}
        <path d="M 0,80 Q 250,90 600,60" stroke="#DDD6FE" strokeWidth="10" fill="none" />
        <path d="M 160,0 L 170,320" stroke="#DDD6FE" strokeWidth="8" fill="none" />
        <path d="M 420,0 L 410,320" stroke="#DDD6FE" strokeWidth="8" fill="none" />

        {/* Connected route from Store (left) to User Home (right) */}
        <path
          d="M 120,140 C 220,100 360,170 480,120"
          stroke="url(#routeGlow)"
          strokeWidth="4"
          strokeDasharray="6 6"
          fill="none"
        />

        {/* Store Pin (Marker A) */}
        <g transform="translate(120, 140)">
          <circle r="18" fill="#4C1D95" fillOpacity="0.2" className="animate-ping" />
          <circle r="12" fill="#4C1D95" />
          <circle r="5" fill="#FFFFFF" />
          <rect x="-60" y="-42" width="120" height="24" rx="6" fill="#4C1D95" />
          <text x="0" y="-26" fill="#FFFFFF" fontSize="11" fontWeight="bold" textAnchor="middle">
            {storeName.slice(0, 14)}
          </text>
        </g>

        {/* User Delivery Anchor (Marker B) */}
        <g transform="translate(480, 120)">
          <circle r="14" fill="#0C4A6E" fillOpacity="0.25" />
          <circle r="10" fill="#0C4A6E" />
          <circle r="4" fill="#38BDF8" />
          <rect x="-55" y="-38" width="110" height="22" rx="6" fill="#0C4A6E" />
          <text x="0" y="-23" fill="#FFFFFF" fontSize="10" fontWeight="bold" textAnchor="middle">
            Delivery Anchor
          </text>
        </g>

        {/* Active Courier Pin (Marker C) if ongoing */}
        {courierLocation && (
          <g transform="translate(300, 130)">
            <circle r="22" fill="#10B981" fillOpacity="0.25" className="animate-pulse" />
            <circle r="14" fill="#10B981" />
            <circle r="5" fill="#FFFFFF" />
            <rect x="-70" y="-44" width="140" height="24" rx="6" fill="#065F46" />
            <text x="0" y="-28" fill="#A7F3D0" fontSize="10" fontWeight="bold" textAnchor="middle">
              🛵 Courier: ~{courierLocation.etaMinutes}m ETA
            </text>
          </g>
        )}
      </svg>

      {/* Overlaid Information Badge */}
      <div className="absolute bottom-2.5 left-2.5 right-2.5 bg-white/95 backdrop-blur-md rounded-xl p-2.5 border border-purple-100 flex items-center justify-between text-xs text-[#0C4A6E] shadow-sm">
        <div className="flex items-center space-x-2 truncate">
          <span className="p-1.5 rounded-lg bg-[#F3E8FF] text-[#4C1D95]">
            <MapPinIcon className="w-4 h-4" />
          </span>
          <div className="truncate">
            <div className="font-bold text-[#4C1D95] truncate">{storeName}</div>
            <div className="text-[11px] text-gray-500 truncate">{storeAddress}</div>
          </div>
        </div>
        <div className="text-right flex-shrink-0 ml-2">
          <span className="inline-block px-2 py-0.5 rounded-full bg-[#38BDF8]/20 text-[#0C4A6E] font-semibold text-[11px]">
            {distanceKm} km away
          </span>
          <div className="text-[10px] text-gray-400 mt-0.5">Anchor: Kyiv</div>
        </div>
      </div>
    </div>
  );
};
