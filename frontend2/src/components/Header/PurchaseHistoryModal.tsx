import React, { useState } from 'react';
import { Order } from '../../types';
import { StoreMap } from '../Common/StoreMap';
import { CloseIcon, HistoryIcon, MapPinIcon, TruckIcon } from '../Common/Icons';

interface PurchaseHistoryModalProps {
  orders: Order[];
  onClose: () => void;
  deliveryAddress: string;
}

export const PurchaseHistoryModal: React.FC<PurchaseHistoryModalProps> = ({
  orders,
  onClose,
  deliveryAddress,
}) => {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(orders[0] || null);
  const [showReceiptOnly, setShowReceiptOnly] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-purple-100 overflow-hidden text-[#0C4A6E] max-h-[88vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-purple-50 bg-[#F3E8FF]/30">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-[#4C1D95] text-white shadow-xs">
              <HistoryIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base text-[#4C1D95]">Purchase & Delivery History</h2>
              <p className="text-xs text-gray-500">
                Active deliveries shown in light green. Completed orders in gray.
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

        {/* Content Body: Left Column (Order List) | Right Column (Details / Live Map / Receipt) */}
        <div className="grid grid-cols-1 md:grid-cols-12 flex-1 overflow-hidden">
          {/* Order List (5 cols) */}
          <div className="md:col-span-5 border-r border-purple-50 overflow-y-auto p-4 space-y-3 bg-gray-50/50">
            <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400 px-1">
              Orders ({orders.length})
            </div>

            {orders.map((order) => {
              const isActive = order.status === 'packing' || order.status === 'delivery';
              const isSelected = selectedOrder?.id === order.id;

              return (
                <div
                  key={order.id}
                  onClick={() => {
                    setSelectedOrder(order);
                    setShowReceiptOnly(false);
                  }}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer select-none ${
                    isActive
                      ? 'bg-emerald-50/90 border-emerald-300 hover:bg-emerald-100/70 text-emerald-950'
                      : 'bg-gray-100/90 border-gray-200 hover:bg-gray-200/80 text-gray-700'
                  } ${
                    isSelected ? 'ring-2 ring-[#4C1D95] shadow-sm' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono font-bold text-xs">{order.receiptNumber}</span>
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        isActive
                          ? 'bg-emerald-200 text-emerald-900 animate-pulse'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {order.status === 'delivery'
                        ? '🚀 On the Way'
                        : order.status === 'packing'
                        ? '📦 Packing'
                        : '✓ Completed'}
                    </span>
                  </div>

                  <div className="text-xs font-semibold truncate mb-1">
                    {order.storeNames.join(' • ')}
                  </div>

                  <div className="flex items-center justify-between text-[11px] opacity-80">
                    <span>{order.date}</span>
                    <span className="font-bold">${order.total.toFixed(2)}</span>
                  </div>

                  <div className="mt-2 pt-1.5 border-t border-black/5 flex items-center justify-between text-[10px]">
                    <span className="capitalize">
                      {order.deliveryType === 'combined'
                        ? 'General Combined Delivery'
                        : 'Direct Store Delivery'}
                    </span>
                    <span className="font-medium underline">
                      {isActive ? 'Track Live Map →' : 'View Receipt →'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Details / Live Map / Receipt View (7 cols) */}
          <div className="md:col-span-7 overflow-y-auto p-6 flex flex-col justify-between bg-white">
            {selectedOrder ? (
              <div className="space-y-4">
                {/* Active Order Live Tracker */}
                {selectedOrder.status !== 'completed' && !showReceiptOnly ? (
                  <div className="space-y-3">
                    <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        <span className="p-2 rounded-xl bg-emerald-600 text-white animate-bounce">
                          <TruckIcon className="w-4 h-4" />
                        </span>
                        <div>
                          <div className="text-xs font-bold text-emerald-900">
                            {selectedOrder.courierLocation?.stepText || 'Order is in progress'}
                          </div>
                          <div className="text-[11px] text-emerald-700">
                            Courier: {selectedOrder.courierLocation?.courierName || 'BuyClose Rider'} • {selectedOrder.courierLocation?.vehicle}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-base font-extrabold text-emerald-800">
                          ~{selectedOrder.courierLocation?.etaMinutes} min
                        </div>
                        <div className="text-[10px] text-emerald-600 uppercase font-semibold">Estimated ETA</div>
                      </div>
                    </div>

                    {/* Live Map Showing Courier Location */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-bold text-[#4C1D95]">
                          Live Courier & Store Location
                        </label>
                        <span className="text-[11px] text-gray-400">GPS Real-time Sync</span>
                      </div>
                      <StoreMap
                        storeName={selectedOrder.storeNames[0] || 'Store'}
                        storeAddress={selectedOrder.deliveryAddress}
                        distanceKm={1.2}
                        deliveryAddress={selectedOrder.deliveryAddress}
                        courierLocation={selectedOrder.courierLocation}
                        height="h-52"
                      />
                    </div>
                  </div>
                ) : (
                  /* Completed Order Receipt Banner */
                  <div className="p-4 rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-gray-700">
                        Order Completed & Delivered
                      </div>
                      <div className="text-[11px] text-gray-500">
                        Delivered to: {selectedOrder.deliveryAddress}
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-gray-200 text-xs font-bold text-gray-700">
                      Paid & Received
                    </span>
                  </div>
                )}

                {/* Receipt Breakdown */}
                <div className="p-4 rounded-2xl border border-purple-100 bg-[#F3E8FF]/20 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-purple-100 text-xs font-bold text-[#4C1D95]">
                    <span>Receipt #{selectedOrder.receiptNumber}</span>
                    <span>{selectedOrder.date}</span>
                  </div>

                  <div className="space-y-2 max-h-36 overflow-y-auto pr-1 text-xs">
                    {selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 truncate">
                          <span className="font-bold text-[#4C1D95]">{item.quantity}x</span>
                          <span className="truncate text-gray-700">{item.productName}</span>
                          <span className="text-[10px] text-gray-400">({item.storeName})</span>
                        </div>
                        <span className="font-semibold ml-2">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-purple-100 space-y-1 text-xs">
                    <div className="flex justify-between text-gray-500">
                      <span>Subtotal</span>
                      <span>${selectedOrder.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-500">
                      <span>Delivery ({selectedOrder.deliveryType === 'combined' ? 'Combined Multi-Store' : 'Direct Store'})</span>
                      <span>${selectedOrder.deliveryFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-extrabold text-[#4C1D95] pt-1 border-t border-purple-100">
                      <span>Total Paid</span>
                      <span>${selectedOrder.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={() => setShowReceiptOnly(!showReceiptOnly)}
                    className="text-xs font-semibold text-[#4C1D95] hover:underline"
                  >
                    {showReceiptOnly ? '← Back to Live View' : 'Printable Receipt View'}
                  </button>
                  <button
                    onClick={() => alert(`Receipt ${selectedOrder.receiptNumber} downloaded.`)}
                    className="px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-bold text-gray-700 transition-colors"
                  >
                    Download PDF Receipt
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 text-xs">
                Select an order from the list to view details.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
