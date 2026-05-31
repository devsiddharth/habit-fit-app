import React, { useEffect } from 'react';
export default function Toast({ message, onClose, duration = 3000 }) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(onClose, duration);
    return () => clearTimeout(t);
  }, [message, onClose, duration]);
  if (!message) return null;
  return (
    <div className="toast">
      <i className="ti ti-circle-check" style={{ fontSize:16 }} />
      {message}
    </div>
  );
}
