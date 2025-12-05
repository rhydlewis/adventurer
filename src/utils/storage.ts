import type { HighScoreEntry } from '../types'

const HIGH_SCORES_KEY = 'ff_battle_high_scores'
const MAX_HIGH_SCORES = 10

export function saveHighScore(entry: HighScoreEntry): void {
  const scores = getHighScores()
  scores.push(entry)
  scores.sort((a, b) => b.score - a.score)
  localStorage.setItem(HIGH_SCORES_KEY, JSON.stringify(scores.slice(0, MAX_HIGH_SCORES)))
}

export function getHighScores(): HighScoreEntry[] {
  const data = localStorage.getItem(HIGH_SCORES_KEY)
  return data ? JSON.parse(data) : []
}
