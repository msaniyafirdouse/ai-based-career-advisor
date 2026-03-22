'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, Loader2, ArrowRight, Sparkles, User, Lock, Eye, EyeOff } from 'lucide-react';

type Mode = 'login' | 'signup';
type Status = 'idle' | 'success_returning' | 'success_new';

export default function LoginPage() {
  const router = useRouter();

  const [mode, setMode]               = useState<Mode>('login');
  const [username, setUsername]       = useState('');
  const [password, setPassword]       = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading]     = useState(false);
  const [error, setError]             = useState('');
  const [status, setStatus]           = useState<Status>('idle');

  // If already logged in this session, skip to dashboard
  useEffect(() => {
    const saved = sessionStorage.getItem('ai_advisor_user');
    if (saved) router.replace('/');
  }, [router]);

  const clearForm = () => {
    setError('');
    setUsername('');
    setPassword('');
    setStatus('idle');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const u = username.trim();
    const p = password.trim();

    // Frontend validation
    if (!u) return setError('Please enter a username.');
    if (u.length < 2) return setError('Username must be at least 2 characters.');
    if (!p) return setError('Please enter a password.');
    if (mode === 'signup' && p.length < 4)
      return setError('Password must be at least 4 characters.');

    setError('');
    setIsLoading(true);

    try {
      const endpoint = mode === 'login' ? '/api/login' : '/api/signup';
      const res  = await fetch(`http://localhost:8000${endpoint}`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ username: u, password: p }),
      });
      const data = await res.json();

      if (!data.success) {
        setError(data.error || 'Something went wrong. Please try again.');
        setIsLoading(false);
        return;
      }

      // Save session
      sessionStorage.setItem('ai_advisor_user', JSON.stringify({
        name: data.user.name,
        id:   data.user.id,
      }));

      // Show success state briefly before redirecting
      setStatus(data.is_new ? 'success_new' : 'success_returning');
      setTimeout(() => router.replace('/'), 1400);

    } catch {
      setError('Could not connect to the server. Make sure the backend is running on port 8000.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-6 relative overflow-hidden">
      
      {/* ── STARFIELD BACKGROUND ────────────────────────────────────── */}
      {/* Layer 1: Small dense stars */}
      <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.15)_1px,transparent_1px)] [background-size:20px_20px] opacity-40" />
      
      {/* Layer 2: Larger sparse stars */}
      <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.4)_1px,transparent_1px)] [background-size:60px_60px] opacity-30" />

      {/* ── NEBULA GLOWS (The "Orbit" aesthetic) ─────────────────────── */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px] opacity-30" />
      <div className="absolute bottom-[-200px] right-[-200px] w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[120px]" />
      <div className="absolute top-[-100px] left-[-100px] w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px]" />

      {/* ── MAIN CARD ─────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, type: "spring" }}
        className="relative w-full max-w-md z-10"
      >
        {/* Card Glass Effect */}
        <div className="relative bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-[2rem] p-10 shadow-2xl shadow-black/50">
          
          {/* Decorative top glow line */}
          <div className="absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-indigo-500/80 to-transparent" />

          {/* LOGO SECTION */}
          <div className="flex flex-col items-center mb-10">
            {/* Animated Orbit Ring around Icon */}
            <div className="relative w-20 h-20 flex items-center justify-center mb-5">
               <div className="absolute inset-0 rounded-full border border-indigo-500/20 animate-[spin_8s_linear_infinite]" />
               <div className="absolute inset-2 rounded-full border border-t-indigo-400/40 border-r-transparent border-b-transparent border-l-transparent animate-[spin_3s_linear_infinite]" />
               
               <div className="w-14 h-14 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                 <BrainCircuit className="w-7 h-7 text-white" />
               </div>
            </div>

            <h1 className="text-2xl font-bold text-white tracking-tight">Career Advisor</h1>
            <p className="text-zinc-400 text-sm mt-2 text-center max-w-[240px]">
              Your personalised AI for career growth.
            </p>
          </div>

          {/* MODE TOGGLE */}
          <div className="flex bg-white/5 border border-white/10 rounded-2xl p-1.5 mb-8">
            {(['login', 'signup'] as Mode[]).map(m => (
              <button
                key={m}
                type="button"
                onClick={() => { setMode(m); clearForm(); }}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                  mode === m
                    ? 'bg-white text-black shadow-lg'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {m === 'login' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          {/* STATUS ANIMATIONS */}
          <AnimatePresence mode="wait">
            {status === 'success_returning' && (
              <motion.div key="ret" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="py-8 text-center">
                <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
                  <span className="text-3xl">👋</span>
                </div>
                <p className="text-emerald-400 font-bold text-xl">Welcome back!</p>
                <p className="text-zinc-500 text-sm mt-2">Restoring your progress...</p>
              </motion.div>
            )}

            {status === 'success_new' && (
              <motion.div key="new" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="py-8 text-center">
                <div className="w-16 h-16 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-indigo-500/20">
                  <span className="text-3xl">🚀</span>
                </div>
                <p className="text-white font-bold text-xl">Account Created</p>
                <p className="text-zinc-500 text-sm mt-2">Preparing your dashboard...</p>
              </motion.div>
            )}

            {status === 'idle' && (
              <motion.form key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                onSubmit={handleSubmit} className="space-y-5">

                {/* USERNAME INPUT */}
                <div>
                  <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-2 ml-1">
                    Username
                  </label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-indigo-400 transition-colors" />
                    <input
                      type="text"
                      value={username}
                      onChange={e => { setUsername(e.target.value); setError(''); }}
                      placeholder="Enter your username"
                      autoFocus
                      autoComplete="username"
                      className="w-full bg-white/[0.03] border border-white/10 text-white placeholder:text-zinc-700 rounded-xl pl-11 pr-5 py-4 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/50 focus:bg-white/[0.05] transition-all"
                    />
                  </div>
                </div>

                {/* PASSWORD INPUT */}
                <div>
                  <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-2 ml-1">
                    Password
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-indigo-400 transition-colors" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => { setPassword(e.target.value); setError(''); }}
                      placeholder={mode === 'signup' ? 'Create a password' : 'Enter your password'}
                      autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                      className="w-full bg-white/[0.03] border border-white/10 text-white placeholder:text-zinc-700 rounded-xl pl-11 pr-12 py-4 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/50 focus:bg-white/[0.05] transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(s => !s)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* ERROR MESSAGE */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3"
                    >
                      <p className="text-rose-400 text-xs font-medium">{error}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* INFO NOTE */}
                {mode === 'signup' && (
                  <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-xl p-4 flex gap-3">
                    <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                    <p className="text-zinc-400 text-[11px] leading-relaxed">
                      Your resume data and roadmaps will be securely linked to this account.
                    </p>
                  </div>
                )}

                {/* SUBMIT BUTTON */}
                <button
                  type="submit"
                  disabled={isLoading || !username.trim() || !password.trim()}
                  className="w-full bg-white text-black font-bold py-4 rounded-xl flex items-center justify-center gap-3 transition-all hover:bg-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-white/5 relative overflow-hidden group"
                >
                  {/* Shimmer effect on hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                  
                  <span className="relative z-10 flex items-center gap-2 text-sm">
                    {isLoading
                      ? <><Loader2 className="animate-spin w-4 h-4" /> {mode === 'login' ? 'Verifying...' : 'Creating...'}</>
                      : <><span>{mode === 'login' ? 'Sign In' : 'Create Account'}</span> <ArrowRight className="w-4 h-4" /></>
                    }
                  </span>
                </button>

                {/* SWITCH MODE */}
                <p className="text-center text-zinc-600 text-xs pt-2">
                  {mode === 'login'
                    ? <>New to Career Advisor?{' '}
                        <button type="button" onClick={() => { setMode('signup'); clearForm(); }}
                          className="text-indigo-400 font-bold hover:text-white transition-colors">
                          Create an account
                        </button>
                      </>
                    : <>Already have an account?{' '}
                        <button type="button" onClick={() => { setMode('login'); clearForm(); }}
                          className="text-indigo-400 font-bold hover:text-white transition-colors">
                          Sign in
                        </button>
                      </>
                  }
                </p>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        <p className="text-center text-zinc-700 text-[10px] mt-6 font-medium uppercase tracking-wider">
          Secure Connection · No email required
        </p>
      </motion.div>
    </div>
  );
}