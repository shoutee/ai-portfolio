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
  external?: boolean;
}

interface Tool {
  name: string;
  icon: string;
  desc: string;
  color: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

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
    accent: '#00f5ff',
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
    color: '#00f5ff',
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
      { threshold: 0.12 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const style: React.CSSProperties = {
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0)' : 'translateY(28px)',
    transition: `opacity 0.65s ease ${delay}s, transform 0.65s ease ${delay}s`,
  };

  return { ref, style };
}

// ── Component: SectionEyebrow ─────────────────────────────────────────────────
function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-mono tracking-[0.45em] text-[#00f5ff] uppercase mb-3">
      {children}
    </p>
  );
}

// ── Component: WorkCard ───────────────────────────────────────────────────────
function WorkCard({ work, index }: { work: Work; index: number }) {
  const { ref, style } = useReveal<HTMLElement>(index * 0.12);

  const inner = (
    <article
      ref={ref}
      style={style}
      className="group rounded-2xl overflow-hidden border border-white/10 bg-white/[0.04] backdrop-blur-md
                 hover:border-white/25 hover:bg-white/[0.07] transition-all duration-500 h-full"
    >
      {/* Image */}
      <div className="relative overflow-hidden" style={{ aspectRatio: '16/9' }}>
        <div className="absolute inset-0 bg-black/25 z-10" />
        <Image
          src={`${BASE}${work.image}`}
          alt={work.title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          unoptimized
        />
        {/* Tool badge */}
        <span
          className="absolute top-3 right-3 z-20 text-[10px] font-mono px-2.5 py-0.5 rounded-full border"
          style={{
            color: work.accent,
            borderColor: `${work.accent}70`,
            background: `${work.accent}18`,
          }}
        >
          {work.tool}
        </span>
        {/* Live badge */}
        {work.href && (
          <span className="absolute top-3 left-3 z-20 flex items-center gap-1.5 text-[10px] font-mono text-white/50">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            LIVE
          </span>
        )}
      </div>

      {/* Body */}
      <div className="p-5">
        <h3 className="font-bold text-white mb-2 leading-snug">{work.title}</h3>
        <p className="text-white/45 text-[13px] leading-relaxed mb-4">{work.description}</p>
        <div className="flex flex-wrap gap-1.5">
          {work.tags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/8 text-white/45"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </article>
  );

  if (work.href) {
    return (
      <Link href={work.href} className="block h-full">
        {inner}
      </Link>
    );
  }
  return inner;
}

// ── Component: ToolCard ───────────────────────────────────────────────────────
function ToolCard({ tool, index }: { tool: Tool; index: number }) {
  const { ref, style } = useReveal<HTMLDivElement>(index * 0.1);

  return (
    <div
      ref={ref}
      style={style}
      className="rounded-xl border border-white/10 bg-white/[0.04] backdrop-blur-sm p-5
                 hover:border-white/20 hover:bg-white/[0.07] transition-all duration-400"
    >
      <div className="flex items-center gap-3 mb-3">
        <span className="text-2xl leading-none">{tool.icon}</span>
        <span className="font-mono font-semibold text-sm" style={{ color: tool.color }}>
          {tool.name}
        </span>
      </div>
      <p className="text-white/45 text-[13px] leading-relaxed">{tool.desc}</p>
    </div>
  );
}

// ── Component: Nav ────────────────────────────────────────────────────────────
function Nav({ scrolled }: { scrolled: boolean }) {
  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-400"
      style={{
        background: scrolled ? 'rgba(8,12,20,0.88)' : 'transparent',
        backdropFilter: scrolled ? 'blur(14px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent',
      }}
    >
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
        <span className="text-[10px] font-mono tracking-[0.3em] text-white/30 uppercase">
          Portfolio
        </span>
        <div className="flex items-center gap-7">
          {[
            { id: 'works', label: 'Works' },
            { id: 'tools', label: 'Tools' },
            { id: 'about', label: 'About' },
          ].map(({ id, label }) => (
            <a
              key={id}
              href={`#${id}`}
              className="text-[11px] font-mono tracking-widest text-white/35
                         hover:text-[#00f5ff] transition-colors duration-200 uppercase"
            >
              {label}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function Home() {
  const [scrolled, setScrolled] = useState(false);

  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 48);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return (
    <div className="min-h-screen bg-[#080c14] text-white overflow-x-hidden">
      {/* ── Cyber grid background ── */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          backgroundImage:
            'linear-gradient(rgba(0,245,255,0.035) 1px, transparent 1px),' +
            'linear-gradient(90deg, rgba(0,245,255,0.035) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* ── Nav ── */}
      <Nav scrolled={scrolled} />

      {/* ── Hero ── */}
      <section className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 text-center">
        {/* Radial glow */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(0,245,255,0.06) 0%, transparent 70%),' +
              'radial-gradient(ellipse 60% 50% at 50% 60%, rgba(168,85,247,0.05) 0%, transparent 70%)',
          }}
        />

        <SectionEyebrow>AI Developer Portfolio</SectionEyebrow>

        <h1
          className="text-5xl sm:text-6xl md:text-7xl font-bold mb-6 leading-[1.1] tracking-tight"
          style={{
            background: 'linear-gradient(100deg, #00f5ff 0%, #ffffff 50%, #a855f7 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Build with AI.
          <br />
          Ship to the world.
        </h1>

        <p className="text-white/40 text-sm sm:text-base max-w-md mb-12 leading-relaxed">
          各種AIツールを使って0から構築したプロダクトのショーケース。
          <br className="hidden sm:block" />
          アイデアから実装・デプロイまで、AIと二人三脚で。
        </p>

        {/* CTA */}
        <a
          href="#works"
          className="group flex flex-col items-center gap-2 text-white/25 hover:text-[#00f5ff] transition-colors duration-300"
        >
          <span className="text-[10px] font-mono tracking-[0.4em] uppercase">Scroll</span>
          <span className="text-xl animate-bounce">↓</span>
        </a>
      </section>

      {/* ── Works ── */}
      <section id="works" className="relative z-10 max-w-5xl mx-auto px-6 pb-32">
        <SectionEyebrow>Works</SectionEyebrow>
        <h2 className="text-3xl font-bold text-white mb-10">作品</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {WORKS.map((work, i) => (
            <WorkCard key={work.id} work={work} index={i} />
          ))}
        </div>
      </section>

      {/* ── Tools ── */}
      <section id="tools" className="relative z-10 max-w-5xl mx-auto px-6 pb-32">
        <SectionEyebrow>Tools</SectionEyebrow>
        <h2 className="text-3xl font-bold text-white mb-10">使用AIツール</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {TOOLS.map((tool, i) => (
            <ToolCard key={tool.name} tool={tool} index={i} />
          ))}
        </div>
      </section>

      {/* ── About ── */}
      <section id="about" className="relative z-10 max-w-5xl mx-auto px-6 pb-32">
        <SectionEyebrow>About</SectionEyebrow>
        <h2 className="text-3xl font-bold text-white mb-10">について</h2>
        <div className="max-w-2xl rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-md p-8">
          <p className="text-white/55 text-[15px] leading-[1.85] mb-5">
            AIツールを駆使してプロダクトを設計・構築することに取り組んでいます。
            NotebookLM・Manus・Claude Codeなど、各ツールの特性を活かした使い方を探求中。
          </p>
          <p className="text-white/30 text-sm leading-relaxed font-mono border-l-2 border-[#00f5ff]/30 pl-4">
            「アイデアを持つ人がAIで即座にプロダクトを作れる世界」を目指して。
          </p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="relative z-10 text-center pb-10 text-white/15 text-[11px] font-mono tracking-[0.35em] uppercase">
        Built with AI — 2026
      </footer>
    </div>
  );
}
