'use client';

export default function QuantityStepper({ value, onChange, onClick }) {
  return (
    <div className="flex items-center gap-3" onClick={onClick}>
      <button
        className="flex items-center justify-center rounded-xl text-2xl font-light transition-opacity active:opacity-60"
        style={{
          width: 54, height: 54,
          background: 'var(--surface2)',
          color: value <= 0 ? 'var(--text-dim)' : 'var(--text)',
          border: '1px solid var(--border)',
          cursor: value <= 0 ? 'not-allowed' : 'pointer',
          opacity: value <= 0 ? 0.4 : 1,
        }}
        onClick={(e) => { e.stopPropagation(); if (value > 0) onChange(-1); }}
        aria-label="Decrease quantity"
      >
        −
      </button>

      <span
        className="text-2xl font-bold tabular-nums text-center"
        style={{ minWidth: '3rem', color: 'var(--text)' }}
      >
        {value}
      </span>

      <button
        className="flex items-center justify-center rounded-xl text-2xl font-light transition-opacity active:opacity-60"
        style={{
          width: 54, height: 54,
          background: 'var(--accent)',
          color: 'white',
        }}
        onClick={(e) => { e.stopPropagation(); onChange(+1); }}
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
}
