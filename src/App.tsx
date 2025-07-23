import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { FirebaseAppStateProvider } from './context/FirebaseAppStateContext';
import AuthenticatedApp from './components/auth/AuthenticatedApp';
import './App.css';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <FirebaseAppStateProvider>
        <AuthenticatedApp />
      </FirebaseAppStateProvider>
    </AuthProvider>
  );
};

export default App;