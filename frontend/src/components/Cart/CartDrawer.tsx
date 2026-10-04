import React, { useState } from 'react';
import { CartItem, DeliveryMode, Order } from '../../types';
import { useStoreColor } from '../../utils/storeColors';
import { CloseIcon, CartIcon, CheckIcon, TruckIcon } from '../Common/Icons';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQty: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onCheckoutSuccess: (newOrder: Order) => void;
  deliveryAddress: string;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQty,
  onRemoveItem,
  onClearCart,
  onCheckoutSuccess,
  deliveryAddress,
}) => {
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>('combined');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  if (!isOpen) return null;

  // Group items by storeName
  const itemsByStore: Record<string, CartItem[]> = {};
  items.forEach((item) => {
    if (!itemsByStore[item.product.storeName]) {
      itemsByStore[item.product.storeName] = [];
    }
    itemsByStore[item.product.storeName].push(item);
  });

  const uniqueStoreNames = Object.keys(itemsByStore);
  const isSingleStore = uniqueStoreNames.length === 1;

  // Calculation logic
  const subtotal = items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  // Delivery Fee Logic:
  // - Combined: flat $2.49 for multi-store consolidated courier
  // - Direct Store Delivery: cheaper ($1.29) if single store; if multiple stores, sum of individual store direct fees
  const combinedFee = 2.49;
  const directStoreFee = isSingleStore ? 1.29 : uniqueStoreNames.length * 1.80;

  const activeDeliveryFee = deliveryMode === 'combined' ? combinedFee : directStoreFee;
  const grandTotal = subtotal > 0 ? subtotal + activeDeliveryFee : 0;

  const handlePlaceOrder = () => {
    if (items.length === 0) return;
    setIsPlacingOrder(true);

    const receiptNum = `BC-${Date.now().toString().slice(-6)}`;
    const newOrder: Order = {
      id: `order-${Date.now()}`,
      receiptNumber: receiptNum,
      date: 'Just now',
      timestamp: new Date().toISOString(),
      status: 'packing',
      deliveryType: deliveryMode,
      storeNames: uniqueStoreNames,
      deliveryAddress,
      items: items.map((i) => ({
        productId: i.product.id,
        productName: i.product.name,
        storeName: i.product.storeName,
        price: i.product.price,
        quantity: i.quantity,
        image: i.product.image,
      })),
      subtotal,
      deliveryFee: activeDeliveryFee,
      total: grandTotal,
      courierLocation: {
        lat: 50.4428,
        lng: 30.5103,
        courierName: 'BuyClose Swift Courier',
        vehicle: deliveryMode === 'combined' ? 'Cargo E-Bike' : 'Direct Store Courier',
        etaMinutes: 22,
        stepText: `Order confirmed! Packing at ${uniqueStoreNames.join(', ')}`,
      },
    };

    setTimeout(() => {
      setIsPlacingOrder(false);
      onCheckoutSuccess(newOrder);
      onClearCart();
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between text-[#0C4A6E]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-purple-50 bg-[#F3E8FF]/30">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-[#4C1D95] text-white shadow-xs">
              <CartIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base text-[#4C1D95]">Your Aggregator Cart</h2>
              <p className="text-xs text-gray-500">
                {items.length} {items.length === 1 ? 'item' : 'items'} across {uniqueStoreNames.length} {uniqueStoreNames.length === 1 ? 'store' : 'stores'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white shadow-xs border border-purple-100 flex items-center justify-center text-gray-500 hover:text-[#4C1D95] transition-colors"
          >
            <CloseIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {items.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center text-gray-400">
              <div className="w-12 h-12 rounded-full bg-[#F3E8FF] flex items-center justify-center text-2xl mb-2 text-[#4C1D95]">
                🛒
              </div>
              <p className="text-sm font-semibold text-[#0C4A6E]">Your cart is empty</p>
              <p className="text-xs text-gray-400 mt-1 max-w-[220px]">
                Search products from ATB, Silpo, or local bakeries and add them to compare delivery!
              </p>
            </div>
          ) : (
            <>
              {/* Grouped by Store */}
              {uniqueStoreNames.map((storeName) => (
                <div key={storeName} className="rounded-2xl border border-purple-100 p-3 bg-purple-50/20">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-purple-100 text-xs font-bold text-[#4C1D95]">
                    <span className="truncate">{storeName}</span>
                    <span className="text-[10px] text-gray-400">
                      {itemsByStore[storeName].length} items
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {itemsByStore[storeName].map((item) => (
                      <div key={item.product.id} className="flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-2.5 truncate">
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border border-purple-100"
                          />
                          <div className="truncate">
                            <div className="font-bold truncate text-[#0C4A6E]">
                              {item.product.name}
                            </div>
                            <div className="text-[11px] text-gray-500">
                              ${item.product.price.toFixed(2)} each
                            </div>
                          </div>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center space-x-1.5 flex-shrink-0 ml-2">
                          <button
                            onClick={() => onUpdateQty(item.product.id, -1)}
                            className="w-6 h-6 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold flex items-center justify-center"
                          >
                            -
                          </button>
                          <span className="w-5 text-center font-bold">{item.quantity}</span>
                          <button
                            onClick={() => onUpdateQty(item.product.id, 1)}
                            className="w-6 h-6 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold flex items-center justify-center"
                          >
                            +
                          </button>
                          <button
                            onClick={() => onRemoveItem(item.product.id)}
                            className="text-gray-400 hover:text-red-500 ml-1 text-xs"
                            title="Remove item"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* CORE PLATFORM CONCEPT: DELIVERY LOGIC CHOOSER */}
              <div className="mt-4 pt-3 border-t border-purple-100">
                <div className="font-bold text-xs text-[#0C4A6E] mb-2 flex items-center justify-between">
                  <span>Choose Delivery Method:</span>
                  <span className="text-[10px] text-gray-400 font-normal">Select optimal rate</span>
                </div>

                <div className="grid grid-cols-1 gap-2 text-xs">
                  {/* Option 1: General Combined Delivery */}
                  <label
                    className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-start space-x-2.5 ${
                      deliveryMode === 'combined'
                        ? 'bg-[#F3E8FF] border-[#4C1D95] ring-2 ring-[#A78BFA]/50'
                        : 'bg-white border-purple-100 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="deliveryMode"
                      checked={deliveryMode === 'combined'}
                      onChange={() => setDeliveryMode('combined')}
                      className="mt-0.5 text-[#4C1D95] focus:ring-[#4C1D95]"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#4C1D95]">General Combined Delivery</span>
                        <span className="font-extrabold">${combinedFee.toFixed(2)}</span>
                      </div>
                      <p className="text-[11px] text-gray-600 mt-0.5">
                        Consolidated courier visits all {uniqueStoreNames.length} stores in one trip. Single drop-off.
                      </p>
                    </div>
                  </label>

                  {/* Option 2: Direct Store Delivery */}
                  <label
                    className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-start space-x-2.5 ${
                      deliveryMode === 'direct'
                        ? 'bg-[#F3E8FF] border-[#4C1D95] ring-2 ring-[#A78BFA]/50'
                        : 'bg-white border-purple-100 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="deliveryMode"
                      checked={deliveryMode === 'direct'}
                      onChange={() => setDeliveryMode('direct')}
                      className="mt-0.5 text-[#4C1D95] focus:ring-[#4C1D95]"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#4C1D95]">Direct Store Delivery</span>
                        <span className="font-extrabold">${directStoreFee.toFixed(2)}</span>
                      </div>
                      <p className="text-[11px] text-gray-600 mt-0.5">
                        {isSingleStore ? (
                          <span className="text-emerald-700 font-semibold">
                            ★ Cheapest option! All items are from a single store ({uniqueStoreNames[0]}).
                          </span>
                        ) : (
                          <span>
                            Direct couriers dispatched per store ({uniqueStoreNames.length} separate dispatches).
                          </span>
                        )}
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer Summary & Checkout */}
        {items.length > 0 && (
          <div className="p-5 border-t border-purple-100 bg-[#F3E8FF]/20 space-y-3">
            <div className="space-y-1.5 text-xs text-[#0C4A6E]">
              <div className="flex justify-between text-gray-500">
                <span>Items Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>
                  Delivery ({deliveryMode === 'combined' ? 'Combined Multi-Store' : 'Direct Store'})
                </span>
                <span>${activeDeliveryFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-[#4C1D95] pt-1.5 border-t border-purple-100">
                <span>Grand Total</span>
                <span>${grandTotal.toFixed(2)}</span>
              </div>
            </div>

            <button
              type="button"
              disabled={isPlacingOrder}
              onClick={handlePlaceOrder}
              className="w-full py-3 px-4 rounded-xl bg-[#4C1D95] hover:bg-[#5b23b1] text-white font-extrabold text-sm transition-all shadow-md active:scale-98 disabled:opacity-50"
            >
              {isPlacingOrder ? 'Confirming with Stores...' : `Checkout & Pay $${grandTotal.toFixed(2)}`}
            </button>

            <div className="text-[10px] text-center text-gray-400">
              Delivering to: <span className="font-medium text-[#0C4A6E]">{deliveryAddress}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
