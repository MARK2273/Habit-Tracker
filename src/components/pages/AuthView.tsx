import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Sparkles, ArrowRight, Loader2, Info } from 'lucide-react';
import { runDiagnostics } from '../../lib/diagnostic';

export const AuthView: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const cleanEmail = email.trim();
      
      if (isLogin) {
        const { error, data } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });
        
        if (error) {
          console.error('[Supabase Auth Error]:', {
            message: error.message,
            status: error.status,
            name: error.name,
            context: 'signInWithPassword'
          });
          throw error;
        }
        
        console.log('[Supabase Auth Success]:', data.user?.id);
      } else {
        const { error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
        });
        
        if (error) {
          console.error('[Supabase Auth Error]:', {
            message: error.message,
            status: error.status,
            name: error.name,
            context: 'signUp'
          });
          throw error;
        }
        
        console.log('[Supabase Auth Success]: Verification email sent to', cleanEmail);
      }
    } catch (err: any) {
      const detail = err.message === 'Failed to fetch' 
        ? 'Network Error: Check your internet connection or ad-blockers. Supabase might be unreachable.'
        : err.message;
      setError(detail);
      console.error('[Auth Exception]:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-primary to-primary-dim rounded-2xl flex items-center justify-center text-white mx-auto shadow-lg shadow-primary/20 mb-6">
            <Sparkles size={32} />
          </div>
          <h1 className="text-3xl font-bold text-on-surface tracking-tight">
            {isLogin ? 'Welcome Back' : 'Create Sanctuary'}
          </h1>
          <p className="text-on-surface-variant mt-2">
            {isLogin ? 'Sign in to access your digital sanctuary.' : 'Start tracking your habits across all your devices.'}
          </p>
        </div>

        <div className="glass-card p-8 border border-outline-variant/10">
          <form onSubmit={handleAuth} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-surface-lowest border border-outline-variant/20 rounded-xl text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-surface-lowest border border-outline-variant/20 rounded-xl text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                placeholder="••••••••"
                minLength={6}
              />
            </div>

            {error && (
              <div className="p-3 bg-error-container/10 border border-error-container/20 rounded-lg text-sm text-error-container">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 btn-gradient text-white font-semibold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.01] transition-all disabled:opacity-70 disabled:hover:scale-100"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : (
                <>
                  {isLogin ? 'Sign In' : 'Create Account'}
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-on-surface-variant hover:text-primary transition-colors"
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-outline-variant/10">
            <button
              onClick={runDiagnostics}
              className="w-full py-2 px-4 flex items-center justify-center gap-2 text-xs font-medium text-on-surface-variant hover:text-primary transition-all rounded-lg border border-transparent hover:border-primary/20 bg-surface-lowest/50"
            >
              <Info size={14} />
              Run Connectivity Diagnostics
            </button>
            <p className="text-[10px] text-on-surface-variant/60 mt-2 text-center">
              Having trouble connecting? Run diagnostics to check your link to Supabase.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
