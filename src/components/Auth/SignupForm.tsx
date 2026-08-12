import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, Mail, Lock, User, Loader2, Phone, Eye, EyeOff } from 'lucide-react';
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
    emailConfigError: 'ईमेल वेरिफिकेशन अभी सही तरह से सेट नहीं है। अभी Google signup उपयोग करें।',
    alreadyRegistered: 'यह ईमेल पहले से रजिस्टर्ड है। कृपया लॉग इन करें।',
    rateLimit: (seconds: number) => `बहुत ज़्यादा signup प्रयास हुए हैं। कृपया ${seconds} सेकंड रुकें या Google signup उपयोग करें।`,
    rateLimitBanner: (seconds: number) => `Signup ${seconds}s के लिए रुका है। Google signup उपयोग करें।`,
    signupFailed: 'साइनअप असफल रहा',
    googleFailed: 'Google साइनअप असफल रहा',
  },
};

function GoogleLogo() {
  return (
    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

export default function SignupForm() {
  const SIGNUP_COOLDOWN_KEY = 'signupCooldownUntil';
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [retryAfter, setRetryAfter] = useState<number | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const { signUp, signInWithGoogle } = useAuth();
  const { language } = useLanguage();
  const copy = language === 'hi' ? signupCopy.hi : signupCopy.en;
  const navigate = useNavigate();
  
  const { register, handleSubmit, formState: { errors } } = useForm<SignupInput>({
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
      <div className="w-full py-6 text-center space-y-4">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 text-3xl">
          ✓
        </div>
        <h2 className="font-display font-black text-2xl text-[#651317] dark:text-amber-100">{copy.successTitle}</h2>
        <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 font-medium leading-relaxed">
          {copy.successBody(registeredName)}
        </p>
        <p className="text-xs text-stone-400">
          {copy.successHint}
        </p>
        <Link 
          to="/auth/login" 
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#651317] via-[#8B1A1F] to-[#5c1d0c] px-6 py-3 text-xs sm:text-sm font-extrabold text-white uppercase tracking-wider shadow-md hover:from-[#8B1A1F] hover:to-[#651317] transition-all"
        >
          <ArrowRight className="w-4 h-4" />
          {copy.goToLogin}
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5 sm:space-y-4 w-full">
      <div className="space-y-1 text-center">
        <h2 className="font-display font-black text-2xl sm:text-3xl text-[#651317] dark:text-amber-100">{copy.title}</h2>
        <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 font-medium">{copy.subtitle}</p>
      </div>
      
      {error && (
        <div className="rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/80 dark:bg-rose-950/40 p-3.5 text-xs text-rose-700 dark:text-rose-300 font-semibold leading-relaxed">
          {error}
        </div>
      )}

      {isRateLimited && (
        <div className="rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/80 dark:bg-rose-950/40 p-3.5 text-xs text-rose-700 dark:text-rose-300 font-semibold">
          {copy.rateLimitBanner(secondsRemaining)}
        </div>
      )}

      <div className="space-y-1 text-left">
        <label htmlFor="name" className="text-[11px] font-extrabold uppercase tracking-wider text-[#651317] dark:text-amber-300">{copy.fullName}</label>
        <div className="relative">
          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#651317]/60 dark:text-amber-400/60 w-4 h-4 pointer-events-none" />
          <Input
            id="name"
            type="text"
            {...register('name')}
            placeholder={copy.fullNamePlaceholder}
            className="h-11 sm:h-12 rounded-xl border border-[#E8D8C4] dark:border-stone-700 bg-[#FAF6EE] dark:bg-stone-900/80 pl-10 text-stone-900 dark:text-white text-xs sm:text-sm font-medium placeholder:text-stone-400 focus:border-[#651317] dark:focus:border-amber-400 focus:ring-2 focus:ring-[#651317]/20 shadow-2xs"
          />
        </div>
        {errors.name && (
          <p className="text-xs text-rose-600 font-semibold">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-1 text-left">
        <label htmlFor="email" className="text-[11px] font-extrabold uppercase tracking-wider text-[#651317] dark:text-amber-300">{copy.email}</label>
        <div className="relative">
          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#651317]/60 dark:text-amber-400/60 w-4 h-4 pointer-events-none" />
          <Input
            id="email"
            type="email"
            {...register('email')}
            placeholder="your@email.com"
            className="h-11 sm:h-12 rounded-xl border border-[#E8D8C4] dark:border-stone-700 bg-[#FAF6EE] dark:bg-stone-900/80 pl-10 text-stone-900 dark:text-white text-xs sm:text-sm font-medium placeholder:text-stone-400 focus:border-[#651317] dark:focus:border-amber-400 focus:ring-2 focus:ring-[#651317]/20 shadow-2xs"
          />
        </div>
        {errors.email && (
          <p className="text-xs text-rose-600 font-semibold">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-1 text-left">
        <label htmlFor="phone" className="text-[11px] font-extrabold uppercase tracking-wider text-[#651317] dark:text-amber-300">{copy.phone}</label>
        <div className="relative">
          <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#651317]/60 dark:text-amber-400/60 w-4 h-4 pointer-events-none" />
          <Input
            id="phone"
            type="tel"
            {...register('phone')}
            placeholder="+91 98765 43210"
            className="h-11 sm:h-12 rounded-xl border border-[#E8D8C4] dark:border-stone-700 bg-[#FAF6EE] dark:bg-stone-900/80 pl-10 text-stone-900 dark:text-white text-xs sm:text-sm font-medium placeholder:text-stone-400 focus:border-[#651317] dark:focus:border-amber-400 focus:ring-2 focus:ring-[#651317]/20 shadow-2xs"
          />
        </div>
        {errors.phone && (
          <p className="text-xs text-rose-600 font-semibold">{errors.phone.message}</p>
        )}
      </div>

      <div className="space-y-1 text-left">
        <label htmlFor="password" className="text-[11px] font-extrabold uppercase tracking-wider text-[#651317] dark:text-amber-300">{copy.password}</label>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#651317]/60 dark:text-amber-400/60 w-4 h-4 pointer-events-none" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            {...register('password')}
            placeholder="••••••••"
            className="h-11 sm:h-12 rounded-xl border border-[#E8D8C4] dark:border-stone-700 bg-[#FAF6EE] dark:bg-stone-900/80 pl-10 pr-10 text-stone-900 dark:text-white text-xs sm:text-sm font-medium placeholder:text-stone-400 focus:border-[#651317] dark:focus:border-amber-400 focus:ring-2 focus:ring-[#651317]/20 shadow-2xs"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 p-0.5"
            title={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.password && (
          <p className="text-xs text-rose-600 font-semibold">{errors.password.message}</p>
        )}
      </div>

      <div className="space-y-1 text-left">
        <label htmlFor="confirmPassword" className="text-[11px] font-extrabold uppercase tracking-wider text-[#651317] dark:text-amber-300">{copy.confirmPassword}</label>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#651317]/60 dark:text-amber-400/60 w-4 h-4 pointer-events-none" />
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            {...register('confirmPassword')}
            placeholder="••••••••"
            className="h-11 sm:h-12 rounded-xl border border-[#E8D8C4] dark:border-stone-700 bg-[#FAF6EE] dark:bg-stone-900/80 pl-10 pr-10 text-stone-900 dark:text-white text-xs sm:text-sm font-medium placeholder:text-stone-400 focus:border-[#651317] dark:focus:border-amber-400 focus:ring-2 focus:ring-[#651317]/20 shadow-2xs"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 p-0.5"
            title={showConfirmPassword ? "Hide password" : "Show password"}
          >
            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="text-xs text-rose-600 font-semibold">{errors.confirmPassword.message}</p>
        )}
      </div>

      <Button 
        type="submit" 
        size="lg"
        disabled={loading || isRateLimited} 
        className="w-full font-extrabold uppercase tracking-wider text-xs sm:text-sm"
      >
        {loading ? <Loader2 className="mr-2 w-4 h-4 animate-spin text-white" /> : null}
        {isRateLimited ? `${copy.blocked} ${secondsRemaining}s` : copy.submit}
      </Button>

      <div className="relative py-0.5">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-[#E8D8C4] dark:border-stone-800" />
        </div>
        <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-extrabold">
          <span className="bg-[#FFFDF8] dark:bg-[#140F0A] px-3 text-stone-400">{copy.divider}</span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={handleGoogleSignup}
        disabled={loading}
        className="h-11 sm:h-12 w-full rounded-xl border border-[#E8D8C4] dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-100 hover:bg-[#FAF0E4] font-extrabold text-xs sm:text-sm shadow-xs transition-all flex items-center justify-center gap-2.5"
      >
        <GoogleLogo />
        <span>{copy.google}</span>
      </Button>

      <p className="text-center text-xs sm:text-sm text-stone-600 dark:text-stone-400 font-medium pt-0.5">
        {copy.alreadyAccount}{' '}
        <Link to="/auth/login" className="font-extrabold text-[#651317] dark:text-amber-400 hover:underline">
          {copy.login}
        </Link>
      </p>
    </form>
  );
}
