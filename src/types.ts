export type GamePhase =
  | 'CHARACTER_SELECT'
  | 'AVATAR_SELECT'
  | 'CREATURE_SELECT'
  | 'BATTLE'
  | 'DICE_ROLLING'
  | 'LUCK_TEST'
  | 'ROUND_RESULT'
  | 'BATTLE_END'

export type CombatResult = 'player_hit' | 'creature_hit' | 'draw'

export type ReactionType = 'gloat' | 'cry' | 'victory' | 'loss'

export interface Reactions {
  gloat: string[]
  cry: string[]
  victory: string[]
  loss: string[]
}

export type ItemType = 'health_potion' | 'luck_potion' | 'provision'

export interface ItemEffect {
  type: 'heal' | 'luck'
  amount: number
}

export interface Item {
  id: string
  type: ItemType
  name: string
  description: string
  effect: ItemEffect
  remaining: number
}

export interface Character {
  name: string
  skill: number
  maxStamina: number
  currentStamina: number
  luck: number
  maxLuck: number
  reactions?: Reactions
  avatar?: string
}

export interface Creature {
  name: string
  skill: number
  maxStamina: number
  currentStamina: number
  imageUrl?: string
  reactions?: Reactions
}

export interface CombatLogEntry {
  round: number
  playerRoll: number
  creatureRoll: number
  playerAttackStrength: number
  creatureAttackStrength: number
  result: CombatResult
  // Optional luck test fields
  isLuckTest?: boolean
  luckRoll?: number
  wasLucky?: boolean
  originalDamage?: number
  modifiedDamage?: number
  target?: 'player' | 'creature'
  skipped?: boolean
}

export interface ActiveReaction {
  text: string
  entity: 'player' | 'creature'
  timestamp: number
}

export interface PendingLuckTest {
  damage: number
  target: 'player' | 'creature'
  type: 'reduce' | 'increase'
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

  // Inventory
  inventory: Item[]

  // Luck test
  pendingLuckTest: PendingLuckTest | null

  // UI state
  lastRoundSummary: string
  showFullLog: boolean

  // Reactions
  activeReaction: ActiveReaction | null
}

export interface PresetCharacter {
  skill: number
  stamina: number
  luck: number
}

export const PRESETS: Record<string, PresetCharacter> = {
  warrior: { skill: 10, stamina: 20, luck: 9 },
  rogue: { skill: 9, stamina: 18, luck: 11 },
  barbarian: { skill: 8, stamina: 24, luck: 8 },
}
