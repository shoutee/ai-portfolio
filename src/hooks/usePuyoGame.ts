'use client';

import { useEffect, useReducer, useRef } from 'react';
import {
  applyGravity,
  calculateScore,
  canPieceMove,
  clearCells,
  createEmptyBoard,
  createPiece,
  findClearableCells,
  getDropInterval,
  movePiece,
  placePiece,
  rotatePiece,
} from '@/lib/puyoEngine';
import type { GameState } from '@/lib/puyoTypes';

type Action =
  | { type: 'START' }
  | { type: 'RESTART' }
  | { type: 'MOVE_LEFT' }
  | { type: 'MOVE_RIGHT' }
  | { type: 'MOVE_DOWN' }
  | { type: 'HARD_DROP' }
  | { type: 'ROTATE_CW' }
  | { type: 'ROTATE_CCW' }
  | { type: 'TICK' }
  | { type: 'CLEAR_DONE' };

function getInitialState(): GameState {
  return {
    board: createEmptyBoard(),
    currentPiece: null,
    nextPiece: createPiece(),
    score: 0,
    level: 1,
    piecesPlaced: 0,
    chain: 0,
    phase: 'idle',
    clearingCells: [],
    totalCleared: 0,
    maxChain: 0,
  };
}

function spawnPiece(state: GameState): GameState {
  const piece = state.nextPiece;
  const board = state.board;

  if (board[piece.pivot.y]?.[piece.pivot.x] !== 'empty') {
    return { ...state, phase: 'gameover', currentPiece: null };
  }
  if (piece.companion.y >= 0 && board[piece.companion.y]?.[piece.companion.x] !== 'empty') {
    return { ...state, phase: 'gameover', currentPiece: null };
  }

  return {
    ...state,
    currentPiece: piece,
    nextPiece: createPiece(),
    phase: 'falling',
    chain: 0,
  };
}

function processBoard(state: GameState): GameState {
  const afterGravity = applyGravity(state.board);
  const clearable = findClearableCells(afterGravity);

  if (clearable.length === 0) {
    const newPiecesPlaced = state.piecesPlaced + 1;
    const newLevel = Math.floor(newPiecesPlaced / 10) + 1;
    return spawnPiece({ ...state, board: afterGravity, piecesPlaced: newPiecesPlaced, level: newLevel });
  }

  const newChain = state.chain + 1;
  return {
    ...state,
    board: afterGravity,
    clearingCells: clearable,
    chain: newChain,
    score: state.score + calculateScore(clearable.length, newChain),
    totalCleared: state.totalCleared + clearable.length,
    maxChain: Math.max(state.maxChain, newChain),
    phase: 'clearing',
  };
}

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'START':
    case 'RESTART': {
      return spawnPiece({ ...getInitialState(), nextPiece: createPiece() });
    }

    case 'MOVE_LEFT': {
      if (state.phase !== 'falling' || !state.currentPiece) return state;
      if (!canPieceMove(state.board, state.currentPiece, -1, 0)) return state;
      return { ...state, currentPiece: movePiece(state.currentPiece, -1, 0) };
    }

    case 'MOVE_RIGHT': {
      if (state.phase !== 'falling' || !state.currentPiece) return state;
      if (!canPieceMove(state.board, state.currentPiece, 1, 0)) return state;
      return { ...state, currentPiece: movePiece(state.currentPiece, 1, 0) };
    }

    case 'MOVE_DOWN':
    case 'TICK': {
      if (state.phase !== 'falling' || !state.currentPiece) return state;
      if (canPieceMove(state.board, state.currentPiece, 0, 1)) {
        return { ...state, currentPiece: movePiece(state.currentPiece, 0, 1) };
      }
      const placed = placePiece(state.board, state.currentPiece);
      return processBoard({ ...state, board: placed, currentPiece: null });
    }

    case 'HARD_DROP': {
      if (state.phase !== 'falling' || !state.currentPiece) return state;
      let piece = state.currentPiece;
      while (canPieceMove(state.board, piece, 0, 1)) {
        piece = movePiece(piece, 0, 1);
      }
      const placed = placePiece(state.board, piece);
      return processBoard({ ...state, board: placed, currentPiece: null });
    }

    case 'ROTATE_CW': {
      if (state.phase !== 'falling' || !state.currentPiece) return state;
      return { ...state, currentPiece: rotatePiece(state.board, state.currentPiece, 1) };
    }

    case 'ROTATE_CCW': {
      if (state.phase !== 'falling' || !state.currentPiece) return state;
      return { ...state, currentPiece: rotatePiece(state.board, state.currentPiece, -1) };
    }

    case 'CLEAR_DONE': {
      if (state.phase !== 'clearing') return state;
      const cleared = clearCells(state.board, state.clearingCells);
      return processBoard({ ...state, board: cleared, clearingCells: [] });
    }

    default:
      return state;
  }
}

export function usePuyoGame() {
  const [state, dispatch] = useReducer(reducer, undefined, getInitialState);
  const stateRef = useRef(state);
  stateRef.current = state;

  // Auto-fall tick
  useEffect(() => {
    if (state.phase !== 'falling') return;
    const id = setInterval(() => dispatch({ type: 'TICK' }), getDropInterval(state.level));
    return () => clearInterval(id);
  }, [state.phase, state.level]);

  // Clearing animation timeout
  useEffect(() => {
    if (state.phase !== 'clearing') return;
    const id = setTimeout(() => dispatch({ type: 'CLEAR_DONE' }), 550);
    return () => clearTimeout(id);
  }, [state.phase, state.clearingCells]);

  // Keyboard controls
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          dispatch({ type: 'MOVE_LEFT' });
          break;
        case 'ArrowRight':
          e.preventDefault();
          dispatch({ type: 'MOVE_RIGHT' });
          break;
        case 'ArrowDown':
          e.preventDefault();
          dispatch({ type: 'MOVE_DOWN' });
          break;
        case 'ArrowUp':
        case ' ':
          e.preventDefault();
          dispatch({ type: 'HARD_DROP' });
          break;
        case 'z':
        case 'Z':
          dispatch({ type: 'ROTATE_CCW' });
          break;
        case 'x':
        case 'X':
        case 'c':
        case 'C':
          dispatch({ type: 'ROTATE_CW' });
          break;
        case 'Enter':
          if (stateRef.current.phase === 'idle') dispatch({ type: 'START' });
          else if (stateRef.current.phase === 'gameover') dispatch({ type: 'RESTART' });
          break;
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return {
    state,
    dispatch,
    start: () => dispatch({ type: 'START' }),
    restart: () => dispatch({ type: 'RESTART' }),
    moveLeft: () => dispatch({ type: 'MOVE_LEFT' }),
    moveRight: () => dispatch({ type: 'MOVE_RIGHT' }),
    moveDown: () => dispatch({ type: 'MOVE_DOWN' }),
    hardDrop: () => dispatch({ type: 'HARD_DROP' }),
    rotateCW: () => dispatch({ type: 'ROTATE_CW' }),
    rotateCCW: () => dispatch({ type: 'ROTATE_CCW' }),
  };
}
