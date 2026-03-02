'use client';

export default function ConfirmDialog({ open, title, message, onConfirm, onCancel, danger = false }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/70" onClick={onCancel} />
      <div className="relative rounded-2xl p-6 w-full max-w-sm" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <h3 className="text-base font-semibold mb-2" style={{ color: 'var(--text)' }}>{title}</h3>
        {message && <p className="text-sm mb-5" style={{ color: 'var(--text-muted)' }}>{message}</p>}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl text-sm font-medium"
            style={{ background: 'var(--surface2)', color: 'var(--text-muted)' }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 rounded-xl text-sm font-medium"
            style={{ background: danger ? 'var(--red)' : 'var(--accent)', color: 'white' }}
          >
            {danger ? 'Delete' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
}
