// src/components/Product/ProductDetailsModal.tsx
import React, { useState } from 'react';
import { Product } from '../../types';
import { useStoreColor } from '../../utils/storeColors';
import { StoreMap } from '../Common/StoreMap';
import { CartIcon, CloseIcon, CheckIcon, StarIcon, MapPinIcon } from '../Common/Icons';

interface ProductDetailsModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  deliveryAddress: string;
}

export const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({
  product,
  onClose,
  onAddToCart,
  deliveryAddress,
}) => {
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  if (!product) return null;

  const storeStyle = useStoreColor(product.storeName);

  const handleAdd = () => {
    onAddToCart(product, qty);
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-purple-100 overflow-hidden text-[#0C4A6E] animate-in fade-in zoom-in-95 duration-150">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-white/90 shadow-sm border border-purple-100 flex items-center justify-center text-gray-500 hover:text-[#4C1D95] transition-colors"
        >
          <CloseIcon className="w-4 h-4" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left Column: Image & Store Badge */}
          <div className="p-6 bg-[#F3E8FF]/30 flex flex-col justify-between border-r border-purple-50">
            <div className="relative w-full h-64 rounded-2xl overflow-hidden bg-white shadow-sm">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-full text-xs font-bold text-[#4C1D95] shadow-xs">
                {product.category}
              </div>
            </div>

            {/* Dynamic Store Color Badge */}
            <div
              className="mt-4 p-3 rounded-xl border flex items-center justify-between"
              style={{
                backgroundColor: storeStyle.bg,
                borderColor: storeStyle.border,
                color: storeStyle.text,
              }}
            >
              <div>
                <div className="text-xs font-extrabold">{product.storeName}</div>
                <div className="text-[11px] opacity-80">{product.storeAddress}</div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-white/70 text-xs font-bold text-[#0C4A6E]">
                {product.distanceKm} km
              </span>
            </div>
          </div>

          {/* Right Column: Details, Description, Store Map, Add to Cart */}
          <div className="p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-2 text-xs font-semibold text-gray-400 mb-1">
                {product.rating && (
                  <div className="flex items-center space-x-1 text-[#0C4A6E]">
                    <StarIcon className="w-3.5 h-3.5 text-[#FBBF24]" />
                    <span>{product.rating.toFixed(1)} rating</span>
                  </div>
                )}
                <span>•</span>
                <span>{product.weightOrUnit || 'Unit'}</span>
              </div>

              <h2 className="font-bold text-xl text-[#4C1D95] leading-snug mb-2">
                {product.name}
              </h2>

              <div className="text-2xl font-black text-[#4C1D95] mb-3">
                ${product.price.toFixed(2)}
              </div>

              {/* Full Description */}
              <div className="text-xs text-gray-600 leading-relaxed mb-4 max-h-24 overflow-y-auto">
                {product.description}
              </div>

              {/* Exact Store Location Map */}
              <div className="mb-4">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                  Store Location & Route
                </label>
                <StoreMap
                  storeName={product.storeName}
                  storeAddress={product.storeAddress}
                  distanceKm={product.distanceKm}
                  deliveryAddress={deliveryAddress}
                  height="h-36"
                />
              </div>
            </div>

            {/* Quantity Selector & Add to Cart */}
            <div className="pt-3 border-t border-purple-50 flex items-center space-x-3">
              <div className="flex items-center border border-purple-100 rounded-xl bg-gray-50 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="px-3 py-2 text-sm font-bold text-gray-600 hover:bg-gray-200 transition-colors"
                >
                  -
                </button>
                <span className="px-3 py-2 text-xs font-bold text-[#0C4A6E]">{qty}</span>
                <button
                  type="button"
                  onClick={() => setQty((q) => q + 1)}
                  className="px-3 py-2 text-sm font-bold text-gray-600 hover:bg-gray-200 transition-colors"
                >
                  +
                </button>
              </div>

              <button
                type="button"
                onClick={handleAdd}
                className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-all ${
                  added
                    ? 'bg-emerald-600 text-white'
                    : 'bg-[#4C1D95] hover:bg-[#5b23b1] text-white shadow-sm'
                }`}
              >
                {added ? (
                  <>
                    <CheckIcon className="w-4 h-4" />
                    <span>Added {qty} to Cart</span>
                  </>
                ) : (
                  <>
                    <CartIcon className="w-4 h-4" />
                    <span>Add to Cart (${(product.price * qty).toFixed(2)})</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
