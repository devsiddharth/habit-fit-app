import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import GoogleIcon from '../components/GoogleIcon';

export default function LoginPage() {
  const { signIn, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [errs,     setErrs]     = useState({});
  const [apiErr,   setApiErr]   = useState('');
  const [loading,  setLoading]  = useState(false);
  const [gLoad,    setGLoad]    = useState(false);

  // Same flag as src/index.js — see there for why.
  const googleEnabled = Boolean(process.env.REACT_APP_GOOGLE_CLIENT_ID);

  const validate = () => {
    const e = {};
    if (!email.trim())                       e.email    = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email))    e.email    = 'Enter a valid email';
    if (!password)                           e.password = 'Password is required';
    return e;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrs(e); return; }
    setErrs({}); setApiErr(''); setLoading(true);
    try { await signIn({ email, password }); navigate('/'); }
    catch (err) { setApiErr(err.message); }
    finally { setLoading(false); }
  };

  // No client ID configured → don't even create the useGoogleLogin hook flow.
  const googleLogin = useGoogleLogin({
    onSuccess: async (tok) => {
      setGLoad(true);
      try {
        const res  = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', { headers: { Authorization: `Bearer ${tok.access_token}` } });
        const prof = await res.json();
        await signInWithGoogle({ name: prof.name, email: prof.email, picture: prof.picture });
        navigate('/');
      } catch { setApiErr('Google sign-in failed.'); }
      finally { setGLoad(false); }
    },
    onError: () => { setApiErr('Google sign-in cancelled.'); setGLoad(false); }
  });

  return (
    <div className="auth-page">
      <div className="auth-orb" style={{ width:420, height:420, background:'#E8B84B', top:-100, right:-80 }} />
      <div className="auth-orb" style={{ width:300, height:300, background:'#22d3a8', bottom:-80, left:-60 }} />

      <div className="auth-card">
        <div style={{ marginBottom:26 }}>
          <div className="auth-logo-title">HABIT.FIT</div>
          <div className="auth-logo-sub">BUILD UNSTOPPABLE</div>
        </div>
        <div className="auth-title">Welcome back 👋</div>
        <div className="auth-subtitle">Sign in to continue your journey</div>

        {googleEnabled && (
          <>
            <button className="btn btn-google" onClick={() => { setApiErr(''); googleLogin(); }} disabled={gLoad || loading} style={{ marginBottom:6 }}>
              {gLoad ? <div className="spinner" style={{ borderTopColor:'#4285F4', borderColor:'rgba(66,133,244,.2)' }} /> : <GoogleIcon />}
              {gLoad ? 'Signing in...' : 'Continue with Google'}
            </button>
            <div className="divider">or sign in with email</div>
          </>
        )}

        <form onSubmit={submit} noValidate style={{ display:'flex', flexDirection:'column', gap:14, marginTop:6 }}>
          {apiErr && (
            <div style={{ background:'rgba(248,113,113,0.1)', border:'1px solid rgba(248,113,113,0.25)', borderRadius:8, padding:'10px 14px', fontSize:13, color:'var(--red)' }}>
              {apiErr}
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className={`form-input ${errs.email ? 'err' : ''}`} type="email" placeholder="you@example.com"
              value={email} onChange={e => { setEmail(e.target.value); setErrs(p => ({ ...p, email:'' })); }} />
            {errs.email && <span className="form-error">{errs.email}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position:'relative' }}>
              <input className={`form-input ${errs.password ? 'err' : ''}`} type={showPw ? 'text' : 'password'}
                placeholder="••••••••" value={password}
                onChange={e => { setPassword(e.target.value); setErrs(p => ({ ...p, password:'' })); }}
                style={{ paddingRight:44 }} />
              <button type="button" onClick={() => setShowPw(s => !s)}
                style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'var(--text3)', cursor:'pointer', fontSize:16 }}>
                <i className={`ti ${showPw ? 'ti-eye-off' : 'ti-eye'}`} />
              </button>
            </div>
            {errs.password && <span className="form-error">{errs.password}</span>}
          </div>
          <button className="btn btn-gold" type="submit" disabled={loading || gLoad} style={{ marginTop:4 }}>
            {loading ? <><div className="spinner" />Signing in...</> : <>Sign In <i className="ti ti-arrow-right" /></>}
          </button>
        </form>

        <p style={{ textAlign:'center', marginTop:20, fontSize:13, color:'var(--text2)' }}>
          No account?{' '}<Link to="/signup" className="auth-link">Create one free</Link>
        </p>
      </div>
    </div>
  );
}
