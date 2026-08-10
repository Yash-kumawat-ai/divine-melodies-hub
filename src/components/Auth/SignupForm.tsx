import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, Mail, Lock, User, Loader2, Chrome, Phone } from 'lucide-react';
import { signupSchema, type SignupInput } from '@/schemas';
import { useLanguage } from '@/hooks/useLanguage';

const signupCopy = {
  en: {
    title: 'Create Account',
    subtitle: 'Build your profile and share your devotion with everyone.',
    fullName: 'Full Name *',
    fullNamePlaceholder: 'Your Full Name',
    email: 'Email *',
    phone: 'Phone (Optional)',
    password: 'Password *',
    confirmPassword: 'Confirm Password *',
    submit: 'Create Sacred Account',
    blocked: 'Blocked',
    divider: 'Or seek with',
    google: 'Sign up with Google',
    alreadyAccount: 'Already have an account?',
    login: 'Login',
    successTitle: 'Account Created!',
    successBody: (name: string) => `Welcome, ${name}! Please check your email to verify your account, then login.`,
    successHint: 'Check spam/junk folder if no email arrives.',
    goToLogin: 'Go to Login',
    emailConfigError: 'Email verification is not configured correctly yet. Please use Google signup for now, or configure Supabase SMTP and try again.',
    alreadyRegistered: 'This email is already registered. Please log in instead.',
    rateLimit: (seconds: number) => `Too many signup attempts. Email provider is rate-limiting. Please wait ${seconds} seconds or use Google signup.`,
    rateLimitBanner: (seconds: number) => `Signup blocked for ${seconds}s. Your email provider is rate-limiting. Try Google signup instead.`,
    signupFailed: 'Signup failed',
    googleFailed: 'Google signup failed',
  },
  hi: {
    title: 'खाता बनाएं',
    subtitle: 'अपनी प्रोफाइल बनाएं और अपनी भक्ति सबके साथ साझा करें।',
    fullName: 'पूरा नाम *',
    fullNamePlaceholder: 'आपका पूरा नाम',
    email: 'ईमेल *',
    phone: 'फोन (वैकल्पिक)',
    password: 'पासवर्ड *',
    confirmPassword: 'पासवर्ड पुष्टि करें *',
    submit: 'पवित्र खाता बनाएं',
    blocked: 'रुका हुआ',
    divider: 'या इससे जारी रखें',
    google: 'Google से साइन अप करें',
    alreadyAccount: 'पहले से खाता है?',
    login: 'लॉग इन',
    successTitle: 'खाता बन गया!',
    successBody: (name: string) => `स्वागत है, ${name}! कृपया अपना खाता सत्यापित करने के लिए ईमेल देखें, फिर लॉगिन करें।`,
    successHint: 'अगर ईमेल न मिले तो स्पैम/जंक फ़ोल्डर देखें।',
    goToLogin: 'लॉगिन पर जाएं',
    emailConfigError: 'ईमेल वेरिफिकेशन अभी सही तरह से सेट नहीं है। अभी Google signup उपयोग करें, या Supabase SMTP सेट करके फिर कोशिश करें।',
    alreadyRegistered: 'यह ईमेल पहले से रजिस्टर्ड है। कृपया लॉग इन करें।',
    rateLimit: (seconds: number) => `बहुत ज़्यादा signup प्रयास हुए हैं। ईमेल provider rate-limit कर रहा है। कृपया ${seconds} सेकंड रुकें या Google signup उपयोग करें।`,
    rateLimitBanner: (seconds: number) => `Signup ${seconds}s के लिए रुका है। ईमेल provider rate-limit कर रहा है। Google signup उपयोग करें।`,
    signupFailed: 'साइनअप असफल रहा',
    googleFailed: 'Google साइनअप असफल रहा',
  },
};

export default function SignupForm() {
  const SIGNUP_COOLDOWN_KEY = 'signupCooldownUntil';
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [retryAfter, setRetryAfter] = useState<number | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const { signUp, signInWithGoogle } = useAuth();
  const { language } = useLanguage();
  const copy = language === 'hi' ? signupCopy.hi : signupCopy.en;
  const navigate = useNavigate();
  
  const { register, handleSubmit, formState: { errors }, getValues } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
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

    if (
      normalized.includes('error sending confirmation email') ||
      normalized.includes('confirmation email') ||
      normalized.includes('smtp') ||
      normalized.includes('email provider')
    ) {
      return {
        message: copy.emailConfigError,
        isRateLimit: false,
      };
    }

    if (normalized.includes('rate limit') || normalized.includes('too many requests') || normalized.includes('email rate limit exceeded')) {
      const cooldownMs = 180_000;
      const cooldownUntil = Date.now() + cooldownMs;
      setRetryAfter(cooldownUntil);
      window.localStorage.setItem(SIGNUP_COOLDOWN_KEY, String(cooldownUntil));
      return { message: '', isRateLimit: true };
    }

    if (normalized.includes('user already registered')) {
      return { message: copy.alreadyRegistered, isRateLimit: false };
    }

    return { message, isRateLimit: false };
  };

  const onSubmit = async (data: SignupInput) => {
    if (isRateLimited) return;
    
    setError('');
    setRegisteredName(data.name);

    const storedCooldown = window.localStorage.getItem(SIGNUP_COOLDOWN_KEY);
    if (storedCooldown) {
      const cooldownUntil = Number(storedCooldown);
      if (!Number.isNaN(cooldownUntil) && cooldownUntil > Date.now()) {
        const waitSeconds = Math.ceil((cooldownUntil - Date.now()) / 1000);
        setError(copy.rateLimit(waitSeconds));
        return;
      }
    }

    setLoading(true);
    const { error } = await signUp(data.email, data.password, data.name, data.phone);
    
    if (error) {
      const parsed = toFriendlySignupError((error as any)?.message || copy.signupFailed);
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
      const { error } = await signInWithGoogle('/upload-bhajan');
      if (error) {
        const parsed = toFriendlySignupError((error as any)?.message || copy.googleFailed);
        if (!parsed.isRateLimit) {
          setError(parsed.message);
        }
      }
    } catch (err: any) {
      const parsed = toFriendlySignupError(err.message || copy.googleFailed);
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
        <h2 className="mb-2 text-2xl font-bold">{copy.successTitle}</h2>
        <p className="mb-4 text-muted-foreground">
          {copy.successBody(registeredName)}
        </p>
        <p className="mb-6 text-sm text-muted-foreground">
          {copy.successHint}
        </p>
        <Link 
          to="/auth/login" 
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/30 hover:from-orange-600 hover:to-amber-600 transition-all"
        >
          <ArrowRight className="w-4 h-4" />
          {copy.goToLogin}
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-full">
      <div className="space-y-1 text-center">
        <h2 className="text-3xl font-semibold text-[#3A2412] dark:text-white">{copy.title}</h2>
        <p className="text-sm text-[#543D2B]/80 dark:text-slate-400">{copy.subtitle}</p>
      </div>
      
      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {isRateLimited && (
        <div className="rounded-xl border-2 border-red-500/50 bg-red-500/10 p-4 text-sm font-semibold text-red-400">
          {copy.rateLimitBanner(secondsRemaining)}
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="name" className="text-xs font-semibold uppercase tracking-wide text-[#543D2B]/85 dark:text-slate-300">{copy.fullName}</label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 text-[#E06D14]/70 dark:text-orange-500/60 w-4 h-4" />
          <Input
            id="name"
            type="text"
            {...register('name')}
            placeholder={copy.fullNamePlaceholder}
            className="h-12 rounded-xl border border-[#EAD7C3] dark:border-orange-500/50 bg-[#FFFDFC]/40 dark:bg-slate-800/50 text-[#3A2412] dark:text-white placeholder:text-[#543D2B]/40 dark:placeholder:text-slate-500 pl-10 focus-visible:ring-[#E06D14] dark:focus-visible:ring-orange-500 focus-visible:ring-2 focus-visible:border-[#E06D14] dark:focus-visible:border-orange-500 shadow-lg shadow-black/[0.02] dark:shadow-orange-500/20 hover:border-[#E06D14]/40 dark:hover:border-orange-500/75 transition-all"
          />
        </div>
        {errors.name && (
          <p className="text-xs text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wide text-[#543D2B]/85 dark:text-slate-300">{copy.email}</label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[#E06D14]/70 dark:text-orange-500/60 w-4 h-4" />
          <Input
            id="email"
            type="email"
            {...register('email')}
            placeholder="your@email.com"
            className="h-12 rounded-xl border border-[#EAD7C3] dark:border-orange-500/50 bg-[#FFFDFC]/40 dark:bg-slate-800/50 text-[#3A2412] dark:text-white placeholder:text-[#543D2B]/40 dark:placeholder:text-slate-500 pl-10 focus-visible:ring-[#E06D14] dark:focus-visible:ring-orange-500 focus-visible:ring-2 focus-visible:border-[#E06D14] dark:focus-visible:border-orange-500 shadow-lg shadow-black/[0.02] dark:shadow-orange-500/20 hover:border-[#E06D14]/40 dark:hover:border-orange-500/75 transition-all"
          />
        </div>
        {errors.email && (
          <p className="text-xs text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="phone" className="text-xs font-semibold uppercase tracking-wide text-[#543D2B]/85 dark:text-slate-300">{copy.phone}</label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-[#E06D14]/70 dark:text-orange-500/60 w-4 h-4" />
          <Input
            id="phone"
            type="tel"
            {...register('phone')}
            placeholder="+91 98765 43210"
            className="h-12 rounded-xl border border-[#EAD7C3] dark:border-orange-500/50 bg-[#FFFDFC]/40 dark:bg-slate-800/50 text-[#3A2412] dark:text-white placeholder:text-[#543D2B]/40 dark:placeholder:text-slate-500 pl-10 focus-visible:ring-[#E06D14] dark:focus-visible:ring-orange-500 focus-visible:ring-2 focus-visible:border-[#E06D14] dark:focus-visible:border-orange-500 shadow-lg shadow-black/[0.02] dark:shadow-orange-500/20 hover:border-[#E06D14]/40 dark:hover:border-orange-500/75 transition-all"
          />
        </div>
        {errors.phone && (
          <p className="text-xs text-destructive">{errors.phone.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="text-xs font-semibold uppercase tracking-wide text-[#543D2B]/85 dark:text-slate-300">{copy.password}</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#E06D14]/70 dark:text-orange-500/60 w-4 h-4" />
          <Input
            id="password"
            type="password"
            {...register('password')}
            placeholder="••••••••"
            className="h-12 rounded-xl border border-[#EAD7C3] dark:border-orange-500/50 bg-[#FFFDFC]/40 dark:bg-slate-800/50 text-[#3A2412] dark:text-white placeholder:text-[#543D2B]/40 dark:placeholder:text-slate-500 pl-10 focus-visible:ring-[#E06D14] dark:focus-visible:ring-orange-500 focus-visible:ring-2 focus-visible:border-[#E06D14] dark:focus-visible:border-orange-500 shadow-lg shadow-black/[0.02] dark:shadow-orange-500/20 hover:border-[#E06D14]/40 dark:hover:border-orange-500/75 transition-all"
          />
        </div>
        {errors.password && (
          <p className="text-xs text-destructive">{errors.password.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="confirmPassword" className="text-xs font-semibold uppercase tracking-wide text-[#543D2B]/85 dark:text-slate-300">{copy.confirmPassword}</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#E06D14]/70 dark:text-orange-500/60 w-4 h-4" />
          <Input
            id="confirmPassword"
            type="password"
            {...register('confirmPassword')}
            placeholder="••••••••"
            className="h-12 rounded-xl border border-[#EAD7C3] dark:border-orange-500/50 bg-[#FFFDFC]/40 dark:bg-slate-800/50 text-[#3A2412] dark:text-white placeholder:text-[#543D2B]/40 dark:placeholder:text-slate-500 pl-10 focus-visible:ring-[#E06D14] dark:focus-visible:ring-orange-500 focus-visible:ring-2 focus-visible:border-[#E06D14] dark:focus-visible:border-orange-500 shadow-lg shadow-black/[0.02] dark:shadow-orange-500/20 hover:border-[#E06D14]/40 dark:hover:border-orange-500/75 transition-all"
          />
        </div>
        {errors.confirmPassword && (
          <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
        )}
      </div>

      <Button type="submit" disabled={loading || isRateLimited} className={`h-12 w-full rounded-xl text-base font-semibold transition-all shadow-lg ${isRateLimited ? 'bg-slate-300 dark:bg-slate-600 text-slate-500 dark:text-slate-300 cursor-not-allowed' : 'bg-gradient-to-r from-[#E06D14] to-[#F59E0B] dark:from-orange-500 dark:to-amber-500 text-white hover:from-[#F59E0B] hover:to-[#E06D14] dark:hover:from-orange-600 dark:hover:to-amber-600 shadow-[0_8px_28px_rgba(224,109,20,0.25)] dark:shadow-orange-500/30'}`}>
        {loading && <Loader2 className="mr-2 w-4 h-4 animate-spin" />}
        {isRateLimited ? `${copy.blocked} ${secondsRemaining}s` : copy.submit}
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-[#EAD7C3] dark:border-orange-500/20" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-[#FFFDFC]/95 dark:bg-slate-800/50 px-3 text-[#543D2B]/80 dark:text-slate-400">{copy.divider}</span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={handleGoogleSignup}
        disabled={loading}
        className="h-12 w-full rounded-xl border border-[#EAD7C3] dark:border-orange-500/30 bg-transparent text-[#3A2412] dark:text-white hover:border-[#E06D14]/40 dark:hover:border-orange-500/50 hover:bg-[#FFF5EA]/35 dark:hover:bg-slate-700/50"
      >
        <Chrome className="mr-2 w-4 h-4" />
        {copy.google}
      </Button>

      <p className="text-center text-sm text-[#543D2B]/85 dark:text-slate-400">
        {copy.alreadyAccount}{' '}
        <Link to="/auth/login" className="text-[#E06D14] dark:text-orange-400 hover:text-[#E06D14]/80 dark:hover:text-orange-300 hover:underline font-medium">
          {copy.login}
        </Link>
      </p>
    </form>
  );
}
