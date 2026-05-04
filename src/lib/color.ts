import type { HexColor } from './types';

const HEX_RE = /^#[0-9a-fA-F]{3,8}$/;
const FALLBACK: HexColor = '#888888';

/**
 * Validates a hex color string at runtime.
 * Prevents CSS custom property injection if the data source ever changes
 * from static data.ts to an external API or CMS.
 */
export function safeHex(value: string, fallback: HexColor = FALLBACK): HexColor {
  return HEX_RE.test(value) ? (value as HexColor) : fallback;
}
