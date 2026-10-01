// src/components/Product/ProductGrid.tsx
import React from 'react';
import { Product } from '../../types';
import { ProductCard } from './ProductCard';

interface ProductGridProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  onOpenDetails: (product: Product) => void;
}

/**
 * Strict Grid Layout Rules:
 * - Display products in rectangular cards with small gaps (margins).
 * - Grid Size: Exactly 7 columns horizontally.
 * - Grid Height: The viewport must fit exactly 2 rows of products.
 * - Container vertically scrollable to see the rest of the list.
 */
export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  onAddToCart,
  onOpenDetails,
}) => {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-80 rounded-2xl bg-white border border-purple-100 p-8 text-center text-[#0C4A6E]">
        <div className="w-12 h-12 rounded-full bg-[#F3E8FF] flex items-center justify-center text-xl mb-3 text-[#4C1D95]">
          🔍
        </div>
        <h4 className="font-bold text-base text-[#4C1D95] mb-1">No matching products found</h4>
        <p className="text-xs text-gray-500 max-w-sm">
          Try adjusting your search keywords, price range sliders, or store selection filters in the sidebar.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* 
        Container with calibrated fixed height to fit exactly 2 rows of 330px cards + gap,
        and vertically scrollable with custom slim scrollbar.
        Exact height: (2 * 330px card) + (1 * 14px gap) + padding ~ 684px
      */}
      <div className="relative w-full max-h-[690px] overflow-y-auto pr-2 custom-scrollbar">
        <div className="grid grid-cols-7 gap-3.5">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={onAddToCart}
              onOpenDetails={onOpenDetails}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
