import React, { useState, useMemo } from 'react';
import { useHabits } from '../context/HabitContext';

/* ── helpers ─────────────────────────────────────────────────────────────── */
const pad   = (n) => String(n).padStart(2, '0');
const dateKey = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`;
const MONTHS  = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS    = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

/* ── Interactive Calendar ────────────────────────────────────────────────── */
function Calendar({ completionMap, habits }) {
  const now   = new Date();
  const [yr,  setYr]  = useState(now.getFullYear());
  const [mon, setMon] = useState(now.getMonth());       // 0-based
  const [selected, setSelected] = useState(null);       // "YYYY-MM-DD"

  const todayStr = dateKey(now.getFullYear(), now.getMonth(), now.getDate());

  const prevMonth = () => { if (mon === 0) { setMon(11); setYr(y => y - 1); } else setMon(m => m - 1); setSelected(null); };
  const nextMonth = () => { if (mon === 11) { setMon(0); setYr(y => y + 1); } else setMon(m => m + 1); setSelected(null); };

  const firstDay  = new Date(yr, mon, 1).getDay();    // 0=Sun
  const daysInMon = new Date(yr, mon + 1, 0).getDate();

  // Build calendar cells
  const cells = useMemo(() => {
    const arr = [];
    for (let i = 0; i < firstDay; i++) arr.push(null);          // empty leading
    for (let d = 1; d <= daysInMon; d++) arr.push(d);
    return arr;
  }, [yr, mon, firstDay, daysInMon]);

  const getCellData = (d) => {
    if (!d) return null;
    const key  = dateKey(yr, mon, d);
    const ids  = completionMap[key] || [];
    const pct  = habits.length > 0 ? Math.round((ids.length / habits.length) * 100) : 0;
    return { key, ids, pct, isFuture: key > todayStr, isToday: key === todayStr };
  };

  const cellColor = (pct, isFuture) => {
    if (isFuture) return 'transparent';
    if (pct === 0)   return '#1a1f2e';
    if (pct < 50)    return 'rgba(34,211,168,0.3)';
    if (pct < 100)   return 'rgba(34,211,168,0.65)';
    return 'var(--gold)';
  };

  const selData = selected ? (() => {
    const ids  = completionMap[selected] || [];
    const done = habits.filter(h => ids.includes(h.id));
    const miss = habits.filter(h => !ids.includes(h.id));
    return { done, miss };
  })() : null;

  return (
    <div>
      {/* Month nav */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:18 }}>
        <button onClick={prevMonth} style={{ background:'none', border:'none', color:'var(--text2)', cursor:'pointer', fontSize:18, padding:'4px 8px', borderRadius:6 }}>
          <i className="ti ti-chevron-left" />
        </button>
        <div style={{ fontFamily:"'Syne',sans-serif", fontSize:15, fontWeight:700, color:'var(--text1)' }}>
          {MONTHS[mon]} {yr}
        </div>
        <button onClick={nextMonth} style={{ background:'none', border:'none', color:'var(--text2)', cursor:'pointer', fontSize:18, padding:'4px 8px', borderRadius:6 }}>
          <i className="ti ti-chevron-right" />
        </button>
      </div>

      {/* Day headers */}
      <div className="cal-grid" style={{ marginBottom:4 }}>
        {DAYS.map(d => <div key={d} className="cal-day-name">{d}</div>)}
      </div>

      {/* Day cells */}
      <div className="cal-grid">
        {cells.map((d, i) => {
          if (!d) return <div key={`e${i}`} className="cal-cell empty" />;
          const data = getCellData(d);
          const isSelected = selected === data.key;
          return (
            <div key={data.key} className={`cal-cell ${data.isToday ? 'today' : ''}`}
              onClick={() => !data.isFuture && setSelected(isSelected ? null : data.key)}
              style={{
                background: isSelected ? data.pct === 100 ? 'var(--gold)' : 'var(--teal-dim)' : cellColor(data.pct, data.isFuture),
                border: isSelected ? `2px solid ${data.pct === 100 ? 'var(--gold)' : 'var(--teal)'}` : data.isToday ? '2px solid var(--gold)' : '1px solid transparent',
                cursor: data.isFuture ? 'default' : 'pointer',
                opacity: data.isFuture ? 0.25 : 1,
                color: isSelected && data.pct === 100 ? '#0b0d14' : 'var(--text1)',
              }}>
              <span style={{ fontSize:11, fontWeight: data.isToday ? 800 : 500 }}>{d}</span>
              {!data.isFuture && data.pct > 0 && (
                <div style={{ fontSize:8, color: data.pct === 100 ? (isSelected ? '#0b0d14' : 'var(--gold)') : 'var(--teal)', fontWeight:700 }}>
                  {data.pct}%
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{ display:'flex', gap:14, marginTop:14, flexWrap:'wrap' }}>
        {[
          ['#1a1f2e',              'No data'  ],
          ['rgba(34,211,168,0.3)', 'Started'  ],
          ['rgba(34,211,168,0.65)','50%+ done'],
          ['var(--gold)',           'Perfect!' ],
        ].map(([c, l]) => (
          <div key={l} style={{ display:'flex', alignItems:'center', gap:5 }}>
            <div style={{ width:10, height:10, borderRadius:3, background:c, border:'1px solid var(--border2)' }} />
            <span style={{ fontSize:10, color:'var(--text3)', fontWeight:600 }}>{l}</span>
          </div>
        ))}
      </div>

      {/* Selected day detail */}
      {selected && selData && (
        <div style={{ marginTop:18, background:'#0d0f18', border:'1px solid var(--border2)', borderRadius:12, padding:16, animation:'fadeUp .3s ease' }}>
          <div style={{ fontFamily:"'Syne',sans-serif", fontSize:12, fontWeight:700, color:'var(--text2)', letterSpacing:1, marginBottom:12, textTransform:'uppercase' }}>
            {new Date(selected + 'T00:00:00').toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long' })}
          </div>
          {habits.length === 0 ? (
            <div style={{ fontSize:12, color:'var(--text3)' }}>No habits were tracked yet.</div>
          ) : (
            <>
              {selData.done.length > 0 && (
                <div style={{ marginBottom:10 }}>
                  <div style={{ fontSize:10, color:'var(--teal)', fontWeight:700, letterSpacing:.5, marginBottom:6 }}>✅ COMPLETED ({selData.done.length})</div>
                  <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
                    {selData.done.map(h => (
                      <div key={h.id} style={{ display:'flex', alignItems:'center', gap:8, fontSize:12, color:'var(--text1)' }}>
                        <span>{h.icon}</span> {h.name}
                        <span style={{ marginLeft:'auto', color:h.color, fontSize:10, fontWeight:700 }}>{h.streak}🔥</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {selData.miss.length > 0 && (
                <div>
                  <div style={{ fontSize:10, color:'var(--text3)', fontWeight:700, letterSpacing:.5, marginBottom:6 }}>❌ MISSED ({selData.miss.length})</div>
                  <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
                    {selData.miss.map(h => (
                      <div key={h.id} style={{ display:'flex', alignItems:'center', gap:8, fontSize:12, color:'var(--text3)' }}>
                        <span style={{ opacity:.5 }}>{h.icon}</span> {h.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {selData.done.length === 0 && selData.miss.length === 0 && (
                <div style={{ fontSize:12, color:'var(--text3)' }}>No habit data for this day.</div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Main Statistics Page ────────────────────────────────────────────────── */
export default function StatisticsPage() {
  const { habits, completionMap, bestStreak, todayDone, todayTotal } = useHabits();

  const avgRate = habits.length
    ? Math.round(habits.reduce((s, h) => s + h.completion, 0) / habits.length) : 0;

  // Count total completed days across all dates
  const totalDays = Object.values(completionMap).filter(ids => ids.length > 0).length;

  const summaryCards = [
    { label:'Total Habits',    val: habits.length,  color:'var(--gold)',   icon:'ti-list-check'   },
    { label:'Done Today',      val: `${todayDone}/${todayTotal}`, color:'var(--teal)', icon:'ti-circle-check' },
    { label:'Best Streak',     val: `${bestStreak}d`, color:'var(--indigo)', icon:'ti-flame'      },
    { label:'Days Tracked',    val: totalDays,      color:'var(--pink)',   icon:'ti-calendar'     },
  ];

  return (
    <div className="fade-up">
      <div style={{ fontFamily:"'Syne',sans-serif", fontSize:22, fontWeight:800, marginBottom:24 }}>Statistics</div>

      {/* Summary */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(120px,1fr))', gap:14, marginBottom:20 }}>
        {summaryCards.map(({ label, val, color, icon }) => (
          <div key={label} className="card" style={{ textAlign:'center' }}>
            <i className={`ti ${icon}`} style={{ fontSize:22, color, marginBottom:8, display:'block' }} />
            <div style={{ fontFamily:"'Syne',sans-serif", fontSize:26, fontWeight:800, color }}>{val}</div>
            <div style={{ fontSize:11, color:'var(--text2)', marginTop:4 }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:18 }} className="bot-grid">

        {/* Interactive Calendar */}
        <div className="card">
          <div className="sec-title">
            <i className="ti ti-calendar" /> Habit Calendar
            <span className="sec-badge">Click any day</span>
          </div>
          <Calendar completionMap={completionMap} habits={habits} />
        </div>

        {/* Completion bars */}
        <div style={{ display:'flex', flexDirection:'column', gap:18 }}>
          <div className="card">
            <div className="sec-title">Completion Rate per Habit</div>
            {habits.length === 0 ? (
              <div className="empty-state" style={{ padding:'20px 0' }}>
                <div style={{ fontSize:24, marginBottom:8 }}>📊</div>
                <p style={{ fontSize:12 }}>Add habits to see stats here</p>
              </div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                {habits.map(h => (
                  <div key={h.id}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
                      <span style={{ fontSize:13, color:'var(--text1)', display:'flex', alignItems:'center', gap:7 }}>
                        <span style={{ fontSize:16 }}>{h.icon}</span> {h.name}
                      </span>
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <span style={{ fontSize:11, color:'var(--text3)' }}>{h.streak}🔥</span>
                        <span style={{ fontSize:13, fontWeight:700, color:h.color }}>{h.completion}%</span>
                      </div>
                    </div>
                    <div className="prog-track" style={{ height:7 }}>
                      <div className="prog-fill" style={{ width:`${h.completion}%`, background:h.color }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Weekly table */}
          {habits.length > 0 && (
            <div className="card">
              <div className="sec-title">This Week</div>
              <div style={{ overflowX:'auto' }}>
                <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
                  <thead>
                    <tr>
                      {['Habit','M','T','W','T','F','S','S'].map((h, i) => (
                        <th key={i} style={{ padding:'6px 8px', textAlign: i===0 ? 'left' : 'center', fontSize:10, color:'var(--text3)', fontWeight:700, letterSpacing:.8, textTransform:'uppercase', borderBottom:'1px solid var(--border)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {habits.map(h => {
                      const now  = new Date();
                      const days = Array.from({ length: 7 }, (_, i) => {
                        const d   = new Date(now);
                        d.setDate(d.getDate() - (6 - i));
                        const key = dateKey(d.getFullYear(), d.getMonth(), d.getDate());
                        return (completionMap[key] || []).includes(h.id);
                      });
                      return (
                        <tr key={h.id}>
                          <td style={{ padding:'8px', color:'var(--text1)', whiteSpace:'nowrap', display:'flex', alignItems:'center', gap:6 }}>
                            <span>{h.icon}</span>
                            <span style={{ fontSize:11 }}>{h.name}</span>
                          </td>
                          {days.map((done, i) => (
                            <td key={i} style={{ padding:'8px', textAlign:'center' }}>
                              <i className={`ti ${done ? 'ti-circle-check' : 'ti-circle'}`}
                                style={{ fontSize:15, color: done ? 'var(--teal)' : 'var(--text3)' }} />
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
