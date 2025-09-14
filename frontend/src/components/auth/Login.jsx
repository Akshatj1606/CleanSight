import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import FloatingParticles from '@/components/ui/FloatingParticles';
import { Eye, EyeOff, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { signInWithGoogleRaw } from '@/lib/firebaseAuthService';
import { Link } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn, signInWithGoogle } = useAuth();

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const result = await signIn(formData.email, formData.password);
      // Navigate to the appropriate dashboard based on user role
      navigate(result.redirectTo, { replace: true });
    } catch (error) {
      alert('Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      const cred = await signInWithGoogleRaw();
      // additionalUserInfo new user flag path (Firebase v9): cred._tokenResponse?.isNewUser OR providerData length
      const isNew = cred?._tokenResponse?.isNewUser || false;
      if (isNew) {
        // Sign out to avoid half-created profile; redirect to register wizard with email prefill
        // We'll pass email via sessionStorage to avoid leaking in URL if user unshares screen
        try { sessionStorage.setItem('pendingGoogleEmail', cred.user.email || ''); } catch (_) {}
        // Ensure sign out so register flow controls profile creation
        try { await signOut(); } catch (_) {}
        navigate('/register?google=1', { replace: true });
      } else {
        // Existing user -> proceed with normal context-based sign-in to load profile (reuse existing method)
        const { redirectTo } = await signInWithGoogle();
        navigate(redirectTo, { replace: true });
      }
    } catch (err) {
      console.error('[Login] Google sign-in error', err);
      alert('Google sign-in failed: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-white overflow-hidden px-4 pt-32 pb-16">
      <Navbar activeSection="login" />
      <div className="hero-soft-bg" aria-hidden="true"></div>
      <div className="noise-layer" aria-hidden="true"></div>
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_10%,rgba(16,185,129,0.08),transparent_70%)]"></div>
      <div className="w-full max-w-md relative z-10">
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 tracking-tight">Welcome Back</h1>
          <p className="text-gray-600 text-sm md:text-base">Sign in to continue your CleanSight journey</p>
        </motion.div>
        <Card className="card-surface shadow-sm border border-gray-200/70">
          <CardHeader className="pb-2 text-center">
            <CardTitle className="text-xl font-semibold text-gray-900">Sign In</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <form onSubmit={handleSubmit} className="space-y-5" aria-label="Sign in form">
              <div>
                <label htmlFor="email" className="block text-xs font-medium text-gray-700 tracking-wide mb-2">Email Address</label>
                <input id="email" type="email" autoComplete="email" required value={formData.email} onChange={(e)=>handleInputChange('email', e.target.value)} placeholder="you@example.com" className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition" />
              </div>
              <div>
                <label htmlFor="password" className="block text-xs font-medium text-gray-700 tracking-wide mb-2">Password</label>
                <div className="relative">
                  <input id="password" type={showPassword?'text':'password'} autoComplete="current-password" required value={formData.password} onChange={(e)=>handleInputChange('password', e.target.value)} placeholder="••••••••" className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition" />
                  <button type="button" onClick={()=>setShowPassword(!showPassword)} aria-label={showPassword? 'Hide password':'Show password'} className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition">
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input type="checkbox" className="h-4 w-4 rounded border border-gray-300 text-green-600 focus:ring-green-500 focus:ring-2" />
                  <span className="text-xs text-gray-600">Remember me</span>
                </label>
                <Link to="/forgot-password" className="text-xs font-medium text-green-600 hover:text-green-700">Forgot password?</Link>
              </div>
              <div>
                <Button type="submit" disabled={loading} className="w-full rounded-full bg-green-600 hover:bg-green-700 text-white text-sm font-medium h-11 shadow-sm disabled:opacity-70 transition">
                  {loading ? 'Signing In...' : (
                    <span className="inline-flex items-center gap-2"><LogIn className="h-4 w-4" /> Sign In</span>
                  )}
                </Button>
              </div>
              <div>
                <Button type="button" variant="outline" disabled={loading} onClick={handleGoogle} className="w-full rounded-full bg-white text-gray-700 text-sm font-medium h-11 shadow-sm border border-gray-300 hover:border-green-500 hover:text-green-700 transition flex items-center justify-center gap-2">
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                  {loading ? 'Please wait...' : 'Sign in with Google'}
                </Button>
              </div>
              <div role="alert" aria-live="polite" className="min-h-[18px] text-center text-xs text-red-600"></div>
            </form>
            <div className="mt-8 text-center">
              <p className="text-xs text-gray-600">Don't have an account? <Link to="/register" className="text-green-600 hover:text-green-700 font-medium">Create one</Link></p>
            </div>
            <div className="mt-8 rounded-lg border border-dashed border-gray-300 p-4 bg-gray-50/70">
              <h4 className="text-[11px] font-semibold text-gray-800 mb-3 flex items-center justify-center gap-1 uppercase tracking-wide"><UserPlus className="h-3.5 w-3.5" /> Demo Accounts</h4>
              <div className="grid grid-cols-2 gap-4 text-[11px] text-gray-600">
                <div className="space-y-1">
                  <p><span className="font-medium text-gray-800">Citizen:</span> <span className="text-green-600 font-mono">citizen@demo.com</span></p>
                  <p><span className="font-medium text-gray-800">Kiosk:</span> <span className="text-green-600 font-mono">ragpicker@demo.com</span></p>
                </div>
                <div className="space-y-1">
                  <p><span className="font-medium text-gray-800">Institution:</span> <span className="text-green-600 font-mono">org@demo.com</span></p>
                  <p><span className="font-medium text-gray-800">Admin:</span> <span className="text-green-600 font-mono">admin@demo.com</span></p>
                </div>
              </div>
              <div className="mt-2 text-center text-[10px] text-gray-500">Password for all: <span className="text-green-600 font-semibold font-mono">demo123</span></div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
