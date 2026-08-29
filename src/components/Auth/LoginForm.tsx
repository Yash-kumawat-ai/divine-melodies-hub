import { useEffect, useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, Lock, Loader2, Eye, EyeOff } from 'lucide-react';
import { loginSchema, type LoginInput } from '@/schemas';
import { useLanguage } from '@/hooks/useLanguage';
import { toast } from 'sonner';
import { getBirthProfile } from '@/lib/astrology/astrologyClient';
import { completeProfileUrl } from '@/lib/astrology/completeProfileRedirect';
import { markBirthProfileReady } from '@/components/Auth/BirthProfileGate';

const loginCopy = {
  en: {
    title: 'Welcome to the Feet of the Divine',
    subtitle: 'Where every name carries devotion, and every bhajan brings peace.',
    email: 'Email Address',
    password: 'Password',
    submit: 'Log In',
    or: 'OR',
    google: 'Continue with Google',
    noAccount: 'First time joining Raghavam?',
    signUp: 'Begin your Sadhana →',
    resend: 'Resend verification email',
    verificationSent: 'Verification email sent. Please check your inbox and spam folder.',
    verificationFailed: 'Verification email could not be sent. Please use Google login for now, or configure Supabase SMTP and try again.',
    invalidLogin: 'No account found for this email, or the password is incorrect. Create an account first, or use Google if you signed up with Google.',
    emailNotConfirmed: 'Please verify your email first, then sign in.',
    googleFailed: 'Google login failed',
    resendFailed: 'Could not resend confirmation email',
    loginFailed: 'Login failed',
  },
  hi: {
    title: 'प्रभु के चरणों में आपका स्वागत है',
    subtitle: 'जहाँ हर नाम में भक्ति है, हर भजन में शांति है।',
    email: 'ईमेल पता',
    password: 'पासवर्ड',
    submit: 'लॉग इन',
    or: 'अथवा',
    google: 'Google से जारी रखें',
    noAccount: 'राघवम् से पहली बार जुड़े हैं?',
    signUp: 'अपनी साधना शुरू करें →',
    resend: 'वेरिफिकेशन ईमेल पुनः भेजें',
    verificationSent: 'वेरिफिकेशन ईमेल भेज दिया गया है। कृपया अपना इनबॉक्स और स्पैम फोल्डर देखें।',
    verificationFailed: 'वेरिफिकेशन ईमेल भेजा नहीं जा सका। अभी Google लॉगिन का उपयोग करें।',
    invalidLogin: 'इस ईमेल का खाता नहीं मिला, या पासवर्ड गलत है।',
    emailNotConfirmed: 'कृपया पहले अपना ईमेल वेरिफाई करें, फिर साइन इन करें।',
    googleFailed: 'Google लॉगिन असफल रहा',
    resendFailed: 'वेरिफिकेशन ईमेल फिर से नहीं भेजा जा सका',
    loginFailed: 'लॉगिन असफल रहा',
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

export default function LoginForm() {
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [lastEmail, setLastEmail] = useState('');
  const [canResendConfirmation, setCanResendConfirmation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { signIn, signInWithGoogle, resendEmailConfirmation, user } = useAuth();
  const { language } = useLanguage();
  const copy = language === 'hi' ? loginCopy.hi : loginCopy.en;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || searchParams.get('next') || '/';
  const fromRegistration = searchParams.get('from') === 'registration';

  const routeAfterAuth = async (userId: string) => {
    const birth = await getBirthProfile(userId);
    if (!birth?.date_of_birth) {
      navigate(completeProfileUrl(redirectUrl), { replace: true });
      return;
    }
    markBirthProfileReady(userId);
    navigate(redirectUrl.startsWith('/auth/') ? '/' : redirectUrl, { replace: true });
  };

  useEffect(() => {
    if (!user || fromRegistration) return;
    void routeAfterAuth(user.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, fromRegistration]);
  
  const { register, handleSubmit, formState: { errors } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setError('');
    setNotice('');
    setCanResendConfirmation(false);
    setLastEmail(data.email);
    setLoading(true);

    const { data: signInData, error } = await signIn(data.email, data.password);
    if (error) {
      const errMessage = (error as any)?.message || '';
      setError(toFriendlyError(errMessage || copy.loginFailed));
      if (errMessage.toLowerCase().includes('email not confirmed')) {
        setCanResendConfirmation(true);
      }
      setLoading(false);
      return;
    }

    toast.success(language === 'hi' ? 'सफलतापूर्वक लॉगिन हो गया! 🙏' : 'Logged in successfully! 🙏');
    const userId = (signInData as { user?: { id?: string } } | null)?.user?.id;
    if (userId) {
      await routeAfterAuth(userId);
    } else {
      navigate(redirectUrl, { replace: true });
    }
    setLoading(false);
  };

  const toFriendlyError = (message: string) => {
    const normalized = message.toLowerCase();
    if (
      normalized.includes('error sending confirmation email') ||
      normalized.includes('confirmation email') ||
      normalized.includes('smtp') ||
      normalized.includes('email provider')
    ) {
      return copy.verificationFailed;
    }
    if (normalized.includes('invalid login credentials')) {
      return copy.invalidLogin;
    }
    if (normalized.includes('email not confirmed')) {
      return copy.emailNotConfirmed;
    }
    return message;
  };

  const handleGoogleLogin = async () => {
    setError('');
    setNotice('');
    setCanResendConfirmation(false);
    setLoading(true);
    try {
      const { error } = await signInWithGoogle(redirectUrl);
      if (error) setError((error as any)?.message || copy.googleFailed);
    } catch (err: unknown) {
      setError(toFriendlyError(err instanceof Error ? err.message : copy.googleFailed));
    } finally {
      setLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    if (!lastEmail) return;

    setError('');
    setNotice('');
    setLoading(true);
    const { error } = await resendEmailConfirmation(lastEmail);

    if (error) {
      setError(toFriendlyError((error as any)?.message || copy.resendFailed));
    } else {
      setNotice(copy.verificationSent);
      setCanResendConfirmation(false);
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5 sm:space-y-4 md:space-y-3.5 w-full">
      <div className="space-y-1 text-center mb-1">
        <h2 className="font-serif font-black text-xl sm:text-2xl md:text-2xl text-[#5C1615] dark:text-amber-100 tracking-tight drop-shadow-xs">{copy.title}</h2>
        <p className="text-xs sm:text-sm text-[#7A6455] dark:text-stone-300 font-medium leading-relaxed max-w-xs md:max-w-md mx-auto">{copy.subtitle}</p>
      </div>
      
      {error && (
        <div className="rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/80 dark:bg-rose-950/40 p-3.5 text-xs text-rose-700 dark:text-rose-300 font-semibold leading-relaxed">
          {error}
          {canResendConfirmation && (
            <button
              type="button"
              onClick={handleResendConfirmation}
              disabled={loading}
              className="mt-2 block text-xs font-bold text-[#6B1D16] dark:text-amber-400 hover:underline"
            >
              {copy.resend}
            </button>
          )}
        </div>
      )}

      {notice && (
        <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/80 dark:bg-emerald-950/40 p-3.5 text-xs text-emerald-700 dark:text-emerald-300 font-semibold">
          {notice}
        </div>
      )}

      <div className="space-y-1.5 text-left">
        <label htmlFor="email" className="text-xs font-bold md:text-[12px] text-[#5C1615] dark:text-amber-300 block">
          {copy.email}
        </label>
        <div className="relative">
          <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7A6455]/70 dark:text-amber-400/60 pointer-events-none" />
          <Input
            id="email"
            type="email"
            {...register('email')}
            placeholder="namaste@raghavam.com"
            className="h-11 rounded-xl border border-[#EADBCC] dark:border-stone-700 bg-[#FAF4EB]/80 dark:bg-stone-900/80 pl-11 pr-4 text-stone-900 dark:text-white text-xs sm:text-sm font-medium placeholder:text-stone-400/80 focus:border-[#6B1D16] dark:focus:border-amber-400 focus:ring-2 focus:ring-[#6B1D16]/15 transition-all shadow-2xs"
          />
        </div>
        {errors.email && (
          <p className="text-[11px] text-rose-600 font-semibold mt-1">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-1.5 text-left">
        <label htmlFor="password" className="text-xs font-bold md:text-[12px] text-[#5C1615] dark:text-amber-300 block">
          {copy.password}
        </label>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7A6455]/70 dark:text-amber-400/60 pointer-events-none" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            {...register('password')}
            placeholder="••••••••"
            className="h-11 rounded-xl border border-[#EADBCC] dark:border-stone-700 bg-[#FAF4EB]/80 dark:bg-stone-900/80 pl-11 pr-11 text-stone-900 dark:text-white text-xs sm:text-sm font-medium placeholder:text-stone-400/80 focus:border-[#6B1D16] dark:focus:border-amber-400 focus:ring-2 focus:ring-[#6B1D16]/15 transition-all shadow-2xs"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 p-1 cursor-pointer"
            title={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.password && (
          <p className="text-[11px] text-rose-600 font-semibold mt-1">{errors.password.message}</p>
        )}
      </div>

      {user && fromRegistration ? (
        <Button
          type="button"
          disabled={loading}
          size="lg"
          onClick={async () => {
            setLoading(true);
            await routeAfterAuth(user.id);
            setLoading(false);
          }}
          className="mt-3.5 md:mt-4 h-11 sm:h-12 md:h-11 w-full rounded-xl bg-[#6B1D16] hover:bg-[#541611] dark:bg-[#7A1C20] dark:hover:bg-[#651317] text-white font-extrabold tracking-wide text-sm sm:text-base shadow-[0_6px_18px_rgba(107,29,22,0.22)] hover:shadow-[0_8px_20px_rgba(107,29,22,0.3)] transition-all flex items-center justify-center cursor-pointer active:scale-[0.99]"
        >
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin text-white" /> : null}
          {copy.submit}
        </Button>
      ) : (
      <Button
        type="submit"
        disabled={loading}
        size="lg"
        className="mt-3.5 md:mt-4 h-11 sm:h-12 md:h-11 w-full rounded-xl bg-[#6B1D16] hover:bg-[#541611] dark:bg-[#7A1C20] dark:hover:bg-[#651317] text-white font-extrabold tracking-wide text-sm sm:text-base shadow-[0_6px_18px_rgba(107,29,22,0.22)] hover:shadow-[0_8px_20px_rgba(107,29,22,0.3)] transition-all flex items-center justify-center cursor-pointer active:scale-[0.99]"
      >
        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin text-white" /> : null}
        {copy.submit}
      </Button>
      )}

      <div className="relative py-1">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-[#EADBCC] dark:border-stone-800" />
        </div>
        <div className="relative flex justify-center text-xs font-medium">
          <span className="bg-white dark:bg-[#140F0A] px-3 text-[#7A6455] dark:text-stone-400 font-medium text-xs">{copy.or}</span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={handleGoogleLogin}
        disabled={loading}
        className="h-11 sm:h-12 md:h-11 w-full rounded-xl border border-[#EADBCC] dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-100 hover:bg-[#FAF4EB] dark:hover:bg-stone-800 font-bold text-sm shadow-2xs transition-all flex items-center justify-center gap-2.5 cursor-pointer"
      >
        <GoogleLogo />
        <span>{copy.google}</span>
      </Button>

      <p className="text-center text-xs sm:text-sm text-[#7A6455] dark:text-stone-400 font-medium pt-1">
        {copy.noAccount}{' '}
        <Link 
          to={searchParams.toString() ? `/auth/signup?${searchParams.toString()}` : "/auth/signup"} 
          className="font-extrabold text-[#6B1D16] dark:text-amber-400 hover:underline"
        >
          {copy.signUp}
        </Link>
      </p>
    </form>
  );
}
