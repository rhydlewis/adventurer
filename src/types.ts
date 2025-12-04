export type GamePhase =
  | 'CHARACTER_SELECT'
  | 'BATTLE'
  | 'DICE_ROLLING'
  | 'ROUND_RESULT'
  | 'BATTLE_END'

export type CombatResult = 'player_hit' | 'creature_hit' | 'draw'

export interface Character {
  name: string
  skill: number
  maxStamina: number
  currentStamina: number
}

export interface Creature {
  name: string
  skill: number
  maxStamina: number
  currentStamina: number
  imageUrl?: string
}

export interface CombatLogEntry {
  round: number
  playerRoll: number
  creatureRoll: number
  playerAttackStrength: number
  creatureAttackStrength: number
  result: CombatResult
}

export interface GameState {
  // Game phase
  gamePhase: GamePhase

  // Player
  player: Character | null

  // Creature (from URL or default)
  creature: Creature

  // Combat tracking
  currentRound: number
  combatLog: CombatLogEntry[]

  // Current dice values (for display)
  currentPlayerRoll: number | null
  currentCreatureRoll: number | null

  // UI state
  lastRoundSummary: string
  showFullLog: boolean
}

export interface PresetCharacter {
  skill: number
  stamina: number
}

export const PRESETS: Record<string, PresetCharacter> = {
  warrior: { skill: 10, stamina: 20 },
  rogue: { skill: 9, stamina: 18 },
  barbarian: { skill: 8, stamina: 24 },
}
