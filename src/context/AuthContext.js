import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiSignup, apiLogin, apiGoogle, apiMe, setToken, clearToken, getToken, ApiError } from '../utils/api';

const Ctx = createContext(null);

/**
 * Global auth state. The JWT lives in localStorage; on mount we validate it
 * against the backend (GET /api/auth/me) so a stale/expired token logs out
 * cleanly instead of rendering a broken app.
 */
export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);   // { name, email, picture, provider }
  const [loading, setLoading] = useState(true);   // true until /me resolves

  useEffect(() => {
    const restore = async () => {
      if (!getToken()) { setLoading(false); return; }
      try {
        const me = await apiMe();          // 200 → token still valid
        setUser(me);
      } catch (err) {
        if (err instanceof ApiError && (err.status === 401 || err.status === 0)) clearToken();
        else if (err.status !== 0) clearToken();
      } finally {
        setLoading(false);
      }
    };
    restore();
  }, []);

  /** Shared: persist token + set user from an AuthResponse. */
  const _applyAuth = (data) => {
    setToken(data.token);
    setUser({ name: data.name, email: data.email, picture: data.picture, provider: data.provider });
    return data;
  };

  const signUp = async ({ name, email, password }) =>
    _applyAuth(await apiSignup({ name, email, password }));

  const signIn = async ({ email, password }) =>
    _applyAuth(await apiLogin({ email, password }));

  const signInWithGoogle = async ({ name, email, picture }) =>
    _applyAuth(await apiGoogle({ name, email, picture }));

  const signOut = () => { clearToken(); setUser(null); };

  return (
    <Ctx.Provider value={{ user, loading, signUp, signIn, signInWithGoogle, signOut }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);
