// src/components/Sidebar/DualRangeSlider.tsx
import React from 'react';

interface DualRangeSliderProps {
  min: number;
  max: number;
  minVal: number;
  maxVal: number;
  onChange: (min: number, max: number) => void;
}

export const DualRangeSlider: React.FC<DualRangeSliderProps> = ({
  min,
  max,
  minVal,
  maxVal,
  onChange,
}) => {
  const minPercent = Math.round(((minVal - min) / (max - min)) * 100);
  const maxPercent = Math.round(((maxVal - min) / (max - min)) * 100);

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.min(Number(e.target.value), maxVal - 0.5);
    onChange(value, maxVal);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(Number(e.target.value), minVal + 0.5);
    onChange(minVal, value);
  };

  return (
    <div className="w-full flex flex-col space-y-3">
      <div className="flex justify-between items-center text-xs font-semibold text-[#0C4A6E]">
        <span className="bg-white px-2 py-1 rounded-lg border border-purple-100 shadow-sm">
          ${minVal.toFixed(2)}
        </span>
        <span className="text-gray-400 font-normal text-[11px]">to</span>
        <span className="bg-white px-2 py-1 rounded-lg border border-purple-100 shadow-sm">
          ${maxVal.toFixed(2)}
        </span>
      </div>

      <div className="relative w-full h-5 flex items-center">
        {/* Visual background track */}
        <div className="absolute w-full h-2 bg-[#F3E8FF] rounded-full pointer-events-none" />

        {/* Selected highlighted range track */}
        <div
          className="absolute h-2 bg-[#A78BFA] rounded-full pointer-events-none"
          style={{ left: `${minPercent}%`, width: `${maxPercent - minPercent}%` }}
        />

        {/* Range thumb 1 (Min) */}
        <input
          type="range"
          min={min}
          max={max}
          step="0.1"
          value={minVal}
          onChange={handleMinChange}
          className="absolute w-full h-2 appearance-none pointer-events-none bg-transparent accent-[#4C1D95] focus:outline-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#4C1D95] [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#4C1D95] [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-pointer"
          style={{ zIndex: minVal > max - 10 ? 5 : 3 }}
        />

        {/* Range thumb 2 (Max) */}
        <input
          type="range"
          min={min}
          max={max}
          step="0.1"
          value={maxVal}
          onChange={handleMaxChange}
          className="absolute w-full h-2 appearance-none pointer-events-none bg-transparent accent-[#4C1D95] focus:outline-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#4C1D95] [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#4C1D95] [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-pointer"
          style={{ zIndex: 4 }}
        />
      </div>
    </div>
  );
};
