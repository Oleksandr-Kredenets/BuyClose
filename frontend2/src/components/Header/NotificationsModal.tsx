import React from 'react';
import { NotificationItem } from '../../types';
import { BellIcon, CloseIcon } from '../Common/Icons';

interface NotificationsModalProps {
  notifications: NotificationItem[];
  onClose: () => void;
  onMarkAllRead: () => void;
  onSelectOrderNotification: (orderId: string) => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  notifications,
  onClose,
  onMarkAllRead,
  onSelectOrderNotification,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-purple-100 overflow-hidden text-[#0C4A6E] animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-purple-50 bg-[#F3E8FF]/30">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-[#4C1D95] text-white shadow-xs">
              <BellIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base text-[#4C1D95]">Notifications</h2>
              <p className="text-xs text-gray-500">Order alerts, courier status & security logins</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white shadow-xs border border-purple-100 flex items-center justify-center text-gray-500 hover:text-[#4C1D95] transition-colors"
          >
            <CloseIcon className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-3 max-h-[70vh] overflow-y-auto">
          <div className="flex items-center justify-between pb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Recent Alerts</span>
            <button
              onClick={onMarkAllRead}
              className="text-xs font-semibold text-[#4C1D95] hover:underline"
            >
              Mark all as read
            </button>
          </div>

          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => {
                if (n.orderId) onSelectOrderNotification(n.orderId);
              }}
              className={`p-3.5 rounded-2xl border transition-all ${
                n.read
                  ? 'bg-gray-50/70 border-gray-100 text-gray-600'
                  : 'bg-[#F3E8FF]/40 border-purple-200 text-[#0C4A6E] shadow-xs'
              } ${n.orderId ? 'cursor-pointer hover:border-[#A78BFA]' : ''}`}
            >
              <div className="flex items-start justify-between mb-1">
                <div className="flex items-center space-x-1.5">
                  {!n.read && <div className="w-2 h-2 rounded-full bg-[#4C1D95]" />}
                  <h4 className="font-bold text-xs text-[#4C1D95]">{n.title}</h4>
                </div>
                <span className="text-[10px] text-gray-400 font-medium">{n.timestamp}</span>
              </div>
              <p className="text-xs text-gray-600 leading-snug">{n.message}</p>
              {n.orderId && (
                <div className="mt-2 text-[10px] font-bold text-[#4C1D95] underline">
                  Click to view live tracking →
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
