/**
 * Roll a single die (1-6)
 */
export function rollDie(): number {
  return Math.floor(Math.random() * 6) + 1
}

/**
 * Roll 2 dice and return the sum
 */
export function roll2d6(): number {
  return rollDie() + rollDie()
}

/**
 * Calculate attack strength (roll + skill)
 */
export function calculateAttackStrength(roll: number, skill: number): number {
  return roll + skill
}

/**
 * Determine combat result
 */
export function determineCombatResult(
  playerStrength: number,
  creatureStrength: number
): 'player_hit' | 'creature_hit' | 'draw' {
  if (playerStrength > creatureStrength) {
    return 'player_hit'
  } else if (creatureStrength > playerStrength) {
    return 'creature_hit'
  }
  return 'draw'
}

/**
 * Parse creature from URL parameters
 */
export function parseCreatureFromURL(): {
  name: string
  skill: number
  stamina: number
} {
  const params = new URLSearchParams(window.location.search)

  const name = params.get('creatureName') || 'Goblin'
  const skillParam = params.get('creatureSkill')
  const staminaParam = params.get('creatureStamina')

  // Parse and validate skill (1-12 range)
  let skill = parseInt(skillParam || '5')
  if (isNaN(skill) || skill < 1 || skill > 12) {
    skill = 5
  }

  // Parse and validate stamina (1-99 range)
  let stamina = parseInt(staminaParam || '6')
  if (isNaN(stamina) || stamina < 1 || stamina > 99) {
    stamina = 6
  }

  return { name, skill, stamina }
}
