export function getProgressiveDifficulty(battlesWon: number): {
  skillBonus: number
  staminaBonus: number
} {
  // Every 2 battles, increase difficulty
  const tier = Math.floor(battlesWon / 2)

  return {
    skillBonus: Math.min(tier, 3), // Max +3 SKILL
    staminaBonus: tier * 2          // +2 STAMINA per tier
  }
}
