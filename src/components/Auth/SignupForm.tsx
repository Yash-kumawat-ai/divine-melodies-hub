import { useEffect, useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, Mail, Lock, User, Loader2, Phone, Eye, EyeOff } from 'lucide-react';
import { signupSchema, type SignupInput } from '@/schemas';
import { useLanguage } from '@/hooks/useLanguage';
import { useRateLimitTimer } from '@/hooks/useRateLimitTimer';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabaseClient';

const signupCopy = {
  en: {
    title: 'Begin Your Sadhana Journey',
    subtitle: 'Where every name carries devotion, and every bhajan brings peace.',
    fullName: 'Full Name *',
    fullNamePlaceholder: 'Your Name',
    email: 'Email *',
    phone: 'Phone (Optional)',
    password: 'Password *',
    confirmPassword: 'Confirm Password *',
    submit: 'Sign Up',
    blocked: 'Blocked',
    divider: 'Or continue with',
    google: 'Sign up with Google',
    alreadyAccount: 'Already part of Raghavam?',
    login: 'Enter Sacred Realm →',
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
    title: 'अपनी साधना यात्रा आरंभ करें',
    subtitle: 'जहाँ हर नाम में भक्ति है, हर भजन में शांति है।',
    fullName: 'पूरा नाम *',
    fullNamePlaceholder: 'आपका शुभ नाम',
    email: 'ईमेल *',
    phone: 'फोन (वैकल्पिक)',
    password: 'पासवर्ड *',
    confirmPassword: 'पासवर्ड पुष्टि करें *',
    submit: 'साइन अप',
    blocked: 'रुका हुआ',
    divider: 'या इससे जारी रखें',
    google: 'Google से साइन अप करें',
    alreadyAccount: 'पहले से राघवम् से जुड़े हैं?',
    login: 'पावन प्रवेश करें →',
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
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [registeredName, setRegisteredName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const { signUp, signIn, signInWithGoogle } = useAuth();
  const { language } = useLanguage();
  const copy = language === 'hi' ? signupCopy.hi : signupCopy.en;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || searchParams.get('next') || '/';

  const { isRateLimited, secondsRemaining, setRateLimit } = useRateLimitTimer();

  const { register, handleSubmit, formState: { errors } } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupInput) => {
    if (isRateLimited) return;

    setError('');
    setLoading(true);

    const result = await signUp(data.email, data.password, data.name, data.phone);

    if (result.error) {
      const parsed = toFriendlySignupError((result.error as any)?.message || copy.signupFailed);
      
      if (parsed.isRateLimit) {
        setRateLimit(parsed.retryAfterSeconds);
      } else {
        setError(parsed.message);
      }
      setLoading(false);
      return;
    }

    // Check if session exists or attempt immediate auto-login
    let session = (result.data as any)?.session;
    if (!session) {
      const { data: sessionData } = await supabase.auth.getSession();
      session = sessionData?.session;
    }

    if (!session) {
      const loginRes = await signIn(data.email, data.password);
      session = (loginRes.data as any)?.session;
    }

    if (session) {
      toast.success(
        language === 'hi'
          ? `स्वागत है ${data.name}! आपका खाता सफलतापूर्वक बन गया है। 🙏`
          : `Welcome ${data.name}! Your account is ready and you are logged in. 🙏`
      );
      navigate(redirectUrl, { replace: true });
      setLoading(false);
      return;
    }

    // Only if email confirmation link is strictly required by Supabase:
    setRegisteredName(data.name);
    setSuccess(true);
    setLoading(false);
  };

  const toFriendlySignupError = (message: string) => {
    const normalized = message.toLowerCase();

    const rateLimitMatch = normalized.match(/after (\d+)\s*seconds/);
    if (rateLimitMatch) {
      const seconds = parseInt(rateLimitMatch[1], 10);
      return {
        isRateLimit: true,
        retryAfterSeconds: seconds,
        message: copy.rateLimit(seconds),
      };
    }

    if (normalized.includes('rate limit') || normalized.includes('too many requests')) {
      return {
        isRateLimit: true,
        retryAfterSeconds: 60,
        message: copy.rateLimit(60),
      };
    }

    if (
      normalized.includes('error sending confirmation email') ||
      normalized.includes('confirmation email') ||
      normalized.includes('smtp') ||
      normalized.includes('email provider')
    ) {
      return { isRateLimit: false, retryAfterSeconds: 0, message: copy.emailConfigError };
    }
    if (normalized.includes('already registered') || normalized.includes('user already exists')) {
      return { isRateLimit: false, retryAfterSeconds: 0, message: copy.alreadyRegistered };
    }

    return { isRateLimit: false, retryAfterSeconds: 0, message };
  };

  const handleGoogleSignup = async () => {
    setError('');
    setLoading(true);
    try {
      const { error } = await signInWithGoogle(redirectUrl);
      if (error) {
        const parsed = toFriendlySignupError((error as any)?.message || copy.googleFailed);
        if (parsed.isRateLimit) {
          setRateLimit(parsed.retryAfterSeconds);
        } else {
          setError(parsed.message);
        }
      }
    } catch (err: any) {
      const parsed = toFriendlySignupError(err.message || copy.googleFailed);
      if (parsed.isRateLimit) {
        setRateLimit(parsed.retryAfterSeconds);
      } else {
        setError(parsed.message);
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full py-6 text-center space-y-4">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-500/40 text-emerald-600 dark:text-emerald-400 text-2xl">
          ✓
        </div>
        <h2 className="font-serif font-black text-2xl text-[#5C1615] dark:text-amber-100">{copy.successTitle}</h2>
        <p className="text-xs sm:text-sm text-[#7A6455] dark:text-amber-200/80 font-medium leading-relaxed">
          {copy.successBody(registeredName)}
        </p>
        <p className="text-xs text-[#7A6455]/70 dark:text-amber-200/50">
          {copy.successHint}
        </p>
        <Link 
          to="/auth/login" 
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#6B1D16] hover:bg-[#541611] text-white px-6 py-2.5 text-xs sm:text-sm font-extrabold text-white uppercase tracking-wider shadow-md transition-all border border-[#5C1615]/20"
        >
          <ArrowRight className="w-4 h-4" />
          {copy.goToLogin}
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5 sm:space-y-4 md:space-y-3.5 w-full">
      <div className="space-y-1 text-center mb-1">
        <h2 className="font-serif font-black text-xl sm:text-2xl md:text-xl text-[#5C1615] dark:text-amber-100 tracking-tight drop-shadow-xs">{copy.title}</h2>
        <p className="text-xs sm:text-sm md:text-xs text-[#7A6455] dark:text-stone-300 font-medium leading-relaxed max-w-xs md:max-w-md mx-auto">{copy.subtitle}</p>
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

      <div className="space-y-1.5 text-left">
        <label htmlFor="name" className="text-xs font-bold md:text-[12px] text-[#5C1615] dark:text-amber-300 block">
          {copy.fullName}
        </label>
        <div className="relative">
          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7A6455]/70 dark:text-amber-400/60 w-4 h-4 pointer-events-none" />
          <Input
            id="name"
            type="text"
            {...register('name')}
            placeholder={copy.fullNamePlaceholder}
            className="h-10.5 sm:h-11 md:h-10.5 rounded-xl border border-[#EADBCC] dark:border-stone-700 bg-[#FAF4EB]/80 dark:bg-stone-900/80 pl-10.5 text-stone-900 dark:text-white text-xs sm:text-sm font-medium placeholder:text-stone-400/80 focus:border-[#6B1D16] dark:focus:border-amber-400 focus:ring-2 focus:ring-[#6B1D16]/15 transition-all shadow-2xs"
          />
        </div>
        {errors.name && (
          <p className="text-[11px] text-rose-600 font-semibold mt-1">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-1.5 text-left">
        <label htmlFor="email" className="text-xs font-bold md:text-[12px] text-[#5C1615] dark:text-amber-300 block">
          {copy.email}
        </label>
        <div className="relative">
          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7A6455]/70 dark:text-amber-400/60 w-4 h-4 pointer-events-none" />
          <Input
            id="email"
            type="email"
            {...register('email')}
            placeholder="namaste@raghavam.com"
            className="h-10.5 sm:h-11 md:h-10.5 rounded-xl border border-[#EADBCC] dark:border-stone-700 bg-[#FAF4EB]/80 dark:bg-stone-900/80 pl-10.5 text-stone-900 dark:text-white text-xs sm:text-sm font-medium placeholder:text-stone-400/80 focus:border-[#6B1D16] dark:focus:border-amber-400 focus:ring-2 focus:ring-[#6B1D16]/15 transition-all shadow-2xs"
          />
        </div>
        {errors.email && (
          <p className="text-[11px] text-rose-600 font-semibold mt-1">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-1.5 text-left">
        <label htmlFor="phone" className="text-xs font-bold md:text-[12px] text-[#5C1615] dark:text-amber-300 block">
          {copy.phone}
        </label>
        <div className="relative">
          <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7A6455]/70 dark:text-amber-400/60 w-4 h-4 pointer-events-none" />
          <Input
            id="phone"
            type="tel"
            {...register('phone')}
            placeholder="+91 98765 43210"
            className="h-10.5 sm:h-11 md:h-10.5 rounded-xl border border-[#EADBCC] dark:border-stone-700 bg-[#FAF4EB]/80 dark:bg-stone-900/80 pl-10.5 text-stone-900 dark:text-white text-xs sm:text-sm font-medium placeholder:text-stone-400/80 focus:border-[#6B1D16] dark:focus:border-amber-400 focus:ring-2 focus:ring-[#6B1D16]/15 transition-all shadow-2xs"
          />
        </div>
        {errors.phone && (
          <p className="text-[11px] text-rose-600 font-semibold mt-1">{errors.phone.message}</p>
        )}
      </div>

      <div className="space-y-1.5 text-left">
        <label htmlFor="password" className="text-xs font-bold md:text-[12px] text-[#5C1615] dark:text-amber-300 block">
          {copy.password}
        </label>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7A6455]/70 dark:text-amber-400/60 w-4 h-4 pointer-events-none" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            {...register('password')}
            placeholder="••••••••"
            className="h-10.5 sm:h-11 md:h-10.5 rounded-xl border border-[#EADBCC] dark:border-stone-700 bg-[#FAF4EB]/80 dark:bg-stone-900/80 pl-10.5 pr-11 text-stone-900 dark:text-white text-xs sm:text-sm font-medium placeholder:text-stone-400/80 focus:border-[#6B1D16] dark:focus:border-amber-400 focus:ring-2 focus:ring-[#6B1D16]/15 transition-all shadow-2xs"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 p-1"
            title={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.password && (
          <p className="text-[11px] text-rose-600 font-semibold mt-1">{errors.password.message}</p>
        )}
      </div>

      <div className="space-y-1.5 text-left">
        <label htmlFor="confirmPassword" className="text-xs font-bold md:text-[12px] text-[#5C1615] dark:text-amber-300 block">
          {copy.confirmPassword}
        </label>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7A6455]/70 dark:text-amber-400/60 w-4 h-4 pointer-events-none" />
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            {...register('confirmPassword')}
            placeholder="••••••••"
            className="h-10.5 sm:h-11 md:h-10.5 rounded-xl border border-[#EADBCC] dark:border-stone-700 bg-[#FAF4EB]/80 dark:bg-stone-900/80 pl-10.5 pr-11 text-stone-900 dark:text-white text-xs sm:text-sm font-medium placeholder:text-stone-400/80 focus:border-[#6B1D16] dark:focus:border-amber-400 focus:ring-2 focus:ring-[#6B1D16]/15 transition-all shadow-2xs"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 p-1"
            title={showConfirmPassword ? "Hide password" : "Show password"}
          >
            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="text-[11px] text-rose-600 font-semibold mt-1">{errors.confirmPassword.message}</p>
        )}
      </div>

      <Button 
        type="submit" 
        size="lg"
        disabled={loading || isRateLimited} 
        className="mt-3.5 md:mt-4 h-11 sm:h-12 md:h-11 w-full rounded-xl bg-[#6B1D16] hover:bg-[#541611] dark:bg-[#7A1C20] dark:hover:bg-[#651317] text-white font-extrabold tracking-wide text-sm sm:text-base shadow-[0_6px_18px_rgba(107,29,22,0.22)] hover:shadow-[0_8px_20px_rgba(107,29,22,0.3)] transition-all flex items-center justify-center cursor-pointer active:scale-[0.99]"
      >
        {loading ? <Loader2 className="mr-2 w-4 h-4 animate-spin text-white" /> : null}
        {isRateLimited ? `${copy.blocked} ${secondsRemaining}s` : copy.submit}
      </Button>

      <div className="relative py-1">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-[#EADBCC] dark:border-stone-800" />
        </div>
        <div className="relative flex justify-center text-xs font-medium">
          <span className="bg-white dark:bg-[#140F0A] px-3 text-[#7A6455] dark:text-stone-400 font-medium text-xs">{copy.divider}</span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={handleGoogleSignup}
        disabled={loading}
        className="h-11 sm:h-12 md:h-11 w-full rounded-xl border border-[#EADBCC] dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-100 hover:bg-[#FAF4EB] font-bold text-sm shadow-2xs transition-all flex items-center justify-center gap-2.5 cursor-pointer"
      >
        <GoogleLogo />
        <span>{copy.google}</span>
      </Button>

      <p className="text-center text-xs sm:text-sm text-[#7A6455] dark:text-stone-400 font-medium pt-1">
        {copy.alreadyAccount}{' '}
        <Link 
          to={searchParams.toString() ? `/auth/login?${searchParams.toString()}` : "/auth/login"} 
          className="font-extrabold text-[#6B1D16] dark:text-amber-400 hover:underline"
        >
          {copy.login}
        </Link>
      </p>
    </form>
  );
}
