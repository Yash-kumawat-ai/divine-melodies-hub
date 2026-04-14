import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, Lock, Loader2, Chrome } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await signIn(email, password);
    if (error) {
      setError(toFriendlyError(error.message || 'Login failed'));
    } else {
      navigate('/upload-bhajan');
    }
    setLoading(false);
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
    } catch (err: any) {
      setError(toFriendlyError(err.message || 'Google login failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 w-full">
      <div className="space-y-1 text-center">
        <h2 className="text-3xl font-semibold text-foreground">Welcome Back</h2>
        <p className="text-sm text-muted-foreground">Continue your journey of bhajans and devotion.</p>
      </div>
      
      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Email Address</label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="namaste@example.com"
            className="h-12 rounded-xl border-orange-200/80 bg-orange-50/30 pl-10 focus-visible:ring-orange-400"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Password</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="h-12 rounded-xl border-orange-200/80 bg-orange-50/30 pl-10 focus-visible:ring-orange-400"
            required
          />
        </div>
      </div>

      <Button type="submit" disabled={loading} className="h-12 w-full rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-base font-semibold text-white hover:from-orange-600 hover:to-amber-600">
        {loading && <Loader2 className="mr-2 w-4 h-4 animate-spin" />}
        Enter The Sanctuary
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-orange-100" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-3 text-muted-foreground">Or seek with</span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={handleGoogleLogin}
        disabled={loading}
        className="h-12 w-full rounded-xl border-orange-200 bg-white"
      >
        <Chrome className="mr-2 w-4 h-4" />
        Sign in with Google
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        New to the Editorial?{' '}
        <Link to="/auth/signup" className="text-primary hover:underline font-medium">
          Create Account
        </Link>
      </p>
    </form>
  );
}
