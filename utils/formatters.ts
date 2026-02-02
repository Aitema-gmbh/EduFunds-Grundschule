/**
 * Formatiert eine Zahl als Prozentstring
 * @param value - Die zu formatierende Zahl (z.B. 0.5 für 50%)
 * @param decimals - Anzahl der Dezimalstellen (Standard: 2)
 * @returns Formatierter Prozentstring (z.B. "50.00%")
 */
export function formatPercent(value: number, decimals: number = 2): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Formatiert eine Zahl als Prozentstring mit automatischer Präzision
 * @param value - Die zu formatierende Zahl (z.B. 0.5 für 50%)
 * @returns Formatierter Prozentstring ohne unnötige Nullen (z.B. "50%")
 */
export function formatPercentClean(value: number): string {
  const percent = value * 100;
  return `${percent % 1 === 0 ? percent.toFixed(0) : percent.toFixed(2).replace(/\.?0+$/, '')}%`;
}

/**
 * Formatiert eine Zahl als Prozentstring mit Lokalisierung
 * @param value - Die zu formatierende Zahl (z.B. 0.5 für 50%)
 * @param locale - Locale-String (z.B. "de-DE", Standard: "de-DE")
 * @param decimals - Anzahl der Dezimalstellen (Standard: 2)
 * @returns Lokalisierter Prozentstring
 */
export function formatPercentLocale(
  value: number,
  locale: string = 'de-DE',
  decimals: number = 2
): string {
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}
