import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../lib/supabase';
import React from 'react';
import { Book, GraduationCap, Target, TrendingUp } from 'lucide-react';

export default function AuthPage({ onAuth }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 relative overflow-hidden">
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
            <div className="flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur-lg p-3 rounded-2xl animate-float">
                <GraduationCap className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-5xl font-bold">Study Tracker</h1>
            </div>
            <p className="text-xl text-white/90 font-light">
              Your ultimate companion for academic success
            </p>
          </div>

          {/* Feature highlights */}
          <div className="space-y-4">
            <div className="flex items-start gap-4 bg-white/10 backdrop-blur-lg p-4 rounded-xl hover:bg-white/20 transition-all transform hover:scale-105" style={{ animationDelay: '0.2s' }}>
              <div className="bg-indigo-400/50 p-2 rounded-lg">
                <Book className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Track Your Subjects</h3>
                <p className="text-white/80 text-sm">Organize chapters, tasks, and progress effortlessly</p>
              </div>
            </div>

            <div className="flex items-start gap-4 bg-white/10 backdrop-blur-lg p-4 rounded-xl hover:bg-white/20 transition-all transform hover:scale-105" style={{ animationDelay: '0.4s' }}>
              <div className="bg-purple-400/50 p-2 rounded-lg">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Plan Your Exams</h3>
                <p className="text-white/80 text-sm">Smart exam scheduling with revision tracking</p>
              </div>
            </div>

            <div className="flex items-start gap-4 bg-white/10 backdrop-blur-lg p-4 rounded-xl hover:bg-white/20 transition-all transform hover:scale-105" style={{ animationDelay: '0.6s' }}>
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
            <div className="md:hidden mb-8 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-xl">
                  <GraduationCap className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Study Tracker
                </h1>
              </div>
              <p className="text-gray-600 text-sm">Your path to academic excellence</p>
            </div>

            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome Back!</h2>
              <p className="text-gray-600">Sign in to continue your learning journey</p>
            </div>

            <Auth
              supabaseClient={supabase}
              appearance={{ 
                theme: ThemeSupa,
                variables: {
                  default: {
                    colors: {
                      brand: '#6366f1',
                      brandAccent: '#4f46e5',
                      inputBackground: '#f9fafb',
                      inputBorder: '#e5e7eb',
                      inputBorderFocus: '#6366f1',
                      inputBorderHover: '#d1d5db',
                    },
                    radii: {
                      borderRadiusButton: '0.75rem',
                      buttonBorderRadius: '0.75rem',
                      inputBorderRadius: '0.75rem',
                    },
                    fontSizes: {
                      baseBodySize: '14px',
                      baseInputSize: '14px',
                      baseLabelSize: '14px',
                      baseButtonSize: '15px',
                    },
                  },
                },
                className: {
                  button: 'font-semibold py-3 transition-all hover:scale-[1.02]',
                  input: 'transition-all',
                  label: 'font-medium text-gray-700',
                }
              }}
              providers={[]}
              onlyThirdPartyProviders={false}
              theme="light"
              localization={{
                variables: {
                  sign_in: {
                    email_label: 'Email Address',
                    password_label: 'Password',
                    button_label: 'Sign In',
                    link_text: 'Already have an account? Sign in',
                  },
                  sign_up: {
                    email_label: 'Email Address',
                    password_label: 'Password',
                    button_label: 'Create Account',
                    link_text: "Don't have an account? Sign up",
                  },
                },
              }}
              redirectTo={process.env.REACT_APP_REDIRECT_URL || window.location.origin}
              magicLink={false}
              socialLayout="horizontal"
              showLinks={false}
              view={undefined}
            />

            <div className="mt-6 text-center text-xs text-gray-500">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </div>
          </div>

          {/* Floating decoration */}
          <div className="hidden md:block absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full blur-2xl opacity-50"></div>
          <div className="hidden md:block absolute -top-4 -left-4 w-32 h-32 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full blur-2xl opacity-50"></div>
        </div>
      </div>
    </div>
  );
}

