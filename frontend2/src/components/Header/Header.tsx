import React, { useState } from 'react';
import { UserProfile } from '../../types';
import {
  LogoIcon,
  SearchIcon,
  HistoryIcon,
  CardIcon,
  BellIcon,
  CartIcon,
} from '../Common/Icons';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  cartCount: number;
  unreadNotifsCount: number;
  activeOrdersCount: number;
  profile: UserProfile;
  onOpenHistory: () => void;
  onOpenCards: () => void;
  onOpenNotifications: () => void;
  onOpenProfile: () => void;
  onOpenCart: () => void;
  onOpenAuth: () => void;
  isLoggedIn: boolean;
}

/**
 * Header Layout: Strict 10-part proportional layout
 * Left to right:
 * - 0.7/10 Width: Circular Site Logo/Icon
 * - 7/10 Width: Central Search Bar (crucial detail: placeholder text "Search" in gray before focus)
 * - 2.3/10 Width: Navigation Group (Purchase History, Cards, Notifications, Profile, Cart)
 */
export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  cartCount,
  unreadNotifsCount,
  activeOrdersCount,
  profile,
  onOpenHistory,
  onOpenCards,
  onOpenNotifications,
  onOpenProfile,
  onOpenCart,
  onOpenAuth,
  isLoggedIn,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-purple-100 px-4 py-2.5 shadow-xs">
      {/* 10-part proportional layout via CSS grid: 0.7fr, 7fr, 2.3fr */}
      <div
        className="w-full items-center grid gap-3"
        style={{ gridTemplateColumns: '0.7fr 7fr 2.3fr' }}
      >
        {/* 1. 0.7/10 Width: Circular Site Logo / Icon */}
        <div className="flex items-center justify-start">
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            title="BuyClose Multi-Store Aggregator"
            className="flex items-center space-x-1.5 p-1 rounded-full hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-[#A78BFA]"
          >
            <LogoIcon className="w-9 h-9 flex-shrink-0 drop-shadow-xs" />
            <div className="hidden xl:flex flex-col text-left leading-none">
              <span className="font-black text-xs text-[#4C1D95] tracking-tight">BuyClose</span>
              <span className="text-[9px] text-[#A78BFA] font-bold">Near & Fresh</span>
            </div>
          </button>
        </div>

        {/* 2. 7/10 Width: Central Search Bar */}
        <div className="w-full flex items-center justify-center">
          <div
            className={`relative w-full transition-all duration-200 rounded-2xl flex items-center bg-[#F3E8FF]/40 border ${
              isFocused
                ? 'border-[#4C1D95] ring-2 ring-[#A78BFA]/40 bg-white shadow-sm'
                : 'border-purple-100 hover:border-[#A78BFA]/50'
            }`}
          >
            <div className="pl-3.5 pr-2 text-gray-400 flex items-center pointer-events-none">
              <SearchIcon className="w-4 h-4" />
            </div>

            {/* 
              Crucial UI detail: placeholder text "Search" in a gray color 
              (placeholder:text-gray-400) before the user clicks/focuses on it.
            */}
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Search"
              className="w-full py-2 text-xs font-medium text-[#0C4A6E] placeholder:text-gray-400 bg-transparent focus:outline-none focus:placeholder:text-gray-300"
            />

            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="pr-3 text-xs text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}

            <div className="pr-3 hidden sm:flex items-center space-x-1 text-[10px] text-gray-400 font-semibold">
              <span className="px-1.5 py-0.5 rounded bg-white/80 border border-purple-100">Esc to clear</span>
            </div>
          </div>
        </div>

        {/* 3. 2.3/10 Width: Navigation Group */}
        <div className="flex items-center justify-end space-x-1 sm:space-x-2 text-[#0C4A6E]">
          {/* Purchase History Button */}
          <button
            type="button"
            onClick={onOpenHistory}
            title="Purchase History & Order Tracking"
            className={`relative p-2 rounded-xl border transition-all flex items-center space-x-1 ${
              activeOrdersCount > 0
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : 'bg-white border-purple-100 hover:bg-[#F3E8FF] text-gray-600'
            }`}
          >
            <HistoryIcon className="w-4 h-4" />
            <span className="hidden lg:inline text-xs font-bold">History</span>
            {activeOrdersCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping absolute -top-0.5 -right-0.5" />
            )}
          </button>

          {/* Cards Button */}
          <button
            type="button"
            onClick={onOpenCards}
            title="Manage Store & Payment Cards"
            className="p-2 rounded-xl bg-white border border-purple-100 hover:bg-[#F3E8FF] text-gray-600 transition-colors flex items-center space-x-1"
          >
            <CardIcon className="w-4 h-4" />
            <span className="hidden lg:inline text-xs font-bold">Cards</span>
          </button>

          {/* Notifications Button */}
          <button
            type="button"
            onClick={onOpenNotifications}
            title="Alerts & Notifications"
            className="relative p-2 rounded-xl bg-white border border-purple-100 hover:bg-[#F3E8FF] text-gray-600 transition-colors"
          >
            <BellIcon className="w-4 h-4" />
            {unreadNotifsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#4C1D95] text-white text-[9px] font-black flex items-center justify-center ring-2 ring-white">
                {unreadNotifsCount}
              </span>
            )}
          </button>

          {/* Profile / Auth Button */}
          {isLoggedIn ? (
            <button
              type="button"
              onClick={onOpenProfile}
              title={`Logged in as ${profile.name}`}
              className="p-1.5 pl-2 pr-2.5 rounded-xl bg-[#F3E8FF] border border-[#A78BFA]/30 hover:border-[#4C1D95] text-[#4C1D95] transition-all flex items-center space-x-1.5"
            >
              <div className="w-5 h-5 rounded-full bg-[#4C1D95] text-white flex items-center justify-center text-[10px] font-bold">
                {profile.name.charAt(0)}
              </div>
              <span className="hidden md:inline text-xs font-bold max-w-[80px] truncate">
                {profile.name.split(' ')[0]}
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenAuth}
              className="px-3 py-1.5 rounded-xl bg-[#4C1D95] text-white text-xs font-bold hover:bg-[#5b23b1] transition-colors shadow-xs"
            >
              Sign In
            </button>
          )}

          {/* Cart Trigger */}
          <button
            type="button"
            onClick={onOpenCart}
            title="Shopping Cart & Delivery Checkout"
            className="relative p-2 rounded-xl bg-[#4C1D95] text-white hover:bg-[#5b23b1] transition-colors shadow-xs flex items-center space-x-1"
          >
            <CartIcon className="w-4 h-4" />
            {cartCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-[#FBBF24] text-[#0C4A6E] font-black text-[10px]">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
