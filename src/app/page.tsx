'use client';

import { useEffect, useRef, useState, useCallback, useMemo, memo, useSyncExternalStore } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  WORKS, TOOLS, NAV_ITEMS, ALL_FILTERS,
  BASE_PATH, AGENT_RECORDS, BUILD_PIPELINE,
} from '@/lib/data';
import type { Work, Tool, FilterLabel, AgentRecord } from '@/lib/types';
import { agentStatusColor, agentStatusLabel } from '@/lib/types';
import { safeHex } from '@/lib/color';

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

// Sanitize href: only allow relative paths to prevent javascript: injection
function safeRelativeHref(href: string | null): string | null {
  if (href === null) return null;
  return href.startsWith('/') ? href : null;
}

// ── Component: WorkCard ───────────────────────────────────────────────────────
function WorkCard({ work, index }: { work: Work; index: number }) {
  const { ref, wrapStyle } = useReveal<HTMLDivElement>(index * 0.09);
  const href = safeRelativeHref(work.href);

  const { accentVars, accent } = useMemo(() => {
    const accent = safeHex(work.accent);
    return {
      accent,
      accentVars: {
        '--card-glow':   `${accent}40`,
        '--card-border': `${accent}55`,
        '--card-accent': accent,
      } as React.CSSProperties,
    };
  }, [work.accent]);

  const inner = (
    <article
      className={`work-card${href ? ' clickable' : ''}`}
      style={accentVars}
    >
      <div className="relative" style={{ aspectRatio: '16/9', overflow: 'hidden' }}>
        <Image
          src={`${BASE_PATH}${work.image}`}
          alt={work.title}
          fill
          className="object-cover thumb-img"
          sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
          unoptimized
        />
        <div className="card-top-scrim absolute inset-0 pointer-events-none" />
        <div className="card-scrim absolute inset-0 pointer-events-none" />

        {href && (
          <div
            className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-0.5 rounded"
            style={{
              background: 'rgba(0,0,0,0.55)',
              border: '1px solid rgba(74,222,128,0.45)',
              backdropFilter: 'blur(6px)',
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span style={{ color: '#4ade80', fontSize: '9px', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em' }}>
              LIVE
            </span>
          </div>
        )}

        {work.isNew && (
          <span
            className="absolute top-2 right-2 text-[9px] font-bold px-2 py-0.5 rounded"
            style={{ background: '#7c3aed', color: '#f5f3ff', letterSpacing: '0.08em', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}
          >
            NEW
          </span>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-3">
          <div className="flex items-end justify-between gap-2">
            <h3 className="font-bold text-sm leading-snug flex-1" style={{ color: '#f0f2f8', letterSpacing: '-0.01em' }}>
              {work.title}
            </h3>
            <span
              className="shrink-0 text-[9px] px-2 py-0.5 rounded"
              style={{ background: `${accent}20`, color: accent, border: `1px solid ${accent}55`, fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}
            >
              {work.tool}
            </span>
          </div>
        </div>
      </div>

      <div className="p-3 pt-2.5">
        <p className="text-[12.5px] leading-[1.65] mb-2.5" style={{ color: '#9399b2' }}>
          {work.description}
        </p>
        <div className="flex flex-wrap gap-1">
          {work.tags.map((tag) => <span key={tag} className="tag-chip">{tag}</span>)}
        </div>
      </div>
    </article>
  );

  return (
    <div ref={ref} style={wrapStyle}>
      {href ? <Link href={href} className="block h-full">{inner}</Link> : inner}
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
          <span className="font-semibold text-[13px]" style={{ color: tool.color, fontFamily: 'var(--font-mono)' }}>
            {tool.name}
          </span>
        </div>
        <p className="text-[12.5px] leading-[1.7]" style={{ color: '#9399b2' }}>{tool.desc}</p>
      </div>
    </div>
  );
}

// ── Component: AgentCard ──────────────────────────────────────────────────────
function AgentCard({ record, index }: { record: AgentRecord; index: number }) {
  const { ref, wrapStyle } = useReveal<HTMLDivElement>(index * 0.08);

  const color = safeHex(record.color);
  const statusColor = agentStatusColor(record.status);
  const statusLabel = agentStatusLabel(record.status);

  return (
    <div ref={ref} style={wrapStyle}>
      <div
        className="rounded-xl p-4 h-full"
        style={{
          background: '#16181f',
          border: `1px solid ${color}30`,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Color accent bar */}
        <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: color }} />

        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl leading-none">{record.icon}</span>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span
                  className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded"
                  style={{
                    background: `${color}20`,
                    color: color,
                    fontFamily: 'var(--font-mono)',
                    letterSpacing: '0.08em',
                    border: `1px solid ${color}40`,
                  }}
                >
                  {record.kind}
                </span>
                <span
                  className="text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded"
                  style={{ background: '#1e2130', color: '#9399b2', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em' }}
                >
                  {record.badge}
                </span>
              </div>
              <p className="font-bold text-[13px]" style={{ color: '#f0f2f8' }}>{record.name}</p>
            </div>
          </div>
          <span
            className="shrink-0 text-[8px] font-bold px-1.5 py-0.5 rounded uppercase"
            style={{ background: `${safeHex(statusColor)}18`, color: statusColor, fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', border: `1px solid ${safeHex(statusColor)}40` }}
          >
            {statusLabel}
          </span>
        </div>

        {/* Purpose */}
        <p className="text-[12px] leading-[1.65] mb-3" style={{ color: '#9399b2' }}>
          {record.purpose}
        </p>

        {/* Outputs */}
        <ul className="space-y-1.5">
          {record.outputs.map((out, i) => (
            <li key={i} className="flex items-start gap-2 text-[11.5px]" style={{ color: '#9399b2' }}>
              <span className="shrink-0 mt-0.5" style={{ color: color }}>›</span>
              {out}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ── Component: TopBar (memoized) ──────────────────────────────────────────────
const TopBar = memo(function TopBar() {
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
      <div className="flex items-center gap-2.5">
        <div
          aria-label="Home"
          role="img"
          className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold select-none"
          style={{ background: 'linear-gradient(135deg, #ff6b2b 0%, #a855f7 100%)' }}
        >
          ⚡
        </div>
        <span className="text-[11px] font-semibold tracking-[0.15em] uppercase hidden sm:block" style={{ color: '#555a72' }}>
          AI Portfolio
        </span>
      </div>

      <nav className="flex lg:hidden items-center gap-5">
        {NAV_ITEMS.map(({ id, label }) => (
          <a key={id} href={`#${id}`} className="text-[11px] uppercase"
            style={{ color: '#9399b2', letterSpacing: '0.08em', textDecoration: 'none', fontFamily: 'var(--font-mono)' }}>
            {label}
          </a>
        ))}
      </nav>

      <a href="#works" className="btn-primary" style={{ fontSize: '12px', padding: '7px 16px' }}>
        Works →
      </a>
    </header>
  );
});

// ── Component: Sidebar (memoized) ─────────────────────────────────────────────
const Sidebar = memo(function Sidebar({ activeSection }: { activeSection: string }) {
  return (
    <aside
      className="hidden lg:flex flex-col"
      style={{
        width: '220px', minWidth: '220px',
        background: '#16181f',
        borderRight: '1px solid #2a2d3e',
        position: 'sticky', top: '56px',
        height: 'calc(100vh - 56px)',
        overflowY: 'auto', flexShrink: 0,
        padding: '28px 12px 20px',
      }}
    >
      <div className="px-3 mb-8">
        <div
          aria-label="AI Developer"
          role="img"
          className="w-11 h-11 rounded-full flex items-center justify-center text-lg mb-3 select-none"
          style={{ background: 'linear-gradient(135deg, #ff6b2b 0%, #a855f7 100%)' }}
        >
          ⚡
        </div>
        <p className="font-bold text-[14px] mb-0.5" style={{ color: '#f0f2f8' }}>AI Developer</p>
        <p className="text-[11px]" style={{ color: '#555a72', fontFamily: 'var(--font-mono)' }}>Portfolio 2026</p>
      </div>

      <nav className="flex flex-col gap-0.5 mb-6" aria-label="Page sections">
        <p className="px-3 mb-2 text-[9px] font-semibold uppercase tracking-[0.1em]" style={{ color: '#555a72', fontFamily: 'var(--font-mono)' }}>
          Navigation
        </p>
        {NAV_ITEMS.map(({ id, label, icon }) => (
          <a key={id} href={`#${id}`} className={`sidebar-nav-item${activeSection === id ? ' active' : ''}`}>
            <span className="nav-icon">{icon}</span>
            {label}
          </a>
        ))}
      </nav>

      <div className="mx-3 mb-5" style={{ borderTop: '1px solid #2a2d3e' }} />

      <div className="px-3">
        <p className="text-[9px] font-semibold uppercase tracking-[0.1em] mb-3" style={{ color: '#555a72', fontFamily: 'var(--font-mono)' }}>
          Stats
        </p>
        {[
          { label: 'Projects', value: WORKS.length },
          { label: 'AI Tools', value: TOOLS.length },
          { label: 'Agents', value: AGENT_RECORDS.length },
          { label: 'Year', value: 2026 },
        ].map(({ label, value }) => (
          <div key={label} className="flex items-center justify-between mb-3">
            <span className="text-[12px]" style={{ color: '#9399b2' }}>{label}</span>
            <span className="text-[14px] font-bold tabular-nums" style={{ color: '#ff6b2b', fontFamily: 'var(--font-mono)' }}>
              {value}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-auto px-3 pt-6">
        <p className="text-[9px] uppercase" style={{ color: '#555a72', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em' }}>
          Built with AI — 2026
        </p>
      </div>
    </aside>
  );
});

// ── Component: SectionHeader ──────────────────────────────────────────────────
function SectionHeader({ eyebrow, title, count }: { eyebrow: string; title: string; count?: number }) {
  return (
    <div className="flex items-end justify-between mb-5">
      <div>
        <p className="text-[10px] font-semibold uppercase mb-1.5"
          style={{ color: '#00d4ff', letterSpacing: '0.1em', fontFamily: 'var(--font-mono)' }}>
          {eyebrow}
        </p>
        <h2 className="text-[20px] font-extrabold leading-tight" style={{ color: '#f0f2f8', letterSpacing: '-0.02em' }}>
          {title}
        </h2>
      </div>
      {count !== undefined && (
        <span className="text-[11px] tabular-nums" style={{ color: '#00d4ff', fontFamily: 'var(--font-mono)' }}>
          {count} items
        </span>
      )}
    </div>
  );
}

// ── Hook: xl viewport detection (SSR-safe via useSyncExternalStore) ──────────
function useIsXl(): boolean {
  return useSyncExternalStore(
    (callback) => {
      const mq = window.matchMedia('(min-width: 1280px)');
      mq.addEventListener('change', callback);
      return () => mq.removeEventListener('change', callback);
    },
    () => window.matchMedia('(min-width: 1280px)').matches,
    () => false,
  );
}

// ── Component: HeroMiniCards (only mounts on xl — no image load on mobile) ────
const HeroMiniCards = memo(function HeroMiniCards({ visible }: { visible: boolean }) {
  const isXl = useIsXl();
  if (!isXl) return null;

  return (
    <div
      className="flex flex-col gap-3"
      style={{
        position: 'absolute', right: '48px', top: '50%', transform: 'translateY(-50%)',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.8s ease 0.5s',
      }}
    >
      {WORKS.map((work, i) => (
        <div
          key={work.id}
          className="mini-card relative rounded-lg overflow-hidden"
          style={{
            width: '200px',
            aspectRatio: '16/9',
            transform: `translateX(${i % 2 === 0 ? '0px' : '16px'})`,
            border: `1px solid ${safeHex(work.accent)}30`,
          }}
        >
          <Image src={`${BASE_PATH}${work.image}`} alt={work.title} fill className="object-cover" unoptimized />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(13,15,20,0.85) 0%, transparent 60%)' }} />
          <span className="absolute bottom-2 left-2 right-2 text-[9px] font-bold leading-tight"
            style={{ color: '#f0f2f8', fontFamily: 'var(--font-mono)' }}>
            {work.title}
          </span>
        </div>
      ))}
    </div>
  );
});

// ── Main ──────────────────────────────────────────────────────────────────────
export default function Home() {
  const [activeSection, setActiveSection] = useState('works');
  const [activeFilter, setActiveFilter] = useState<FilterLabel>('すべて');
  const [heroVisible, setHeroVisible] = useState(false);
  const [activeKind, setActiveKind] = useState<'SubAgent' | 'Skill' | 'All'>('All');

  // Cursor glow via ref — avoids re-render on every mousemove
  const worksSectionRef = useRef<HTMLElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setHeroVisible(true), 80);
    return () => clearTimeout(timer);
  }, []);

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

  // Cursor glow: direct DOM update (no state → no re-render)
  const handleWorksMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    if (!worksSectionRef.current || !glowRef.current) return;
    const rect = worksSectionRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    glowRef.current.style.background =
      `radial-gradient(circle 380px at ${x}px ${y}px, rgba(255,107,43,0.055) 0%, transparent 75%)`;
  }, []);

  const handleWorksMouseLeave = useCallback(() => {
    if (glowRef.current) glowRef.current.style.background = 'none';
  }, []);

  // Filtered works — memoized
  const filteredWorks = useMemo(
    () => activeFilter === 'すべて' ? WORKS : WORKS.filter((w) => w.tags.includes(activeFilter)),
    [activeFilter],
  );

  // Filtered agent records
  const filteredAgents = useMemo(
    () => activeKind === 'All' ? AGENT_RECORDS : AGENT_RECORDS.filter((r) => r.kind === activeKind),
    [activeKind],
  );

  return (
    <div style={{ minHeight: '100vh', background: '#0d0f14', color: '#f0f2f8', display: 'flex', flexDirection: 'column', fontFamily: 'var(--font-inter), system-ui, sans-serif' }}>
      <TopBar />

      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar activeSection={activeSection} />

        <main style={{ flex: 1, minWidth: 0 }}>

          {/* ══ Hero ══════════════════════════════════════════════════════════ */}
          <section className="relative overflow-hidden" style={{ padding: '72px 48px 64px', borderBottom: '1px solid #2a2d3e' }}>
            <div className="hero-grid pointer-events-none absolute inset-0" />
            <div className="pointer-events-none absolute inset-0" style={{
              background:
                'radial-gradient(ellipse 60% 70% at 10% 50%, rgba(255,107,43,0.13) 0%, transparent 65%),' +
                'radial-gradient(ellipse 45% 55% at 85% 20%, rgba(168,85,247,0.07) 0%, transparent 65%)',
            }} />

            <div className="relative z-10 max-w-[580px]">
              <div
                className="inline-flex items-center gap-2 mb-5 px-3 py-1.5 rounded-full"
                style={{
                  background: 'rgba(255,107,43,0.1)', border: '1px solid rgba(255,107,43,0.28)',
                  opacity: heroVisible ? 1 : 0,
                  transform: heroVisible ? 'translateY(0)' : 'translateY(16px)',
                  transition: 'opacity 0.5s ease, transform 0.5s ease',
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full glow-pulse" style={{ background: '#ff6b2b' }} />
                <span className="text-[10px] font-semibold uppercase" style={{ color: '#ff8f5e', letterSpacing: '0.1em', fontFamily: 'var(--font-mono)' }}>
                  AI Developer Portfolio
                </span>
              </div>

              <h1
                className="font-extrabold leading-[1.08] mb-5"
                style={{
                  fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', letterSpacing: '-0.035em',
                  opacity: heroVisible ? 1 : 0,
                  transform: heroVisible ? 'translateY(0)' : 'translateY(20px)',
                  transition: 'opacity 0.5s ease 0.09s, transform 0.5s ease 0.09s',
                }}
              >
                <span style={{ color: '#f0f2f8' }}>Build with AI.</span>
                <br />
                <span style={{ background: 'linear-gradient(90deg, #ff6b2b 0%, #ff8f5e 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Ship
                </span>
                <span style={{ color: '#f0f2f8' }}> to the world.</span>
              </h1>

              <p className="mb-8 leading-relaxed" style={{
                fontSize: '14px', color: '#9399b2', maxWidth: '420px',
                opacity: heroVisible ? 1 : 0,
                transform: heroVisible ? 'translateY(0)' : 'translateY(14px)',
                transition: 'opacity 0.5s ease 0.18s, transform 0.5s ease 0.18s',
              }}>
                各種AIツールを使って0から構築したプロダクトのショーケース。
                アイデアから実装・デプロイまで、AIと二人三脚で。
              </p>

              <div className="flex gap-3 flex-wrap" style={{
                opacity: heroVisible ? 1 : 0,
                transform: heroVisible ? 'translateY(0)' : 'translateY(10px)',
                transition: 'opacity 0.5s ease 0.27s, transform 0.5s ease 0.27s',
              }}>
                <a href="#works" className="btn-primary">作品を見る →</a>
                <a href="#process" className="btn-ghost">Build Process</a>
              </div>
            </div>

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
            <div ref={glowRef} className="pointer-events-none absolute inset-0" />

            <div className="relative z-10">
              <SectionHeader eyebrow="Works" title="作品" count={filteredWorks.length} />

              <div className="flex gap-2 mb-6 flex-wrap">
                {ALL_FILTERS.map((f) => (
                  <button key={f} className={`filter-chip${activeFilter === f ? ' active' : ''}`} onClick={() => setActiveFilter(f)}>
                    {f}
                  </button>
                ))}
              </div>

              <ul key={activeFilter} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 list-none p-0">
                {filteredWorks.length > 0 ? (
                  filteredWorks.map((work, i) => (
                    <li key={work.id}><WorkCard work={work} index={i} /></li>
                  ))
                ) : (
                  <li className="col-span-full py-16 text-center text-[13px]" style={{ color: '#555a72' }}>
                    このフィルターに該当する作品はまだありません。
                  </li>
                )}
              </ul>
            </div>
          </section>

          {/* ══ Tools ═════════════════════════════════════════════════════════ */}
          <section id="tools" className="px-8 py-10" style={{ borderBottom: '1px solid #2a2d3e' }}>
            <SectionHeader eyebrow="Tools" title="使用AIツール" count={TOOLS.length} />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {TOOLS.map((tool, i) => <ToolCard key={tool.name} tool={tool} index={i} />)}
            </div>
          </section>

          {/* ══ Process ═══════════════════════════════════════════════════════ */}
          <section id="process" className="px-8 py-10" style={{ borderBottom: '1px solid #2a2d3e' }}>
            <SectionHeader eyebrow="Process" title="Build Log" count={AGENT_RECORDS.length} />

            {/* Build Pipeline */}
            <div className="mb-8 rounded-xl p-5 overflow-x-auto" style={{ background: '#16181f', border: '1px solid #2a2d3e' }}>
              <p className="text-[10px] font-semibold uppercase mb-4" style={{ color: '#555a72', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em' }}>
                Build Pipeline
              </p>
              <div className="flex items-center gap-0 min-w-max">
                {BUILD_PIPELINE.map((step, i) => (
                  <div key={step.step} className="flex items-center">
                    <div className="flex flex-col items-center gap-1.5">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                        style={{ background: 'linear-gradient(135deg, rgba(255,107,43,0.2), rgba(168,85,247,0.2))', border: '1px solid rgba(255,107,43,0.35)' }}
                      >
                        {step.icon}
                      </div>
                      <span className="text-[10px] font-bold" style={{ color: '#f0f2f8' }}>{step.label}</span>
                      <span className="text-[9px]" style={{ color: '#555a72', fontFamily: 'var(--font-mono)' }}>{step.desc}</span>
                    </div>
                    {i < BUILD_PIPELINE.length - 1 && (
                      <div className="flex items-center mx-3" style={{ marginBottom: '28px' }}>
                        <div className="h-px w-8" style={{ background: 'linear-gradient(90deg, #ff6b2b, #a855f7)' }} />
                        <span style={{ color: '#ff6b2b', fontSize: '10px', marginLeft: '-2px' }}>›</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Kind filter */}
            <div className="flex gap-2 mb-5">
              {(['All', 'SubAgent', 'Skill'] as const).map((k) => (
                <button
                  key={k}
                  className={`filter-chip${activeKind === k ? ' active' : ''}`}
                  onClick={() => setActiveKind(k)}
                >
                  {k}
                </button>
              ))}
            </div>

            {/* Agent records grid */}
            <div key={activeKind} className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredAgents.map((record, i) => (
                <AgentCard key={record.id} record={record} index={i} />
              ))}
            </div>

            {/* Legend */}
            <div className="mt-5 flex flex-wrap gap-4 text-[11px]" style={{ color: '#555a72' }}>
              {[
                { color: '#4ade80', label: 'SUCCESS — 正常完了' },
                { color: '#f59e0b', label: 'PARTIAL — 一部制約あり' },
              ].map(({ color, label }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ background: color }} />
                  {label}
                </div>
              ))}
            </div>
          </section>

          {/* ══ About ═════════════════════════════════════════════════════════ */}
          <section id="about" className="px-8 py-10">
            <SectionHeader eyebrow="About" title="自己紹介" />

            <div className="max-w-2xl rounded-xl p-6" style={{ background: '#16181f', border: '1px solid #2a2d3e' }}>
              <div className="flex items-center gap-4 mb-5 pb-5" style={{ borderBottom: '1px solid #2a2d3e' }}>
                <div
                  aria-label="AI Developer avatar"
                  role="img"
                  className="w-12 h-12 rounded-full flex items-center justify-center text-xl shrink-0 select-none"
                  style={{ background: 'linear-gradient(135deg, #ff6b2b, #a855f7)' }}
                >
                  ⚡
                </div>
                <div>
                  <p className="font-bold text-[15px] mb-0.5" style={{ color: '#f0f2f8' }}>AI Developer</p>
                  <p className="text-[11px]" style={{ color: '#555a72', fontFamily: 'var(--font-mono)' }}>2026 · Japan</p>
                </div>
              </div>

              <p className="text-[13.5px] leading-[1.9] mb-5" style={{ color: '#9399b2' }}>
                AIツールを駆使してプロダクトを設計・構築することに取り組んでいます。
                NotebookLM・Manus・Claude Codeなど、各ツールの特性を活かした使い方を探求中。
              </p>

              <blockquote className="pl-4 text-[13px] leading-relaxed mb-5"
                style={{ color: '#9399b2', borderLeft: '2px solid rgba(0,212,255,0.4)', fontStyle: 'italic' }}>
                「アイデアを持つ人がAIで即座にプロダクトを作れる世界」を目指して。
              </blockquote>

              <div className="flex flex-wrap gap-2">
                {['Next.js', 'TypeScript', 'Claude Code', 'NotebookLM', 'Manus'].map((t) => (
                  <span key={t} className="tag-chip" style={{ fontSize: '10px' }}>{t}</span>
                ))}
              </div>
            </div>
          </section>

          {/* ══ Footer ════════════════════════════════════════════════════════ */}
          <footer className="px-8 py-5 flex items-center justify-between"
            style={{ borderTop: '1px solid #2a2d3e', color: '#555a72', fontSize: '10px', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em' }}>
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
