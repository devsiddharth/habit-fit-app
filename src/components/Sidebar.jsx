import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV = [
  { id:'dashboard',  icon:'ti-layout-dashboard', label:'Dashboard'   },
  { id:'statistics', icon:'ti-calendar-stats',   label:'Statistics'  },
  { id:'insights',   icon:'ti-brain',             label:'AI Insights' },
  { id:'profile',    icon:'ti-user',              label:'Profile'     },
];

const initials = (name='') => name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase() || 'HF';

export default function Sidebar({ active, onChange }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-title">HABIT.FIT</div>
        <div className="sidebar-logo-sub">BUILD UNSTOPPABLE</div>
      </div>

      <nav style={{ flex:1, paddingTop:4 }}>
        {NAV.map(({ id, icon, label }) => (
          <div key={id} className={`nav-item ${active === id ? 'active' : ''}`} onClick={() => onChange(id)}>
            <i className={`ti ${icon}`} />
            <span className="nav-label">{label}</span>
          </div>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <div style={{ display:'flex', alignItems:'center', gap:10, cursor:'pointer', borderRadius:8, padding:'4px 6px' }}
          onClick={() => setOpen(o => !o)}>
          <div className="user-avatar" style={{ background:'var(--gold)' }}>
            {user?.picture
              ? <img src={user.picture} alt={user.name} />
              : <span style={{ color:'#0b0d14', fontFamily:"'Syne',sans-serif", fontWeight:800 }}>{initials(user?.name)}</span>
            }
          </div>
          <div className="usr-name" style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:12, fontWeight:700, color:'var(--text1)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
              {user?.name || 'User'}
            </div>
            <div style={{ fontSize:10, color:'var(--gold)' }}>Habit Tracker</div>
          </div>
          <i className="ti ti-chevron-down" style={{ fontSize:13, color:'var(--text3)', flexShrink:0 }} />
        </div>

        {open && (
          <div style={{ marginTop:8, background:'#0d0f18', border:'1px solid var(--border2)', borderRadius:8, overflow:'hidden', animation:'scaleIn .2s ease' }}>
            <button onClick={() => { signOut(); navigate('/login'); }} style={{
              width:'100%', background:'none', border:'none', padding:'10px 14px',
              color:'var(--red)', fontSize:13, fontWeight:600, cursor:'pointer',
              display:'flex', alignItems:'center', gap:8
            }}>
              <i className="ti ti-logout" style={{ fontSize:15 }} /> Sign Out
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}

export { NAV };
