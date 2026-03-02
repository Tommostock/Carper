// ─── Stock Status ───────────────────────────────────────────────────────────

/**
 * Returns 'critical' | 'low' | 'ok' for an item.
 * critical = quantity <= critical_threshold (default 0)
 * low      = quantity <= low_stock_threshold (default 2)
 */
export function getStockStatus(item) {
  if (item.quantity <= item.critical_threshold) return 'critical';
  if (item.quantity <= item.low_stock_threshold) return 'low';
  return 'ok';
}

// ─── Weight Formatting ──────────────────────────────────────────────────────

/**
 * UK carp fishing convention: "18lb 4oz" not decimals.
 */
export function formatWeight(lb, oz) {
  if (!lb && !oz) return null;
  const lbNum = parseInt(lb) || 0;
  const ozNum = parseInt(oz) || 0;
  if (ozNum === 0) return `${lbNum}lb`;
  return `${lbNum}lb ${ozNum}oz`;
}

// ─── Date Helpers ───────────────────────────────────────────────────────────

export function isUnused(item, months = 6) {
  if (!item.last_used_at) return true;
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - months);
  return new Date(item.last_used_at) < cutoff;
}

export function daysSince(dateStr) {
  if (!dateStr) return Infinity;
  return (Date.now() - new Date(dateStr)) / 86400000;
}

export function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

// ─── Shopping List Generation ───────────────────────────────────────────────

/**
 * Generates an ordered shopping list from inventory items.
 * Priority: critical > low stock > recently used (within 90 days).
 */
export function generateShoppingList(items) {
  const critical = items.filter(i => getStockStatus(i) === 'critical');
  const low      = items.filter(i => getStockStatus(i) === 'low');
  const recent   = items.filter(i => {
    if (!i.last_used_at || getStockStatus(i) !== 'ok') return false;
    return daysSince(i.last_used_at) <= 90;
  });

  // Deduplicate (critical items won't also be in low)
  const seen = new Set();
  const result = [];
  for (const item of [...critical, ...low, ...recent]) {
    if (!seen.has(item.id)) {
      seen.add(item.id);
      result.push(item);
    }
  }
  return result;
}

// ─── Sort Items ─────────────────────────────────────────────────────────────

const STATUS_ORDER = { critical: 0, low: 1, ok: 2 };

export function sortItems(items) {
  return [...items].sort((a, b) => {
    const statusDiff = STATUS_ORDER[getStockStatus(a)] - STATUS_ORDER[getStockStatus(b)];
    if (statusDiff !== 0) return statusDiff;
    // Within same status: most recently used first
    return daysSince(a.last_used_at) - daysSince(b.last_used_at);
  });
}
