import type { CreatureDifficulty } from '../types'

export function calculateBattleScore(params: {
  roundsCompleted: number
  damageDealt: number
  damageTaken: number
  creatureDifficulty: CreatureDifficulty
  isPerfectVictory: boolean
  currentStreak: number
}): number {
  // Base points: 100 per round survived
  let score = params.roundsCompleted * 100

  // Difficulty multiplier
  const difficultyMultipliers = {
    easy: 1.0,
    medium: 1.5,
    hard: 2.0,
    legendary: 3.0
  }
  score *= difficultyMultipliers[params.creatureDifficulty]

  // Bonuses
  if (params.isPerfectVictory) score += 1000
  if (params.damageTaken === 0) score += 500
  score += params.damageDealt * 50
  score += params.currentStreak * 200

  return Math.floor(score)
}
