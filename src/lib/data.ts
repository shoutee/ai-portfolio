import type { Work, Tool, NavItem, FilterLabel, AgentRecord } from './types';

export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

// ── Works ─────────────────────────────────────────────────────────────────────
export const WORKS: Work[] = [
  {
    id: 'piyopiyo',
    title: 'ぴよぴよAIマーケスクール',
    description:
      'NotebookLMを使って生成したAI×Webマーケスクールのランディングページ。ターゲット設計・訴求軸・ビジュアル方針をAIと対話しながら構築。',
    image: '/work-piyopiyo.png',
    tool: 'NotebookLM',
    tags: ['LP', 'マーケ', 'かわいい系'],
    accent: '#a855f7',
    href: null,
  },
  {
    id: 'tetris',
    title: 'テトリスゲーム',
    description:
      'Manusでゼロからビルドしたブラウザテトリスゲーム。スマホ向けタップ・スワイプ操作にも完全対応したレスポンシブ設計。',
    image: '/work-tetris.png',
    tool: 'Manus',
    tags: ['ゲーム', 'ダーク系', 'スマホ対応'],
    accent: '#00d4ff',
    href: null,
  },
  {
    id: 'puyo',
    title: 'ぷよぷよゲーム',
    description:
      'Claude Codeで設計・実装したNext.js版ぷよぷよ。連鎖BFS判定・スコアリング・レベル進行・ゴーストピース・モバイル操作を完全実装。',
    image: '/work-puyo.png',
    tool: 'Claude Code',
    tags: ['ゲーム', 'Next.js', 'TypeScript'],
    accent: '#a855f7',
    href: '/puyo',
    isNew: true,
  },
];

// ── Tools ─────────────────────────────────────────────────────────────────────
export const TOOLS: Tool[] = [
  {
    name: 'NotebookLM',
    icon: '📚',
    desc: 'コンテンツ設計・LP構成・対話型リサーチに活用。PDFや資料をベースに構造化されたアウトプットを生成。',
    color: '#4ade80',
  },
  {
    name: 'Manus',
    icon: '🤖',
    desc: '自律型AIエージェント。要件を与えるだけでWebアプリの設計〜実装まで丸ごと構築。',
    color: '#00d4ff',
  },
  {
    name: 'Claude Code',
    icon: '⚡',
    desc: 'Anthropic製の開発特化AI CLI。アーキテクチャ設計・コーディング・レビュー・デプロイを一気通貫でサポート。',
    color: '#a855f7',
  },
];

// ── Nav ───────────────────────────────────────────────────────────────────────
export const NAV_ITEMS: NavItem[] = [
  { id: 'works', label: 'Works',   icon: '◈' },
  { id: 'tools', label: 'Tools',   icon: '⬡' },
  { id: 'process', label: 'Process', icon: '◎' },
  { id: 'about',  label: 'About',  icon: '◉' },
];

export const ALL_FILTERS: FilterLabel[] = [
  'すべて', 'ゲーム', 'LP', 'Next.js', 'スマホ対応',
];

// ── Agent & Skill records ─────────────────────────────────────────────────────
export const AGENT_RECORDS: AgentRecord[] = [
  // ── SubAgents ──────────────────────────────────────────────────────────────
  {
    id: 'subagent-research',
    kind: 'SubAgent',
    badge: 'Explore',
    name: 'Reference Site Research',
    purpose:
      'ポートフォリオサイトに合った参考デザイン・UI構造をWeb上で調査。ダークネオン系・サイドバーナビ・カードグリッドの先進事例を収集。',
    outputs: [
      'Brittany Chiang — スティッキーサイドバー + ダーク背景が参考に',
      'Interactive Glowing Grid Cards — カーソル追従グロー実装のヒント',
      'CrazyGames風グリッドレイアウトのカード密度設計',
      'Dashboard-style portfolio（iPortfolio / Dashfolio NEO）の構造分析',
    ],
    icon: '🔍',
    color: '#00d4ff',
    status: 'partial',
  },
  {
    id: 'subagent-planning',
    kind: 'SubAgent',
    badge: 'Plan',
    name: 'Portfolio Structure Planning',
    purpose:
      'コンポーネント分割・TypeScript型定義・アニメーション実装方針・GitHub Pagesデプロイ手順を10ステップで設計。',
    outputs: [
      'src/lib/types.ts + data.ts への型・データ分離を提案',
      'WorkCard: CSS変数でaccent色グロー・スクリムホバー・アクセントラインを設計',
      'フィルター切替時のキー再レンダリングでリビール再実行の提案',
      '10ステップ実装計画（型定義 → フック抽出 → UI → レイアウト → 強化 → デプロイ）',
    ],
    icon: '📐',
    color: '#ff6b2b',
    status: 'success',
  },
  {
    id: 'subagent-codereview',
    kind: 'SubAgent',
    badge: 'code-reviewer',
    name: 'Code Review',
    purpose:
      'page.tsx・data.ts・types.ts を対象に品質・型安全性・アクセシビリティ・パフォーマンスをレビュー。セキュリティ問題なし、8件の改善点を特定。',
    outputs: [
      '[error] HeroMiniCards の onMouseEnter で直接DOM変更 → CSSホバークラスへ修正',
      '[error] Work.tags と FilterLabel の型が非連動 → useMemo + 型整合で解消',
      '[warn] TopBar・Sidebar を React.memo でラップしてre-render抑制',
      '[warn] ブランドマーク⚡に aria-label 追加（スクリーンリーダー対応）',
      '[info] filteredWorks を useMemo 化、カーソルグローを useRef で最適化',
    ],
    icon: '🔎',
    color: '#4ade80',
    status: 'success',
  },
  // ── Skills ─────────────────────────────────────────────────────────────────
  {
    id: 'skill-plan',
    kind: 'Skill',
    badge: 'Plan subagent',
    name: 'Plan Mode',
    purpose:
      'EnterPlanMode に相当する構造設計を Plan SubAgent で代替実行。実装前にコンポーネント設計・データフロー・デプロイ手順を合意形成。',
    outputs: [
      'Sidebar / TopBar / WorkCard / SectionHeader の役割分離を確定',
      'basePath 扱いを src/lib/config.ts 相当の定数に集約する方針を決定',
      '"use client" 境界を最小化するディレクティブ戦略を策定',
    ],
    icon: '🗺',
    color: '#ff6b2b',
    status: 'success',
  },
  {
    id: 'skill-competitor-research',
    kind: 'Skill',
    badge: 'competitor-research',
    name: 'Competitor Research',
    purpose:
      'WebSearch で上位ポートフォリオサイトのデザインパターン・見出し構成・UI要素を分析。競合にない差別化ポイントを特定。',
    outputs: [
      '"cursor-following glow" はトップポートフォリオで未実装 → 採用して差別化',
      'サイドバーにStats（Projects数・ツール数・年度）を表示する例が少ない → 採用',
      'ダークテーマ × オレンジプライマリの組み合わせはゲームポータル系のみ → 独自性あり',
    ],
    icon: '📊',
    color: '#a855f7',
    status: 'success',
  },
  {
    id: 'skill-deploy',
    kind: 'Skill',
    badge: 'GitHub Pages Deploy',
    name: 'Direct API Deploy',
    purpose:
      'PATのworkflowスコープ制限を回避するため、GitHub Contents API経由でgh-pagesブランチへ直接デプロイ。',
    outputs: [
      'Python スクリプトで out/ の全ファイルを Contents API でプッシュ',
      '54/55 ファイルを正常デプロイ（1件は GitHub側の一時504エラー）',
      'GitHub Actions を不要にするゼロ依存デプロイを実現',
    ],
    icon: '🚀',
    color: '#ff6b2b',
    status: 'partial',
  },
];

// pipeline steps for the Process section
export const BUILD_PIPELINE = [
  { step: '01', label: 'Research',  icon: '🔍', desc: 'SubAgent (Explore)' },
  { step: '02', label: 'Plan',      icon: '📐', desc: 'SubAgent (Plan)' },
  { step: '03', label: 'Code',      icon: '⚡', desc: 'Claude Code' },
  { step: '04', label: 'Review',    icon: '🔎', desc: 'SubAgent (code-reviewer)' },
  { step: '05', label: 'Deploy',    icon: '🚀', desc: 'GitHub Pages API' },
] as const;
