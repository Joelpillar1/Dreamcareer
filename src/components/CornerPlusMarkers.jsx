import React from 'react';

export default function CornerPlusMarkers({ color = '#94a3b8', bg = '#ffffff', size = '14px' }) {
  return (
    <>
      <span aria-hidden="true" style={{ position: 'absolute', top: 0, left: 0, transform: 'translate(-50%, -50%)', fontSize: size, fontWeight: 300, color, lineHeight: 1, backgroundColor: bg, padding: '1px 2px', userSelect: 'none', zIndex: 10, pointerEvents: 'none' }}>+</span>
      <span aria-hidden="true" style={{ position: 'absolute', top: 0, right: 0, transform: 'translate(50%, -50%)', fontSize: size, fontWeight: 300, color, lineHeight: 1, backgroundColor: bg, padding: '1px 2px', userSelect: 'none', zIndex: 10, pointerEvents: 'none' }}>+</span>
      <span aria-hidden="true" style={{ position: 'absolute', bottom: 0, left: 0, transform: 'translate(-50%, 50%)', fontSize: size, fontWeight: 300, color, lineHeight: 1, backgroundColor: bg, padding: '1px 2px', userSelect: 'none', zIndex: 10, pointerEvents: 'none' }}>+</span>
      <span aria-hidden="true" style={{ position: 'absolute', bottom: 0, right: 0, transform: 'translate(50%, 50%)', fontSize: size, fontWeight: 300, color, lineHeight: 1, backgroundColor: bg, padding: '1px 2px', userSelect: 'none', zIndex: 10, pointerEvents: 'none' }}>+</span>
    </>
  );
}
