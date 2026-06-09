import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, Lock, Loader2, Chrome } from 'lucide-react';
import { loginSchema, type LoginInput } from '@/schemas';

export default function LoginForm() {
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [lastEmail, setLastEmail] = useState('');
  const [canResendConfirmation, setCanResendConfirmation] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn, signInWithGoogle, resendEmailConfirmation } = useAuth();
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
      setError(toFriendlyError(error.message || 'Login failed'));
      if (error.message?.toLowerCase().includes('email not confirmed')) {
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
      return 'Verification email could not be sent. Please use Google login for now, or configure Supabase SMTP and try again.';
    }
    if (normalized.includes('invalid login credentials')) {
      return 'No account found for this email, or the password is incorrect. Create an account first, or use Google if you signed up with Google.';
    }
    if (normalized.includes('email not confirmed')) {
      return 'Please verify your email first, then sign in.';
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
      if (error) setError(error.message);
    } catch (err: unknown) {
      setError(toFriendlyError(err instanceof Error ? err.message : 'Google login failed'));
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
      setError(toFriendlyError(error.message || 'Could not resend confirmation email'));
    } else {
      setNotice('Verification email sent. Please check your inbox and spam folder.');
      setCanResendConfirmation(false);
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 w-full">
      <div className="space-y-1 text-center">
        <h2 className="font-display text-2xl font-semibold text-white sm:text-3xl">Welcome Back</h2>
        <p className="text-sm text-[#B5BFD0]">Continue your spiritual journey</p>
      </div>
      
      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
          {canResendConfirmation && (
            <button
              type="button"
              onClick={handleResendConfirmation}
              disabled={loading}
              className="mt-2 block text-xs font-semibold text-[#E6C27A] hover:text-[#FFD98A] hover:underline"
            >
              Resend verification email
            </button>
          )}
        </div>
      )}

      {notice && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-300">
          {notice}
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wide text-[#B5BFD0]">Email Address</label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#E6C27A]/70" />
          <Input
            id="email"
            type="email"
            {...register('email')}
            placeholder="namaste@example.com"
            className="h-12 rounded-xl border border-[#E6C27A]/25 bg-[#061323]/60 pl-10 text-white shadow-lg shadow-black/20 placeholder:text-[#B5BFD0]/50 transition-all hover:border-[#E6C27A]/45 focus-visible:border-[#E6C27A] focus-visible:ring-2 focus-visible:ring-[#E6C27A]/30"
          />
        </div>
        {errors.email && (
          <p className="text-xs text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="text-xs font-semibold uppercase tracking-wide text-[#B5BFD0]">Password</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#E6C27A]/70" />
          <Input
            id="password"
            type="password"
            {...register('password')}
            placeholder="••••••••"
            className="h-12 rounded-xl border border-[#E6C27A]/25 bg-[#061323]/60 pl-10 text-white shadow-lg shadow-black/20 placeholder:text-[#B5BFD0]/50 transition-all hover:border-[#E6C27A]/45 focus-visible:border-[#E6C27A] focus-visible:ring-2 focus-visible:ring-[#E6C27A]/30"
          />
        </div>
        {errors.password && (
          <p className="text-xs text-destructive">{errors.password.message}</p>
        )}
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="h-12 w-full rounded-xl bg-gradient-to-r from-[#E6C27A] to-[#FFD98A] text-base font-semibold text-[#061323] shadow-[0_8px_28px_rgba(230,194,122,0.35)] transition-all hover:from-[#FFD98A] hover:to-[#E6C27A] hover:shadow-[0_10px_32px_rgba(255,217,138,0.4)]"
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Login
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-[#E6C27A]/20" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-[#0A1830]/80 px-3 text-[#B5BFD0]">OR</span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={handleGoogleLogin}
        disabled={loading}
        className="h-12 w-full rounded-xl border border-[#E6C27A]/30 bg-transparent text-white hover:border-[#E6C27A]/55 hover:bg-[#061323]/40"
      >
        <Chrome className="mr-2 h-4 w-4" />
        Continue with Google
      </Button>

      <p className="text-center text-sm text-[#B5BFD0]">
        Don&apos;t have an account?{' '}
        <Link to="/auth/signup" className="font-medium text-[#E6C27A] hover:text-[#FFD98A] hover:underline">
          Sign Up
        </Link>
      </p>
    </form>
  );
}
