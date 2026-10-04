// src/components/Product/ProductCard.tsx
import React, { useState } from 'react';
import { Product } from '../../types';
import { useStoreColor } from '../../utils/storeColors';
import { CartIcon, CheckIcon, MapPinIcon, StarIcon } from '../Common/Icons';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onOpenDetails: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onOpenDetails,
}) => {
  const storeStyle = useStoreColor(product.storeName);
  const [justAdded, setJustAdded] = useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  };

  return (
    <div
      onClick={() => onOpenDetails(product)}
      className="group relative flex flex-col bg-white rounded-2xl border border-purple-100/80 p-2.5 hover:shadow-md hover:border-[#A78BFA]/50 transition-all duration-200 cursor-pointer text-[#0C4A6E] h-[330px] overflow-hidden select-none"
    >
      {/* Distance Tag Overlay */}
      <div className="absolute top-3.5 left-3.5 z-10 flex items-center space-x-1 px-1.5 py-0.5 rounded-full bg-white/90 backdrop-blur-sm text-[10px] font-bold text-[#0C4A6E] shadow-xs border border-purple-50">
        <MapPinIcon className="w-3 h-3 text-[#38BDF8]" />
        <span>{product.distanceKm} km</span>
      </div>

      {/* 1. Product Photo */}
      <div className="relative w-full h-32 rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center mb-2 flex-shrink-0">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        {product.rating && (
          <div className="absolute bottom-1.5 right-1.5 flex items-center space-x-0.5 bg-black/40 backdrop-blur-sm text-white px-1.5 py-0.5 rounded-md text-[10px] font-semibold">
            <StarIcon className="w-2.5 h-2.5 text-[#FBBF24]" />
            <span>{product.rating.toFixed(1)}</span>
          </div>
        )}
      </div>

      {/* 2. Product Name */}
      <div className="flex-1 flex flex-col justify-between min-h-0">
        <div>
          <h3
            className="font-bold text-xs text-[#0C4A6E] leading-snug line-clamp-2 group-hover:text-[#4C1D95] transition-colors"
            title={product.name}
          >
            {product.name}
          </h3>
          {product.weightOrUnit && (
            <span className="text-[10px] text-gray-400 font-medium block mt-0.5">
              {product.weightOrUnit}
            </span>
          )}
        </div>

        <div>
          {/* 3. Price */}
          <div className="mt-1 mb-2 flex items-baseline justify-between">
            <span className="font-extrabold text-sm text-[#4C1D95]">
              ${product.price.toFixed(2)}
            </span>
            <span className="text-[10px] text-gray-400">in stock</span>
          </div>

          {/* 4. Add to Cart Button */}
          <button
            type="button"
            onClick={handleAdd}
            className={`w-full py-1.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-all duration-200 active:scale-95 ${
              justAdded
                ? 'bg-emerald-600 text-white'
                : 'bg-[#4C1D95] hover:bg-[#5b23b1] text-white shadow-xs'
            }`}
          >
            {justAdded ? (
              <>
                <CheckIcon className="w-3.5 h-3.5" />
                <span>Added</span>
              </>
            ) : (
              <>
                <CartIcon className="w-3.5 h-3.5" />
                <span>Add to Cart</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 5. Store Name & Address (in small font with dynamic consistent memoized store background color) */}
      <div
        className="mt-2 pt-1.5 pb-1 px-1.5 rounded-lg border flex flex-col justify-center flex-shrink-0 transition-colors"
        style={{
          backgroundColor: storeStyle.bg,
          borderColor: storeStyle.border,
          color: storeStyle.text,
        }}
      >
        <span className="font-bold text-[10px] truncate leading-tight">
          {product.storeName}
        </span>
        <span className="text-[9px] opacity-80 truncate leading-tight">
          {product.storeAddress}
        </span>
      </div>
    </div>
  );
};
