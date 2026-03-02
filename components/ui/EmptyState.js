export default function EmptyState({ icon = '📦', title, message, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      <span className="text-5xl mb-4">{icon}</span>
      <p className="text-base font-medium mb-1" style={{ color: 'var(--text)' }}>{title}</p>
      {message && <p className="text-sm mb-5" style={{ color: 'var(--text-muted)' }}>{message}</p>}
      {action}
    </div>
  );
}
