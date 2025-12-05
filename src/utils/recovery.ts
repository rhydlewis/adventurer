import type { Character } from '../types'

export function calculateRecovery(player: Character): {
  staminaRestored: number
  luckRestored: number
} {
  const damageDealt = player.maxStamina - player.currentStamina
  const staminaRestored = Math.floor(damageDealt * 0.5)

  const luckRestored = player.luck < player.maxLuck ? 1 : 0

  return { staminaRestored, luckRestored }
}
