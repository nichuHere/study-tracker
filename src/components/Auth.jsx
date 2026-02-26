import React, { useState } from 'react';
import { supabase, setRememberMe as setRememberMePreference } from '../lib/supabase';
import { Mail, Lock, User, AlertCircle, CheckCircle, BookOpen, Target, TrendingUp, Sparkles, Star } from 'lucide-react';
import BoyLogo from '../image/Boy.png';

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      if (isSignUp) {
        if (password !== confirmPassword) {
          setMessage({ type: 'error', text: 'Passwords do not match' });
          setLoading(false);
          return;
        }

        if (password.length < 6) {
          setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
          setLoading(false);
          return;
        }

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
          },
        });

        if (error) throw error;

        if (data.user) {
          setMessage({ 
            type: 'success', 
            text: 'Account created! Please check your email to verify your account.' 
          });
          setEmail('');
          setPassword('');
          setConfirmPassword('');
          setFullName('');
        }
      } else {
        setRememberMePreference(rememberMe);
        
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        setMessage({ type: 'success', text: 'Successfully logged in!' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setMessage({ type: 'error', text: 'Please enter your email address' });
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      setMessage({ type: 'success', text: 'Password reset email sent! Check your inbox.' });
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-violet-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Rich animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-gradient-to-br from-fuchsia-600/30 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-32 -left-32 w-[600px] h-[600px] bg-gradient-to-br from-indigo-600/25 to-blue-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>
        <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-gradient-to-br from-amber-400/15 to-orange-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '3s' }}></div>
        <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-gradient-to-br from-cyan-400/10 to-teal-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        {/* Subtle grid overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      </div>

      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
        {/* Left side - Branding */}
        <div className="hidden md:flex flex-col items-center text-center space-y-8 animate-slide-in-left">
          {/* Logo - large, no circle, prominent */}
          <div className="relative">
            <div className="absolute inset-0 scale-110 bg-gradient-to-br from-amber-400/30 via-purple-400/20 to-pink-400/30 rounded-3xl blur-3xl"></div>
            <img 
              src={BoyLogo} 
              alt="Kannama Logo" 
              className="relative w-72 h-72 object-contain drop-shadow-[0_0_40px_rgba(168,85,247,0.4)] animate-float filter brightness-110 contrast-105" 
            />
          </div>

          {/* App Name */}
          <div className="space-y-2">
            <h1 className="text-6xl font-extrabold text-white tracking-tight">
              Kannama
            </h1>
            <h2 className="text-2xl font-medium text-purple-200 tracking-wide">
              Study Tracker
            </h2>
            <p className="text-lg text-purple-300/90 mt-3 max-w-sm mx-auto leading-relaxed">
              Your ultimate companion for academic success
            </p>
          </div>

          {/* Feature Cards */}
          <div className="w-full max-w-sm space-y-3 mt-4">
            <div className="flex items-center gap-4 bg-white/[0.07] backdrop-blur-md border border-white/[0.12] p-4 rounded-2xl hover:bg-white/[0.12] transition-all duration-300 group">
              <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 p-2.5 rounded-xl shadow-lg shadow-indigo-500/30 group-hover:scale-110 transition-transform">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-white text-[15px]">Track Your Subjects</h3>
                <p className="text-purple-300 text-sm">Organize chapters, tasks & progress</p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-white/[0.07] backdrop-blur-md border border-white/[0.12] p-4 rounded-2xl hover:bg-white/[0.12] transition-all duration-300 group">
              <div className="bg-gradient-to-br from-violet-500 to-purple-700 p-2.5 rounded-xl shadow-lg shadow-purple-500/30 group-hover:scale-110 transition-transform">
                <Target className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-white text-[15px]">Plan Your Exams</h3>
                <p className="text-purple-300 text-sm">Smart scheduling & revision tracking</p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-white/[0.07] backdrop-blur-md border border-white/[0.12] p-4 rounded-2xl hover:bg-white/[0.12] transition-all duration-300 group">
              <div className="bg-gradient-to-br from-fuchsia-500 to-pink-700 p-2.5 rounded-xl shadow-lg shadow-pink-500/30 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-white text-[15px]">Visualize Progress</h3>
                <p className="text-purple-300 text-sm">Analytics & insights to stay motivated</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <p className="text-purple-300/80 text-sm font-medium">
              Join thousands of students achieving their academic goals
            </p>
          </div>
        </div>

        {/* Right side - Auth Form */}
        <div className="w-full animate-slide-in-right">
          <div className="bg-white rounded-3xl shadow-[0_20px_70px_-10px_rgba(0,0,0,0.5)] p-8 md:p-10 border border-gray-100">
            {/* Mobile branding */}
            <div className="md:hidden mb-8 text-center">
              <img 
                src={BoyLogo} 
                alt="Kannama Logo" 
                className="w-36 h-36 object-contain mx-auto mb-4 drop-shadow-xl" 
              />
              <h1 className="text-3xl font-extrabold text-gray-900">
                Kannama
              </h1>
              <p className="text-base text-gray-600 font-medium mt-1">Study Tracker</p>
            </div>

            <div className="mb-7">
              <h2 className="text-3xl font-extrabold text-gray-900 mb-1.5">
                {isSignUp ? 'Create Account' : 'Welcome Back'}
              </h2>
              <p className="text-gray-500 text-base">
                {isSignUp ? 'Sign up to start your learning journey' : 'Log in to continue learning'}
              </p>
            </div>

            {/* Message Display */}
            {message.text && (
              <div className={`mb-5 p-3.5 rounded-xl flex items-start gap-2.5 animate-fade-in-up ${
                message.type === 'error' 
                  ? 'bg-red-50 text-red-800 border border-red-200' 
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              }`}>
                {message.type === 'error' ? (
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                )}
                <span className="text-sm font-medium">{message.text}</span>
              </div>
            )}

            {/* Auth Form */}
            <form onSubmit={handleAuth} className="space-y-5">
              {isSignUp && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-gray-50/80 focus:bg-white text-gray-900 placeholder-gray-400 text-[15px]"
                      placeholder="Enter your full name"
                      required={isSignUp}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-gray-50/80 focus:bg-white text-gray-900 placeholder-gray-400 text-[15px]"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-gray-50/80 focus:bg-white text-gray-900 placeholder-gray-400 text-[15px]"
                    placeholder={isSignUp ? 'Create a password (min 6 characters)' : 'Enter your password'}
                    required
                  />
                </div>
              </div>

              {isSignUp && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-gray-50/80 focus:bg-white text-gray-900 placeholder-gray-400 text-[15px]"
                      placeholder="Confirm your password"
                      required={isSignUp}
                    />
                  </div>
                </div>
              )}

              {!isSignUp && (
                <div className="flex items-center justify-between">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 font-medium">Remember me</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-sm text-indigo-600 hover:text-indigo-800 font-bold transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-xl hover:shadow-purple-500/25 hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 mt-2"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Please wait...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Star className="w-5 h-5" />
                    {isSignUp ? 'Create Account' : 'Log In'}
                  </span>
                )}
              </button>
            </form>

            {/* Toggle Sign Up / Log In */}
            <div className="mt-7 text-center">
              <p className="text-gray-600 font-medium">
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                <button
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setMessage({ type: '', text: '' });
                  }}
                  className="ml-2 text-indigo-600 font-bold hover:text-indigo-800 hover:underline transition-colors"
                >
                  {isSignUp ? 'Log In' : 'Sign Up'}
                </button>
              </p>
            </div>

            {/* Footer note */}
            <div className="mt-5 text-center text-xs text-gray-400 font-medium">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </div>
          </div>
          
          {/* Copyright */}
          <div className="text-center mt-6 text-purple-300/60 text-sm font-medium">
            <p>&copy; 2026 Kannama Study Tracker. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
