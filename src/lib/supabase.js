import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key exists:', !!supabaseAnonKey);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables!');
  console.log('REACT_APP_SUPABASE_URL:', supabaseUrl);
  console.log('REACT_APP_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'exists' : 'missing');
  throw new Error('Missing Supabase environment variables. Please check your .env.local file.');
}

// Check if user previously chose "Remember Me"
const getStorageType = () => {
  // Check localStorage for the preference
  const rememberMe = localStorage.getItem('rememberMe');
  // Default to localStorage (remembered) if no preference set
  return rememberMe === 'false' ? sessionStorage : localStorage;
};

// Create the default client with localStorage
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: getStorageType(),
    autoRefreshToken: true,
    persistSession: true,
  }
});

// Function to update storage preference and reinitialize auth
export const setRememberMe = (remember) => {
  localStorage.setItem('rememberMe', remember.toString());
  
  if (!remember) {
    // If not remembering, we need to move the session to sessionStorage
    // This will be picked up on next page load
    const sessionData = localStorage.getItem('sb-' + supabaseUrl.split('//')[1].split('.')[0] + '-auth-token');
    if (sessionData) {
      sessionStorage.setItem('sb-' + supabaseUrl.split('//')[1].split('.')[0] + '-auth-token', sessionData);
      localStorage.removeItem('sb-' + supabaseUrl.split('//')[1].split('.')[0] + '-auth-token');
    }
  }
};
