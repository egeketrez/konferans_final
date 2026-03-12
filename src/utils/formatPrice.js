/**
 * Formats a price string with dot as thousands separator (e.g. ₺12000 → ₺12.000).
 */
export function formatPrice(priceStr) {
  if (priceStr == null || priceStr === '') return priceStr;
  const str = String(priceStr).trim();
  const match = str.match(/^([^\d]*)(\d[\d]*)(.*)$/);
  if (!match) return priceStr;
  const prefix = match[1];
  const numStr = match[2];
  const suffix = match[3];
  const num = parseInt(numStr, 10);
  if (Number.isNaN(num)) return priceStr;
  const formatted = num.toLocaleString('tr-TR');
  return prefix + formatted + suffix;
}
