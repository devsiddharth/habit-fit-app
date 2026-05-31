import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useHabits } from '../context/HabitContext';
import StreakRing from '../components/StreakRing';
import Confetti from '../components/Confetti';

const QUOTES = [
  "Every expert was once a beginner. Your streak of zero is just the starting line.",
  "Small habits compound into extraordinary results. Add your first habit and begin.",
  "Discipline is choosing between what you want now and what you want most.",
  "Champions don't always feel motivated — they show up anyway.",
  "You don't rise to the level of your goals. You fall to the level of your systems.",
  "The secret of getting ahead is getting started. One habit. One day. Right now.",
];

const firstName = (n = '') => n.split(' ')[0] || 'there';

export default function DashboardPage({ onAddHabit }) {
  const { user }   = useAuth();
  const { habits, toggleHabit, todayDone, todayTotal, todayPct, bestStreak } = useHabits();
  const [confettiId, setConfettiId] = useState(null);
  const [qIdx,       setQIdx]       = useState(0);
  const [qAnim,      setQAnim]      = useState(false);

  const handleToggle = (id) => {
    const h = habits.find(h => h.id === id);
    if (h && !h.done) { setConfettiId(id); setTimeout(() => setConfettiId(null), 900); }
    toggleHabit(id);
  };

  const nextQuote = () => {
    setQAnim(true);
    setTimeout(() => { setQIdx(i => (i + 1) % QUOTES.length); setQAnim(false); }, 280);
  };

  const today = new Date().toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long' });

  return (
    <div>
      {/* ── Topbar ─────────────────────────────────────────────────── */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:26 }}>
        <div>
          <div style={{ fontSize:11, color:'var(--text3)', fontWeight:600, letterSpacing:.5, marginBottom:5 }}>{today}</div>
          <div style={{ fontFamily:"'Syne',sans-serif", fontSize:24, fontWeight:800, lineHeight:1.2 }}>
            Hello, <span style={{ color:'var(--gold)' }}>{firstName(user?.name)}</span> 👋
          </div>
          <div style={{ fontSize:13, color:'var(--text2)', marginTop:5 }}>
            {habits.length === 0
              ? "No habits yet — add your first one below!"
              : todayDone === todayTotal
                ? '🎉 All habits done today! Incredible!'
                : `${todayTotal - todayDone} habit${todayTotal - todayDone !== 1 ? 's' : ''} remaining today`}
          </div>
        </div>
        <button className="btn btn-gold hide-mob" onClick={onAddHabit} style={{ width:'auto', whiteSpace:'nowrap' }}>
          <i className="ti ti-plus" style={{ fontSize:14 }} /> Add Habit
        </button>
      </div>

      {/* ── Stat cards ─────────────────────────────────────────────── */}
      <div className="stats-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:16, marginBottom:18 }}>

        {/* Streak */}
        <div className="card fade-up" style={{ textAlign:'center', animationDelay:'.05s' }}>
          <div style={{ fontSize:10, color:'var(--text3)', fontWeight:600, letterSpacing:2, marginBottom:10, fontFamily:"'Syne',sans-serif" }}>CURRENT STREAK</div>
          <StreakRing value={bestStreak} />
          <div style={{ display:'flex', gap:10, marginTop:10 }}>
            <div className="stat-pill">
              <div style={{ fontFamily:"'Syne',sans-serif", fontSize:18, fontWeight:800, color:'var(--gold)' }}>{bestStreak}</div>
              <div style={{ fontSize:10, color:'var(--text3)', marginTop:2 }}>Best</div>
            </div>
            <div className="stat-pill">
              <div style={{ fontFamily:"'Syne',sans-serif", fontSize:18, fontWeight:800, color:'var(--teal)' }}>{todayPct}%</div>
              <div style={{ fontSize:10, color:'var(--text3)', marginTop:2 }}>Today</div>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="card fade-up" style={{ animationDelay:'.10s' }}>
          <div style={{ fontSize:10, color:'var(--text3)', fontWeight:600, letterSpacing:2, marginBottom:14, fontFamily:"'Syne',sans-serif" }}>TODAY'S PROGRESS</div>
          {habits.length === 0 ? (
            <div className="empty-state" style={{ padding:'10px 0' }}>
              <div style={{ fontSize:28, marginBottom:8 }}>🎯</div>
              <div style={{ fontSize:12 }}>Add habits to track progress</div>
            </div>
          ) : (
            <>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:10, fontSize:13, color:'var(--text2)' }}>
                <span>Habits done</span>
                <span style={{ color:'var(--teal)', fontWeight:700 }}>{todayDone} / {todayTotal}</span>
              </div>
              {/* Big progress arc */}
              <div style={{ position:'relative', width:90, height:90, margin:'0 auto 12px' }}>
                <svg width="90" height="90" viewBox="0 0 90 90" style={{ transform:'rotate(-90deg)' }}>
                  <circle cx="45" cy="45" r="38" fill="none" stroke="#1e2230" strokeWidth="8" />
                  <circle cx="45" cy="45" r="38" fill="none"
                    stroke={todayPct === 100 ? 'var(--gold)' : 'var(--teal)'}
                    strokeWidth="8" strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 38}
                    strokeDashoffset={2 * Math.PI * 38 * (1 - todayPct / 100)}
                    style={{ transition:'stroke-dashoffset 1s ease' }} />
                </svg>
                <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <span style={{ fontFamily:"'Syne',sans-serif", fontSize:20, fontWeight:800, color:'#fff' }}>{todayPct}%</span>
                </div>
              </div>
              <div className="prog-track">
                <div className="prog-fill" style={{ width:`${todayPct}%`, background:'linear-gradient(90deg,var(--teal),var(--gold))' }} />
              </div>
            </>
          )}
        </div>

        {/* AI Quote */}
        <div className="card fade-up" style={{ background:'linear-gradient(135deg,var(--surface) 0%,#1a1f2e 100%)', border:'1px solid var(--gold-border)', animationDelay:'.15s' }}>
          <div className="ai-badge" style={{ marginBottom:12 }}>
            <i className="ti ti-sparkles" style={{ fontSize:11 }} /> AI Coach
          </div>
          <div style={{ fontSize:13, color:'var(--text1)', lineHeight:1.72, fontStyle:'italic', opacity:qAnim ? 0 : 1, transition:'opacity .28s', minHeight:90 }}>
            "{QUOTES[qIdx]}"
          </div>
          <div style={{ fontSize:11, color:'var(--gold)', marginTop:8, fontWeight:600 }}>
            — For {firstName(user?.name)}
          </div>
          <button onClick={nextQuote} style={{
            marginTop:12, background:'var(--gold-dim)', border:'1px solid var(--gold-border)',
            color:'var(--gold)', borderRadius:7, padding:'7px 12px', fontSize:11,
            fontWeight:700, cursor:'pointer', width:'100%', fontFamily:"'Syne',sans-serif", letterSpacing:.5
          }}>✨ New Quote</button>
        </div>
      </div>

      {/* ── Habits list ────────────────────────────────────────────── */}
      <div className="card fade-up" style={{ animationDelay:'.20s' }}>
        <div className="sec-title">
          Today's Habits
          {habits.length > 0 && <span className="sec-badge">{habits.length} habits</span>}
        </div>

        {habits.length === 0 ? (
          <div className="empty-state">
            <div className="emoji">🌱</div>
            <p>You have no habits yet.<br />Add your first habit and start your journey from day 1!</p>
            <button className="btn btn-gold" onClick={onAddHabit} style={{ width:'auto', margin:'0 auto' }}>
              <i className="ti ti-plus" /> Add Your First Habit
            </button>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:9 }}>
            {habits.map((h, i) => (
              <div key={h.id} className={`habit-row ${h.done ? 'done' : ''}`}
                style={{ borderLeftColor: h.done ? h.color : 'transparent', animationDelay:`${.22 + i * .05}s` }}
                onClick={() => handleToggle(h.id)}>
                <Confetti show={confettiId === h.id} />
                <div style={{ width:36, height:36, borderRadius:9, flexShrink:0, background:h.colorDim, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>
                  {h.icon}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:13, fontWeight:600, color: h.done ? 'var(--text1)' : 'var(--text2)' }}>{h.name}</div>
                  <div style={{ fontSize:11, color:'var(--text3)', marginTop:1 }}>{h.goal}</div>
                  <div className="prog-track" style={{ marginTop:5 }}>
                    <div className="prog-fill" style={{ width:`${h.completion}%`, background:h.color }} />
                  </div>
                </div>
                <div style={{ textAlign:'right', flexShrink:0 }}>
                  <div style={{ fontSize:11, color:h.color, fontWeight:700, marginBottom:5 }}>{h.streak}🔥</div>
                  <div style={{
                    width:28, height:28, borderRadius:'50%',
                    background: h.done ? h.color : '#1a1f2e',
                    border: h.done ? 'none' : '2px dashed var(--border2)',
                    display:'flex', alignItems:'center', justifyContent:'center', transition:'all .25s'
                  }}>
                    {h.done && <i className="ti ti-check" style={{ color: h.color === '#E8B84B' ? '#0b0d14' : '#fff', fontSize:13 }} />}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
