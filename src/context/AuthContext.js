import React, { createContext, useContext, useState, useEffect } from 'react';
import { saveSession, loadSession, clearSession, loadAccounts, saveAccounts } from '../utils/storage';

const Ctx = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUser(loadSession());
    setLoading(false);
  }, []);

  const _persist = (u) => { setUser(u); saveSession(u); };

  // Email signup — brand new account, starts from scratch
  const signUp = ({ name, email, password }) => new Promise((res, rej) => {
    setTimeout(() => {
      const accounts = loadAccounts();
      if (accounts.find(a => a.email === email))
        return rej(new Error('An account with this email already exists.'));
      saveAccounts([...accounts, { name, email, password }]);
      const u = { name, email, picture: null, provider: 'email' };
      _persist(u);
      res(u);
    }, 600);
  });

  // Email sign-in
  const signIn = ({ email, password }) => new Promise((res, rej) => {
    setTimeout(() => {
      const match = loadAccounts().find(a => a.email === email && a.password === password);
      if (!match) return rej(new Error('Invalid email or password.'));
      const u = { name: match.name, email: match.email, picture: null, provider: 'email' };
      _persist(u);
      res(u);
    }, 600);
  });

  // Google sign-in
  const signInWithGoogle = ({ name, email, picture }) => {
    const u = { name, email, picture, provider: 'google' };
    _persist(u);
    return u;
  };

  const signOut = () => { setUser(null); clearSession(); };

  return (
    <Ctx.Provider value={{ user, loading, signUp, signIn, signInWithGoogle, signOut }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);
