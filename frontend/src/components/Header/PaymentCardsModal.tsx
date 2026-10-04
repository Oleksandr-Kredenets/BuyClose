import React, { useState } from 'react';
import { PaymentCard } from '../../types';
import { CardIcon, CloseIcon, CheckIcon } from '../Common/Icons';

interface PaymentCardsModalProps {
  cards: PaymentCard[];
  onClose: () => void;
  onAddCard: (card: PaymentCard) => void;
  onSetDefault: (id: string) => void;
}

export const PaymentCardsModal: React.FC<PaymentCardsModalProps> = ({
  cards,
  onClose,
  onAddCard,
  onSetDefault,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [cardholderName, setCardholderName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [storeAffinity, setStoreAffinity] = useState('Universal');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardNumber || !cardholderName) return;

    const lastFour = cardNumber.replace(/\s/g, '').slice(-4) || '1234';
    const newCard: PaymentCard = {
      id: `card-${Date.now()}`,
      cardholderName: cardholderName.toUpperCase(),
      cardNumberMasked: `•••• •••• •••• ${lastFour}`,
      expiryDate: expiry || '12/28',
      brand: storeAffinity.includes('ATB') || storeAffinity.includes('Silpo') ? 'store_loyalty' : 'visa',
      storeAffinity,
      isDefault: cards.length === 0,
    };

    onAddCard(newCard);
    setIsAdding(false);
    setCardholderName('');
    setCardNumber('');
    setExpiry('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-purple-100 overflow-hidden text-[#0C4A6E] animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-purple-50 bg-[#F3E8FF]/30">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-[#4C1D95] text-white shadow-xs">
              <CardIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base text-[#4C1D95]">Payment & Store Cards</h2>
              <p className="text-xs text-gray-500">
                Manage cards linked to specific store checkouts or universal cards.
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

        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Card list */}
          <div className="space-y-3">
            {cards.map((card) => (
              <div
                key={card.id}
                className="p-4 rounded-2xl border border-purple-100 bg-gradient-to-r from-white to-[#F3E8FF]/30 flex items-center justify-between hover:shadow-xs transition-shadow"
              >
                <div className="flex items-center space-x-3.5">
                  <div className="w-11 h-8 rounded-lg bg-[#4C1D95] text-white flex items-center justify-center font-black text-[10px] tracking-wider shadow-xs">
                    {card.brand === 'store_loyalty' ? 'PERK' : 'CARD'}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-xs text-[#0C4A6E]">{card.storeAffinity}</span>
                      {card.isDefault && (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">
                          Default
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-mono text-gray-500 mt-0.5">
                      {card.cardNumberMasked} • Exp: {card.expiryDate}
                    </div>
                  </div>
                </div>

                {!card.isDefault && (
                  <button
                    onClick={() => onSetDefault(card.id)}
                    className="text-xs text-[#4C1D95] font-semibold hover:underline px-2 py-1"
                  >
                    Make Default
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Add New Card Form */}
          {isAdding ? (
            <form onSubmit={handleCreate} className="p-4 rounded-2xl bg-[#F3E8FF]/30 border border-[#A78BFA]/30 space-y-3 mt-4">
              <div className="font-bold text-xs text-[#4C1D95]">Add Payment or Store Card</div>
              <div>
                <label className="block text-[11px] font-semibold text-gray-500 mb-1">Store Association</label>
                <select
                  value={storeAffinity}
                  onChange={(e) => setStoreAffinity(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-purple-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#4C1D95]"
                >
                  <option value="Universal">Universal (All Stores)</option>
                  <option value="ATB Club Card (5% Off)">ATB Club Card (5% Off)</option>
                  <option value="Silpo Rewards Mastercard">Silpo Rewards Mastercard</option>
                  <option value="Local Artisan Bakery Pay">Local Artisan Bakery Pay</option>
                  <option value="Eco Lavka Organic Club">Eco Lavka Organic Club</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-500 mb-1">Cardholder Name</label>
                <input
                  type="text"
                  required
                  placeholder="ALEX MARCHENKO"
                  value={cardholderName}
                  onChange={(e) => setCardholderName(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-purple-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#4C1D95] uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 mb-1">Card Number</label>
                  <input
                    type="text"
                    required
                    maxLength={19}
                    placeholder="4441 2345 6789 0012"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-purple-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#4C1D95] font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 mb-1">Expiry (MM/YY)</label>
                  <input
                    type="text"
                    required
                    maxLength={5}
                    placeholder="12/28"
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-purple-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#4C1D95] font-mono"
                  />
                </div>
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-[#4C1D95] text-white font-bold text-xs hover:bg-[#5b23b1] transition-colors shadow-xs"
                >
                  Save Card
                </button>
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-2 rounded-xl bg-gray-100 text-gray-600 font-semibold text-xs hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setIsAdding(true)}
              className="w-full py-2.5 rounded-2xl border-2 border-dashed border-[#A78BFA] text-[#4C1D95] font-bold text-xs hover:bg-[#F3E8FF]/50 transition-colors flex items-center justify-center space-x-1.5"
            >
              <span>+ Add Store or Payment Card</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
