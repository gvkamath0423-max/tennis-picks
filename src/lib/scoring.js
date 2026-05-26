// src/lib/scoring.js
// ─────────────────────────────────────────────────────────────
// Calculates a user's score by comparing their picks to the
// actual results stored in the draw data.
// ─────────────────────────────────────────────────────────────
import { ROUND_POINTS, ROUNDS } from "./draws";

/**
 * Calculate score for a set of picks against a draw.
 * picks format: { "R128-1": "J. Sinner [1]", "R64-1": "...", ... }
 * draw format: { R128: [...matches], R64: [...], ... }
 *
 * Returns: { score, correct, total, byRound }
 */
export function calculateScore(picks, draw) {
  let score = 0;
  let correct = 0;
  let total = 0;
  const byRound = {};

  for (const round of ROUNDS) {
    const matches = draw[round] || [];
    let roundCorrect = 0;
    let roundTotal = 0;

    for (const match of matches) {
      const pickKey = `${round}-${match.id}`;
      const userPick = picks[pickKey];

      // Only count picks where the match has a known result
      if (match.status === "complete" && match.winner && userPick) {
        roundTotal++;
        total++;
        if (userPick === match.winner) {
          const pts = ROUND_POINTS[round] || 10;
          score += pts;
          correct++;
          roundCorrect++;
        }
      }
    }

    byRound[round] = { correct: roundCorrect, total: roundTotal, points: roundCorrect * (ROUND_POINTS[round] || 10) };
  }

  return { score, correct, total, byRound };
}

/** Count how many picks a user still needs to make */
export function countRemainingPicks(picks, draw) {
  let remaining = 0;
  for (const round of ROUNDS) {
    const matches = draw[round] || [];
    for (const match of matches) {
      if (match.status !== "complete") {
        const pickKey = `${round}-${match.id}`;
        if (!picks[pickKey]) remaining++;
      }
    }
  }
  return remaining;
}
