import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useHabits } from '../context/HabitContext';
import { ACHIEVEMENT_DEFS, computeUnlocked } from '../utils/achievements';
import { loadSettings, saveSettings } from '../utils/storage';

const initials = (n='') => n.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase() || 'HF';

export default function ProfilePage() {
  const { user, signOut }  = useAuth();
  const { habits, completionMap, bestStreak, todayDone, todayTotal } = useHabits();
  const navigate = useNavigate();

  const [settings, setSettings] = useState(() => ({
    reminders:true, darkMode:true, weeklyReport:false, aiMotivation:true,
    ...loadSettings(),
  }));
  const toggle = (k) => setSettings(s => {
    const next = { ...s, [k]: !s[k] };
    saveSettings(next);
    return next;
  });

  const unlocked = computeUnlocked({ habits, completionMap });
  const totalDaysTracked = Object.values(completionMap).filter(ids => ids.length > 0).length;

  const SETTINGS = [
    { key:'reminders',    label:'Daily Reminders',     icon:'ti-bell'     },
    { key:'darkMode',     label:'Dark Mode',           icon:'ti-moon'     },
    { key:'weeklyReport', label:'Weekly Email Report', icon:'ti-mail'     },
    { key:'aiMotivation', label:'AI Motivation',       icon:'ti-sparkles' },
  ];

  return (
    <div className="fade-up">
      <div style={{ fontFamily:"'Syne',sans-serif", fontSize:22, fontWeight:800, marginBottom:24 }}>Profile</div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:18 }}>

        {/* User card */}
        <div className="card">
          <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:20, paddingBottom:18, borderBottom:'1px solid var(--border)' }}>
            <div style={{ width:64, height:64, borderRadius:'50%', background: user?.picture ? 'transparent' : 'var(--gold)', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden', flexShrink:0, boxShadow:'0 0 0 3px rgba(232,184,75,.25)' }}>
              {user?.picture
                ? <img src={user.picture} alt={user.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                : <span style={{ fontFamily:"'Syne',sans-serif", fontSize:22, fontWeight:800, color:'#0b0d14' }}>{initials(user?.name)}</span>
              }
            </div>
            <div>
              <div style={{ fontFamily:"'Syne',sans-serif", fontSize:18, fontWeight:700 }}>{user?.name || 'User'}</div>
              <div style={{ fontSize:12, color:'var(--text2)', marginTop:3 }}>{user?.email}</div>
              <div style={{ display:'inline-flex', alignItems:'center', gap:5, marginTop:6, background:'var(--gold-dim)', border:'1px solid var(--gold-border)', borderRadius:99, padding:'3px 10px' }}>
                <span style={{ fontSize:11, color:'var(--gold)', fontWeight:700 }}>
                  {unlocked.size === 0 ? 'Beginner' : unlocked.size < 4 ? 'Rising Star' : unlocked.size < 8 ? 'Habit Master' : 'Legend'} · {unlocked.size} badges
                </span>
              </div>
            </div>
          </div>

          {/* Stats grid */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10, marginBottom:18 }}>
            {[
              { val: bestStreak,       label:'Best Streak',  suffix:'🔥' },
              { val: `${todayDone}/${todayTotal}`, label:'Done Today', suffix:'' },
              { val: totalDaysTracked, label:'Days Active',  suffix:'' },
            ].map(({ val, label, suffix }) => (
              <div key={label} className="stat-pill">
                <div style={{ fontFamily:"'Syne',sans-serif", fontSize:16, fontWeight:800, color:'var(--text1)' }}>{val}{suffix}</div>
                <div style={{ fontSize:10, color:'var(--text3)', marginTop:3 }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Achievement progress */}
          <div style={{ marginBottom:16 }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6, fontSize:11, color:'var(--text2)' }}>
              <span>Achievements</span>
              <span style={{ color:'var(--gold)', fontWeight:700 }}>{unlocked.size} / {ACHIEVEMENT_DEFS.length}</span>
            </div>
            <div className="prog-track" style={{ height:7 }}>
              <div className="prog-fill" style={{ width:`${Math.round((unlocked.size / ACHIEVEMENT_DEFS.length) * 100)}%`, background:'linear-gradient(90deg,var(--gold),#f0c85a)' }} />
            </div>
          </div>

          {/* Provider */}
          <div style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 12px', background:'#0d0f18', borderRadius:8, marginBottom:16 }}>
            <i className={`ti ${user?.provider === 'google' ? 'ti-brand-google' : 'ti-mail'}`} style={{ fontSize:16, color:'var(--text2)' }} />
            <span style={{ fontSize:12, color:'var(--text2)' }}>Signed in with {user?.provider === 'google' ? 'Google' : 'Email'}</span>
          </div>

          <button className="btn btn-danger" onClick={() => { signOut(); navigate('/login'); }}>
            <i className="ti ti-logout" style={{ fontSize:15 }} /> Sign Out
          </button>
        </div>

        {/* Settings */}
        <div style={{ display:'flex', flexDirection:'column', gap:18 }}>
          <div className="card">
            <div className="sec-title">Settings</div>
            {SETTINGS.map(({ key, label, icon }) => (
              <div key={key} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'13px 0', borderBottom:'1px solid var(--border)' }}>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <i className={`ti ${icon}`} style={{ fontSize:17, color:'var(--text2)' }} />
                  <span style={{ fontSize:13, color:'var(--text1)' }}>{label}</span>
                </div>
                <div className="toggle-wrap" onClick={() => toggle(key)}
                  style={{ background: settings[key] ? 'var(--teal)' : '#1e2230', border: settings[key] ? 'none' : '1px solid var(--border2)' }}>
                  <div className="toggle-knob" style={{ left: settings[key] ? 21 : 3 }} />
                </div>
              </div>
            ))}
          </div>

          <div className="card">
            <div className="sec-title">Your Habits ({habits.length})</div>
            {habits.length === 0 ? (
              <div style={{ fontSize:12, color:'var(--text3)', padding:'10px 0' }}>No habits added yet.</div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {habits.map(h => (
                  <div key={h.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 10px', background:'#0d0f18', borderRadius:8 }}>
                    <span style={{ fontSize:16 }}>{h.icon}</span>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:12, fontWeight:600, color:'var(--text1)' }}>{h.name}</div>
                      <div style={{ fontSize:10, color:'var(--text3)' }}>{h.goal}</div>
                    </div>
                    <div style={{ fontSize:11, color:h.color, fontWeight:700 }}>{h.streak}🔥</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
