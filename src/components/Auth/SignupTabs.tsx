import { useState } from 'react';
import SignupForm from '@/components/Auth/SignupForm';
import PhoneSignupForm from '@/components/Auth/PhoneSignupForm';

export default function SignupTabs() {
  const [method, setMethod] = useState<'email' | 'phone'>('email');

  return (
    <div className="space-y-4 w-full">
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setMethod('email')}
          aria-pressed={method === 'email'}
          className={`rounded-xl border px-3 py-2 text-xs font-semibold uppercase tracking-wide transition-all ${
            method === 'email'
              ? 'border-orange-500/70 bg-orange-500/15 text-orange-100'
              : 'border-orange-500/20 bg-slate-800/40 text-slate-300 hover:border-orange-500/40'
          }`}
        >
          Email Signup
        </button>
        <button
          type="button"
          onClick={() => setMethod('phone')}
          aria-pressed={method === 'phone'}
          className={`rounded-xl border px-3 py-2 text-xs font-semibold uppercase tracking-wide transition-all ${
            method === 'phone'
              ? 'border-orange-500/70 bg-orange-500/15 text-orange-100'
              : 'border-orange-500/20 bg-slate-800/40 text-slate-300 hover:border-orange-500/40'
          }`}
        >
          Phone Signup
        </button>
      </div>

      {method === 'email' ? <SignupForm /> : <PhoneSignupForm />}
    </div>
  );
}
