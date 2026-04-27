import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, Lock, User, Loader2, Chrome } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export default function SignupForm() {
  const SIGNUP_COOLDOWN_KEY = 'signupCooldownUntil';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [retryAfter, setRetryAfter] = useState<number | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const { signUp } = useAuth();
  const navigate = useNavigate();

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
      const cooldownMs = 180_000; // 3 minutes - Supabase rolling window
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isRateLimited) {
      setError('');
    }

    if (isRateLimited) {
      return;
    }

    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    // Final defensive check: read localStorage directly to prevent any race condition
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
    const { error } = await signUp(email, password, name);
    
    if (error) {
      const parsed = toFriendlySignupError(error.message || 'Signup failed');
      if (!parsed.isRateLimit) {
        setError(parsed.message);
      }
    } else {
      setSuccess(true);
      setTimeout(() => {
        navigate('/auth/login');
      }, 2000);
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
          Welcome, {name}! Check your email to verify your account.
        </p>
        <p className="text-sm text-muted-foreground">
          Redirecting to login...
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full">
      <div className="space-y-1 text-center">
        <h2 className="text-3xl font-semibold text-white">Create Account</h2>
        <p className="text-sm text-slate-400">Build your profile and share your devotion with everyone.</p>
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
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-300">Full Name *</label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-500/60 w-4 h-4" />
          <Input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your Full Name"
            className="h-12 rounded-xl border border-orange-500/50 bg-slate-800/50 text-white placeholder:text-slate-500 pl-10 focus-visible:ring-orange-500 focus-visible:ring-2 focus-visible:border-orange-500 shadow-lg shadow-orange-500/20 hover:border-orange-500/75 transition-all"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-300">Email *</label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-500/60 w-4 h-4" />
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="h-12 rounded-xl border border-orange-500/50 bg-slate-800/50 text-white placeholder:text-slate-500 pl-10 focus-visible:ring-orange-500 focus-visible:ring-2 focus-visible:border-orange-500 shadow-lg shadow-orange-500/20 hover:border-orange-500/75 transition-all"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-300">Password *</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-500/60 w-4 h-4" />
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="h-12 rounded-xl border border-orange-500/50 bg-slate-800/50 text-white placeholder:text-slate-500 pl-10 focus-visible:ring-orange-500 focus-visible:ring-2 focus-visible:border-orange-500 shadow-lg shadow-orange-500/20 hover:border-orange-500/75 transition-all"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-300">Confirm Password *</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-500/60 w-4 h-4" />
          <Input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            className="h-12 rounded-xl border border-orange-500/50 bg-slate-800/50 text-white placeholder:text-slate-500 pl-10 focus-visible:ring-orange-500 focus-visible:ring-2 focus-visible:border-orange-500 shadow-lg shadow-orange-500/20 hover:border-orange-500/75 transition-all"
            required
          />
        </div>
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
