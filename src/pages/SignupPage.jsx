import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import GoogleIcon from '../components/GoogleIcon';

export default function SignupPage() {
  const { signUp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [name,    setName]    = useState('');
  const [email,   setEmail]   = useState('');
  const [pw,      setPw]      = useState('');
  const [cpw,     setCpw]     = useState('');
  const [showPw,  setShowPw]  = useState(false);
  const [errs,    setErrs]    = useState({});
  const [apiErr,  setApiErr]  = useState('');
  const [loading, setLoading] = useState(false);
  const [gLoad,   setGLoad]   = useState(false);

  const googleEnabled = Boolean(process.env.REACT_APP_GOOGLE_CLIENT_ID);

  const validate = () => {
    const e = {};
    if (!name.trim())                        e.name  = 'Full name is required';
    if (!email.trim())                       e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email))    e.email = 'Enter a valid email';
    if (!pw)                                 e.pw    = 'Password is required';
    else if (pw.length < 6)                  e.pw    = 'Min. 6 characters';
    if (pw !== cpw)                          e.cpw   = 'Passwords do not match';
    return e;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrs(e); return; }
    setErrs({}); setApiErr(''); setLoading(true);
    try { await signUp({ name, email, password: pw }); navigate('/'); }
    catch (err) { setApiErr(err.message); }
    finally { setLoading(false); }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tok) => {
      setGLoad(true);
      try {
        const res  = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', { headers: { Authorization:`Bearer ${tok.access_token}` } });
        const prof = await res.json();
        await signInWithGoogle({ name: prof.name, email: prof.email, picture: prof.picture });
        navigate('/');
      } catch { setApiErr('Google sign-up failed.'); }
      finally { setGLoad(false); }
    },
    onError: () => { setApiErr('Google sign-up cancelled.'); setGLoad(false); }
  });

  return (
    <div className="auth-page">
      <div className="auth-orb" style={{ width:350, height:350, background:'#818cf8', top:-80, left:-60 }} />
      <div className="auth-orb" style={{ width:280, height:280, background:'#E8B84B', bottom:-60, right:-40 }} />

      <div className="auth-card">
        <div style={{ marginBottom:22 }}>
          <div className="auth-logo-title">HABIT.FIT</div>
          <div className="auth-logo-sub">BUILD UNSTOPPABLE</div>
        </div>
        <div className="auth-title">Create account 🌱</div>
        <div className="auth-subtitle">Your journey starts from zero — and that's perfect.</div>

        {googleEnabled && (
          <>
            <button className="btn btn-google" onClick={() => { setApiErr(''); googleLogin(); }} disabled={gLoad || loading} style={{ marginBottom:6 }}>
              {gLoad ? <div className="spinner" style={{ borderTopColor:'#4285F4', borderColor:'rgba(66,133,244,.2)' }} /> : <GoogleIcon />}
              {gLoad ? 'Signing up...' : 'Continue with Google'}
            </button>
            <div className="divider">or sign up with email</div>
          </>
        )}

        <form onSubmit={submit} noValidate style={{ display:'flex', flexDirection:'column', gap:13, marginTop:6 }}>
          {apiErr && (
            <div style={{ background:'rgba(248,113,113,0.1)', border:'1px solid rgba(248,113,113,0.25)', borderRadius:8, padding:'10px 14px', fontSize:13, color:'var(--red)' }}>
              {apiErr}
            </div>
          )}
          {[
            { label:'Full name', val:name,  set:setName,  key:'name',  type:'text',  ph:'Ankit Kumar'     },
            { label:'Email',     val:email, set:setEmail, key:'email', type:'email', ph:'you@example.com' },
          ].map(({ label, val, set, key, type, ph }) => (
            <div className="form-group" key={key}>
              <label className="form-label">{label}</label>
              <input className={`form-input ${errs[key] ? 'err' : ''}`} type={type} placeholder={ph}
                value={val} onChange={e => { set(e.target.value); setErrs(p => ({ ...p, [key]:'' })); }} />
              {errs[key] && <span className="form-error">{errs[key]}</span>}
            </div>
          ))}
          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position:'relative' }}>
              <input className={`form-input ${errs.pw ? 'err' : ''}`} type={showPw ? 'text' : 'password'}
                placeholder="Min. 6 characters" value={pw}
                onChange={e => { setPw(e.target.value); setErrs(p => ({ ...p, pw:'' })); }}
                style={{ paddingRight:44 }} />
              <button type="button" onClick={() => setShowPw(s => !s)}
                style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'var(--text3)', cursor:'pointer', fontSize:16 }}>
                <i className={`ti ${showPw ? 'ti-eye-off' : 'ti-eye'}`} />
              </button>
            </div>
            {errs.pw && <span className="form-error">{errs.pw}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input className={`form-input ${errs.cpw ? 'err' : ''}`} type="password"
              placeholder="Repeat password" value={cpw}
              onChange={e => { setCpw(e.target.value); setErrs(p => ({ ...p, cpw:'' })); }} />
            {errs.cpw && <span className="form-error">{errs.cpw}</span>}
          </div>
          <button className="btn btn-gold" type="submit" disabled={loading || gLoad} style={{ marginTop:4 }}>
            {loading ? <><div className="spinner" />Creating account...</> : <>Create Account <i className="ti ti-arrow-right" /></>}
          </button>
        </form>

        <p style={{ textAlign:'center', marginTop:18, fontSize:13, color:'var(--text2)' }}>
          Already have an account?{' '}<Link to="/login" className="auth-link">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
