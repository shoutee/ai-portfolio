export interface Work {
  id: string;
  title: string;
  description: string;
  image: string;
  tool: string;
  tags: readonly string[];
  accent: string;       // hover glow & tool badge color
  href: string | null;  // null = no live link
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
