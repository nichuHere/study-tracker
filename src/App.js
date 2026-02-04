
import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import StudyTracker from './components/StudyTracker';
import AuthPage from './components/AuthPage';
import './App.css';

function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (!session) {
    return <AuthPage />;
  }

  return (
    <div className="App">
      <StudyTracker />
    </div>
  );
}

export default App;
