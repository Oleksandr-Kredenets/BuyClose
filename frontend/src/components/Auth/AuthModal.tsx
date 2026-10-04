import React, { useState } from 'react';
import { CloseIcon, CheckIcon } from '../Common/Icons';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (name: string, email: string) => void;
  existingAccounts: string[];
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  existingAccounts,
}) => {
  // Modes: 'signup' | 'verify' | 'login'
  const [authMode, setAuthMode] = useState<'signup' | 'verify' | 'login'>('signup');
  const [loginInput, setLoginInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [verificationCode, setVerificationCode] = useState(['', '', '', '']);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [securityDuplicateDetected, setSecurityDuplicateDetected] = useState(false);
  const [registeredList, setRegisteredList] = useState<string[]>(existingAccounts);

  if (!isOpen) return null;

  // Clean and normalize email/phone for duplicate protection comparison
  const normalizeIdentifier = (val: string) => val.trim().toLowerCase().replace(/[\s\-\(\)]/g, '');

  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSecurityDuplicateDetected(false);

    const normalized = normalizeIdentifier(loginInput);

    // Security Logic: Duplicate profile protection based on base phone/email
    const isDuplicate = registeredList.some(
      (acc) => normalizeIdentifier(acc) === normalized
    );

    if (isDuplicate) {
      setSecurityDuplicateDetected(true);
      setErrorMessage(
        'Duplicate profile detected: An account with this phone or email already exists. Please log in instead.'
      );
      return;
    }

    if (passwordInput.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    // Advance to verification code flow
    setAuthMode('verify');
  };

  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const enteredCode = verificationCode.join('');
    if (enteredCode.length !== 4) {
      setErrorMessage('Please enter the complete 4-digit verification code.');
      return;
    }

    // Save newly registered account into duplicate protection list
    setRegisteredList((prev) => [...prev, loginInput.trim()]);
    onLoginSuccess(nameInput || 'New Shopper', loginInput.trim());
    onClose();
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!loginInput || !passwordInput) {
      setErrorMessage('Please enter both your login and password.');
      return;
    }

    // Successful login simulation
    const displayName = loginInput.includes('@')
      ? loginInput.split('@')[0]
      : 'Shopper ' + loginInput.slice(-4);

    onLoginSuccess(displayName, loginInput);
    onClose();
  };

  const resetState = () => {
    setErrorMessage(null);
    setSecurityDuplicateDetected(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-purple-100 overflow-hidden text-[#0C4A6E] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-purple-50 bg-[#F3E8FF]/30">
          <div>
            <h2 className="font-extrabold text-base text-[#4C1D95]">
              {authMode === 'signup' && 'Create your BuyClose Account'}
              {authMode === 'verify' && 'Verify Phone / Email'}
              {authMode === 'login' && 'Log In to BuyClose'}
            </h2>
            <p className="text-xs text-gray-500">
              {authMode === 'signup' && 'Compare stores, save carts & track local orders'}
              {authMode === 'verify' && `We sent a 4-digit security code to ${loginInput}`}
              {authMode === 'login' && 'Enter your credentials to access your account'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white shadow-xs border border-purple-100 flex items-center justify-center text-gray-500 hover:text-[#4C1D95] transition-colors"
          >
            <CloseIcon className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6">
          {/* Security Alert Banner for Duplicate Profile Protection */}
          {securityDuplicateDetected && (
            <div className="mb-4 p-3 rounded-2xl bg-amber-50 border border-[#FBBF24] text-amber-900 text-xs">
              <div className="font-bold flex items-center space-x-1.5 mb-1">
                <span>🛡️ Security Duplicate Protection</span>
              </div>
              <p className="leading-snug">{errorMessage}</p>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  resetState();
                }}
                className="mt-2 text-xs font-bold text-[#4C1D95] underline"
              >
                Switch to Log In with this account →
              </button>
            </div>
          )}

          {errorMessage && !securityDuplicateDetected && (
            <div className="mb-4 p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
              {errorMessage}
            </div>
          )}

          {/* 1. SIGN UP FORM */}
          {authMode === 'signup' && (
            <div>
              <form onSubmit={handleSignUpSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">
                    Login (Phone or Email)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. +380 50 123 4567 or you@mail.com"
                    value={loginInput}
                    onChange={(e) => setLoginInput(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-purple-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#4C1D95]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Alex Marchenko"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-purple-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#4C1D95]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Min 6 characters"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-purple-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#4C1D95]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl bg-[#4C1D95] hover:bg-[#5b23b1] text-white font-bold text-xs transition-colors shadow-xs"
                >
                  Continue to Verification
                </button>
              </form>

              {/* Divider: A horizontal line below the sign-up fields with the word "or" in the center */}
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-purple-100" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-3 text-gray-400 font-semibold uppercase text-[10px] tracking-widest">
                    or
                  </span>
                </div>
              </div>

              {/* Log In Toggle Button: Toggles the state to show ONLY the Login and Password fields */}
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  resetState();
                }}
                className="w-full py-2.5 px-4 rounded-xl border border-[#A78BFA] text-[#4C1D95] font-bold text-xs hover:bg-[#F3E8FF]/60 transition-colors"
              >
                Log in to existing account
              </button>
            </div>
          )}

          {/* 2. VERIFICATION CODE FLOW */}
          {authMode === 'verify' && (
            <form onSubmit={handleVerifySubmit} className="space-y-4">
              <div className="text-center py-2">
                <div className="text-xs text-gray-500 mb-3">
                  Enter the 4-digit code sent to: <span className="font-bold text-[#4C1D95]">{loginInput}</span>
                </div>

                {/* 4-Digit Inputs */}
                <div className="flex justify-center space-x-2.5">
                  {verificationCode.map((digit, index) => (
                    <input
                      key={index}
                      id={`digit-${index}`}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => {
                        const val = e.target.value;
                        const newCode = [...verificationCode];
                        newCode[index] = val;
                        setVerificationCode(newCode);
                        if (val && index < 3) {
                          const nextInput = document.getElementById(`digit-${index + 1}`);
                          nextInput?.focus();
                        }
                      }}
                      className="w-12 h-12 text-center text-lg font-black rounded-xl border-2 border-purple-200 focus:border-[#4C1D95] focus:outline-none bg-purple-50/20 text-[#4C1D95]"
                    />
                  ))}
                </div>

                <div className="mt-3 text-[11px] text-gray-400">
                  Demo auto-fill helper:{' '}
                  <button
                    type="button"
                    onClick={() => setVerificationCode(['4', '8', '2', '1'])}
                    className="font-bold text-[#4C1D95] hover:underline"
                  >
                    Click to fill 4-8-2-1
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-[#4C1D95] hover:bg-[#5b23b1] text-white font-bold text-xs transition-colors shadow-xs"
              >
                Verify & Complete Registration
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthMode('signup');
                  resetState();
                }}
                className="w-full text-center text-xs text-gray-400 hover:text-gray-600"
              >
                ← Back to Edit Information
              </button>
            </form>
          )}

          {/* 3. LOG IN FORM (SHOWS ONLY LOGIN AND PASSWORD FIELDS) */}
          {authMode === 'login' && (
            <div>
              <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">
                    Login (Phone or Email)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your phone or email"
                    value={loginInput}
                    onChange={(e) => setLoginInput(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-purple-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#4C1D95]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Enter your password"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-purple-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#4C1D95]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl bg-[#4C1D95] hover:bg-[#5b23b1] text-white font-bold text-xs transition-colors shadow-xs"
                >
                  Log In
                </button>
              </form>

              {/* Option to toggle back to Sign Up */}
              <div className="mt-4 pt-3 border-t border-purple-50 text-center">
                <span className="text-xs text-gray-500">Need an account? </span>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signup');
                    resetState();
                  }}
                  className="text-xs font-bold text-[#4C1D95] hover:underline"
                >
                  Sign up here
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
