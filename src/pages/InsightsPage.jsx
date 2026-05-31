import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useHabits } from '../context/HabitContext';
import { ACHIEVEMENT_DEFS, computeUnlocked } from '../utils/achievements';

const firstName = (n='') => n.split(' ')[0] || 'there';

const TIPS = [
  { icon:'☀️', title:'Morning habits win',    body:'People who complete habits before 10AM have a 40% higher success rate. Stack your hardest habit first.', color:'var(--gold)',   tag:'Timing'  },
  { icon:'🔗', title:'Habit stacking',         body:'Pair a new habit with an existing one. "After I brush my teeth, I will meditate for 5 minutes."',       color:'var(--teal)',   tag:'Strategy'},
  { icon:'🧠', title:'66-day rule',            body:'It takes ~66 days to form a habit on average — not 21. Commit to consistency beyond the first month.',  color:'var(--indigo)', tag:'Science' },
  { icon:'📉', title:'Miss once, never twice', body:"Missing one day has little impact. Missing two in a row is where habits break. Protect your streak.",    color:'var(--pink)',   tag:'Warning' },
  { icon:'🏆', title:'Celebrate wins',         body:'Every completed habit is a vote for the identity you want. Small wins compound into transformations.',   color:'#34d399',      tag:'Mindset' },
  { icon:'📱', title:'Remove friction',        body:'Put your running shoes by the door. Keep your book on your pillow. Make habits impossible to ignore.',   color:'#f97316',      tag:'Tip'     },
];

const PERSONAL_QUOTES = [
  (name, streak) => `${name}, your best streak is ${streak} days. Every champion was once a beginner who refused to quit.`,
  (name, total)  => `You have ${total} habit${total!==1?'s':''} tracked so far, ${name}. The compound effect is just getting started.`,
  (name)         => `${name}, focus on showing up — not on being perfect. Progress beats perfection every single day.`,
  (name, streak) => `${name}, ${streak > 0 ? `a ${streak}-day streak` : 'a fresh start'} is exactly where legends begin their stories.`,
];

export default function InsightsPage() {
  const { user }   = useAuth();
  const { habits, completionMap, bestStreak } = useHabits();
  const [quoteIdx, setQuoteIdx] = useState(0);
  const [loading,  setLoading]  = useState(false);
  const [qAnim,    setQAnim]    = useState(false);

  const unlocked = computeUnlocked({ habits, completionMap });
  const name     = firstName(user?.name);

  const habitInsights = habits.map(h => ({
    icon:  h.icon,
    title: `${h.name} — ${h.streak} day streak`,
    body:  h.streak >= 7
      ? `Outstanding! ${h.name} is your strongest habit right now. You're close to the next achievement.`
      : h.streak >= 3
        ? `Good momentum on ${h.name}. Keep it going 4 more days to hit the 7-Day Warrior badge.`
        : `${h.name} has a streak of ${h.streak}. Aim for 3 days in a row to unlock your first streak badge.`,
    color: h.color,
    tag:   h.streak >= 7 ? 'Strong' : h.streak >= 3 ? 'Growing' : 'Start',
  }));

  const genQuote = () => {
    setLoading(true); setQAnim(true);
    setTimeout(() => {
      setQuoteIdx(i => (i + 1) % PERSONAL_QUOTES.length);
      setLoading(false); setQAnim(false);
    }, 700);
  };

  const currentQuote = PERSONAL_QUOTES[quoteIdx](name, bestStreak, habits.length);

  return (
    <div className="fade-up">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
        <div style={{ fontFamily:"'Syne',sans-serif", fontSize:22, fontWeight:800 }}>AI Insights</div>
        <div className="ai-badge"><i className="ti ti-sparkles" style={{ fontSize:11 }} /> Powered by AI</div>
      </div>

      {/* Personal message */}
      <div className="card" style={{ border:'1px solid var(--gold-border)', background:'linear-gradient(135deg,var(--surface) 0%,#1a1f2e 100%)', marginBottom:20 }}>
        <div style={{ display:'flex', alignItems:'flex-start', gap:14 }}>
          <div style={{ width:44, height:44, borderRadius:10, background:'var(--gold-dim)', border:'1px solid var(--gold-border)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 }}>🤖</div>
          <div style={{ flex:1 }}>
            <div style={{ fontFamily:"'Syne',sans-serif", fontSize:12, fontWeight:700, color:'var(--gold)', marginBottom:10, letterSpacing:.5, textTransform:'uppercase' }}>
              Personalized for {name}
            </div>
            <div style={{ fontSize:14, color:'var(--text1)', lineHeight:1.72, fontStyle:'italic', opacity: qAnim ? 0.2 : 1, transition:'opacity .3s' }}>
              "{currentQuote}"
            </div>
            <button onClick={genQuote} disabled={loading} style={{
              marginTop:14, background: loading ? 'var(--gold-dim)' : 'var(--gold)',
              color: loading ? 'var(--gold)' : '#0b0d14',
              border:'1px solid var(--gold-border)', borderRadius:7, padding:'8px 16px',
              fontSize:12, fontWeight:700, cursor: loading ? 'not-allowed':'pointer',
              fontFamily:"'Syne',sans-serif", letterSpacing:.5,
              display:'flex', alignItems:'center', gap:7
            }}>
              {loading ? <><div className="spinner gold" />Generating...</> : <><i className="ti ti-sparkles" /> New Message</>}
            </button>
          </div>
        </div>
      </div>

      {/* Achievements section */}
      <div className="card" style={{ marginBottom:20 }}>
        <div className="sec-title">
          <i className="ti ti-trophy" /> Achievements
          <span className="sec-badge">{unlocked.size} / {ACHIEVEMENT_DEFS.length} unlocked</span>
        </div>
        {habits.length === 0 ? (
          <div className="empty-state" style={{ padding:'20px 0' }}>
            <div style={{ fontSize:28, marginBottom:8 }}>🏆</div>
            <p style={{ fontSize:12 }}>Add habits and complete them to unlock achievements</p>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(130px,1fr))', gap:10 }}>
            {ACHIEVEMENT_DEFS.map(a => {
              const done = unlocked.has(a.id);
              return (
                <div key={a.id} className={`ach-card ${done ? 'unlocked' : ''}`} title={a.desc}>
                  <div className="ach-icon" style={{ opacity: done ? 1 : 0.3 }}>{a.icon}</div>
                  <div className="ach-name" style={{ color: done ? 'var(--text1)' : 'var(--text3)' }}>{a.name}</div>
                  <div className="ach-sub">{a.desc}</div>
                  {done
                    ? <i className="ti ti-circle-check" style={{ color:'var(--teal)', fontSize:14 }} />
                    : <i className="ti ti-lock" style={{ color:'var(--text3)', fontSize:13 }} />
                  }
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Habit-specific insights */}
      {habitInsights.length > 0 && (
        <div style={{ marginBottom:20 }}>
          <div style={{ fontFamily:"'Syne',sans-serif", fontSize:13, fontWeight:700, letterSpacing:1, color:'var(--text2)', textTransform:'uppercase', marginBottom:12 }}>Your Habit Insights</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))', gap:14 }}>
            {habitInsights.map(({ icon, title, body, color, tag }, i) => (
              <div key={i} className="card" style={{ borderTop:`3px solid ${color}` }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
                  <div style={{ fontSize:24 }}>{icon}</div>
                  <span style={{ fontSize:9, background:`${color}18`, color, border:`1px solid ${color}33`, borderRadius:99, padding:'3px 8px', fontWeight:700, letterSpacing:.5, textTransform:'uppercase', fontFamily:"'Syne',sans-serif" }}>{tag}</span>
                </div>
                <div style={{ fontFamily:"'Syne',sans-serif", fontSize:13, fontWeight:700, color:'var(--text1)', marginBottom:7 }}>{title}</div>
                <div style={{ fontSize:12, color:'var(--text2)', lineHeight:1.65 }}>{body}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* General tips */}
      <div>
        <div style={{ fontFamily:"'Syne',sans-serif", fontSize:13, fontWeight:700, letterSpacing:1, color:'var(--text2)', textTransform:'uppercase', marginBottom:12 }}>Habit Science & Tips</div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))', gap:14 }}>
          {TIPS.map(({ icon, title, body, color, tag }, i) => (
            <div key={i} className="card" style={{ borderTop:`3px solid ${color}`, animationDelay:`${i * .06}s` }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
                <div style={{ fontSize:24 }}>{icon}</div>
                <span style={{ fontSize:9, background:`${color}18`, color, border:`1px solid ${color}33`, borderRadius:99, padding:'3px 8px', fontWeight:700, letterSpacing:.5, textTransform:'uppercase', fontFamily:"'Syne',sans-serif" }}>{tag}</span>
              </div>
              <div style={{ fontFamily:"'Syne',sans-serif", fontSize:13, fontWeight:700, color:'var(--text1)', marginBottom:7 }}>{title}</div>
              <div style={{ fontSize:12, color:'var(--text2)', lineHeight:1.65 }}>{body}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
