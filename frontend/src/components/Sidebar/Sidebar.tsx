// src/components/Sidebar/Sidebar.tsx
import React from 'react';
import { SortMode } from '../../types';
import { DualRangeSlider } from './DualRangeSlider';
import { ChevronLeftIcon, ChevronRightIcon, MapPinIcon } from '../Common/Icons';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  sortMode: SortMode;
  onSortChange: (mode: SortMode) => void;
  minPrice: number;
  maxPrice: number;
  priceRange: [number, number];
  onPriceChange: (min: number, max: number) => void;
  selectedStore: string | null;
  onStoreSelect: (store: string | null) => void;
  stores: string[];
  totalResults: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onToggle,
  sortMode,
  onSortChange,
  minPrice,
  maxPrice,
  priceRange,
  onPriceChange,
  selectedStore,
  onStoreSelect,
  stores,
  totalResults,
}) => {
  return (
    <>
      {/* Small >>> restore button on the edge when sidebar is collapsed */}
      {!isOpen && (
        <button
          onClick={onToggle}
          title="Open Filters & Sorting (>>>)"
          className="fixed left-0 top-24 z-30 flex items-center justify-center w-8 h-12 bg-white/95 text-[#4C1D95] rounded-r-xl shadow-lg border-y border-r border-[#A78BFA]/40 hover:bg-[#F3E8FF] hover:w-9 transition-all duration-200 group"
        >
          <div className="flex items-center text-xs font-bold text-[#4C1D95]">
            <span className="tracking-tighter">❯❯❯</span>
          </div>
        </button>
      )}

      {/* Main Sidebar overlay directly under the site icon on the left */}
      <aside
        className={`fixed left-0 top-[72px] bottom-4 z-30 w-72 bg-white/95 backdrop-blur-md rounded-r-3xl shadow-xl border-y border-r border-[#A78BFA]/30 flex flex-col transition-all duration-300 transform ${
          isOpen ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0 pointer-events-none'
        }`}
      >
        {/* Header with <<< close button */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-purple-50">
          <div className="flex items-center space-x-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#4C1D95]" />
            <h2 className="font-bold text-sm text-[#0C4A6E] tracking-tight">Filters & Sorting</h2>
            <span className="text-[11px] font-semibold text-[#4C1D95] bg-[#F3E8FF] px-2 py-0.5 rounded-full">
              {totalResults} items
            </span>
          </div>
          <button
            onClick={onToggle}
            title="Hide sidebar (<<<)"
            className="flex items-center space-x-1 px-2 py-1 rounded-lg text-xs font-bold text-[#4C1D95] bg-[#F3E8FF] hover:bg-[#A78BFA]/20 transition-colors"
          >
            <span>❮❮❮</span>
          </button>
        </div>

        {/* Scrollable filter controls body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6 text-sm text-[#0C4A6E]">
          {/* Sorting Group */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <label className="font-bold text-xs uppercase tracking-wider text-gray-400">Sort Order</label>
              {sortMode === 'closest' && (
                <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-medium">
                  Default
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 gap-1.5">
              <button
                type="button"
                onClick={() => onSortChange('closest')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  sortMode === 'closest'
                    ? 'bg-[#4C1D95] text-white shadow-sm ring-2 ring-[#A78BFA]/50'
                    : 'bg-[#F3E8FF]/60 text-[#0C4A6E] hover:bg-[#F3E8FF]'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <MapPinIcon className="w-4 h-4" />
                  <span>Closest First</span>
                </div>
                <span className="text-[10px] opacity-75 font-normal">By distance</span>
              </button>

              <button
                type="button"
                onClick={() => onSortChange('cheapest')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  sortMode === 'cheapest'
                    ? 'bg-[#4C1D95] text-white shadow-sm ring-2 ring-[#A78BFA]/50'
                    : 'bg-[#F3E8FF]/60 text-[#0C4A6E] hover:bg-[#F3E8FF]'
                }`}
              >
                <span>Cheapest First</span>
                <span className="text-[10px] opacity-75 font-normal">Lowest price</span>
              </button>

              <button
                type="button"
                onClick={() => onSortChange('expensive')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  sortMode === 'expensive'
                    ? 'bg-[#4C1D95] text-white shadow-sm ring-2 ring-[#A78BFA]/50'
                    : 'bg-[#F3E8FF]/60 text-[#0C4A6E] hover:bg-[#F3E8FF]'
                }`}
              >
                <span>Most Expensive</span>
                <span className="text-[10px] opacity-75 font-normal">Highest price</span>
              </button>
            </div>
            <p className="text-[11px] text-gray-400 mt-2 italic">
              *Closest sorts by distance from your location.
            </p>
          </div>

          {/* Dual-Thumb Price Slider */}
          <div className="pt-2 border-t border-purple-50">
            <label className="block font-bold text-xs uppercase tracking-wider text-gray-400 mb-3">
              Price Range
            </label>
            <DualRangeSlider
              min={minPrice}
              max={maxPrice}
              minVal={priceRange[0]}
              maxVal={priceRange[1]}
              onChange={onPriceChange}
            />
          </div>

          {/* Store Filter Pills */}
          <div className="pt-2 border-t border-purple-50">
            <div className="flex items-center justify-between mb-2.5">
              <label className="font-bold text-xs uppercase tracking-wider text-gray-400">Stores</label>
              {selectedStore && (
                <button
                  onClick={() => onStoreSelect(null)}
                  className="text-[11px] text-[#4C1D95] hover:underline font-semibold"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => onStoreSelect(null)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                  selectedStore === null
                    ? 'bg-[#4C1D95] text-white shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All Stores
              </button>
              {stores.map((store) => (
                <button
                  key={store}
                  onClick={() => onStoreSelect(store === selectedStore ? null : store)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                    selectedStore === store
                      ? 'bg-[#4C1D95] text-white shadow-xs'
                      : 'bg-[#F3E8FF] text-[#4C1D95] hover:bg-[#A78BFA]/30'
                  }`}
                >
                  {store}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer info banner */}
        <div className="p-4 border-t border-purple-50 bg-[#F3E8FF]/30 rounded-br-3xl text-[11px] text-[#0C4A6E]/80">
          <span className="font-bold text-[#4C1D95]">BuyClose Tip:</span> Group items from one store for Direct Delivery savings, or use Combined Delivery for everything.
        </div>
      </aside>
    </>
  );
};
