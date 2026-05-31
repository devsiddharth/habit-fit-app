import React from 'react';
export default function StreakRing({ value, max = 30 }) {
  const r = 42, circ = 2 * Math.PI * r;
  const offset = circ * (1 - Math.min(value / max, 1));
  return (
    <div style={{ position:'relative', width:100, height:100, margin:'0 auto 8px' }}>
      <svg width="100" height="100" viewBox="0 0 100 100" style={{ transform:'rotate(-90deg)' }}>
        <circle cx="50" cy="50" r={r} fill="none" stroke="#1e2230" strokeWidth="9" />
        <circle cx="50" cy="50" r={r} fill="none" stroke="#E8B84B" strokeWidth="9"
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transition:'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)' }} />
      </svg>
      <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
        <div style={{ fontFamily:"'Syne',sans-serif", fontSize:26, fontWeight:800, color:'#fff', lineHeight:1 }}>{value}</div>
        <div style={{ fontSize:9, color:'var(--text3)', fontWeight:600, letterSpacing:1.5, marginTop:2 }}>DAYS</div>
      </div>
    </div>
  );
}
