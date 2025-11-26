
import React, { createContext, useState, useContext, useEffect } from 'react';
import { User, VocabFolder } from '../types';
import { authService } from '../services/authService';
import Loader from '../components/shared/Loader';

type SignupDetails = Omit<User, 'folders' | 'hangulProgress'>;

interface AuthContextType {
  currentUser: User | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>;
  login: (email: string, password?: string) => Promise<User>;
  loginWithGoogle: () => Promise<User>;
  signup: (details: SignupDetails) => Promise<User>;
  signupWithGoogle: () => Promise<User>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const user = await authService.getCurrentUser();
        setCurrentUser(user);
      } catch (e) {
          console.error("Failed to check user status", e);
      } finally {
        setLoading(false);
      }
    };
    checkUser();
  }, []);

  useEffect(() => {
    // Persist any changes to the user object to localStorage
    if (currentUser && !loading) {
      authService.updateUser(currentUser);
    }
  }, [currentUser, loading]);

  const login = async (email: string, password?: string) => {
    const user = await authService.login(email, password);
    setCurrentUser(user);
    return user;
  };

  const loginWithGoogle = async () => {
    const user = await authService.loginWithGoogle();
    setCurrentUser(user);
    return user;
  };

  const signup = async (details: SignupDetails) => {
    const user = await authService.signup(details);
    setCurrentUser(user);
    return user;
  };

  const signupWithGoogle = async () => {
    const user = await authService.signupWithGoogle();
    setCurrentUser(user);
    return user;
  };

  const logout = async () => {
    await authService.logout();
    setCurrentUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen font-sans bg-rose-50 text-gray-800 flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ currentUser, setCurrentUser, login, loginWithGoogle, signup, signupWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};