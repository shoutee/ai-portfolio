export type PuyoColor = 'red' | 'green' | 'blue' | 'yellow' | 'purple';
export type Cell = PuyoColor | 'empty';
export type Board = Cell[][];

export interface Position {
  x: number;
  y: number;
}

export interface Piece {
  pivot: Position;
  companion: Position;
  pivotColor: PuyoColor;
  companionColor: PuyoColor;
}

export type GamePhase = 'idle' | 'falling' | 'clearing' | 'gameover';

export interface GameState {
  board: Board;
  currentPiece: Piece | null;
  nextPiece: Piece;
  score: number;
  level: number;
  piecesPlaced: number;
  chain: number;
  phase: GamePhase;
  clearingCells: Position[];
  totalCleared: number;
  maxChain: number;
}
