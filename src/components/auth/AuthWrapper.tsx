import React, { useState } from 'react';
import Login from './Login';
import SignUp from './SignUp';
import ForgotPassword from './ForgotPassword';

type AuthScreen = 'login' | 'signup' | 'forgot-password';

const AuthWrapper: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<AuthScreen>('login');

  const handleSwitchToSignUp = () => {
    setCurrentScreen('signup');
  };

  const handleSwitchToLogin = () => {
    setCurrentScreen('login');
  };

  const handleForgotPassword = () => {
    setCurrentScreen('forgot-password');
  };

  const handleBackToLogin = () => {
    setCurrentScreen('login');
  };

  switch (currentScreen) {
    case 'signup':
      return <SignUp onSwitchToLogin={handleSwitchToLogin} />;
    case 'forgot-password':
      return <ForgotPassword onBackToLogin={handleBackToLogin} />;
    default:
      return (
        <Login 
          onSwitchToSignUp={handleSwitchToSignUp} 
          onForgotPassword={handleForgotPassword} 
        />
      );
  }
};

export default AuthWrapper;