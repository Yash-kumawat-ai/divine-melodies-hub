import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, Lock, Loader2, Chrome } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { loginSchema, type LoginInput } from '@/schemas';

export default function LoginForm() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  
  const { register, handleSubmit, formState: { errors } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setError('');
    setLoading(true);

    const { error } = await signIn(data.email, data.password);
    if (error) {
      setError(toFriendlyError(error.message || 'Login failed'));
    } else {
      navigate('/upload-bhajan');
    }
    setLoading(false);
  };

  const toFriendlyError = (message: string) => {
    const normalized = message.toLowerCase();
    if (normalized.includes('invalid login credentials')) {
      return 'No account found for this email, or the password is incorrect. If signup failed earlier, create your account first.';
    }
    if (normalized.includes('email not confirmed')) {
      return 'Please verify your email first, then sign in.';
    }
    return message;
  };

  const handleGoogleLogin = async () => {
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
      if (error) setError(error.message);
    } catch (err: unknown) {
      setError(toFriendlyError(err instanceof Error ? err.message : 'Google login failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 w-full">
      <div className="space-y-1 text-center">
        <h2 className="text-3xl font-semibold text-white">Welcome Back</h2>
        <p className="text-sm text-slate-400">Continue your journey of bhajans and devotion.</p>
      </div>
      
      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wide text-slate-300">Email Address</label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-500/60 w-4 h-4" />
          <Input
            id="email"
            type="email"
            {...register('email')}
            placeholder="namaste@example.com"
            className="h-12 rounded-xl border border-orange-500/50 bg-slate-800/50 text-white placeholder:text-slate-500 pl-10 focus-visible:ring-orange-500 focus-visible:ring-2 focus-visible:border-orange-500 shadow-lg shadow-orange-500/20 hover:border-orange-500/75 transition-all"
          />
        </div>
        {errors.email && (
          <p className="text-xs text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="text-xs font-semibold uppercase tracking-wide text-slate-300">Password</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-500/60 w-4 h-4" />
          <Input
            id="password"
            type="password"
            {...register('password')}
            placeholder="••••••••"
            className="h-12 rounded-xl border border-orange-500/50 bg-slate-800/50 text-white placeholder:text-slate-500 pl-10 focus-visible:ring-orange-500 focus-visible:ring-2 focus-visible:border-orange-500 shadow-lg shadow-orange-500/20 hover:border-orange-500/75 transition-all"
          />
        </div>
        {errors.password && (
          <p className="text-xs text-destructive">{errors.password.message}</p>
        )}
      </div>

      <Button type="submit" disabled={loading} className="h-12 w-full rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-base font-semibold text-white hover:from-orange-600 hover:to-amber-600 shadow-lg shadow-orange-500/30 transition-all">
        {loading && <Loader2 className="mr-2 w-4 h-4 animate-spin" />}
        Enter The Sanctuary
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
        onClick={handleGoogleLogin}
        disabled={loading}
        className="h-12 w-full rounded-xl border border-orange-500/30 bg-slate-800/50 text-white hover:bg-slate-700/50 hover:border-orange-500/50"
      >
        <Chrome className="mr-2 w-4 h-4" />
        Sign in with Google
      </Button>

      <p className="text-center text-sm text-slate-400">
        New to the Editorial?{' '}
        <Link to="/auth/signup" className="text-orange-400 hover:text-orange-300 hover:underline font-medium">
          Create Account
        </Link>
      </p>
    </form>
  );
}
