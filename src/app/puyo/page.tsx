'use client';

import { useMemo, useRef, useEffect, useState } from 'react';
import { usePuyoGame } from '@/hooks/usePuyoGame';
import { BOARD_HEIGHT, BOARD_WIDTH, getGhostPiece } from '@/lib/puyoEngine';
import type { Cell, Piece, Position } from '@/lib/puyoTypes';

// ─── Color Config ───────────────────────────────────────────────────────────

const COLOR_MAP: Record<
  Exclude<Cell, 'empty'>,
  { gradient: string; glow: string; border: string }
> = {
  red: {
    gradient: 'radial-gradient(circle at 35% 30%, #ff9999 0%, #ff2222 50%, #aa0000 100%)',
    glow: '#ff3333',
    border: '#ff6666',
  },
  green: {
    gradient: 'radial-gradient(circle at 35% 30%, #99ffaa 0%, #22cc44 50%, #007722 100%)',
    glow: '#33ee55',
    border: '#66ff88',
  },
  blue: {
    gradient: 'radial-gradient(circle at 35% 30%, #99bbff 0%, #2255ff 50%, #001199 100%)',
    glow: '#4477ff',
    border: '#6699ff',
  },
  yellow: {
    gradient: 'radial-gradient(circle at 35% 30%, #ffff99 0%, #ffcc00 50%, #996600 100%)',
    glow: '#ffdd00',
    border: '#ffee66',
  },
  purple: {
    gradient: 'radial-gradient(circle at 35% 30%, #dd99ff 0%, #9922ff 50%, #550099 100%)',
    glow: '#aa44ff',
    border: '#cc77ff',
  },
};

const CELL_SIZE = 40;

// ─── Puyo Cell ───────────────────────────────────────────────────────────────

function PuyoCell({
  color,
  isGhost = false,
  isClearing = false,
  size = CELL_SIZE - 2,
}: {
  color: Exclude<Cell, 'empty'>;
  isGhost?: boolean;
  isClearing?: boolean;
  size?: number;
}) {
  const cfg = COLOR_MAP[color];

  return (
    <div
      className={isClearing ? 'puyo-pop' : ''}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: isGhost ? `radial-gradient(circle at 35% 30%, ${cfg.glow}55, ${cfg.glow}22)` : cfg.gradient,
        boxShadow: isGhost
          ? `0 0 6px ${cfg.glow}44`
          : `0 0 14px ${cfg.glow}99, 0 0 4px ${cfg.glow}cc, inset 0 2px 0 rgba(255,255,255,0.35)`,
        border: isGhost ? `1px solid ${cfg.border}55` : `1.5px solid ${cfg.border}`,
        opacity: isGhost ? 0.4 : 1,
        position: 'relative',
        flexShrink: 0,
      }}
    >
      {!isGhost && (
        <>
          {/* Left eye */}
          <div
            style={{
              position: 'absolute',
              top: '20%',
              left: '16%',
              width: '24%',
              height: '30%',
              background: 'white',
              borderRadius: '50%',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                bottom: '8%',
                right: '8%',
                width: '58%',
                height: '58%',
                background: '#111',
                borderRadius: '50%',
              }}
            />
          </div>
          {/* Right eye */}
          <div
            style={{
              position: 'absolute',
              top: '20%',
              right: '16%',
              width: '24%',
              height: '30%',
              background: 'white',
              borderRadius: '50%',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                bottom: '8%',
                right: '8%',
                width: '58%',
                height: '58%',
                background: '#111',
                borderRadius: '50%',
              }}
            />
          </div>
          {/* Shine */}
          <div
            style={{
              position: 'absolute',
              top: '7%',
              left: '10%',
              width: '30%',
              height: '30%',
              background: 'rgba(255,255,255,0.5)',
              borderRadius: '50%',
            }}
          />
        </>
      )}
    </div>
  );
}

// ─── Render Cell ─────────────────────────────────────────────────────────────

interface RenderCell {
  color: Cell;
  isGhost: boolean;
  isClearing: boolean;
}

function buildRenderBoard(
  board: Cell[][],
  currentPiece: Piece | null,
  clearingCells: Position[],
  phase: string
): RenderCell[][] {
  const grid: RenderCell[][] = board.map(row =>
    row.map(color => ({ color, isGhost: false, isClearing: false }))
  );

  // Mark clearing cells
  for (const { x, y } of clearingCells) {
    if (y >= 0 && y < BOARD_HEIGHT) {
      grid[y][x].isClearing = true;
    }
  }

  if (currentPiece && phase === 'falling') {
    const ghost = getGhostPiece(board, currentPiece);
    const isGhostDifferent = ghost.pivot.y !== currentPiece.pivot.y;

    const setCell = (pos: Position, color: Cell, isGhost: boolean) => {
      if (pos.y >= 0 && pos.y < BOARD_HEIGHT) {
        grid[pos.y][pos.x] = { color, isGhost, isClearing: false };
      }
    };

    if (isGhostDifferent) {
      setCell(ghost.pivot, currentPiece.pivotColor, true);
      setCell(ghost.companion, currentPiece.companionColor, true);
    }

    setCell(currentPiece.pivot, currentPiece.pivotColor, false);
    setCell(currentPiece.companion, currentPiece.companionColor, false);
  }

  return grid;
}

// ─── Game Board ───────────────────────────────────────────────────────────────

function GameBoard({
  renderBoard,
  isFlashing,
}: {
  renderBoard: RenderCell[][];
  isFlashing: boolean;
}) {
  return (
    <div
      className={`scanlines relative ${isFlashing ? 'board-flash' : ''}`}
      style={{
        width: CELL_SIZE * BOARD_WIDTH,
        height: CELL_SIZE * BOARD_HEIGHT,
        background: 'rgba(8, 8, 28, 0.85)',
        border: '1px solid rgba(120,100,255,0.25)',
        borderRadius: 8,
        boxShadow: '0 0 40px rgba(80,50,200,0.2), inset 0 0 0 1px rgba(255,255,255,0.04)',
        backdropFilter: 'blur(8px)',
        display: 'grid',
        gridTemplateColumns: `repeat(${BOARD_WIDTH}, ${CELL_SIZE}px)`,
        gridTemplateRows: `repeat(${BOARD_HEIGHT}, ${CELL_SIZE}px)`,
      }}
    >
      {renderBoard.flat().map((cell, idx) => (
        <div
          key={idx}
          style={{
            width: CELL_SIZE,
            height: CELL_SIZE,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRight: (idx % BOARD_WIDTH) < BOARD_WIDTH - 1 ? '1px solid rgba(255,255,255,0.025)' : undefined,
            borderBottom: Math.floor(idx / BOARD_WIDTH) < BOARD_HEIGHT - 1 ? '1px solid rgba(255,255,255,0.025)' : undefined,
          }}
        >
          {cell.color !== 'empty' && (
            <PuyoCell
              color={cell.color as Exclude<Cell, 'empty'>}
              isGhost={cell.isGhost}
              isClearing={cell.isClearing}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Next Piece Preview ───────────────────────────────────────────────────────

function NextPiecePreview({ piece }: { piece: Piece }) {
  const size = 30;
  return (
    <div style={{ position: 'relative', width: size * 2, height: size * 3 }}>
      <div style={{ position: 'absolute', top: 0, left: size / 2 }}>
        <PuyoCell color={piece.companionColor} size={size - 2} />
      </div>
      <div style={{ position: 'absolute', top: size, left: size / 2 }}>
        <PuyoCell color={piece.pivotColor} size={size - 2} />
      </div>
    </div>
  );
}

// ─── Glass Panel ─────────────────────────────────────────────────────────────

function GlassPanel({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={className}
      style={{
        background: 'rgba(15, 12, 40, 0.75)',
        border: '1px solid rgba(160,120,255,0.2)',
        borderRadius: 12,
        backdropFilter: 'blur(12px)',
        boxShadow: '0 4px 32px rgba(80,40,160,0.15), inset 0 1px 0 rgba(255,255,255,0.07)',
        padding: '16px 20px',
      }}
    >
      {children}
    </div>
  );
}

// ─── Label / Value ────────────────────────────────────────────────────────────

function StatRow({ label, value, accent = false }: { label: string; value: string | number; accent?: boolean }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: '0.15em',
          color: 'rgba(180,160,255,0.6)',
          textTransform: 'uppercase',
          marginBottom: 2,
          fontFamily: 'var(--font-geist-mono)',
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: accent ? 28 : 22,
          fontWeight: 800,
          color: accent ? '#c084fc' : '#e0d0ff',
          fontFamily: 'var(--font-geist-mono)',
          textShadow: accent ? '0 0 20px rgba(192,132,252,0.6)' : 'none',
          lineHeight: 1,
        }}
      >
        {value}
      </div>
    </div>
  );
}

// ─── Chain Badge ─────────────────────────────────────────────────────────────

function ChainBadge({ chain }: { chain: number }) {
  if (chain < 2) return null;

  const colors = ['', '', '#facc15', '#fb923c', '#f87171', '#c084fc', '#60a5fa', '#34d399'];
  const color = colors[Math.min(chain, 7)] ?? '#fff';

  return (
    <div
      key={chain}
      className="chain-badge"
      style={{
        textAlign: 'center',
        padding: '8px 14px',
        background: `${color}22`,
        border: `1.5px solid ${color}88`,
        borderRadius: 10,
        marginBottom: 8,
      }}
    >
      <div style={{ fontSize: 9, letterSpacing: '0.2em', color: `${color}aa`, fontWeight: 700, fontFamily: 'var(--font-geist-mono)' }}>
        連鎖
      </div>
      <div style={{ fontSize: 30, fontWeight: 900, color, lineHeight: 1, textShadow: `0 0 20px ${color}` }}>
        {chain}
      </div>
    </div>
  );
}

// ─── Mobile Controls ─────────────────────────────────────────────────────────

function MobileBtn({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <button
      onPointerDown={(e) => {
        e.preventDefault();
        onPress();
      }}
      style={{
        width: 52,
        height: 52,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(120,80,255,0.18)',
        border: '1px solid rgba(180,140,255,0.3)',
        borderRadius: 10,
        color: 'rgba(220,200,255,0.9)',
        fontSize: 20,
        cursor: 'pointer',
        WebkitTapHighlightColor: 'transparent',
        userSelect: 'none',
        touchAction: 'none',
        transition: 'background 0.1s',
      }}
    >
      {label}
    </button>
  );
}

// ─── Overlay ─────────────────────────────────────────────────────────────────

function GameOverlay({
  phase,
  score,
  maxChain,
  onStart,
  onRestart,
}: {
  phase: string;
  score: number;
  maxChain: number;
  onStart: () => void;
  onRestart: () => void;
}) {
  if (phase !== 'idle' && phase !== 'gameover') return null;

  const isGameOver = phase === 'gameover';

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(5,5,20,0.88)',
        borderRadius: 8,
        backdropFilter: 'blur(4px)',
        zIndex: 10,
      }}
    >
      <div className="fade-in" style={{ textAlign: 'center' }}>
        {isGameOver ? (
          <>
            <div
              style={{
                fontSize: 32,
                fontWeight: 900,
                color: '#f87171',
                textShadow: '0 0 30px rgba(248,113,113,0.8)',
                marginBottom: 8,
                letterSpacing: '0.05em',
              }}
            >
              ゲームオーバー
            </div>
            <div style={{ fontSize: 13, color: 'rgba(200,180,255,0.6)', marginBottom: 20 }}>
              スコア：<span style={{ color: '#c084fc', fontWeight: 700 }}>{score.toLocaleString()}</span>
              {'  '}|{'  '}
              最大連鎖：<span style={{ color: '#facc15', fontWeight: 700 }}>{maxChain}</span>
            </div>
          </>
        ) : (
          <>
            <div
              style={{
                fontSize: 42,
                fontWeight: 900,
                background: 'linear-gradient(135deg, #c084fc, #60a5fa, #34d399)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '0.1em',
                marginBottom: 6,
                lineHeight: 1.1,
              }}
            >
              ぷよぷよ
            </div>
            <div style={{ fontSize: 12, color: 'rgba(180,160,255,0.5)', marginBottom: 24, letterSpacing: '0.1em' }}>
              連鎖パズルゲーム
            </div>
          </>
        )}

        <button
          onClick={isGameOver ? onRestart : onStart}
          style={{
            padding: '12px 36px',
            background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
            border: '1px solid rgba(167,139,250,0.5)',
            borderRadius: 50,
            color: 'white',
            fontWeight: 700,
            fontSize: 15,
            letterSpacing: '0.08em',
            cursor: 'pointer',
            boxShadow: '0 0 24px rgba(124,58,237,0.5)',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 0 40px rgba(124,58,237,0.8)')}
          onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 0 24px rgba(124,58,237,0.5)')}
        >
          {isGameOver ? 'もう一度' : 'ゲームスタート'}
        </button>

        <div
          style={{
            marginTop: 20,
            fontSize: 10,
            color: 'rgba(180,160,255,0.35)',
            letterSpacing: '0.1em',
            lineHeight: 1.8,
            fontFamily: 'var(--font-geist-mono)',
          }}
        >
          ← → 移動{'  '} ↓ ソフトドロップ{'  '} ↑/SPC ハードドロップ
          <br />
          Z 左回転{'  '} X 右回転
        </div>
      </div>
    </div>
  );
}

// ─── Main Game ────────────────────────────────────────────────────────────────

export default function PuyoPuyoPage() {
  const { state, start, restart, moveLeft, moveRight, moveDown, hardDrop, rotateCW, rotateCCW } =
    usePuyoGame();

  const [isFlashing, setIsFlashing] = useState(false);
  const prevChainRef = useRef(0);
  const [scoreAnimKey, setScoreAnimKey] = useState(0);
  const prevScoreRef = useRef(0);

  // Trigger board flash on chain
  useEffect(() => {
    if (state.chain > 1 && state.chain !== prevChainRef.current) {
      prevChainRef.current = state.chain;
      setIsFlashing(true);
      const id = setTimeout(() => setIsFlashing(false), 600);
      return () => clearTimeout(id);
    }
  }, [state.chain]);

  // Trigger score bump animation on score change
  useEffect(() => {
    if (state.score !== prevScoreRef.current) {
      prevScoreRef.current = state.score;
      setScoreAnimKey(k => k + 1);
    }
  }, [state.score]);

  const renderBoard = useMemo(
    () => buildRenderBoard(state.board, state.currentPiece, state.clearingCells, state.phase),
    [state.board, state.currentPiece, state.clearingCells, state.phase]
  );

  return (
    <div
      className="animated-bg"
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        gap: 16,
      }}
    >
      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: 4 }}>
        <h1
          style={{
            fontSize: 22,
            fontWeight: 900,
            background: 'linear-gradient(135deg, #c084fc 0%, #818cf8 50%, #38bdf8 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
          }}
        >
          ぷよぷよ
        </h1>
      </div>

      {/* Game Layout */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        {/* Left Panel */}
        <GlassPanel>
          <div style={{ width: 120 }}>
            <div key={scoreAnimKey} className="score-bump">
              <StatRow label="スコア" value={state.score.toLocaleString()} accent />
            </div>
            <StatRow label="レベル" value={String(state.level).padStart(2, '0')} />
            <StatRow label="消去数" value={state.totalCleared} />
            <StatRow label="最大連鎖" value={state.maxChain} />
          </div>
        </GlassPanel>

        {/* Board */}
        <div style={{ position: 'relative' }}>
          <GameBoard renderBoard={renderBoard} isFlashing={isFlashing} />
          <GameOverlay
            phase={state.phase}
            score={state.score}
            maxChain={state.maxChain}
            onStart={start}
            onRestart={restart}
          />
        </div>

        {/* Right Panel */}
        <GlassPanel>
          <div style={{ width: 90, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.15em',
                color: 'rgba(180,160,255,0.6)',
                textTransform: 'uppercase',
                marginBottom: 12,
                fontFamily: 'var(--font-geist-mono)',
              }}
            >
              ネクスト
            </div>
            <div style={{ marginBottom: 20 }}>
              <NextPiecePreview piece={state.nextPiece} />
            </div>

            <div style={{ width: '100%', marginTop: 8 }}>
              {state.phase === 'clearing' && <ChainBadge chain={state.chain} />}
              {state.phase === 'falling' && state.chain > 0 && (
                <div
                  style={{
                    textAlign: 'center',
                    fontSize: 11,
                    color: 'rgba(180,160,255,0.4)',
                    fontFamily: 'var(--font-geist-mono)',
                  }}
                >
                  {state.chain}連鎖
                </div>
              )}
            </div>
          </div>
        </GlassPanel>
      </div>

      {/* Mobile Controls */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          alignItems: 'center',
          marginTop: 8,
        }}
      >
        {/* Rotate row */}
        <div style={{ display: 'flex', gap: 8 }}>
          <MobileBtn label="↺" onPress={rotateCCW} />
          <MobileBtn label="⬆" onPress={hardDrop} />
          <MobileBtn label="↻" onPress={rotateCW} />
        </div>
        {/* Move row */}
        <div style={{ display: 'flex', gap: 8 }}>
          <MobileBtn label="◀" onPress={moveLeft} />
          <MobileBtn label="⬇" onPress={moveDown} />
          <MobileBtn label="▶" onPress={moveRight} />
        </div>
      </div>
    </div>
  );
}
