import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, Mail, Lock, User, Loader2, Chrome, Phone } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const phoneSignupSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must not exceed 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces'),
  phone: z.string()
    .min(1, 'Phone number is required')
    .transform(val => val.trim())
    .refine(val => /^[0-9+()\-\s]{6,20}$/.test(val), 'Invalid phone number'),
  email: z.string()
    .min(1, 'Email is required for verification')
    .email('Invalid email format')
    .transform(val => val.toLowerCase().trim()),
  password: z.string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string()
    .min(1, 'Please confirm your password'),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type PhoneSignupInput = z.infer<typeof phoneSignupSchema>;

export default function PhoneSignupForm() {
  const SIGNUP_COOLDOWN_KEY = 'signupCooldownUntil';
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [retryAfter, setRetryAfter] = useState<number | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const { signUp } = useAuth();

  const { register, handleSubmit, formState: { errors } } = useForm<PhoneSignupInput>({
    resolver: zodResolver(phoneSignupSchema),
  });

  const [registeredName, setRegisteredName] = useState('');

  useEffect(() => {
    const storedValue = window.localStorage.getItem(SIGNUP_COOLDOWN_KEY);
    if (!storedValue) return;

    const parsed = Number(storedValue);
    if (!Number.isNaN(parsed) && parsed > Date.now()) {
      setRetryAfter(parsed);
    } else {
      window.localStorage.removeItem(SIGNUP_COOLDOWN_KEY);
    }
  }, []);

  useEffect(() => {
    if (!retryAfter) return;

    const tick = () => {
      const remaining = Math.max(0, Math.ceil((retryAfter - Date.now()) / 1000));
      setSecondsRemaining(remaining);

      if (remaining <= 0) {
        setRetryAfter(null);
        window.localStorage.removeItem(SIGNUP_COOLDOWN_KEY);
      }
    };

    tick();
    const intervalId = window.setInterval(tick, 1000);
    return () => window.clearInterval(intervalId);
  }, [retryAfter]);

  const isRateLimited = retryAfter !== null && Date.now() < retryAfter;

  const toFriendlySignupError = (message: string): { message: string; isRateLimit: boolean } => {
    const normalized = message.toLowerCase();

    if (normalized.includes('rate limit') || normalized.includes('too many requests') || normalized.includes('email rate limit exceeded')) {
      const cooldownMs = 180_000;
      const cooldownUntil = Date.now() + cooldownMs;
      setRetryAfter(cooldownUntil);
      window.localStorage.setItem(SIGNUP_COOLDOWN_KEY, String(cooldownUntil));
      return { message: '', isRateLimit: true };
    }

    if (normalized.includes('user already registered')) {
      return { message: 'This email is already registered. Please log in instead.', isRateLimit: false };
    }

    return { message, isRateLimit: false };
  };

  const onSubmit = async (data: PhoneSignupInput) => {
    if (isRateLimited) return;

    setError('');
    setRegisteredName(data.name);

    const storedCooldown = window.localStorage.getItem(SIGNUP_COOLDOWN_KEY);
    if (storedCooldown) {
      const cooldownUntil = Number(storedCooldown);
      if (!Number.isNaN(cooldownUntil) && cooldownUntil > Date.now()) {
        const waitSeconds = Math.ceil((cooldownUntil - Date.now()) / 1000);
        setError(`Too many signup attempts. Email provider is rate-limiting. Please wait ${waitSeconds} seconds or use Google signup.`);
        return;
      }
    }

    setLoading(true);
    const { error } = await signUp(data.email, data.password, data.name, data.phone);

    if (error) {
      const parsed = toFriendlySignupError(error.message || 'Signup failed');
      if (!parsed.isRateLimit) {
        setError(parsed.message);
      }
    } else {
      setSuccess(true);
    }
    setLoading(false);
  };

  const handleGoogleSignup = async () => {
    setError('');
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/upload-bhajan`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      if (error) {
        const parsed = toFriendlySignupError(error.message);
        if (!parsed.isRateLimit) {
          setError(parsed.message);
        }
      }
    } catch (err: any) {
      const parsed = toFriendlySignupError(err.message || 'Google signup failed');
      if (!parsed.isRateLimit) {
        setError(parsed.message);
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full py-8 text-center">
        <div className="mb-4 text-4xl">✅</div>
        <h2 className="mb-2 text-2xl font-bold">Account Created!</h2>
        <p className="mb-4 text-muted-foreground">
          Welcome, {registeredName}! Please check your email to verify your account, then login.
        </p>
        <p className="mb-6 text-sm text-muted-foreground">
          Check spam/junk folder if no email arrives.
        </p>
        <Link
          to="/auth/login"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/30 hover:from-orange-600 hover:to-amber-600 transition-all"
        >
          <ArrowRight className="w-4 h-4" />
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-full">
      <div className="space-y-1 text-center">
        <h2 className="text-3xl font-semibold text-white">Create Account</h2>
        <p className="text-sm text-slate-400">Sign up with your mobile number and email for verification.</p>
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {isRateLimited && (
        <div className="rounded-xl border-2 border-red-500/50 bg-red-500/10 p-4 text-sm font-semibold text-red-400">
          ⏱️ Signup blocked for {secondsRemaining}s. Your email provider is rate-limiting. Try Google signup instead.
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="name" className="text-xs font-semibold uppercase tracking-wide text-slate-300">Full Name *</label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-500/60 w-4 h-4" />
          <Input
            id="name"
            type="text"
            {...register('name')}
            placeholder="Your Full Name"
            className="h-12 rounded-xl border border-orange-500/50 bg-slate-800/50 text-white placeholder:text-slate-500 pl-10 focus-visible:ring-orange-500 focus-visible:ring-2 focus-visible:border-orange-500 shadow-lg shadow-orange-500/20 hover:border-orange-500/75 transition-all"
          />
        </div>
        {errors.name && (
          <p className="text-xs text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="phone" className="text-xs font-semibold uppercase tracking-wide text-slate-300">Phone *</label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-500/60 w-4 h-4" />
          <Input
            id="phone"
            type="tel"
            {...register('phone')}
            placeholder="+91 98765 43210"
            className="h-12 rounded-xl border border-orange-500/50 bg-slate-800/50 text-white placeholder:text-slate-500 pl-10 focus-visible:ring-orange-500 focus-visible:ring-2 focus-visible:border-orange-500 shadow-lg shadow-orange-500/20 hover:border-orange-500/75 transition-all"
          />
        </div>
        {errors.phone && (
          <p className="text-xs text-destructive">{errors.phone.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wide text-slate-300">Email (Required for Verification) *</label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-500/60 w-4 h-4" />
          <Input
            id="email"
            type="email"
            {...register('email')}
            placeholder="your@email.com"
            className="h-12 rounded-xl border border-orange-500/50 bg-slate-800/50 text-white placeholder:text-slate-500 pl-10 focus-visible:ring-orange-500 focus-visible:ring-2 focus-visible:border-orange-500 shadow-lg shadow-orange-500/20 hover:border-orange-500/75 transition-all"
          />
        </div>
        {errors.email && (
          <p className="text-xs text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="text-xs font-semibold uppercase tracking-wide text-slate-300">Password *</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-500/60 w-4 h-4" />
          <Input
            id="password"
            type="password"
            {...register('password')}
            placeholder="••••••"
            className="h-12 rounded-xl border border-orange-500/50 bg-slate-800/50 text-white placeholder:text-slate-500 pl-10 focus-visible:ring-orange-500 focus-visible:ring-2 focus-visible:border-orange-500 shadow-lg shadow-orange-500/20 hover:border-orange-500/75 transition-all"
          />
        </div>
        {errors.password && (
          <p className="text-xs text-destructive">{errors.password.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="confirmPassword" className="text-xs font-semibold uppercase tracking-wide text-slate-300">Confirm Password *</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-500/60 w-4 h-4" />
          <Input
            id="confirmPassword"
            type="password"
            {...register('confirmPassword')}
            placeholder="••••••"
            className="h-12 rounded-xl border border-orange-500/50 bg-slate-800/50 text-white placeholder:text-slate-500 pl-10 focus-visible:ring-orange-500 focus-visible:ring-2 focus-visible:border-orange-500 shadow-lg shadow-orange-500/20 hover:border-orange-500/75 transition-all"
          />
        </div>
        {errors.confirmPassword && (
          <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
        )}
      </div>

      <Button type="submit" disabled={loading || isRateLimited} className={`h-12 w-full rounded-xl text-base font-semibold transition-all shadow-lg ${isRateLimited ? 'bg-slate-600 text-slate-300 cursor-not-allowed' : 'bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600 shadow-orange-500/30'}`}>
        {loading && <Loader2 className="mr-2 w-4 h-4 animate-spin" />}
        {isRateLimited ? `🔒 Blocked ${secondsRemaining}s` : 'Create Sacred Account'}
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-orange-500/20" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-slate-800/50 px-3 text-slate-400">Or seek with</span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={handleGoogleSignup}
        disabled={loading}
        className="h-12 w-full rounded-xl border border-orange-500/30 bg-slate-800/50 text-white hover:bg-slate-700/50 hover:border-orange-500/50"
      >
        <Chrome className="mr-2 w-4 h-4" />
        Sign up with Google
      </Button>

      <p className="text-center text-sm text-slate-400">
        Already have an account?{' '}
        <Link to="/auth/login" className="text-orange-400 hover:text-orange-300 hover:underline font-medium">
          Login
        </Link>
      </p>
    </form>
  );
}
