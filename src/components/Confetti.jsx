import React from 'react';
const C = ['#E8B84B','#22d3a8','#818cf8','#f472b6','#60a5fa','#34d399'];
export default function Confetti({ show }) {
  if (!show) return null;
  return (
    <div style={{ position:'absolute', inset:0, pointerEvents:'none', overflow:'hidden' }}>
      {Array.from({ length: 14 }).map((_, i) => (
        <div key={i} className="confetti-p" style={{
          left:`${4 + i * 7}%`, top:'15%',
          width: i%3===0 ? 7 : 5, height: i%3===0 ? 7 : 5,
          background:C[i % C.length],
          borderRadius: i%2===0 ? '50%' : '2px',
          animationDelay:`${i * 0.04}s`,
        }} />
      ))}
    </div>
  );
}
