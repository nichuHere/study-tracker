import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Mail, Lock, User, AlertCircle, CheckCircle, Book, Target, TrendingUp } from 'lucide-react';
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
        // Sign Up
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
          // Clear form
          setEmail('');
          setPassword('');
          setConfirmPassword('');
          setFullName('');
        }
      } else {
        // Log In
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        // Handle "Remember Me"
        if (!rememberMe) {
          // Set session to expire when browser closes
          // Note: Supabase handles session persistence by default
          // For "don't remember", we'll clear session on window close
          window.addEventListener('beforeunload', async () => {
            await supabase.auth.signOut();
          });
        }

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
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white opacity-10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-8 items-center">
        {/* Left side - Branding and Features */}
        <div className="hidden md:block text-white space-y-8 animate-slide-in-left">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="bg-white/30 backdrop-blur-lg p-4 rounded-3xl shadow-2xl border-2 border-white/40 animate-float">
                <img src={BoyLogo} alt="Kannama Logo" className="w-24 h-24 object-contain drop-shadow-2xl" />
              </div>
              <div>
                <h1 className="text-5xl font-bold drop-shadow-lg">Kannama</h1>
                <h2 className="text-3xl font-light opacity-90">Study Tracker</h2>
              </div>
            </div>
            <p className="text-xl text-white/90 font-light">
              Your ultimate companion for academic success
            </p>
          </div>

          {/* Feature highlights */}
          <div className="space-y-4">
            <div className="flex items-start gap-4 bg-white/10 backdrop-blur-lg p-4 rounded-xl hover:bg-white/20 transition-all transform hover:scale-105">
              <div className="bg-indigo-400/50 p-2 rounded-lg">
                <Book className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Track Your Subjects</h3>
                <p className="text-white/80 text-sm">Organize chapters, tasks, and progress effortlessly</p>
              </div>
            </div>

            <div className="flex items-start gap-4 bg-white/10 backdrop-blur-lg p-4 rounded-xl hover:bg-white/20 transition-all transform hover:scale-105">
              <div className="bg-purple-400/50 p-2 rounded-lg">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Plan Your Exams</h3>
                <p className="text-white/80 text-sm">Smart exam scheduling with revision tracking</p>
              </div>
            </div>

            <div className="flex items-start gap-4 bg-white/10 backdrop-blur-lg p-4 rounded-xl hover:bg-white/20 transition-all transform hover:scale-105">
              <div className="bg-pink-400/50 p-2 rounded-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Visualize Progress</h3>
                <p className="text-white/80 text-sm">Beautiful analytics and insights to stay motivated</p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/20">
            <p className="text-white/70 text-sm">
              ✨ Join thousands of students achieving their academic goals
            </p>
          </div>
        </div>

        {/* Right side - Auth Form */}
        <div className="w-full animate-slide-in-right">
          <div className="bg-white/95 backdrop-blur-xl p-8 md:p-10 rounded-3xl shadow-2xl border border-white/20 transform hover:shadow-3xl transition-all duration-300">
            {/* Mobile branding */}
            <div className="md:hidden mb-6 text-center">
              <div className="flex items-center justify-center gap-3 mb-3">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-3 rounded-2xl shadow-lg">
                  <img src={BoyLogo} alt="Kannama Logo" className="w-16 h-16 object-contain drop-shadow-lg" />
                </div>
                <div className="text-left">
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Kannama
                  </h1>
                  <p className="text-base text-gray-600 font-medium">Study Tracker</p>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {isSignUp ? '🎓 Create Account' : '👋 Welcome Back'}
              </h2>
              <p className="text-gray-600">
                {isSignUp ? 'Sign up to start your learning journey' : 'Log in to continue learning'}
              </p>
            </div>

            {/* Message Display */}
            {message.text && (
              <div className={`mb-4 p-3 rounded-xl flex items-start gap-2 animate-fade-in-up ${
                message.type === 'error' 
                  ? 'bg-red-50 text-red-700 border border-red-200' 
                  : 'bg-green-50 text-green-700 border border-green-200'
              }`}>
                {message.type === 'error' ? (
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                )}
                <span className="text-sm">{message.text}</span>
              </div>
            )}

            {/* Auth Form */}
            <form onSubmit={handleAuth} className="space-y-4">
              {isSignUp && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-gray-50 focus:bg-white"
                      placeholder="Enter your full name"
                      required={isSignUp}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-gray-50 focus:bg-white"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-gray-50 focus:bg-white"
                    placeholder={isSignUp ? 'Create a password (min 6 characters)' : 'Enter your password'}
                    required
                  />
                </div>
              </div>

              {isSignUp && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-gray-50 focus:bg-white"
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
                    className="text-sm text-indigo-600 hover:text-indigo-700 font-semibold"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white py-3.5 rounded-xl font-bold text-lg hover:shadow-lg hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
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
                  isSignUp ? '🚀 Create Account' : '✨ Log In'
                )}
              </button>
            </form>

            {/* Toggle Sign Up / Log In */}
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                <button
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setMessage({ type: '', text: '' });
                  }}
                  className="ml-2 text-indigo-600 font-bold hover:text-indigo-700 hover:underline"
                >
                  {isSignUp ? 'Log In' : 'Sign Up'}
                </button>
              </p>
            </div>

            {/* Footer note */}
            <div className="mt-6 text-center text-xs text-gray-500">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </div>
          </div>

          {/* Decorative elements */}
          <div className="hidden md:block absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full blur-2xl opacity-50"></div>
          <div className="hidden md:block absolute -top-4 -left-4 w-32 h-32 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full blur-2xl opacity-50"></div>
          
          {/* Copyright */}
          <div className="text-center mt-6 text-white/80 text-sm font-medium">
            <p>© 2026 Kannama Study Tracker. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
