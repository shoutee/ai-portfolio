// Branded type: only relative paths ("/...") are assignable — prevents javascript: injection
export type RelativePath = `/${string}`;

export interface Work {
  id: string;
  title: string;
  description: string;
  /** Must start with "/" (relative path) or be null */
  image: RelativePath;
  tool: string;
  tags: readonly WorkTag[];
  /** Hex color string, e.g. "#a855f7" */
  accent: HexColor;
  href: RelativePath | null;
  isNew?: boolean;
}

export interface Tool {
  name: string;
  icon: string;
  desc: string;
  color: HexColor;
}

export interface NavItem {
  id: string;
  label: string;
  icon: string;
}

// Single source of truth — FilterLabel is derived from ALL_FILTERS in data.ts
// WorkTag covers the filterable subset of tags
export type WorkTag = 'ゲーム' | 'LP' | 'Next.js' | 'スマホ対応' | 'マーケ' | 'かわいい系' | 'ダーク系' | 'TypeScript';
export type FilterLabel = 'すべて' | WorkTag;

// Opaque hex color — catches typos at compile time when used with satisfies
export type HexColor = `#${string}`;

// ── Agent & Skill records ─────────────────────────────────────────────────────

export type AgentKind = 'SubAgent' | 'Skill';
export type AgentStatus = 'success' | 'partial' | 'info';

export interface AgentRecord {
  id: string;
  kind: AgentKind;
  /** SubAgent type (Explore / Plan / code-reviewer …) or Skill name */
  badge: string;
  name: string;
  purpose: string;
  outputs: readonly string[];
  icon: string;
  color: HexColor;
  status: AgentStatus;
}

// ── Agent status helpers (single responsibility) ──────────────────────────────

const STATUS_COLOR_MAP: Record<AgentStatus, string> = {
  success: '#4ade80',
  partial:  '#f59e0b',
  info:     '#9399b2',
};

const STATUS_LABEL_MAP: Record<AgentStatus, string> = {
  success: 'SUCCESS',
  partial:  'PARTIAL',
  info:     'INFO',
};

export function agentStatusColor(status: AgentStatus): string {
  return STATUS_COLOR_MAP[status];
}

export function agentStatusLabel(status: AgentStatus): string {
  return STATUS_LABEL_MAP[status];
}
