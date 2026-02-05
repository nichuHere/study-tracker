import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../lib/supabase';
import React from 'react';

export default function AuthPage({ onAuth }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={[]}
          onlyThirdPartyProviders={false}
          theme="light"
          localization={{
            variables: {
              sign_in: {
                email_label: 'Email',
                password_label: 'Password',
                button_label: 'Sign in',
                link_text: 'Already have an account? Sign in',
              },
              sign_up: {
                email_label: 'Email',
                password_label: 'Password',
                button_label: 'Sign up',
                link_text: "Don't have an account? Sign up",
              },
            },
          }}
          redirectTo={window.location.origin}
          magicLink={false}
          socialLayout="horizontal"
          showLinks={false}
          view={undefined}
        />
      </div>
    </div>
  );
}
