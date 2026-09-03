const indianNumberFormatter = new Intl.NumberFormat('hi-IN-u-nu-latn');

/**
 * Formats a number with Indian grouping (lakhs, crores) using clean Latin digits (0-9).
 * Example: 1234567 -> "12,34,567"
 */
export function formatIndianNumber(value: number | bigint): string {
  if (value === null || value === undefined || isNaN(Number(value))) return '0';
  return indianNumberFormatter.format(value);
}

const DEVANAGARI_TO_LATIN: Record<string, string> = {
  '०': '0',
  '१': '1',
  '२': '2',
  '३': '3',
  '४': '4',
  '५': '5',
  '६': '6',
  '७': '7',
  '८': '8',
  '९': '9',
};

/**
 * Replaces any stray Devanagari digits with standard Latin digits (0-9).
 * Example: "१०८ जप" -> "108 जप"
 */
export function toLatinDigits(input: string | number): string {
  if (input === null || input === undefined) return '';
  return String(input).replace(/[०-९]/g, (ch) => DEVANAGARI_TO_LATIN[ch] || ch);
}
