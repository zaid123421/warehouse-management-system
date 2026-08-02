/**
 * Format integers for SSR-safe display.
 * Always uses Latin digits so Arabic locale does not hydrate as ٠ vs 0.
 */
export function formatCount(value: number): string {
  return value.toLocaleString("en-US");
}
