import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, Lock, Loader2, Eye, EyeOff } from 'lucide-react';
import { loginSchema, type LoginInput } from '@/schemas';
import { useLanguage } from '@/hooks/useLanguage';

const loginCopy = {
  en: {
    title: 'Welcome Back',
    subtitle: 'Continue your spiritual journey',
    email: 'Email Address',
    password: 'Password',
    submit: 'Login to Account',
    or: 'OR',
    google: 'Continue with Google',
    noAccount: "Don't have an account?",
    signUp: 'Create Account',
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
    title: 'पुनः स्वागत है',
    subtitle: 'अपनी भक्ति यात्रा जारी रखें',
    email: 'ईमेल पता',
    password: 'पासवर्ड',
    submit: 'खाते में लॉगिन करें',
    or: 'अथवा',
    google: 'Google से जारी रखें',
    noAccount: 'खाता नहीं है?',
    signUp: 'नया खाता बनाएं',
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
  const { signIn, signInWithGoogle, resendEmailConfirmation } = useAuth();
  const { language } = useLanguage();
  const copy = language === 'hi' ? loginCopy.hi : loginCopy.en;
  const navigate = useNavigate();
  
  const { register, handleSubmit, formState: { errors } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setError('');
    setNotice('');
    setCanResendConfirmation(false);
    setLastEmail(data.email);
    setLoading(true);

    const { error } = await signIn(data.email, data.password);
    if (error) {
      const errMessage = (error as any)?.message || '';
      setError(toFriendlyError(errMessage || copy.loginFailed));
      if (errMessage.toLowerCase().includes('email not confirmed')) {
        setCanResendConfirmation(true);
      }
      setLoading(false);
      return;
    }

    navigate('/upload-bhajan', { replace: true });
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
      const { error } = await signInWithGoogle('/upload-bhajan');
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5 w-full">
      <div className="space-y-1 text-center">
        <h2 className="font-display font-black text-2xl sm:text-3xl text-[#651317] dark:text-amber-100">{copy.title}</h2>
        <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 font-medium">{copy.subtitle}</p>
      </div>
      
      {error && (
        <div className="rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/80 dark:bg-rose-950/40 p-3.5 text-xs text-rose-700 dark:text-rose-300 font-semibold leading-relaxed">
          {error}
          {canResendConfirmation && (
            <button
              type="button"
              onClick={handleResendConfirmation}
              disabled={loading}
              className="mt-2 block text-xs font-bold text-[#651317] dark:text-amber-400 hover:underline"
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
        <label htmlFor="email" className="text-[11px] font-extrabold uppercase tracking-wider text-[#651317] dark:text-amber-300">{copy.email}</label>
        <div className="relative">
          <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#651317]/60 dark:text-amber-400/60 pointer-events-none" />
          <Input
            id="email"
            type="email"
            {...register('email')}
            placeholder="namaste@example.com"
            className="h-12 rounded-xl border border-[#E8D8C4] dark:border-stone-700 bg-[#FAF6EE] dark:bg-stone-900/80 pl-10 text-stone-900 dark:text-white text-xs sm:text-sm font-medium placeholder:text-stone-400 focus:border-[#651317] dark:focus:border-amber-400 focus:ring-2 focus:ring-[#651317]/20 shadow-2xs"
          />
        </div>
        {errors.email && (
          <p className="text-xs text-rose-600 font-semibold">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-1.5 text-left">
        <label htmlFor="password" className="text-[11px] font-extrabold uppercase tracking-wider text-[#651317] dark:text-amber-300">{copy.password}</label>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#651317]/60 dark:text-amber-400/60 pointer-events-none" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            {...register('password')}
            placeholder="••••••••"
            className="h-12 rounded-xl border border-[#E8D8C4] dark:border-stone-700 bg-[#FAF6EE] dark:bg-stone-900/80 pl-10 pr-10 text-stone-900 dark:text-white text-xs sm:text-sm font-medium placeholder:text-stone-400 focus:border-[#651317] dark:focus:border-amber-400 focus:ring-2 focus:ring-[#651317]/20 shadow-2xs"
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

      <Button
        type="submit"
        disabled={loading}
        size="lg"
        className="w-full font-extrabold uppercase tracking-wider text-xs sm:text-sm"
      >
        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin text-white" /> : null}
        {copy.submit}
      </Button>

      <div className="relative py-1">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-[#E8D8C4] dark:border-stone-800" />
        </div>
        <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-extrabold">
          <span className="bg-[#FFFDF8] dark:bg-[#140F0A] px-3 text-stone-400">{copy.or}</span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={handleGoogleLogin}
        disabled={loading}
        className="h-12 w-full rounded-xl border border-[#E8D8C4] dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-100 hover:bg-[#FAF0E4] dark:hover:bg-stone-800 font-extrabold text-xs sm:text-sm shadow-xs transition-all flex items-center justify-center gap-2.5"
      >
        <GoogleLogo />
        <span>{copy.google}</span>
      </Button>

      <p className="text-center text-xs sm:text-sm text-stone-600 dark:text-stone-400 font-medium pt-1">
        {copy.noAccount}{' '}
        <Link to="/auth/signup" className="font-extrabold text-[#651317] dark:text-amber-400 hover:underline">
          {copy.signUp}
        </Link>
      </p>
    </form>
  );
}
