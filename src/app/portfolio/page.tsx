import Image from "next/image";

const works = [
  {
    id: 1,
    title: "ぴよぴよAIマーケスクール",
    description: "NotebookLMを使って作成したAI×Webマーケティングスクールのランディングページ。未経験者向けに「やさしいAIで未来をひらく」をテーマに設計。",
    image: "/work-piyopiyo.png",
    tool: "NotebookLM",
    tags: ["LP", "マーケ", "かわいい系"],
    accent: "#a855f7",
  },
  {
    id: 2,
    title: "テトリスゲーム",
    description: "ManusでゼロからビルドしたWebテトリス。スマホ操作（タップ回転・スワイプ移動）にも対応したダーク系ゲームアプリ。",
    image: "/work-tetris.png",
    tool: "Manus",
    tags: ["ゲーム", "ダーク系", "レスポンシブ"],
    accent: "#00f5ff",
  },
];

export default function Portfolio() {
  return (
    <main className="min-h-screen bg-[#080c14] text-white relative overflow-hidden">
      {/* Grid background */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(#00f5ff 1px, transparent 1px), linear-gradient(90deg, #00f5ff 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center justify-center pt-24 pb-16 px-4 text-center">
        <p className="text-xs tracking-[0.4em] text-[#00f5ff] uppercase mb-4 font-mono">
          AI WORKS PORTFOLIO
        </p>
        <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-[#00f5ff] via-white to-[#a855f7] bg-clip-text text-transparent leading-tight">
          AIで作ったものたちを、<br className="hidden md:block" />ここに。
        </h1>
        <p className="text-white/50 text-sm md:text-base max-w-md">
          各種AIツールを使って0から構築したプロダクトのショーケースです
        </p>
      </section>

      {/* Works */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {works.map((work) => (
            <article
              key={work.id}
              className="group rounded-2xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-md hover:border-white/30 transition-all duration-300"
              style={{ boxShadow: `0 0 0 0 ${work.accent}` }}
            >
              {/* Screenshot */}
              <div className="relative overflow-hidden aspect-video bg-black/30">
                <Image
                  src={work.image}
                  alt={work.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {/* Tool badge */}
                <span
                  className="absolute top-3 right-3 text-[10px] font-mono px-2 py-1 rounded-full border"
                  style={{
                    color: work.accent,
                    borderColor: work.accent,
                    background: `${work.accent}18`,
                  }}
                >
                  {work.tool}
                </span>
              </div>

              {/* Content */}
              <div className="p-5">
                <h2 className="text-lg font-bold mb-2">{work.title}</h2>
                <p className="text-white/50 text-sm leading-relaxed mb-4">
                  {work.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {work.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[11px] px-2 py-0.5 rounded-full bg-white/10 text-white/60"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 text-center pb-8 text-white/20 text-xs font-mono">
        built with AI
      </footer>
    </main>
  );
}
