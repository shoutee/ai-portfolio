'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { WORKS, TOOLS, NAV_ITEMS, ALL_FILTERS, BASE_PATH } from '@/lib/data';
import type { Work, Tool, FilterLabel } from '@/lib/types';

// ── Hook: Scroll Reveal ───────────────────────────────────────────────────────
function useReveal<T extends HTMLElement>(delay = 0) {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) { setVisible(true); obs.disconnect(); }
      },
      { threshold: 0.06 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return {
    ref,
    wrapStyle: {
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(22px)',
      transition: `opacity 0.4s ease ${delay}s, transform 0.4s ease ${delay}s`,
    } as React.CSSProperties,
  };
}

// ── Component: WorkCard ───────────────────────────────────────────────────────
function WorkCard({ work, index }: { work: Work; index: number }) {
  const { ref, wrapStyle } = useReveal<HTMLDivElement>(index * 0.09);

  // Per-card CSS variables for accent glow and line
  const accentVars = {
    '--card-glow':   `${work.accent}40`,
    '--card-border': `${work.accent}55`,
    '--card-accent': work.accent,
  } as React.CSSProperties;

  const inner = (
    <article
      className={`work-card${work.href ? ' clickable' : ''}`}
      style={accentVars}
    >
      {/* ── Thumbnail ── */}
      <div className="relative" style={{ aspectRatio: '16/9', overflow: 'hidden' }}>
        <Image
          src={`${BASE_PATH}${work.image}`}
          alt={work.title}
          fill
          className="object-cover thumb-img"
          sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
          unoptimized
        />

        {/* Top scrim — badge background */}
        <div className="card-top-scrim absolute inset-0 pointer-events-none" />

        {/* Bottom gradient scrim */}
        <div className="card-scrim absolute inset-0 pointer-events-none" />

        {/* ── Badges (top row) ── */}
        {/* LIVE */}
        {work.href && (
          <div
            className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-0.5 rounded"
            style={{
              background: 'rgba(0,0,0,0.55)',
              border: '1px solid rgba(74,222,128,0.45)',
              backdropFilter: 'blur(6px)',
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span
              style={{
                color: '#4ade80',
                fontSize: '9px',
                fontFamily: 'var(--font-mono)',
                letterSpacing: '0.08em',
              }}
            >
              LIVE
            </span>
          </div>
        )}

        {/* NEW */}
        {work.isNew && (
          <span
            className="absolute top-2 right-2 text-[9px] font-bold px-2 py-0.5 rounded"
            style={{
              background: '#7c3aed',
              color: '#f5f3ff',
              letterSpacing: '0.08em',
              fontFamily: 'var(--font-mono)',
              textTransform: 'uppercase',
            }}
          >
            NEW
          </span>
        )}

        {/* ── Overlay: title + tool badge ── */}
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
                background: `${work.accent}20`,
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

      {/* ── Body ── */}
      <div className="p-3 pt-2.5">
        <p
          className="text-[12.5px] leading-[1.65] mb-2.5"
          style={{ color: '#9399b2' }}
        >
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
        <Link href={work.href} className="block h-full">{inner}</Link>
      ) : (
        inner
      )}
    </div>
  );
}

// ── Component: ToolCard ───────────────────────────────────────────────────────
function ToolCard({ tool, index }: { tool: Tool; index: number }) {
  const { ref, wrapStyle } = useReveal<HTMLDivElement>(index * 0.09);

  return (
    <div ref={ref} style={wrapStyle}>
      <div className="tool-card h-full">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-2xl leading-none">{tool.icon}</span>
          <span
            className="font-semibold text-[13px]"
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
        background: 'rgba(22,24,31,0.94)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        borderBottom: '1px solid #2a2d3e',
        flexShrink: 0,
      }}
    >
      {/* Brand */}
      <div className="flex items-center gap-2.5">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold select-none"
          style={{ background: 'linear-gradient(135deg, #ff6b2b 0%, #a855f7 100%)' }}
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
      <a href="#works" className="btn-primary" style={{ fontSize: '12px', padding: '7px 16px' }}>
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
      {/* Avatar + name */}
      <div className="px-3 mb-8">
        <div
          className="w-11 h-11 rounded-full flex items-center justify-center text-lg mb-3 select-none"
          style={{ background: 'linear-gradient(135deg, #ff6b2b 0%, #a855f7 100%)' }}
        >
          ⚡
        </div>
        <p className="font-bold text-[14px] mb-0.5" style={{ color: '#f0f2f8' }}>
          AI Developer
        </p>
        <p
          className="text-[11px]"
          style={{ color: '#555a72', fontFamily: 'var(--font-mono)' }}
        >
          Portfolio 2026
        </p>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-0.5 mb-6">
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
      <div className="mx-3 mb-5" style={{ borderTop: '1px solid #2a2d3e' }} />

      {/* Stats */}
      <div className="px-3">
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
          <div key={label} className="flex items-center justify-between mb-3">
            <span className="text-[12px]" style={{ color: '#9399b2' }}>{label}</span>
            <span
              className="text-[14px] font-bold tabular-nums"
              style={{ color: '#ff6b2b', fontFamily: 'var(--font-mono)' }}
            >
              {value}
            </span>
          </div>
        ))}
      </div>

      {/* Bottom */}
      <div className="mt-auto px-3 pt-6">
        <p
          className="text-[9px] uppercase"
          style={{ color: '#555a72', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em' }}
        >
          Built with AI — 2026
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
          style={{
            color: '#00d4ff',
            letterSpacing: '0.1em',
            fontFamily: 'var(--font-mono)',
          }}
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

// ── Component: HeroMiniCards ──────────────────────────────────────────────────
function HeroMiniCards({ visible }: { visible: boolean }) {
  return (
    <div
      className="hidden xl:flex flex-col gap-3"
      style={{
        position: 'absolute',
        right: '48px',
        top: '50%',
        transform: 'translateY(-50%)',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.8s ease 0.5s',
      }}
    >
      {WORKS.map((work, i) => (
        <div
          key={work.id}
          className="relative rounded-lg overflow-hidden"
          style={{
            width: '200px',
            aspectRatio: '16/9',
            transform: `translateX(${i % 2 === 0 ? '0px' : '16px'})`,
            border: `1px solid ${work.accent}30`,
            boxShadow: `0 8px 24px rgba(0,0,0,0.5), 0 0 0 0 ${work.accent}00`,
            transition: 'box-shadow 200ms ease, transform 200ms ease',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.boxShadow =
              `0 12px 32px rgba(0,0,0,0.6), 0 0 20px ${work.accent}40`;
            (e.currentTarget as HTMLElement).style.transform =
              `translateX(${i % 2 === 0 ? '-4px' : '12px'})`;
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.boxShadow =
              `0 8px 24px rgba(0,0,0,0.5)`;
            (e.currentTarget as HTMLElement).style.transform =
              `translateX(${i % 2 === 0 ? '0px' : '16px'})`;
          }}
        >
          <Image
            src={`${BASE_PATH}${work.image}`}
            alt={work.title}
            fill
            className="object-cover"
            style={{ transition: 'transform 400ms ease' }}
            unoptimized
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(to top, rgba(13,15,20,0.85) 0%, transparent 60%)',
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
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function Home() {
  const [activeSection, setActiveSection] = useState('works');
  const [activeFilter, setActiveFilter] = useState<FilterLabel>('すべて');
  const [heroVisible, setHeroVisible] = useState(false);

  // Cursor glow in Works section
  const worksSectionRef = useRef<HTMLElement>(null);
  const [cursorGlow, setCursorGlow] = useState({ x: -999, y: -999 });

  useEffect(() => {
    const timer = setTimeout(() => setHeroVisible(true), 80);
    return () => clearTimeout(timer);
  }, []);

  // Section active tracking
  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    NAV_ITEMS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSection(id); },
        { rootMargin: '-25% 0px -65% 0px' },
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((obs) => obs.disconnect());
  }, []);

  // Cursor glow handler
  const handleWorksMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    if (!worksSectionRef.current) return;
    const rect = worksSectionRef.current.getBoundingClientRect();
    setCursorGlow({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }, []);
  const handleWorksMouseLeave = useCallback(() => {
    setCursorGlow({ x: -999, y: -999 });
  }, []);

  const filteredWorks = activeFilter === 'すべて'
    ? WORKS
    : WORKS.filter((w) => w.tags.includes(activeFilter));

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

          {/* ══ Hero ══════════════════════════════════════════════════════════ */}
          <section
            className="relative overflow-hidden"
            style={{ padding: '72px 48px 64px', borderBottom: '1px solid #2a2d3e' }}
          >
            {/* Animated grid */}
            <div className="hero-grid pointer-events-none absolute inset-0 opacity-100" />

            {/* Ambient glow */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  'radial-gradient(ellipse 60% 70% at 10% 50%, rgba(255,107,43,0.13) 0%, transparent 65%),' +
                  'radial-gradient(ellipse 45% 55% at 85% 20%, rgba(168,85,247,0.07) 0%, transparent 65%)',
              }}
            />

            <div className="relative z-10 max-w-[580px]">
              {/* Eyebrow pill */}
              <div
                className="inline-flex items-center gap-2 mb-5 px-3 py-1.5 rounded-full"
                style={{
                  background: 'rgba(255,107,43,0.1)',
                  border: '1px solid rgba(255,107,43,0.28)',
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
                  style={{
                    color: '#ff8f5e',
                    letterSpacing: '0.1em',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  AI Developer Portfolio
                </span>
              </div>

              {/* H1 */}
              <h1
                className="font-extrabold leading-[1.08] mb-5"
                style={{
                  fontSize: 'clamp(2.2rem, 5vw, 3.5rem)',
                  letterSpacing: '-0.035em',
                  opacity: heroVisible ? 1 : 0,
                  transform: heroVisible ? 'translateY(0)' : 'translateY(20px)',
                  transition: 'opacity 0.5s ease 0.09s, transform 0.5s ease 0.09s',
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

              {/* Sub */}
              <p
                className="mb-8 leading-relaxed"
                style={{
                  fontSize: '14px',
                  color: '#9399b2',
                  maxWidth: '420px',
                  opacity: heroVisible ? 1 : 0,
                  transform: heroVisible ? 'translateY(0)' : 'translateY(14px)',
                  transition: 'opacity 0.5s ease 0.18s, transform 0.5s ease 0.18s',
                }}
              >
                各種AIツールを使って0から構築したプロダクトのショーケース。
                アイデアから実装・デプロイまで、AIと二人三脚で。
              </p>

              {/* CTAs */}
              <div
                className="flex gap-3 flex-wrap"
                style={{
                  opacity: heroVisible ? 1 : 0,
                  transform: heroVisible ? 'translateY(0)' : 'translateY(10px)',
                  transition: 'opacity 0.5s ease 0.27s, transform 0.5s ease 0.27s',
                }}
              >
                <a href="#works" className="btn-primary">作品を見る →</a>
                <a href="#about" className="btn-ghost">自己紹介</a>
              </div>
            </div>

            {/* Decorative mini-cards */}
            <HeroMiniCards visible={heroVisible} />
          </section>

          {/* ══ Works ═════════════════════════════════════════════════════════ */}
          <section
            id="works"
            ref={worksSectionRef}
            className="relative px-8 py-10"
            style={{ borderBottom: '1px solid #2a2d3e', overflow: 'hidden' }}
            onMouseMove={handleWorksMouseMove}
            onMouseLeave={handleWorksMouseLeave}
          >
            {/* Cursor-following ambient glow */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background: `radial-gradient(circle 380px at ${cursorGlow.x}px ${cursorGlow.y}px, rgba(255,107,43,0.055) 0%, transparent 75%)`,
                transition: 'background 60ms linear',
              }}
            />

            <div className="relative z-10">
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

              {/* Card grid — re-keyed on filter to re-trigger reveal animations */}
              <div
                key={activeFilter}
                className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3"
              >
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
            </div>
          </section>

          {/* ══ Tools ═════════════════════════════════════════════════════════ */}
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

          {/* ══ About ═════════════════════════════════════════════════════════ */}
          <section id="about" className="px-8 py-10">
            <SectionHeader eyebrow="About" title="自己紹介" />

            <div
              className="max-w-2xl rounded-xl p-6"
              style={{ background: '#16181f', border: '1px solid #2a2d3e' }}
            >
              {/* Profile row */}
              <div
                className="flex items-center gap-4 mb-5 pb-5"
                style={{ borderBottom: '1px solid #2a2d3e' }}
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-xl shrink-0 select-none"
                  style={{ background: 'linear-gradient(135deg, #ff6b2b, #a855f7)' }}
                >
                  ⚡
                </div>
                <div>
                  <p className="font-bold text-[15px] mb-0.5" style={{ color: '#f0f2f8' }}>
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
                className="text-[13.5px] leading-[1.9] mb-5"
                style={{ color: '#9399b2' }}
              >
                AIツールを駆使してプロダクトを設計・構築することに取り組んでいます。
                NotebookLM・Manus・Claude Codeなど、各ツールの特性を活かした使い方を探求中。
              </p>

              <blockquote
                className="pl-4 text-[13px] leading-relaxed mb-5"
                style={{
                  color: '#9399b2',
                  borderLeft: '2px solid rgba(0,212,255,0.4)',
                  fontStyle: 'italic',
                }}
              >
                「アイデアを持つ人がAIで即座にプロダクトを作れる世界」を目指して。
              </blockquote>

              {/* Tech tags */}
              <div className="flex flex-wrap gap-2">
                {['Next.js', 'TypeScript', 'Claude Code', 'NotebookLM', 'Manus'].map((t) => (
                  <span key={t} className="tag-chip" style={{ fontSize: '10px' }}>{t}</span>
                ))}
              </div>
            </div>
          </section>

          {/* ══ Footer ════════════════════════════════════════════════════════ */}
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
            <div className="flex items-center gap-1.5" style={{ color: '#4ade80', opacity: 0.8 }}>
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="uppercase">Online</span>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
