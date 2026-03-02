const CONFIG = {
  critical: { label: 'Needs Buying', bg: 'rgba(230,57,70,0.15)', color: 'var(--red)' },
  low:      { label: 'Running Low',  bg: 'rgba(249,115,22,0.15)', color: 'var(--orange)' },
  ok:       { label: 'OK',           bg: 'rgba(34,197,94,0.1)',  color: 'var(--green)' },
};

export default function StockBadge({ status }) {
  const cfg = CONFIG[status] || CONFIG.ok;
  return (
    <span
      className="text-xs font-semibold px-2 py-1 rounded-lg whitespace-nowrap"
      style={{ background: cfg.bg, color: cfg.color }}
    >
      {cfg.label}
    </span>
  );
}
