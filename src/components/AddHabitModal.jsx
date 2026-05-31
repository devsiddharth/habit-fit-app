import React, { useState } from 'react';
import { useHabits } from '../context/HabitContext';

const EMOJIS = ['💪','📚','💻','🧘','🎯','🏃','✍️','🎵','🌿','💧','🍎','🛌','🚴','🎨','🧠'];
const COLORS = [
  { hex:'#22d3a8', dim:'rgba(34,211,168,0.12)'  },
  { hex:'#818cf8', dim:'rgba(129,140,248,0.12)' },
  { hex:'#E8B84B', dim:'rgba(232,184,75,0.12)'  },
  { hex:'#f472b6', dim:'rgba(244,114,182,0.12)' },
  { hex:'#60a5fa', dim:'rgba(96,165,250,0.12)'  },
  { hex:'#34d399', dim:'rgba(52,211,153,0.12)'  },
  { hex:'#f97316', dim:'rgba(249,115,22,0.12)'  },
  { hex:'#e879f9', dim:'rgba(232,121,249,0.12)' },
];

export default function AddHabitModal({ onClose, onSuccess }) {
  const { addHabit } = useHabits();
  const [name,  setName]  = useState('');
  const [goal,  setGoal]  = useState('');
  const [icon,  setIcon]  = useState('🎯');
  const [color, setColor] = useState(COLORS[0]);
  const [err,   setErr]   = useState('');

  const submit = () => {
    if (!name.trim()) { setErr('Please enter a habit name.'); return; }
    addHabit({ name: name.trim(), goal: goal.trim() || 'Daily', icon, color: color.hex, colorDim: color.dim });
    onSuccess?.(`"${name.trim()}" added! Start your journey 🚀`);
    onClose();
  };

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-hdr">
          <span className="modal-title">Add New Habit</span>
          <button className="modal-close" onClick={onClose}><i className="ti ti-x" /></button>
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          {err && (
            <div style={{ background:'rgba(248,113,113,0.1)', border:'1px solid rgba(248,113,113,0.25)', borderRadius:8, padding:'9px 13px', fontSize:12, color:'var(--red)' }}>
              {err}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Habit name *</label>
            <input className={`form-input ${err ? 'err' : ''}`}
              placeholder="e.g. Morning Run, Read Books, No Sugar"
              value={name} onChange={e => { setName(e.target.value); setErr(''); }} />
          </div>

          <div className="form-group">
            <label className="form-label">Goal / description</label>
            <input className="form-input" placeholder="e.g. 30 mins, 20 pages, 1 litre"
              value={goal} onChange={e => setGoal(e.target.value)} />
          </div>

          <div>
            <div className="form-label" style={{ marginBottom:9 }}>Pick an icon</div>
            <div style={{ display:'flex', gap:7, flexWrap:'wrap' }}>
              {EMOJIS.map(e => (
                <button key={e} onClick={() => setIcon(e)} style={{
                  fontSize:18, background: icon === e ? 'var(--gold-dim)' : '#0d0f18',
                  border:`1px solid ${icon === e ? 'var(--gold)' : 'var(--border)'}`,
                  borderRadius:8, width:36, height:36, cursor:'pointer', transition:'all .15s'
                }}>{e}</button>
              ))}
            </div>
          </div>

          <div>
            <div className="form-label" style={{ marginBottom:9 }}>Accent color</div>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              {COLORS.map(c => (
                <button key={c.hex} onClick={() => setColor(c)} style={{
                  width:28, height:28, borderRadius:'50%', background:c.hex,
                  border:`3px solid ${color.hex === c.hex ? '#fff' : 'transparent'}`,
                  cursor:'pointer', transition:'all .15s',
                  boxShadow: color.hex === c.hex ? `0 0 0 2px ${c.hex}55` : 'none'
                }} />
              ))}
            </div>
          </div>

          {/* Preview */}
          <div style={{ background:'#0d0f18', border:`1px solid ${color.hex}33`, borderRadius:10, padding:'11px 13px', display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:36, height:36, borderRadius:9, background:color.dim, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>{icon}</div>
            <div>
              <div style={{ fontSize:13, fontWeight:600, color:'var(--text1)' }}>{name || 'Habit name'}</div>
              <div style={{ fontSize:11, color:'var(--text3)', marginTop:2 }}>{goal || 'Daily'}</div>
            </div>
            <div style={{ marginLeft:'auto', fontSize:11, color:color.hex, fontWeight:700 }}>0🔥</div>
          </div>
        </div>

        <div style={{ display:'flex', gap:10, marginTop:22 }}>
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-gold" onClick={submit}>
            <i className="ti ti-plus" style={{ fontSize:14 }} /> Save Habit
          </button>
        </div>
      </div>
    </div>
  );
}
