# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server at http://localhost:3000
npm run build    # Production build
npm run lint     # Run ESLint
npm start        # Serve production build
```

## Architecture

This is a **Next.js 16 App Router** project using TypeScript, Tailwind CSS v4, and React 19.

### Game: Puyo Puyo

A complete Puyo Puyo puzzle game. The architecture separates pure logic from React state:

- **`src/lib/puyoTypes.ts`** — All TypeScript types (`Board`, `Piece`, `GameState`, `GamePhase`, etc.)
- **`src/lib/puyoEngine.ts`** — Pure functions with no React dependencies: board creation, piece movement, rotation (with wall kicks), ghost piece, gravity, BFS group-finding, scoring, and drop interval calculation. Board is a `Cell[][]` (12 rows × 6 columns).
- **`src/hooks/usePuyoGame.ts`** — `useReducer`-based game state hook. Manages the game phase state machine (`idle → falling → clearing → falling…`), auto-fall interval, clearing animation timeout (550ms), and keyboard listeners. Exports action dispatchers.
- **`src/app/page.tsx`** — All UI components (no separate component files). Key helpers: `buildRenderBoard` merges board + current piece + ghost piece into a flat render grid; `PuyoCell` renders a single puyo with CSS radial-gradient, glow, and eye details; `ChainBadge` shows animated chain count.

### Game Loop State Machine

```
idle ──[START]──► falling ──[lands]──► clearing ──[550ms]──► (gravity+check)
                     ▲                                              │
                     └────────────[no more groups]─────────────────┘
                  gameover ◄──[spawn blocked]
```

### Tailwind v4

Uses `@import "tailwindcss"` in `globals.css` (not `@tailwind` directives). Custom animations (`.puyo-pop`, `.chain-badge`, `.board-flash`, `.fade-in`) are defined in `globals.css` with `@keyframes`.

---

## 要件定義 — ぷよぷよ

### 1. ゲームボード

| 項目 | 仕様 |
|---|---|
| サイズ | 6列 × 12行 |
| スポーン位置 | 列2（0-indexed）、行1（ピボット）／行0（コンパニオン） |
| セルサイズ | 40px × 40px |

### 2. ぷよ

- **色**: 赤・緑・青・黄・紫の5色（`PuyoColor`）
- **ピース構成**: ピボット（回転中心）＋コンパニオン（衛星）の2個1組
- **ゴーストピース**: 現在のピースが落下する最終位置を半透明で表示。現在位置と同じ場合は非表示

### 3. 操作仕様

| 操作 | キーボード | モバイルボタン |
|---|---|---|
| 左移動 | `←` | `◀` |
| 右移動 | `→` | `▶` |
| ソフトドロップ | `↓` | `⬇` |
| ハードドロップ | `↑` / `Space` | `⬆` |
| 時計回り回転 | `X` / `C` | `↻` |
| 反時計回り回転 | `Z` | `↺` |
| スタート／リスタート | `Enter` | スタートボタン |

- **壁キック**: 回転時にコンパニオンが壁外に出る場合、ピース全体を1列ずらして回転を成立させる
- **DAS（Delayed Auto Shift）**: ブラウザのネイティブキーリピートに依存

### 4. ゲームフロー（フェーズ遷移）

```
idle
 │ [START / RESTART]
 ▼
falling  ←──────────────────────────────────────────┐
 │ ピースが着地（落下不可）                           │
 ▼                                                   │
(placePiece) → processBoard                          │
                 │                                   │
                 ├─ applyGravity                     │
                 │                                   │
                 ├─ 消去可能グループなし → spawnPiece ─┘
                 │
                 └─ 消去可能グループあり
                       │
                       ▼
                    clearing（550ms アニメーション）
                       │ [CLEAR_DONE]
                       ▼
                    clearCells → processBoard（連鎖ループ）

falling フェーズでスポーン位置が塞がれている → gameover
```

### 5. 消去ルール

- 同色のぷよが **4個以上** 上下左右に連結した場合に消去
- 判定アルゴリズム: BFS（幅優先探索）で連結グループを列挙し、サイズ ≥ 4 のグループを対象とする
- 消去後: `applyGravity` で上部のぷよを下に詰め、再度グループ判定（連鎖）

### 6. スコアリング

```
得点 = 消去ぷよ数 × 10 × 2^(連鎖数 - 1)
```

| 連鎖数 | 4個消去時の得点 |
|---|---|
| 1連鎖 | 40 |
| 2連鎖 | 80 |
| 3連鎖 | 160 |
| N連鎖 | 40 × 2^(N-1) |

### 7. レベル・速度

- **レベルアップ条件**: 10ピース設置ごとに1レベル上昇
- **落下間隔**: `max(80ms, 700 - (level - 1) × 60ms)`

| レベル | 落下間隔 |
|---|---|
| 1 | 700ms |
| 2 | 640ms |
| 5 | 460ms |
| 10 | 200ms |
| 11以上 | 80ms（上限） |

### 8. ゲームオーバー

スポーン時にピボット位置（列2、行1）が既存のぷよで塞がれている場合にゲームオーバー。

### 9. UI / UX 要件

- **テーマ**: ダーク背景（サイバーパンク／ネオン）、グラスモーフィズムパネル
- **ぷよ外観**: 放射状グラデーション＋グロー＋目のディテール＋ハイライト
- **アニメーション**:
  - 消去時: `.puyo-pop`（スケールアップ→ゼロへ縮小、0.55s）
  - 連鎖2以上: `.chain-badge`（バウンスイン）＋ `.board-flash`（ボード全体フラッシュ）
  - オーバーレイ: `.fade-in`
- **表示情報**: スコア・レベル・消去数・最大連鎖数（左パネル）、NEXTピース・現在連鎖数（右パネル）
- **レスポンシブ**: モバイル向けのオンスクリーンコントロールボタンを常時表示
