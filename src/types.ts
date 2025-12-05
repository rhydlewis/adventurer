export type GamePhase =
  | 'CHARACTER_SELECT'
  | 'AVATAR_SELECT'
  | 'CREATURE_SELECT'
  | 'BATTLE'
  | 'DICE_ROLLING'
  | 'SPELL_CASTING'
  | 'LUCK_TEST'
  | 'ROUND_RESULT'
  | 'BATTLE_END'
  | 'CAMPAIGN_VICTORY'
  | 'CAMPAIGN_END'

export type CombatResult = 'player_hit' | 'creature_hit' | 'draw'

export type ReactionType = 'gloat' | 'cry' | 'victory' | 'loss'

export interface Reactions {
  gloat: string[]
  cry: string[]
  victory: string[]
  loss: string[]
}

export type ItemType = 'health_potion' | 'luck_potion' | 'skill_potion'

export interface ItemEffect {
  type: 'heal' | 'luck' | 'skill'
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

// Spell system types
export type SpellEffectType =
  | 'damage'        // Direct damage to target
  | 'heal'          // Restore stamina
  | 'buff'          // Increase stat (next attack only)
  | 'debuff'        // Decrease enemy stat (next attack only)
  | 'drain'         // Damage + heal
  | 'block'         // Prevent next incoming damage

export interface SpellEffect {
  type: SpellEffectType
  power: number           // Damage/heal amount
  statModifier?: {        // For buffs/debuffs
    stat: 'skill' | 'luck'
    amount: number
    target: 'self' | 'enemy'
  }
}

export interface Spell {
  id: string
  name: string
  description: string
  manaCost: number
  effect: SpellEffect
}

export interface ActiveEffect {
  type: 'skill_buff' | 'skill_debuff' | 'luck_buff' | 'luck_debuff' | 'block'
  value: number
  target: 'player' | 'creature'
}

export interface Character {
  name: string
  skill: number
  maxStamina: number
  currentStamina: number
  luck: number
  maxLuck: number
  mana: number
  maxMana: number
  spells: string[]
  reactions?: Reactions
  avatar?: string
}

export interface Creature {
  name: string
  skill: number
  maxStamina: number
  currentStamina: number
  imageUrl?: string
  mana?: number
  maxMana?: number
  spells?: string[]
  spellCastChance?: number
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
  // Spell casting fields
  spellCast?: {
    caster: 'player' | 'creature'
    spellName: string
    manaCost: number
    effect: string
  }
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

  // Spell system
  activeEffects: ActiveEffect[]

  // UI state
  lastRoundSummary: string
  showFullLog: boolean

  // Reactions
  activeReaction: ActiveReaction | null

  // Campaign
  campaignState: CampaignState | null
}

export interface PresetCharacter {
  skill: number
  stamina: number
  luck: number
  mana: number
  spells: string[]
}

export type CreatureDifficulty = 'easy' | 'medium' | 'hard' | 'legendary'

export interface CampaignState {
  isActive: boolean
  score: number
  battlesWon: number
  totalDamageDealt: number
  totalDamageTaken: number
  perfectVictories: number
  currentStreak: number
  startingStats: {
    skill: number
    stamina: number
    luck: number
  }
  battleHistory: BattleRecord[]
}

export interface BattleRecord {
  battleNumber: number
  creature: string
  victory: boolean
  score: number
  roundsCompleted: number
  damageDealt: number
  damageTaken: number
}

export interface HighScoreEntry {
  playerName: string
  score: number
  battlesWon: number
  timestamp: number
}

export const PRESETS: Record<string, PresetCharacter> = {
  warrior: {
    skill: 10,
    stamina: 20,
    luck: 9,
    mana: 12,
    spells: ['magic_missile', 'shield', 'block']
  },
  thief: {
    skill: 9,
    stamina: 18,
    luck: 11,
    mana: 14,
    spells: ['magic_missile', 'weakness', 'drain']
  },
  wizard: {
    skill: 8,
    stamina: 16,
    luck: 9,
    mana: 16,
    spells: ['magic_missile', 'fireball', 'healing_light', 'shield']
  },
}
