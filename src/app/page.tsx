'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';

// ── Types ─────────────────────────────────────────────────────────────────────
interface Work {
  id: string;
  title: string;
  description: string;
  image: string;
  tool: string;
  tags: string[];
  accent: string;
  href: string | null;
  isNew?: boolean;
}

interface Tool {
  name: string;
  icon: string;
  desc: string;
  color: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

const ALL_FILTERS = ['すべて', 'ゲーム', 'LP', 'Next.js', 'スマホ対応'] as const;

const NAV_ITEMS = [
  { id: 'works', label: 'Works',  icon: '◈' },
  { id: 'tools', label: 'Tools',  icon: '⬡' },
  { id: 'about', label: 'About',  icon: '◉' },
] as const;

// ── Data ──────────────────────────────────────────────────────────────────────
const WORKS: Work[] = [
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

const TOOLS: Tool[] = [
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

// ── Hook: Scroll Reveal ───────────────────────────────────────────────────────
function useReveal<T extends HTMLElement>(delay = 0) {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.06 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Reveal wrapper style: opacity + translateY only
  const wrapStyle: React.CSSProperties = {
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0px)' : 'translateY(22px)',
    transition: `opacity 0.4s ease ${delay}s, transform 0.4s ease ${delay}s`,
  };

  return { ref, wrapStyle };
}

// ── Component: WorkCard ───────────────────────────────────────────────────────
function WorkCard({ work, index }: { work: Work; index: number }) {
  const { ref, wrapStyle } = useReveal<HTMLDivElement>(index * 0.08);

  const inner = (
    <article className={`work-card${work.href ? ' clickable' : ''}`}>
      {/* Thumbnail */}
      <div className="relative" style={{ aspectRatio: '16/9', overflow: 'hidden' }}>
        <Image
          src={`${BASE}${work.image}`}
          alt={work.title}
          fill
          className="object-cover thumb-img"
          unoptimized
        />

        {/* Gradient scrim */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(to top, rgba(13,15,20,0.97) 0%, rgba(13,15,20,0.3) 45%, transparent 75%)',
          }}
        />

        {/* NEW badge */}
        {work.isNew && (
          <span
            className="absolute top-2 right-2 text-[9px] font-bold px-2 py-0.5 rounded"
            style={{
              background: '#a855f7',
              color: '#fff',
              letterSpacing: '0.08em',
              fontFamily: 'var(--font-mono)',
              textTransform: 'uppercase',
            }}
          >
            NEW
          </span>
        )}

        {/* LIVE badge */}
        {work.href && (
          <span
            className="absolute top-2 left-2 flex items-center gap-1.5 text-[9px]"
            style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-mono)' }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            LIVE
          </span>
        )}

        {/* Overlay content: tool badge + title */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <div className="flex items-end justify-between gap-2">
            <h3
              className="font-bold text-sm leading-snug flex-1"
              style={{ color: '#f0f2f8', letterSpacing: '-0.01em' }}
            >
              {work.title}
            </h3>
            <span
              className="shrink-0 text-[9px] px-2 py-0.5 rounded"
              style={{
                background: `${work.accent}22`,
                color: work.accent,
                border: `1px solid ${work.accent}55`,
                fontFamily: 'var(--font-mono)',
                whiteSpace: 'nowrap',
              }}
            >
              {work.tool}
            </span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-3 pt-2.5">
        <p className="text-[12px] leading-[1.65] mb-2.5" style={{ color: '#9399b2' }}>
          {work.description}
        </p>
        <div className="flex flex-wrap gap-1">
          {work.tags.map((tag) => (
            <span key={tag} className="tag-chip">{tag}</span>
          ))}
        </div>
      </div>
    </article>
  );

  return (
    <div ref={ref} style={wrapStyle}>
      {work.href ? (
        <Link href={work.href} className="block">
          {inner}
        </Link>
      ) : (
        inner
      )}
    </div>
  );
}

// ── Component: ToolCard ───────────────────────────────────────────────────────
function ToolCard({ tool, index }: { tool: Tool; index: number }) {
  const { ref, wrapStyle } = useReveal<HTMLDivElement>(index * 0.08);

  return (
    <div ref={ref} style={wrapStyle}>
      <div className="tool-card h-full">
        <div className="flex items-center gap-3 mb-2.5">
          <span className="text-2xl leading-none">{tool.icon}</span>
          <span
            className="font-semibold text-sm"
            style={{ color: tool.color, fontFamily: 'var(--font-mono)' }}
          >
            {tool.name}
          </span>
        </div>
        <p className="text-[12.5px] leading-[1.7]" style={{ color: '#9399b2' }}>
          {tool.desc}
        </p>
      </div>
    </div>
  );
}

// ── Component: TopBar ─────────────────────────────────────────────────────────
function TopBar() {
  return (
    <header
      className="sticky top-0 z-50 flex items-center justify-between px-5"
      style={{
        height: '56px',
        background: 'rgba(22,24,31,0.92)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid #2a2d3e',
        flexShrink: 0,
      }}
    >
      {/* Brand */}
      <div className="flex items-center gap-2.5">
        <div
          className="w-7 h-7 rounded-md flex items-center justify-center text-sm font-bold"
          style={{ background: 'linear-gradient(135deg, #ff6b2b, #a855f7)' }}
        >
          ⚡
        </div>
        <span
          className="text-[11px] font-semibold tracking-[0.15em] uppercase hidden sm:block"
          style={{ color: '#555a72' }}
        >
          AI Portfolio
        </span>
      </div>

      {/* Mobile nav */}
      <nav className="flex lg:hidden items-center gap-5">
        {NAV_ITEMS.map(({ id, label }) => (
          <a
            key={id}
            href={`#${id}`}
            className="text-[11px] uppercase"
            style={{
              color: '#9399b2',
              letterSpacing: '0.08em',
              textDecoration: 'none',
              fontFamily: 'var(--font-mono)',
            }}
          >
            {label}
          </a>
        ))}
      </nav>

      {/* CTA */}
      <a href="#works" className="btn-primary text-[12px]" style={{ padding: '7px 16px' }}>
        Works →
      </a>
    </header>
  );
}

// ── Component: Sidebar ────────────────────────────────────────────────────────
function Sidebar({ activeSection }: { activeSection: string }) {
  return (
    <aside
      className="hidden lg:flex flex-col"
      style={{
        width: '220px',
        minWidth: '220px',
        background: '#16181f',
        borderRight: '1px solid #2a2d3e',
        position: 'sticky',
        top: '56px',
        height: 'calc(100vh - 56px)',
        overflowY: 'auto',
        flexShrink: 0,
        padding: '28px 12px 20px',
      }}
    >
      {/* Profile */}
      <div className="px-3 mb-8">
        <div
          className="w-11 h-11 rounded-full flex items-center justify-center text-lg mb-3"
          style={{ background: 'linear-gradient(135deg, #ff6b2b 0%, #a855f7 100%)' }}
        >
          ⚡
        </div>
        <p className="font-bold text-[14px] mb-0.5" style={{ color: '#f0f2f8' }}>
          AI Developer
        </p>
        <p className="text-[11px]" style={{ color: '#555a72', fontFamily: 'var(--font-mono)' }}>
          Portfolio 2026
        </p>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-0.5">
        <p
          className="px-3 mb-2 text-[9px] font-semibold uppercase tracking-[0.1em]"
          style={{ color: '#555a72', fontFamily: 'var(--font-mono)' }}
        >
          Navigation
        </p>
        {NAV_ITEMS.map(({ id, label, icon }) => (
          <a
            key={id}
            href={`#${id}`}
            className={`sidebar-nav-item${activeSection === id ? ' active' : ''}`}
          >
            <span className="nav-icon">{icon}</span>
            {label}
          </a>
        ))}
      </nav>

      {/* Divider */}
      <div className="my-6 mx-3" style={{ borderTop: '1px solid #2a2d3e' }} />

      {/* Stats */}
      <div className="px-3 space-y-4">
        <p
          className="text-[9px] font-semibold uppercase tracking-[0.1em] mb-3"
          style={{ color: '#555a72', fontFamily: 'var(--font-mono)' }}
        >
          Stats
        </p>
        {[
          { label: 'Projects', value: WORKS.length },
          { label: 'AI Tools', value: TOOLS.length },
          { label: 'Year', value: 2026 },
        ].map(({ label, value }) => (
          <div key={label} className="flex items-center justify-between">
            <span className="text-[12px]" style={{ color: '#9399b2' }}>
              {label}
            </span>
            <span
              className="text-[13px] font-bold tabular-nums"
              style={{ color: '#ff6b2b', fontFamily: 'var(--font-mono)' }}
            >
              {value}
            </span>
          </div>
        ))}
      </div>

      {/* Bottom */}
      <div className="mt-auto pt-6 px-3">
        <p
          className="text-[9px] uppercase"
          style={{ color: '#555a72', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em' }}
        >
          Built with AI
        </p>
      </div>
    </aside>
  );
}

// ── Component: SectionHeader ──────────────────────────────────────────────────
function SectionHeader({
  eyebrow,
  title,
  count,
}: {
  eyebrow: string;
  title: string;
  count?: number;
}) {
  return (
    <div className="flex items-end justify-between mb-5">
      <div>
        <p
          className="text-[10px] font-semibold uppercase mb-1.5"
          style={{ color: '#00d4ff', letterSpacing: '0.1em', fontFamily: 'var(--font-mono)' }}
        >
          {eyebrow}
        </p>
        <h2
          className="text-[20px] font-extrabold leading-tight"
          style={{ color: '#f0f2f8', letterSpacing: '-0.02em' }}
        >
          {title}
        </h2>
      </div>
      {count !== undefined && (
        <span
          className="text-[11px] tabular-nums"
          style={{ color: '#00d4ff', fontFamily: 'var(--font-mono)' }}
        >
          {count} items
        </span>
      )}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function Home() {
  const [activeSection, setActiveSection] = useState('works');
  const [activeFilter, setActiveFilter] = useState<string>('すべて');
  const heroRef = useRef<HTMLDivElement>(null);
  const [heroVisible, setHeroVisible] = useState(false);

  // Hero entrance animation
  useEffect(() => {
    const timer = setTimeout(() => setHeroVisible(true), 80);
    return () => clearTimeout(timer);
  }, []);

  // Section tracking
  useEffect(() => {
    const ids = NAV_ITEMS.map((n) => n.id);
    const observers: IntersectionObserver[] = [];

    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveSection(id);
        },
        { rootMargin: '-25% 0px -65% 0px' },
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach((obs) => obs.disconnect());
  }, []);

  const filteredWorks = useCallback(() => {
    if (activeFilter === 'すべて') return WORKS;
    return WORKS.filter((w) => w.tags.includes(activeFilter));
  }, [activeFilter])();

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0d0f14',
        color: '#f0f2f8',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'var(--font-inter), system-ui, sans-serif',
      }}
    >
      <TopBar />

      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar activeSection={activeSection} />

        <main style={{ flex: 1, minWidth: 0 }}>

          {/* ── Hero ── */}
          <section
            ref={heroRef}
            className="relative overflow-hidden"
            style={{
              padding: '72px 48px 64px',
              borderBottom: '1px solid #2a2d3e',
            }}
          >
            {/* Ambient glow */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  'radial-gradient(ellipse 65% 70% at 10% 50%, rgba(255,107,43,0.12) 0%, transparent 65%),' +
                  'radial-gradient(ellipse 50% 60% at 90% 20%, rgba(168,85,247,0.07) 0%, transparent 65%)',
              }}
            />

            {/* Grid texture */}
            <div
              className="pointer-events-none absolute inset-0 opacity-40"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(255,107,43,0.04) 1px, transparent 1px),' +
                  'linear-gradient(90deg, rgba(255,107,43,0.04) 1px, transparent 1px)',
                backgroundSize: '48px 48px',
              }}
            />

            <div className="relative z-10 max-w-[600px]">
              {/* Eyebrow */}
              <div
                className="inline-flex items-center gap-2 mb-5 px-3 py-1 rounded-full"
                style={{
                  background: 'rgba(255,107,43,0.1)',
                  border: '1px solid rgba(255,107,43,0.25)',
                  opacity: heroVisible ? 1 : 0,
                  transform: heroVisible ? 'translateY(0)' : 'translateY(16px)',
                  transition: 'opacity 0.5s ease, transform 0.5s ease',
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full glow-pulse"
                  style={{ background: '#ff6b2b' }}
                />
                <span
                  className="text-[10px] font-semibold uppercase"
                  style={{ color: '#ff8f5e', letterSpacing: '0.1em', fontFamily: 'var(--font-mono)' }}
                >
                  AI Developer Portfolio
                </span>
              </div>

              {/* Headline */}
              <h1
                className="font-extrabold leading-[1.08] mb-5"
                style={{
                  fontSize: 'clamp(2.2rem, 5vw, 3.5rem)',
                  letterSpacing: '-0.035em',
                  opacity: heroVisible ? 1 : 0,
                  transform: heroVisible ? 'translateY(0)' : 'translateY(20px)',
                  transition: 'opacity 0.5s ease 0.08s, transform 0.5s ease 0.08s',
                }}
              >
                <span style={{ color: '#f0f2f8' }}>Build with AI.</span>
                <br />
                <span
                  style={{
                    background: 'linear-gradient(90deg, #ff6b2b 0%, #ff8f5e 100%)',
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Ship
                </span>
                <span style={{ color: '#f0f2f8' }}> to the world.</span>
              </h1>

              {/* Subtext */}
              <p
                className="mb-8 leading-relaxed"
                style={{
                  fontSize: '14px',
                  color: '#9399b2',
                  maxWidth: '440px',
                  opacity: heroVisible ? 1 : 0,
                  transform: heroVisible ? 'translateY(0)' : 'translateY(16px)',
                  transition: 'opacity 0.5s ease 0.16s, transform 0.5s ease 0.16s',
                }}
              >
                各種AIツールを使って0から構築したプロダクトのショーケース。
                アイデアから実装・デプロイまで、AIと二人三脚で。
              </p>

              {/* CTA buttons */}
              <div
                className="flex gap-3 flex-wrap"
                style={{
                  opacity: heroVisible ? 1 : 0,
                  transform: heroVisible ? 'translateY(0)' : 'translateY(12px)',
                  transition: 'opacity 0.5s ease 0.24s, transform 0.5s ease 0.24s',
                }}
              >
                <a href="#works" className="btn-primary">
                  作品を見る →
                </a>
                <a href="#about" className="btn-ghost">
                  自己紹介
                </a>
              </div>
            </div>

            {/* Decorative right side (desktop) */}
            <div
              className="hidden xl:flex absolute right-12 top-1/2 -translate-y-1/2 gap-4 opacity-60"
              style={{
                opacity: heroVisible ? 0.6 : 0,
                transition: 'opacity 0.8s ease 0.4s',
              }}
            >
              {WORKS.map((work, i) => (
                <div
                  key={work.id}
                  className="relative rounded-lg overflow-hidden"
                  style={{
                    width: '140px',
                    aspectRatio: '9/14',
                    transform: `translateY(${i % 2 === 0 ? '-12px' : '12px'})`,
                    border: '1px solid rgba(255,107,43,0.15)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                  }}
                >
                  <Image
                    src={`${BASE}${work.image}`}
                    alt={work.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        'linear-gradient(to top, rgba(13,15,20,0.8) 0%, transparent 60%)',
                    }}
                  />
                  <span
                    className="absolute bottom-2 left-2 right-2 text-[9px] font-bold leading-tight"
                    style={{ color: '#f0f2f8', fontFamily: 'var(--font-mono)' }}
                  >
                    {work.title}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* ── Works ── */}
          <section
            id="works"
            className="px-8 py-10"
            style={{ borderBottom: '1px solid #2a2d3e' }}
          >
            <SectionHeader eyebrow="Works" title="作品" count={filteredWorks.length} />

            {/* Filter chips */}
            <div className="flex gap-2 mb-6 flex-wrap">
              {ALL_FILTERS.map((f) => (
                <button
                  key={f}
                  className={`filter-chip${activeFilter === f ? ' active' : ''}`}
                  onClick={() => setActiveFilter(f)}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* Card grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {filteredWorks.length > 0 ? (
                filteredWorks.map((work, i) => (
                  <WorkCard key={work.id} work={work} index={i} />
                ))
              ) : (
                <div
                  className="col-span-full py-16 text-center text-[13px]"
                  style={{ color: '#555a72' }}
                >
                  このフィルターに該当する作品はまだありません。
                </div>
              )}
            </div>
          </section>

          {/* ── Tools ── */}
          <section
            id="tools"
            className="px-8 py-10"
            style={{ borderBottom: '1px solid #2a2d3e' }}
          >
            <SectionHeader eyebrow="Tools" title="使用AIツール" count={TOOLS.length} />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {TOOLS.map((tool, i) => (
                <ToolCard key={tool.name} tool={tool} index={i} />
              ))}
            </div>
          </section>

          {/* ── About ── */}
          <section id="about" className="px-8 py-10">
            <SectionHeader eyebrow="About" title="自己紹介" />

            <div
              className="max-w-2xl rounded-xl p-6"
              style={{ background: '#16181f', border: '1px solid #2a2d3e' }}
            >
              {/* Accent line */}
              <div
                className="flex items-center gap-3 mb-5"
                style={{
                  paddingBottom: '16px',
                  borderBottom: '1px solid #2a2d3e',
                }}
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-base shrink-0"
                  style={{ background: 'linear-gradient(135deg, #ff6b2b, #a855f7)' }}
                >
                  ⚡
                </div>
                <div>
                  <p className="font-bold text-sm" style={{ color: '#f0f2f8' }}>
                    AI Developer
                  </p>
                  <p
                    className="text-[11px]"
                    style={{ color: '#555a72', fontFamily: 'var(--font-mono)' }}
                  >
                    2026 · Japan
                  </p>
                </div>
              </div>

              <p
                className="text-[13.5px] leading-[1.85] mb-5"
                style={{ color: '#9399b2' }}
              >
                AIツールを駆使してプロダクトを設計・構築することに取り組んでいます。
                NotebookLM・Manus・Claude Codeなど、各ツールの特性を活かした使い方を探求中。
              </p>

              <blockquote
                className="pl-4 text-[13px] leading-relaxed"
                style={{
                  color: '#9399b2',
                  borderLeft: '2px solid rgba(0,212,255,0.4)',
                  fontStyle: 'italic',
                }}
              >
                「アイデアを持つ人がAIで即座にプロダクトを作れる世界」を目指して。
              </blockquote>

              {/* Tech tags */}
              <div className="flex flex-wrap gap-2 mt-5">
                {['Next.js', 'TypeScript', 'Claude Code', 'NotebookLM', 'Manus'].map((t) => (
                  <span key={t} className="tag-chip" style={{ fontSize: '10px' }}>
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* ── Footer ── */}
          <footer
            className="px-8 py-5 flex items-center justify-between"
            style={{
              borderTop: '1px solid #2a2d3e',
              color: '#555a72',
              fontSize: '10px',
              fontFamily: 'var(--font-mono)',
              letterSpacing: '0.08em',
            }}
          >
            <span className="uppercase">Built with AI — 2026</span>
            <span
              className="flex items-center gap-1.5"
              style={{ color: '#ff6b2b', opacity: 0.7 }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              ONLINE
            </span>
          </footer>
        </main>
      </div>
    </div>
  );
}
