import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { Lock, Mail, Eye, EyeOff } from 'lucide-react';
import { useRateLimit } from '@/hooks/useRateLimit';

// Opaque, unified messaging: never reveal whether an account exists.
const GENERIC_AUTH_ERROR = 'Invalid email or password.';
const GENERIC_RESET_MESSAGE =
  'If an account exists for that email, a password reset link has been sent.';

const credentialsSchema = z.object({
  email: z.string().trim().email({ message: 'Enter a valid email address.' }).max(255),
  password: z.string().min(6, { message: GENERIC_AUTH_ERROR }).max(128),
});

const emailSchema = z.object({
  email: z.string().trim().email({ message: 'Enter a valid email address.' }).max(255),
});

const formatLockout = (seconds: number) => {
  const mins = Math.ceil(seconds / 60);
  return `Too many attempts. Try again in ${mins} minute${mins === 1 ? '' : 's'}.`;
};

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false);
  const [lockedMessage, setLockedMessage] = useState('');
  const navigate = useNavigate();
  const { checkRateLimit } = useRateLimit(2000, 5, 60000);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate('/admin');
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate('/admin');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLockedMessage('');

    // Client-side throttle (server-side lockout is enforced below).
    const limit = checkRateLimit();
    if (!limit.allowed) {
      toast.error(limit.message);
      return;
    }

    const parsed = credentialsSchema.safeParse({ email, password });
    if (!parsed.success) {
      toast.error(GENERIC_AUTH_ERROR);
      return;
    }

    setLoading(true);
    try {
      // Server-side account lockout: 5 failed attempts locks sign-in for 15 minutes.
      const { data: lockedFor } = await supabase.rpc('auth_lockout_seconds', {
        _identifier: parsed.data.email,
      });
      if (typeof lockedFor === 'number' && lockedFor > 0) {
        const msg = formatLockout(lockedFor);
        setLockedMessage(msg);
        toast.error(msg);
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: parsed.data.email,
        password: parsed.data.password,
      });

      if (error) {
        const { data: remaining } = await supabase.rpc('auth_record_failure', {
          _identifier: parsed.data.email,
        });
        if (typeof remaining === 'number' && remaining > 0) {
          const msg = formatLockout(remaining);
          setLockedMessage(msg);
          toast.error(msg);
        } else {
          toast.error(GENERIC_AUTH_ERROR);
        }
        return;
      }

      await supabase.rpc('auth_clear_failures', { _identifier: parsed.data.email });
      toast.success('Signed in successfully');
    } catch {
      toast.error(GENERIC_AUTH_ERROR);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLockedMessage('');

    const limit = checkRateLimit();
    if (!limit.allowed) {
      toast.error(limit.message);
      return;
    }

    const parsed = emailSchema.safeParse({ email });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }

    setLoading(true);
    try {
      // Response is identical whether or not the account exists (no enumeration).
      await supabase.auth.resetPasswordForEmail(parsed.data.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
    } catch {
      // Swallowed intentionally: the message below must never vary.
    } finally {
      toast.success(GENERIC_RESET_MESSAGE);
      setIsResetMode(false);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-border bg-card">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
            <Lock className="w-6 h-6 text-primary" aria-hidden="true" />
          </div>
          <CardTitle className="text-2xl font-heading">
            {isResetMode ? 'Reset Password' : 'Admin Sign In'}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {isResetMode
              ? 'Enter your email to receive a reset link'
              : 'Sign in to access the admin dashboard'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={isResetMode ? handleResetPassword : handleSignIn} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" aria-hidden="true" />
              <Input
                type="email"
                placeholder="Email"
                aria-label="Email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                maxLength={255}
                className="pl-10"
              />
            </div>
            {!isResetMode && (
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" aria-hidden="true" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  aria-label="Password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  maxLength={128}
                  className="pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            )}
            {lockedMessage && (
              <p role="alert" className="text-sm text-destructive text-center">
                {lockedMessage}
              </p>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Please wait...' : isResetMode ? 'Send Reset Link' : 'Sign In'}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <button
              onClick={() => { setIsResetMode(!isResetMode); setLockedMessage(''); }}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              {isResetMode ? 'Back to sign in' : 'Forgot password?'}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
