import React, { useState } from 'react';
import { Coordinates, UserProfile } from '../../types';
import { CloseIcon, MapPinIcon, UserIcon } from '../Common/Icons';

interface ProfileModalProps {
  profile: UserProfile;
  onClose: () => void;
  onUpdateProfile: (updated: UserProfile) => void;
  onRequestDeviceLocation: () => Promise<Coordinates>;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  profile,
  onClose,
  onUpdateProfile,
  onRequestDeviceLocation,
}) => {
  const [name, setName] = useState(profile.name);
  const [deliveryAddress, setDeliveryAddress] = useState(profile.deliveryAddress);
  const [useDeviceGps, setUseDeviceGps] = useState(profile.useDeviceGps);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const handleGpsChange = async (enabled: boolean) => {
    setLocationError(null);
    if (!enabled) {
      setUseDeviceGps(false);
      return;
    }

    try {
      await onRequestDeviceLocation();
      setUseDeviceGps(true);
    } catch (error) {
      setUseDeviceGps(false);
      setLocationError(error instanceof Error ? error.message : 'Unable to get your location.');
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      ...profile,
      name,
      deliveryAddress,
      useDeviceGps,
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-purple-100 overflow-hidden text-[#0C4A6E] animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-purple-50 bg-[#F3E8FF]/30">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-[#4C1D95] text-white shadow-xs">
              <UserIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base text-[#4C1D95]">Profile & Delivery Settings</h2>
              <p className="text-xs text-gray-500">
                Anchor address configuration for Closest Store calculations
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

        <form onSubmit={handleSave} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-xl border border-purple-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#4C1D95]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">Email (Account ID)</label>
            <input
              type="text"
              disabled
              value={profile.email}
              className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed"
            />
          </div>

          {/* Delivery Address & Anchor Logic */}
          <div className="p-4 rounded-2xl bg-[#F3E8FF]/40 border border-purple-200 space-y-3">
            <div className="flex items-start space-x-2">
              <MapPinIcon className="w-4 h-4 text-[#4C1D95] mt-0.5 flex-shrink-0" />
              <div>
                <label className="block text-xs font-bold text-[#4C1D95]">
                  Delivery Anchor Address
                </label>
                <p className="text-[11px] text-gray-600 mt-0.5">
                  <strong>Core Logic:</strong> This address is used as the anchor to calculate &quot;Closest Stores&quot; if device GPS is turned off.
                </p>
              </div>
            </div>

            <input
              type="text"
              required
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              placeholder="e.g., Shevchenka Blvd, 18, Apt 42, Kyiv"
              className="w-full text-xs px-3 py-2 rounded-xl border border-purple-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#4C1D95]"
            />

            {/* GPS Toggle */}
            <div className="pt-2 border-t border-purple-100 flex items-center justify-between text-xs">
              <div>
                <div className="font-bold text-[#0C4A6E]">Device GPS Mode</div>
                <div className="text-[10px] text-gray-500">
                  {useDeviceGps ? 'Using live device GPS sensor' : 'Use your location (browser permission required)'}
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={useDeviceGps}
                  onChange={(e) => void handleGpsChange(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#4C1D95]"></div>
              </label>
            </div>
            {locationError && (
              <div className="text-[11px] text-red-600" role="alert">
                {locationError}
              </div>
            )}
          </div>

          {savedSuccess && (
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold text-center border border-emerald-200">
              ✓ Profile and store proximity anchor updated successfully!
            </div>
          )}

          <div className="flex space-x-2 pt-2">
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-[#4C1D95] text-white font-bold text-xs hover:bg-[#5b23b1] transition-colors shadow-xs"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-gray-100 text-gray-600 font-semibold text-xs hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
