"use client";

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface EmailVerificationProps {
  orderId: string;
  email: string;
  onVerified: () => void;
}

export default function EmailVerification({ orderId, email: initialEmail, onVerified }: EmailVerificationProps) {
  const [digits, setDigits] = useState(['', '', '', '']);
  const [email, setEmail] = useState(initialEmail);
  const [showChangeEmail, setShowChangeEmail] = useState(false);
  const [newEmailInput, setNewEmailInput] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isChanging, setIsChanging] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleDigitChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...digits];
    next[index] = value;
    setDigits(next);
    setError('');
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
    if (pasted.length === 4) {
      setDigits(pasted.split(''));
      inputRefs.current[3]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = digits.join('');
    if (code.length !== 4) {
      setError('Voer de volledige 4-cijferige code in.');
      return;
    }
    setIsVerifying(true);
    setError('');
    try {
      const res = await fetch('/api/verify-email/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, code }),
      });
      const data = await res.json();
      if (data.success) {
        onVerified();
      } else {
        setError(data.error || 'Onjuiste code.');
        setDigits(['', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch {
      setError('Er is een fout opgetreden. Probeer het opnieuw.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    setError('');
    setSuccessMsg('');
    try {
      const res = await fetch('/api/verify-email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg('Nieuwe code verstuurd! Controleer je inbox.');
        setDigits(['', '', '', '']);
        inputRefs.current[0]?.focus();
      } else {
        setError(data.error || 'Verzenden mislukt.');
      }
    } catch {
      setError('Er is een fout opgetreden.');
    } finally {
      setIsResending(false);
    }
  };

  const handleChangeEmail = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!newEmailInput || !emailRegex.test(newEmailInput)) {
      setError('Voer een geldig e-mailadres in.');
      return;
    }
    setIsChanging(true);
    setError('');
    setSuccessMsg('');
    try {
      const res = await fetch('/api/verify-email/send', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, newEmail: newEmailInput }),
      });
      const data = await res.json();
      if (data.success) {
        setEmail(data.email);
        setShowChangeEmail(false);
        setNewEmailInput('');
        setSuccessMsg('E-mailadres gewijzigd en nieuwe code verstuurd!');
        setDigits(['', '', '', '']);
        inputRefs.current[0]?.focus();
      } else {
        setError(data.error || 'Wijzigen mislukt.');
      }
    } catch {
      setError('Er is een fout opgetreden.');
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Bevestig je e-mailadres</h3>
        <p className="text-gray-600 text-sm leading-relaxed">
          We hebben een 4-cijferige code gestuurd naar<br />
          <strong className="text-gray-800">{email}</strong>
        </p>
      </div>

      {/* 4-digit code inputs */}
      <div className="flex justify-center gap-3" onPaste={handlePaste}>
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => { inputRefs.current[i] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={d}
            onChange={(e) => handleDigitChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            className="w-14 h-16 text-center text-2xl font-bold border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-gray-800"
          />
        ))}
      </div>

      {error && (
        <p className="text-center text-sm text-red-600">{error}</p>
      )}
      {successMsg && (
        <p className="text-center text-sm text-green-600">{successMsg}</p>
      )}

      {/* Verify button */}
      <div className="flex justify-center">
        <motion.button
          onClick={handleVerify}
          disabled={isVerifying || digits.join('').length !== 4}
          className="px-10 py-3 bg-[#1F3C88] text-white rounded-full font-semibold shadow-md hover:bg-[#163070] transition-colors disabled:opacity-50"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isVerifying ? 'Controleren…' : 'Bevestig code'}
        </motion.button>
      </div>

      {/* Secondary actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-sm">
        <button
          onClick={handleResend}
          disabled={isResending}
          className="text-gray-600 hover:text-gray-800 underline underline-offset-2 disabled:opacity-50"
        >
          {isResending ? 'Versturen…' : 'E-mail niet ontvangen? Opnieuw versturen'}
        </button>
        <span className="hidden sm:inline text-gray-300">|</span>
        <button
          onClick={() => { setShowChangeEmail(!showChangeEmail); setError(''); }}
          className="text-gray-600 hover:text-gray-800 underline underline-offset-2"
        >
          E-mailadres wijzigen
        </button>
      </div>

      {/* Change email form */}
      {showChangeEmail && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="border border-gray-200 rounded-xl p-4 space-y-3 bg-gray-50/60"
        >
          <label className="block text-sm font-medium text-gray-700">Nieuw e-mailadres</label>
          <input
            type="email"
            value={newEmailInput}
            onChange={(e) => setNewEmailInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleChangeEmail()}
            placeholder="jouw.naam@email.com"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            autoFocus
          />
          <div className="flex gap-3">
            <button
              onClick={handleChangeEmail}
              disabled={isChanging}
              className="flex-1 px-4 py-2 bg-[#1F3C88] text-white rounded-full text-sm font-medium hover:bg-[#163070] transition-colors disabled:opacity-50"
            >
              {isChanging ? 'Opslaan…' : 'Opslaan & code versturen'}
            </button>
            <button
              onClick={() => { setShowChangeEmail(false); setNewEmailInput(''); }}
              className="px-4 py-2 border border-gray-300 rounded-full text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Annuleren
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
