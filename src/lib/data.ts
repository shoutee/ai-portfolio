import type { Work, Tool, NavItem, FilterLabel } from './types';

export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

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

export const NAV_ITEMS: NavItem[] = [
  { id: 'works', label: 'Works', icon: '◈' },
  { id: 'tools', label: 'Tools', icon: '⬡' },
  { id: 'about', label: 'About', icon: '◉' },
];

export const ALL_FILTERS: FilterLabel[] = [
  'すべて',
  'ゲーム',
  'LP',
  'Next.js',
  'スマホ対応',
];
