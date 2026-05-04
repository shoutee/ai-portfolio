export interface Work {
  id: string;
  title: string;
  description: string;
  image: string;
  tool: string;
  tags: readonly string[];
  accent: string;
  href: string | null;
  isNew?: boolean;
}

export interface Tool {
  name: string;
  icon: string;
  desc: string;
  color: string;
}

export interface NavItem {
  id: string;
  label: string;
  icon: string;
}

export type FilterLabel = 'すべて' | 'ゲーム' | 'LP' | 'Next.js' | 'スマホ対応';

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
  outputs: string[];
  icon: string;
  color: string;
  status: AgentStatus;
}
