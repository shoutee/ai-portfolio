import type { Board, Cell, Piece, PuyoColor, Position } from './puyoTypes';

export const BOARD_WIDTH = 6;
export const BOARD_HEIGHT = 12;
export const COLORS: PuyoColor[] = ['red', 'green', 'blue', 'yellow', 'purple'];
export const SPAWN_COL = 2;
export const SPAWN_ROW = 1;

export function createEmptyBoard(): Board {
  return Array.from({ length: BOARD_HEIGHT }, () =>
    Array(BOARD_WIDTH).fill('empty' as Cell)
  );
}

export function randomColor(): PuyoColor {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}

export function createPiece(): Piece {
  return {
    pivot: { x: SPAWN_COL, y: SPAWN_ROW },
    companion: { x: SPAWN_COL, y: SPAWN_ROW - 1 },
    pivotColor: randomColor(),
    companionColor: randomColor(),
  };
}

export function canPieceMove(board: Board, piece: Piece, dx: number, dy: number): boolean {
  const np = { x: piece.pivot.x + dx, y: piece.pivot.y + dy };
  const nc = { x: piece.companion.x + dx, y: piece.companion.y + dy };

  if (np.x < 0 || np.x >= BOARD_WIDTH || np.y < 0 || np.y >= BOARD_HEIGHT) return false;
  if (nc.x < 0 || nc.x >= BOARD_WIDTH || nc.y >= BOARD_HEIGHT) return false;
  if (board[np.y][np.x] !== 'empty') return false;
  if (nc.y >= 0 && board[nc.y][nc.x] !== 'empty') return false;

  return true;
}

export function movePiece(piece: Piece, dx: number, dy: number): Piece {
  return {
    ...piece,
    pivot: { x: piece.pivot.x + dx, y: piece.pivot.y + dy },
    companion: { x: piece.companion.x + dx, y: piece.companion.y + dy },
  };
}

export function rotatePiece(board: Board, piece: Piece, dir: 1 | -1): Piece {
  const dx = piece.companion.x - piece.pivot.x;
  const dy = piece.companion.y - piece.pivot.y;

  // clockwise: (dx,dy) → (-dy,dx); counter-clockwise: (dx,dy) → (dy,-dx)
  const newDx = dir === 1 ? -dy : dy;
  const newDy = dir === 1 ? dx : -dx;

  let rotated: Piece = {
    ...piece,
    companion: { x: piece.pivot.x + newDx, y: piece.pivot.y + newDy },
  };

  // Wall kick
  if (rotated.companion.x < 0) rotated = movePiece(rotated, 1, 0);
  else if (rotated.companion.x >= BOARD_WIDTH) rotated = movePiece(rotated, -1, 0);

  const { pivot: p, companion: c } = rotated;
  const pivotOk =
    p.x >= 0 && p.x < BOARD_WIDTH &&
    p.y >= 0 && p.y < BOARD_HEIGHT &&
    board[p.y][p.x] === 'empty';
  const compOk =
    c.x >= 0 && c.x < BOARD_WIDTH &&
    c.y < BOARD_HEIGHT &&
    (c.y < 0 || board[c.y][c.x] === 'empty');

  return pivotOk && compOk ? rotated : piece;
}

export function getGhostPiece(board: Board, piece: Piece): Piece {
  let ghost = piece;
  while (canPieceMove(board, ghost, 0, 1)) {
    ghost = movePiece(ghost, 0, 1);
  }
  return ghost;
}

export function placePiece(board: Board, piece: Piece): Board {
  const b = board.map(row => [...row]);
  const { pivot, companion, pivotColor, companionColor } = piece;
  if (pivot.y >= 0 && pivot.y < BOARD_HEIGHT) b[pivot.y][pivot.x] = pivotColor;
  if (companion.y >= 0 && companion.y < BOARD_HEIGHT) b[companion.y][companion.x] = companionColor;
  return b;
}

export function applyGravity(board: Board): Board {
  const result = createEmptyBoard();
  for (let col = 0; col < BOARD_WIDTH; col++) {
    let writeRow = BOARD_HEIGHT - 1;
    for (let row = BOARD_HEIGHT - 1; row >= 0; row--) {
      if (board[row][col] !== 'empty') {
        result[writeRow--][col] = board[row][col];
      }
    }
  }
  return result;
}

export function findClearableCells(board: Board): Position[] {
  const visited = new Uint8Array(BOARD_HEIGHT * BOARD_WIDTH);
  const clearable: Position[] = [];

  for (let row = 0; row < BOARD_HEIGHT; row++) {
    for (let col = 0; col < BOARD_WIDTH; col++) {
      const idx = row * BOARD_WIDTH + col;
      const color = board[row][col];
      if (color === 'empty' || visited[idx]) continue;

      const group: Position[] = [];
      const queue: Position[] = [{ x: col, y: row }];
      visited[idx] = 1;

      while (queue.length > 0) {
        const pos = queue.shift()!;
        group.push(pos);
        for (const [ddx, ddy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
          const nx = pos.x + ddx, ny = pos.y + ddy;
          if (nx < 0 || nx >= BOARD_WIDTH || ny < 0 || ny >= BOARD_HEIGHT) continue;
          const nIdx = ny * BOARD_WIDTH + nx;
          if (!visited[nIdx] && board[ny][nx] === color) {
            visited[nIdx] = 1;
            queue.push({ x: nx, y: ny });
          }
        }
      }

      if (group.length >= 4) clearable.push(...group);
    }
  }

  return clearable;
}

export function clearCells(board: Board, cells: Position[]): Board {
  const b = board.map(row => [...row]);
  for (const { x, y } of cells) b[y][x] = 'empty';
  return b;
}

export function calculateScore(cleared: number, chain: number): number {
  return cleared * 10 * Math.pow(2, chain - 1);
}

export function getDropInterval(level: number): number {
  return Math.max(80, 700 - (level - 1) * 60);
}
