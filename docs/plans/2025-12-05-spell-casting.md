# Spell Casting System Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add spell casting system where players choose to cast spells instead of attacking, with mana costs, class-based loadouts, and creature spell AI.

**Architecture:** SPELL_CASTING phase pattern (similar to LUCK_TEST). Spells replace attacks (either/or). Single-use buffs/debuffs (no duration tracking). Mana resets each battle.

**Tech Stack:** React 18, TypeScript, Zustand (state), Tailwind CSS, Vite

**Note:** This project has no test framework. We'll follow incremental development with frequent commits instead of TDD cycles.

---

## Task 1: Add Spell Type Definitions

**Files:**
- Modify: `src/types.ts:1-170`

**Step 1: Add spell-related types to GamePhase**

Find the `GamePhase` type (lines 1-11) and add `'SPELL_CASTING'`:

```typescript
export type GamePhase =
  | 'CHARACTER_SELECT'
  | 'AVATAR_SELECT'
  | 'CREATURE_SELECT'
  | 'BATTLE'
  | 'DICE_ROLLING'
  | 'SPELL_CASTING'  // NEW
  | 'LUCK_TEST'
  | 'ROUND_RESULT'
  | 'BATTLE_END'
  | 'CAMPAIGN_VICTORY'
  | 'CAMPAIGN_END'
```

**Step 2: Add spell effect types**

Add after line 38 (after `Item` interface):

```typescript
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
```

**Step 3: Extend Character interface with mana/spells**

Modify the `Character` interface (around line 40):

```typescript
export interface Character {
  name: string
  skill: number
  maxStamina: number
  currentStamina: number
  luck: number
  maxLuck: number
  mana: number         // NEW
  maxMana: number      // NEW
  spells: string[]     // NEW - Array of spell IDs
  reactions?: Reactions
  avatar?: string
}
```

**Step 4: Extend Creature interface with optional spell fields**

Modify the `Creature` interface (around line 51):

```typescript
export interface Creature {
  name: string
  skill: number
  maxStamina: number
  currentStamina: number
  imageUrl?: string
  mana?: number              // NEW
  maxMana?: number           // NEW
  spells?: string[]          // NEW
  spellCastChance?: number   // NEW - Percentage (0-100)
  reactions?: Reactions
}
```

**Step 5: Extend GameState with activeEffects**

Modify the `GameState` interface (around line 89):

```typescript
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
  activeEffects: ActiveEffect[]  // NEW

  // UI state
  lastRoundSummary: string
  showFullLog: boolean

  // Reactions
  activeReaction: ActiveReaction | null

  // Campaign
  campaignState: CampaignState | null
}
```

**Step 6: Update PresetCharacter to include mana/spells**

Modify the `PresetCharacter` interface (around line 124):

```typescript
export interface PresetCharacter {
  skill: number
  stamina: number
  luck: number
  mana: number         // NEW
  spells: string[]     // NEW
}
```

**Step 7: Update PRESETS with mana and spell loadouts**

Modify the `PRESETS` constant (around line 165):

```typescript
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
```

**Step 8: Extend CombatLogEntry for spell events**

Modify the `CombatLogEntry` interface (around line 60):

```typescript
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

  // NEW: Spell casting fields
  spellCast?: {
    caster: 'player' | 'creature'
    spellName: string
    manaCost: number
    effect: string
  }
}
```

**Step 9: Run TypeScript compiler to check for errors**

Run: `npm run build`
Expected: Compile errors in gameStore.ts (missing mana fields in createCharacter)

**Step 10: Commit type definitions**

```bash
git add src/types.ts
git commit -m "feat(types): add spell casting type definitions

- Add SPELL_CASTING phase
- Add Spell, SpellEffect, ActiveEffect types
- Extend Character/Creature with mana and spells
- Update PRESETS with class-based spell loadouts
- Extend CombatLogEntry for spell events"
```

---

## Task 2: Create Spell Library and Effects

**Files:**
- Create: `src/utils/spells.ts`

**Step 1: Create spell library file with imports**

```typescript
import type { Spell, SpellEffect, ActiveEffect, Character, Creature, GameState } from '../types'

export const SPELL_LIBRARY: Record<string, Spell> = {
  // Damage spells
  magic_missile: {
    id: 'magic_missile',
    name: 'Magic Missile',
    description: 'Deal 3 guaranteed damage',
    manaCost: 3,
    effect: { type: 'damage', power: 3 }
  },
  fireball: {
    id: 'fireball',
    name: 'Fireball',
    description: 'Deal 5 damage with a blazing inferno',
    manaCost: 5,
    effect: { type: 'damage', power: 5 }
  },

  // Healing
  healing_light: {
    id: 'healing_light',
    name: 'Healing Light',
    description: 'Restore 4 stamina',
    manaCost: 4,
    effect: { type: 'heal', power: 4 }
  },

  // Buffs/Debuffs
  shield: {
    id: 'shield',
    name: 'Shield',
    description: '+2 skill on your next attack',
    manaCost: 3,
    effect: {
      type: 'buff',
      power: 0,
      statModifier: { stat: 'skill', amount: 2, target: 'self' }
    }
  },
  weakness: {
    id: 'weakness',
    name: 'Weakness',
    description: '-2 enemy skill on their next attack',
    manaCost: 4,
    effect: {
      type: 'debuff',
      power: 0,
      statModifier: { stat: 'skill', amount: -2, target: 'enemy' }
    }
  },

  // Utility
  drain: {
    id: 'drain',
    name: 'Drain Life',
    description: 'Deal 3 damage and heal 2',
    manaCost: 6,
    effect: { type: 'drain', power: 3 }
  },
  block: {
    id: 'block',
    name: 'Arcane Block',
    description: 'Prevent all damage from next attack',
    manaCost: 5,
    effect: { type: 'block', power: 0 }
  }
}
```

**Step 2: Add spell effect application function**

```typescript
export function applySpellEffect(
  spell: Spell,
  caster: Character | Creature,
  target: Character | Creature,
  activeEffects: ActiveEffect[],
  casterIsPlayer: boolean
): {
  updatedCaster: Character | Creature
  updatedTarget: Character | Creature
  updatedEffects: ActiveEffect[]
  description: string
} {
  let updatedCaster = { ...caster }
  let updatedTarget = { ...target }
  let updatedEffects = [...activeEffects]
  let description = ''

  switch (spell.effect.type) {
    case 'damage':
      updatedTarget.currentStamina = Math.max(0, target.currentStamina - spell.effect.power)
      description = `dealt ${spell.effect.power} damage`
      break

    case 'heal':
      const healAmount = Math.min(spell.effect.power, caster.maxStamina - caster.currentStamina)
      updatedCaster.currentStamina += healAmount
      description = healAmount > 0 ? `restored ${healAmount} stamina` : 'already at full health'
      break

    case 'buff':
    case 'debuff':
      const effectTarget = spell.effect.statModifier!.target === 'self'
        ? (casterIsPlayer ? 'player' : 'creature')
        : (casterIsPlayer ? 'creature' : 'player')

      const effectType = spell.effect.statModifier!.stat === 'skill'
        ? (spell.effect.type === 'buff' ? 'skill_buff' : 'skill_debuff')
        : (spell.effect.type === 'buff' ? 'luck_buff' : 'luck_debuff')

      updatedEffects.push({
        type: effectType as 'skill_buff' | 'skill_debuff' | 'luck_buff' | 'luck_debuff',
        value: Math.abs(spell.effect.statModifier!.amount),
        target: effectTarget
      })
      description = `applied ${spell.name} effect`
      break

    case 'drain':
      updatedTarget.currentStamina = Math.max(0, target.currentStamina - spell.effect.power)
      const drainHeal = Math.min(2, caster.maxStamina - caster.currentStamina)
      updatedCaster.currentStamina += drainHeal
      description = `drained ${spell.effect.power} stamina and healed ${drainHeal}`
      break

    case 'block':
      updatedEffects.push({
        type: 'block',
        value: 1,
        target: casterIsPlayer ? 'player' : 'creature'
      })
      description = 'raised an arcane barrier'
      break
  }

  return { updatedCaster, updatedTarget, updatedEffects, description }
}
```

**Step 3: Run TypeScript compiler**

Run: `npm run build`
Expected: No errors in spells.ts

**Step 4: Commit spell library**

```bash
git add src/utils/spells.ts
git commit -m "feat(spells): create spell library and effect system

- Define 7 spells: magic missile, fireball, healing light, shield, weakness, drain, block
- Implement applySpellEffect function for all spell types
- Handle damage, heal, buff, debuff, drain, and block effects"
```

---

## Task 3: Update Game Store State Initialization

**Files:**
- Modify: `src/store/gameStore.ts:15-60`

**Step 1: Add spell imports**

At the top of gameStore.ts (after line 13), add:

```typescript
import { SPELL_LIBRARY, applySpellEffect } from '../utils/spells'
```

**Step 2: Update GameStore interface with new actions**

Find the `GameStore` interface (around line 15-36) and add new spell actions:

```typescript
interface GameStore extends GameState {
  // Actions
  selectCreature: (name: string, skill: number, stamina: number, imageUrl?: string, reactions?: Reactions) => void
  createCharacter: (name: string, skill: number, stamina: number, luck: number, mana: number, spells: string[]) => void  // MODIFIED
  selectAvatar: (avatar: string) => void
  startBattle: () => void
  rollAttack: () => void
  rollSpecialAttack: () => void
  advancePhase: (phase: GamePhase) => void
  resetGame: () => void
  toggleFullLog: () => void
  useItem: (itemId: string) => void
  triggerReaction: (entity: 'player' | 'creature', reactionType: ReactionType) => void
  clearReaction: () => void
  testLuck: () => void
  skipLuckTest: () => void
  // NEW: Spell casting actions
  openSpellBook: () => void
  castSpell: (spellId: string) => void
  cancelSpellCast: () => void
  // Campaign actions
  startCampaign: () => void
  endCampaign: () => void
  recordBattleVictory: (creatureDifficulty: CreatureDifficulty) => void
  applyCampaignRecovery: () => void
}
```

**Step 3: Update initialState with activeEffects**

Find `initialState` (around line 41-60) and add:

```typescript
const initialState: GameState = {
  gamePhase: 'CHARACTER_SELECT',
  player: null,
  creature: {
    name: creatureData.name,
    skill: creatureData.skill,
    maxStamina: creatureData.stamina,
    currentStamina: creatureData.stamina,
  },
  currentRound: 0,
  combatLog: [],
  currentPlayerRoll: null,
  currentCreatureRoll: null,
  inventory: [],
  pendingLuckTest: null,
  activeEffects: [],  // NEW
  lastRoundSummary: '',
  showFullLog: false,
  activeReaction: null,
  campaignState: null,
}
```

**Step 4: Run TypeScript compiler**

Run: `npm run build`
Expected: Errors in createCharacter calls (missing mana/spells parameters)

**Step 5: Commit state initialization**

```bash
git add src/store/gameStore.ts
git commit -m "feat(store): add spell system state initialization

- Import spell utilities
- Add openSpellBook, castSpell, cancelSpellCast actions to interface
- Update createCharacter signature with mana and spells
- Initialize activeEffects in initial state"
```

---

## Task 4: Implement Spell Casting Actions in Store

**Files:**
- Modify: `src/store/gameStore.ts:101-122` (createCharacter)
- Modify: `src/store/gameStore.ts:137-147` (startBattle)
- Add: New spell casting actions at end of store

**Step 1: Update createCharacter to accept mana and spells**

Find the `createCharacter` action (around line 101) and modify:

```typescript
createCharacter: (name: string, skill: number, stamina: number, luck: number, mana: number, spells: string[]) => {
  set({
    player: {
      name,
      skill,
      maxStamina: stamina,
      currentStamina: stamina,
      luck,
      maxLuck: luck,
      mana,          // NEW
      maxMana: mana, // NEW
      spells,        // NEW
      reactions: {
        gloat: ['Take that!', 'Too easy!', 'Mwah ha ha!', 'I smash you up!', 'Hah!', 'Surrender!', 'I triumph!',
          'Defeat is inevitable!'],
        cry: ['Ouch!', 'That hurt!', 'Aargh!', 'This is bad...', 'Ouch!', 'My wounds!', 'I am injured!',
          'This is the WORST!'],
        victory: ['I did it!', 'Victory!', 'Yes! I won!', 'I am victorious!', 'Victory is mine!',
          'I have prevailed!', 'Triumph!', 'I stand undeafted!'],
        loss: ['No...', 'I failed...', 'This cannot be...', 'I will return...', 'Defeat...', 'I am beaten...',
          'This is not over...', 'I shall rise again!']
      }
    },
    gamePhase: 'AVATAR_SELECT',
  })
},
```

**Step 2: Update startBattle to reset mana**

Find the `startBattle` action (around line 137) and modify:

```typescript
startBattle: () => {
  const state = get()

  set({
    gamePhase: 'BATTLE',
    currentRound: 0,
    combatLog: [],
    currentPlayerRoll: null,
    currentCreatureRoll: null,
    inventory: JSON.parse(JSON.stringify(DEFAULT_INVENTORY)), // Deep copy
    activeEffects: [], // NEW - Reset active effects
    lastRoundSummary: 'BEGIN BATTLE!',
    // NEW - Reset player mana
    player: state.player ? {
      ...state.player,
      mana: state.player.maxMana,
      currentStamina: state.player.maxStamina,
      luck: state.player.maxLuck,
    } : null,
    // NEW - Reset creature mana if it has spells
    creature: state.creature.mana ? {
      ...state.creature,
      mana: state.creature.maxMana,
      currentStamina: state.creature.maxStamina,
    } : state.creature
  })
},
```

**Step 3: Add openSpellBook action**

At the end of the store actions (before campaign actions), add:

```typescript
// Spell casting actions
openSpellBook: () => {
  const state = get()
  if (state.gamePhase !== 'BATTLE') return

  set({ gamePhase: 'SPELL_CASTING' })
},
```

**Step 4: Add cancelSpellCast action**

```typescript
cancelSpellCast: () => {
  set({ gamePhase: 'BATTLE' })
},
```

**Step 5: Add castSpell action - validation part**

```typescript
castSpell: (spellId: string) => {
  const state = get()
  const { player, creature, activeEffects } = state

  // Validation
  if (!player) {
    console.error('No player exists')
    return
  }

  if (!player.spells.includes(spellId)) {
    console.error('Player does not have this spell')
    return
  }

  const spell = SPELL_LIBRARY[spellId]
  if (!spell) {
    console.error('Spell not found in library')
    return
  }

  if (player.mana < spell.manaCost) {
    console.error('Insufficient mana')
    return
  }

  // Haptic feedback on spell cast
  if (navigator.vibrate) {
    navigator.vibrate(350)
  }

  // Apply spell effect
  const result = applySpellEffect(
    spell,
    player,
    creature,
    activeEffects,
    true // casterIsPlayer
  )

  // Update state with spell effects
  const updatedPlayer = {
    ...result.updatedCaster as Character,
    mana: player.mana - spell.manaCost
  }
  const updatedCreature = result.updatedTarget as Creature

  // Add to combat log
  const newRound = state.currentRound + 1
  const logEntry: CombatLogEntry = {
    round: newRound,
    playerRoll: 0,
    creatureRoll: 0,
    playerAttackStrength: 0,
    creatureAttackStrength: 0,
    result: 'draw',
    spellCast: {
      caster: 'player',
      spellName: spell.name,
      manaCost: spell.manaCost,
      effect: result.description
    }
  }

  set({
    player: updatedPlayer,
    creature: updatedCreature,
    activeEffects: result.updatedEffects,
    currentRound: newRound,
    combatLog: [...state.combatLog, logEntry],
    lastRoundSummary: `You cast ${spell.name}! ${result.description}`,
  })

  // Check if battle ends after player spell
  if (updatedCreature.currentStamina <= 0) {
    get().triggerReaction('player', 'victory')
    setTimeout(() => get().triggerReaction('creature', 'loss'), 1000)
    setTimeout(() => set({ gamePhase: 'BATTLE_END' }), 2000)
    return
  }

  // Creature response - spell or attack
  setTimeout(() => {
    const currentState = get()
    const { creature: stateCreature } = currentState

    // Check if creature can cast spell
    if (stateCreature.spells && stateCreature.mana && stateCreature.mana > 0 && stateCreature.spellCastChance) {
      const roll = Math.floor(Math.random() * 100) + 1

      if (roll <= stateCreature.spellCastChance) {
        // Filter affordable spells
        const affordableSpells = stateCreature.spells.filter(
          sId => SPELL_LIBRARY[sId] && SPELL_LIBRARY[sId].manaCost <= stateCreature.mana!
        )

        if (affordableSpells.length > 0) {
          // Cast random spell
          const randomSpellId = affordableSpells[Math.floor(Math.random() * affordableSpells.length)]
          const creatureSpell = SPELL_LIBRARY[randomSpellId]

          const creatureResult = applySpellEffect(
            creatureSpell,
            stateCreature,
            currentState.player!,
            currentState.activeEffects,
            false // casterIsPlayer
          )

          const finalCreature = {
            ...creatureResult.updatedCaster as Creature,
            mana: stateCreature.mana - creatureSpell.manaCost
          }
          const finalPlayer = creatureResult.updatedTarget as Character

          const creatureLogEntry: CombatLogEntry = {
            round: currentState.currentRound,
            playerRoll: 0,
            creatureRoll: 0,
            playerAttackStrength: 0,
            creatureAttackStrength: 0,
            result: 'draw',
            spellCast: {
              caster: 'creature',
              spellName: creatureSpell.name,
              manaCost: creatureSpell.manaCost,
              effect: creatureResult.description
            }
          }

          set({
            player: finalPlayer,
            creature: finalCreature,
            activeEffects: creatureResult.updatedEffects,
            combatLog: [...currentState.combatLog, creatureLogEntry],
            lastRoundSummary: `${stateCreature.name} cast ${creatureSpell.name}! ${creatureResult.description}`,
          })

          // Haptic feedback
          if (navigator.vibrate) {
            navigator.vibrate(200)
          }

          // Trigger reaction
          if (creatureResult.description.includes('damage')) {
            get().triggerReaction('creature', 'gloat')
            setTimeout(() => get().triggerReaction('player', 'cry'), 500)
          }

          checkBattleEndAndAdvance(get, set, 2000)
          return
        }
      }
    }

    // Default: creature attacks normally
    get().rollAttack()
  }, 1500)
},
```

**Step 6: Run TypeScript compiler**

Run: `npm run build`
Expected: Errors in CharacterSelectScreen.tsx (wrong createCharacter parameters)

**Step 7: Commit spell casting actions**

```bash
git add src/store/gameStore.ts
git commit -m "feat(store): implement spell casting actions

- Update createCharacter to accept mana and spells
- Reset mana and activeEffects in startBattle
- Add openSpellBook and cancelSpellCast actions
- Implement castSpell with validation and creature AI response
- Creature can cast spells based on spellCastChance"
```

---

## Task 5: Update Active Effects in Combat

**Files:**
- Modify: `src/store/gameStore.ts:149-250` (rollAttack action)

**Step 1: Find the rollAttack action**

Locate the `rollAttack` action (starts around line 149).

**Step 2: Add active effects application before attack calculation**

After the dice roll section (around line 167-183), before calculating attack strengths, insert:

```typescript
      const playerRoll = roll2d6()
      const creatureRoll = roll2d6()

      // Haptic feedback when dice land
      if (navigator.vibrate) {
        navigator.vibrate(20)
      }

      // NEW: Apply active effects to skill values
      const currentState = get()
      const { activeEffects } = currentState
      let playerSkillMod = 0
      let creatureSkillMod = 0
      let playerBlocked = false
      let creatureBlocked = false

      activeEffects.forEach(effect => {
        if (effect.type === 'skill_buff' && effect.target === 'player') {
          playerSkillMod += effect.value
        }
        if (effect.type === 'skill_debuff' && effect.target === 'creature') {
          creatureSkillMod -= effect.value
        }
        if (effect.type === 'block' && effect.target === 'player') {
          playerBlocked = true
        }
        if (effect.type === 'block' && effect.target === 'creature') {
          creatureBlocked = true
        }
      })

      const playerAttackStrength = calculateAttackStrength(
        playerRoll,
        state.player!.skill + playerSkillMod  // MODIFIED - add skill modifier
      )
      const creatureAttackStrength = calculateAttackStrength(
        creatureRoll,
        state.creature.skill + creatureSkillMod  // MODIFIED - add skill modifier
      )
```

**Step 3: Apply block effects to damage**

Find where damage is applied (after determining combat result). Modify damage application:

```typescript
      const result = determineCombatResult(
        playerAttackStrength,
        creatureAttackStrength
      )

      const newRound = state.currentRound + 1

      // Create log entry
      const logEntry: CombatLogEntry = {
        round: newRound,
        playerRoll,
        creatureRoll,
        playerAttackStrength,
        creatureAttackStrength,
        result,
      }

      let updatedPlayer = state.player
      let updatedCreature = state.creature
      let summary = ''

      // NEW: Apply block effects and calculate damage
      if (result === 'creature_hit') {
        let damage = 2
        if (creatureBlocked) {
          damage = 0
          summary = `${state.creature.name} blocks your attack with magic!`
        } else {
          updatedCreature = {
            ...state.creature,
            currentStamina: Math.max(0, state.creature.currentStamina - damage),
          }
          summary = `You hit ${state.creature.name} for ${damage} damage!`
        }
      } else if (result === 'player_hit') {
        let damage = 2
        if (playerBlocked) {
          damage = 0
          summary = 'You block the attack with your arcane barrier!'
        } else {
          updatedPlayer = {
            ...state.player!,
            currentStamina: Math.max(0, state.player!.currentStamina - damage),
          }
          summary = `${state.creature.name} hits you for ${damage} damage!`
        }
      } else {
        summary = 'Draw! Both attacks were equal.'
      }

      // NEW: Remove consumed active effects (buffs/debuffs and triggered blocks)
      const remainingEffects = currentState.activeEffects.filter(effect => {
        // Remove skill buffs/debuffs (single use)
        if (effect.type === 'skill_buff' || effect.type === 'skill_debuff') {
          return false
        }
        // Remove block if it was triggered
        if (effect.type === 'block') {
          if ((effect.target === 'player' && playerBlocked) ||
              (effect.target === 'creature' && creatureBlocked)) {
            return false
          }
        }
        return true
      })

      set({
        currentRound: newRound,
        combatLog: [...state.combatLog, logEntry],
        currentPlayerRoll: playerRoll,
        currentCreatureRoll: creatureRoll,
        player: updatedPlayer,
        creature: updatedCreature,
        activeEffects: remainingEffects,  // NEW - update effects
        lastRoundSummary: summary,
        gamePhase: 'ROUND_RESULT',
      })
```

**Step 4: Run TypeScript compiler**

Run: `npm run build`
Expected: Should compile with no errors

**Step 5: Commit active effects integration**

```bash
git add src/store/gameStore.ts
git commit -m "feat(combat): integrate active effects into attack system

- Apply skill buffs/debuffs before attack calculation
- Check for block effects and prevent damage
- Remove single-use effects after consumption
- Update combat summary for blocked attacks"
```

---

## Task 6: Update CharacterSelectScreen for Mana/Spells

**Files:**
- Modify: `src/components/CharacterSelectScreen.tsx:22-111`

**Step 1: Update handlePresetSelect to pass mana/spells**

Find `handlePresetSelect` (around line 22) and modify the createCharacter call:

```typescript
const handlePresetSelect = (presetKey: string) => {
  if (!playerName.trim()) return

  // Haptic feedback
  if (navigator.vibrate) {
    navigator.vibrate(10)
  }

  const preset = PRESETS[presetKey]
  setSelectedStats({
    skill: preset.skill,
    stamina: preset.stamina,
    luck: preset.luck
  })
}
```

**Step 2: Update handleContinueSingleBattle**

Find `handleContinueSingleBattle` (around line 90) and update:

```typescript
const handleContinueSingleBattle = () => {
  if (!selectedStats) return

  // Haptic feedback
  if (navigator.vibrate) {
    navigator.vibrate(10)
  }

  // Find which preset was selected to get mana/spells
  const presetKey = Object.keys(PRESETS).find(key => {
    const preset = PRESETS[key]
    return preset.skill === selectedStats.skill &&
           preset.stamina === selectedStats.stamina &&
           preset.luck === selectedStats.luck
  })

  if (presetKey) {
    const preset = PRESETS[presetKey]
    createCharacter(
      playerName.trim(),
      selectedStats.skill,
      selectedStats.stamina,
      selectedStats.luck,
      preset.mana,      // NEW
      preset.spells     // NEW
    )
  } else {
    // Roll your own - no spells
    createCharacter(
      playerName.trim(),
      selectedStats.skill,
      selectedStats.stamina,
      selectedStats.luck,
      0,   // NEW - no mana
      []   // NEW - no spells
    )
  }
}
```

**Step 3: Update handleStartCampaign similarly**

Find `handleStartCampaign` (around line 101) and update:

```typescript
const handleStartCampaign = () => {
  if (!selectedStats) return

  // Haptic feedback
  if (navigator.vibrate) {
    navigator.vibrate(10)
  }

  // Find which preset was selected to get mana/spells
  const presetKey = Object.keys(PRESETS).find(key => {
    const preset = PRESETS[key]
    return preset.skill === selectedStats.skill &&
           preset.stamina === selectedStats.stamina &&
           preset.luck === selectedStats.luck
  })

  if (presetKey) {
    const preset = PRESETS[presetKey]
    createCharacter(
      playerName.trim(),
      selectedStats.skill,
      selectedStats.stamina,
      selectedStats.luck,
      preset.mana,      // NEW
      preset.spells     // NEW
    )
  } else {
    // Roll your own - no spells
    createCharacter(
      playerName.trim(),
      selectedStats.skill,
      selectedStats.stamina,
      selectedStats.luck,
      0,   // NEW - no mana
      []   // NEW - no spells
    )
  }

  startCampaign()
}
```

**Step 4: Update class descriptions in JSX**

Find the preset selection buttons (search for "warrior", "rogue", "barbarian" in the JSX). Update button text to mention spells:

- Warrior → "Warrior (3 spells, 12 mana)"
- Rogue → "Thief (3 spells, 14 mana)"
- Barbarian → "Wizard (4 spells, 16 mana)"

Also update the class names in the button keys and labels:
- Change "barbarian" to "wizard"
- Change "rogue" to "thief"

**Step 5: Run dev server and test**

Run: `npm run dev`
Test: Create character with each preset, verify no console errors

**Step 6: Commit character creation updates**

```bash
git add src/components/CharacterSelectScreen.tsx
git commit -m "feat(character): pass mana and spells to character creation

- Update handleContinueSingleBattle to include mana/spells from preset
- Update handleStartCampaign similarly
- Rename barbarian to wizard, rogue to thief
- Add spell/mana info to class descriptions
- Roll-your-own characters get 0 mana and no spells"
```

---

## Task 7: Update CharacterStats Component for Mana Display

**Files:**
- Modify: `src/components/CharacterStats.tsx`

**Step 1: Read the current CharacterStats component**

Run: `cat src/components/CharacterStats.tsx` to see current structure

**Step 2: Add mana bar after luck stat**

Find where the LUCK stat is displayed. Add mana display after it:

```typescript
{/* LUCK stat */}
<div className="flex justify-between items-center mb-1">
  <span className="font-cinzel text-sm">LUCK</span>
  <span className="font-cinzel text-sm">
    {character.luck} / {character.maxLuck}
  </span>
</div>
<div className="w-full bg-gray-300 rounded-full h-2 mb-3">
  <div
    className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
    style={{ width: `${(character.luck / character.maxLuck) * 100}%` }}
  />
</div>

{/* NEW: MANA stat - only show if character has mana */}
{character.maxMana > 0 && (
  <>
    <div className="flex justify-between items-center mb-1">
      <span className="font-cinzel text-sm">MANA</span>
      <span className="font-cinzel text-sm">
        {character.mana} / {character.maxMana}
      </span>
    </div>
    <div className="w-full bg-gray-300 rounded-full h-2 mb-3">
      <div
        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
        style={{ width: `${(character.mana / character.maxMana) * 100}%` }}
      />
    </div>
  </>
)}
```

**Step 3: Run dev server and test**

Run: `npm run dev`
Test: Start battle, verify mana bar appears for player

**Step 4: Commit mana display**

```bash
git add src/components/CharacterStats.tsx
git commit -m "feat(ui): add mana bar to character stats

- Display MANA below LUCK stat
- Only show if character has maxMana > 0
- Blue/purple gradient for mana bar
- Show current/max mana values"
```

---

## Task 8: Create SpellBook Component

**Files:**
- Create: `src/components/SpellBook.tsx`

**Step 1: Create SpellBook component file**

```typescript
import { useGameStore } from '../store/gameStore'
import { SPELL_LIBRARY } from '../utils/spells'

export function SpellBook() {
  const player = useGameStore((state) => state.player)
  const castSpell = useGameStore((state) => state.castSpell)
  const cancelSpellCast = useGameStore((state) => state.cancelSpellCast)

  if (!player) return null

  const playerSpells = player.spells.map(id => SPELL_LIBRARY[id]).filter(Boolean)

  const handleCastSpell = (spellId: string) => {
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(10)
    }
    castSpell(spellId)
  }

  const handleCancel = () => {
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(10)
    }
    cancelSpellCast()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-parchment rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl">
        <h2 className="text-3xl font-cinzel font-bold text-dark-brown text-center mb-6">
          Spell Book
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {playerSpells.map((spell) => {
            const canAfford = player.mana >= spell.manaCost

            return (
              <div
                key={spell.id}
                className={`bg-white/70 rounded-lg p-4 border-2 transition-all ${
                  canAfford
                    ? 'border-blue-500 hover:bg-white/90 hover:shadow-lg'
                    : 'border-gray-300 opacity-50'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-cinzel font-bold text-dark-brown">
                    {spell.name}
                  </h3>
                  <span className="text-sm font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded">
                    ⚡ {spell.manaCost}
                  </span>
                </div>

                <p className="text-sm text-gray-700 mb-4">
                  {spell.description}
                </p>

                <button
                  onClick={() => handleCastSpell(spell.id)}
                  disabled={!canAfford}
                  className={`w-full py-2 px-4 rounded font-cinzel font-bold transition-all ${
                    canAfford
                      ? 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {canAfford ? 'Cast Spell' : 'Insufficient Mana'}
                </button>
              </div>
            )
          })}
        </div>

        <button
          onClick={handleCancel}
          className="w-full py-3 px-6 bg-gray-600 text-white rounded font-cinzel font-bold hover:bg-gray-700 transition-all active:scale-95"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
```

**Step 2: Run TypeScript compiler**

Run: `npm run build`
Expected: No errors

**Step 3: Commit SpellBook component**

```bash
git add src/components/SpellBook.tsx
git commit -m "feat(ui): create SpellBook component

- Modal overlay for spell selection
- Grid layout of spell cards with name, description, mana cost
- Cast button disabled when insufficient mana
- Cancel button to return to battle
- Blue theme matching mana colors"
```

---

## Task 9: Update BattleScreen with Spell Casting UI

**Files:**
- Modify: `src/components/BattleScreen.tsx`

**Step 1: Read BattleScreen to understand structure**

Run: `cat src/components/BattleScreen.tsx | head -100`

**Step 2: Import SpellBook component**

At the top of BattleScreen.tsx, add import:

```typescript
import { SpellBook } from './SpellBook'
```

**Step 3: Add gameStore hooks for spell casting**

After existing `useGameStore` hooks, add:

```typescript
const gamePhase = useGameStore((state) => state.gamePhase)
const openSpellBook = useGameStore((state) => state.openSpellBook)
```

**Step 4: Find the special attack button**

Search for "Special Attack" or "rollSpecialAttack" in the JSX.

**Step 5: Replace special attack button section with two buttons**

Find the special attack button and replace with a flex container containing both buttons:

```typescript
{/* Special actions row - Special Attack and Cast Spell */}
<div className="flex gap-2 mb-2">
  {/* Special Attack button - 50% width */}
  <button
    onClick={rollSpecialAttack}
    disabled={gamePhase !== 'BATTLE'}
    className="flex-1 py-3 px-6 bg-purple-600 text-white rounded font-cinzel font-bold hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all active:scale-95 disabled:active:scale-100"
  >
    Special Attack
  </button>

  {/* Cast Spell button - 50% width */}
  <button
    onClick={openSpellBook}
    disabled={
      gamePhase !== 'BATTLE' ||
      !player?.spells?.length ||
      player?.mana === 0
    }
    className="flex-1 py-3 px-6 bg-blue-600 text-white rounded font-cinzel font-bold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all active:scale-95 disabled:active:scale-100"
  >
    {!player?.spells?.length
      ? 'Cast Spell (No Spells)'
      : player?.mana === 0
        ? `Cast Spell (⚡ 0/${player?.maxMana})`
        : `Cast Spell (⚡ ${player?.mana}/${player?.maxMana})`
    }
  </button>
</div>
```

**Step 6: Add conditional SpellBook rendering**

At the end of the component's JSX, before the closing div, add:

```typescript
      {/* Spell Book modal */}
      {gamePhase === 'SPELL_CASTING' && <SpellBook />}
    </div>
  )
}
```

**Step 7: Run dev server and test**

Run: `npm run dev`
Test:
- Start battle with Wizard
- Click "Cast Spell" button
- Verify spell book opens
- Cast a spell
- Verify mana decreases

**Step 8: Commit BattleScreen updates**

```bash
git add src/components/BattleScreen.tsx
git commit -m "feat(ui): add Cast Spell button and SpellBook to battle

- Add Cast Spell button next to Special Attack (both 50% width)
- Show current mana in button text
- Disable when no spells or no mana
- Render SpellBook modal during SPELL_CASTING phase
- Import and integrate openSpellBook action"
```

---

## Task 10: Update Creatures with Spell Casting

**Files:**
- Modify: `src/data/creatures.ts`

**Step 1: Find Goblin Shaman in creature library**

Search for "goblin" in creatures.ts. If "Goblin Shaman" doesn't exist, we'll modify the existing Goblin.

**Step 2: Add or update Goblin Shaman with basic spells**

```typescript
{
  id: 'goblin_shaman',
  name: 'Goblin Shaman',
  skill: 5,
  stamina: 6,
  imageUrl: '/creatures/goblin.jpg', // Reuse goblin image
  difficulty: 'easy',
  description: 'A goblin wielding crude magic, unpredictable and weak.',
  mana: 6,
  maxMana: 6,
  spells: ['magic_missile'],
  spellCastChance: 25,
  reactions: {
    gloat: ['Hehe! Magic hurt you!', 'Goblin cast spell!', 'Me powerful wizard!'],
    cry: ['Ow! No fair!', 'Magic hurt goblin!', 'This bad...'],
    victory: ['Goblin magic win!', 'Me best spellcaster!'],
    loss: ['No more magic...', 'Goblin beaten...']
  }
},
```

**Step 3: Find or add Wraith with debuff spells**

```typescript
{
  id: 'wraith',
  name: 'Wraith',
  skill: 7,
  stamina: 8,
  imageUrl: '/creatures/wraith.jpg',
  difficulty: 'hard',
  description: 'A spectral entity that drains the living with dark magic.',
  mana: 12,
  maxMana: 12,
  spells: ['magic_missile', 'weakness', 'drain'],
  spellCastChance: 35,
  reactions: {
    gloat: ['*Cackles eerily*', 'Your essence is mine!', 'Feel the cold touch of death!'],
    cry: ['*Wails in pain*', '*Flickers weakly*', 'The light... it burns...'],
    victory: ['*Triumphant shriek*', 'Another soul claimed!', '*Fades into darkness*'],
    loss: ['*Dissipates with a mournful cry*', 'Banished... for now...', '*Whispers fade*']
  }
},
```

**Step 4: Find or add Lich with full spellcaster loadout**

```typescript
{
  id: 'lich',
  name: 'Lich',
  skill: 9,
  stamina: 10,
  imageUrl: '/creatures/lich.jpg',
  difficulty: 'legendary',
  description: 'An ancient undead sorcerer of immense power and cunning.',
  mana: 18,
  maxMana: 18,
  spells: ['fireball', 'drain', 'weakness', 'block'],
  spellCastChance: 45,
  reactions: {
    gloat: ['Witness true power!', 'Your magic is nothing!', '*Dark laughter echoes*'],
    cry: ['Impossible!', '*Robe tears, bones crack*', 'This mortal wounds me!'],
    victory: ['Death claims another!', 'Bow before the eternal!', 'I am inevitable!'],
    loss: ['This body... is merely one of many...', '*Phylactery glows faintly*', 'I shall return...']
  }
},
```

**Step 5: Update Dragon with powerful fire spells**

Find the existing dragon entry and add spell fields:

```typescript
{
  id: 'dragon',
  name: 'Ancient Dragon',
  skill: 10,
  stamina: 12,
  imageUrl: '/creatures/dragon.jpg',
  difficulty: 'legendary',
  description: 'A massive dragon with scales like molten metal and breath of fire.',
  mana: 20,
  maxMana: 20,
  spells: ['fireball', 'drain'],
  spellCastChance: 30,
  reactions: {
    gloat: ['*ROARS triumphantly*', 'You are nothing before me!', '*Breathes fire menacingly*'],
    cry: ['*ROARS in pain*', 'You dare wound me?!', '*Thrashes violently*'],
    victory: ['*Stands over your body*', 'Another treasure for my hoard!', '*Victorious roar*'],
    loss: ['*A final, earth-shaking roar*', 'Impossible...', '*Collapses with a thunderous crash*']
  }
},
```

**Step 6: Run dev server and test**

Run: `npm run dev`
Test:
- Battle Goblin Shaman - should occasionally cast magic missile
- Battle Wraith - should cast debuffs
- Battle Lich - should cast frequently
- Battle Dragon - should cast fireball

**Step 7: Commit creature spell updates**

```bash
git add src/data/creatures.ts
git commit -m "feat(creatures): add spell casting to 4 creatures

- Goblin Shaman: 6 mana, magic missile, 25% cast chance
- Wraith: 12 mana, magic missile/weakness/drain, 35% cast chance
- Lich: 18 mana, 4 spells including fireball and block, 45% cast chance
- Dragon: 20 mana, fireball/drain, 30% cast chance"
```

---

## Task 11: Update Combat Log for Spell Events

**Files:**
- Modify: `src/components/CombatLogModal.tsx`

**Step 1: Read CombatLogModal to understand structure**

Run: `cat src/components/CombatLogModal.tsx`

**Step 2: Find where log entries are rendered**

Search for where `combatLog.map` is used to render entries.

**Step 3: Add spell event rendering**

In the log entry rendering section, add conditional rendering for spell casts:

```typescript
{combatLog.map((entry) => (
  <div
    key={entry.round}
    className="bg-white/50 rounded p-3 mb-2 border-l-4 border-brown"
  >
    <div className="font-cinzel font-bold text-dark-brown mb-1">
      Round {entry.round}
    </div>

    {/* NEW: Spell casting display */}
    {entry.spellCast ? (
      <div className="text-sm">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xl">⚡</span>
          <span className="font-bold text-blue-600">
            {entry.spellCast.caster === 'player' ? 'You' : creature?.name} cast {entry.spellCast.spellName}
          </span>
        </div>
        <div className="text-gray-700 ml-7">
          Cost: {entry.spellCast.manaCost} mana
        </div>
        <div className="text-gray-700 ml-7">
          Effect: {entry.spellCast.effect}
        </div>
      </div>
    ) : (
      // Existing attack display
      <>
        <div className="text-sm text-gray-700">
          Player: {entry.playerRoll} + {player?.skill} = {entry.playerAttackStrength}
        </div>
        <div className="text-sm text-gray-700">
          {creature?.name}: {entry.creatureRoll} + {creature?.skill} = {entry.creatureAttackStrength}
        </div>
        <div className={`text-sm font-bold mt-1 ${
          entry.result === 'player_hit'
            ? 'text-red-600'
            : entry.result === 'creature_hit'
              ? 'text-green-600'
              : 'text-gray-600'
        }`}>
          {entry.result === 'player_hit' && 'Creature hits!'}
          {entry.result === 'creature_hit' && 'You hit!'}
          {entry.result === 'draw' && 'Draw!'}
        </div>
      </>
    )}

    {/* Luck test info if present */}
    {entry.isLuckTest && (
      <div className="text-sm text-yellow-700 mt-2 ml-2">
        Luck Test: Rolled {entry.luckRoll} - {entry.wasLucky ? 'Lucky!' : 'Unlucky!'}
        {entry.originalDamage && ` (${entry.originalDamage} → ${entry.modifiedDamage} damage)`}
      </div>
    )}
  </div>
))}
```

**Step 4: Run dev server and test**

Run: `npm run dev`
Test:
- Cast spells in battle
- Open combat log
- Verify spell casts appear with ⚡ icon
- Verify mana cost and effect shown

**Step 5: Commit combat log updates**

```bash
git add src/components/CombatLogModal.tsx
git commit -m "feat(ui): display spell events in combat log

- Add spell cast entries with ⚡ icon
- Show caster, spell name, mana cost, and effect
- Differentiate spell casts from normal attacks
- Maintain existing attack and luck test display"
```

---

## Task 12: Final Testing and Polish

**Files:**
- None (testing phase)

**Step 1: Test all spell types**

Run: `npm run dev`

Test each spell:
- Magic Missile (damage) ✓
- Fireball (damage) ✓
- Healing Light (heal) ✓
- Shield (buff) ✓
- Weakness (debuff) ✓
- Drain (damage + heal) ✓
- Block (prevent damage) ✓

**Step 2: Test creature spell casting**

Test battles against:
- Goblin Shaman (occasional cast) ✓
- Wraith (moderate casting) ✓
- Lich (frequent casting) ✓
- Dragon (powerful but rare) ✓

**Step 3: Test edge cases**

- Cast spell with exactly enough mana ✓
- Try to cast with 0 mana (should be disabled) ✓
- Cast healing at full health ✓
- Apply multiple active effects ✓
- Block effect prevents damage then disappears ✓
- Mana resets when starting new battle ✓

**Step 4: Test campaign mode**

- Start campaign with Wizard ✓
- Cast spells in first battle ✓
- Win battle ✓
- Verify mana resets for second battle ✓

**Step 5: Test roll-your-own character**

- Create custom character ✓
- Verify no spells available ✓
- Verify "No Spells" message on button ✓

**Step 6: Run production build**

Run: `npm run build`
Expected: Clean build with no errors

**Step 7: Test production build**

Run: `npm run preview`
Test: Full spell casting flow works in production

**Step 8: Final commit**

```bash
git add -A
git commit -m "feat: complete spell casting system implementation

Final testing complete:
- All 7 spell types working correctly
- Creature AI casts spells based on chance
- Active effects (buffs/debuffs/block) function properly
- Mana system resets between battles
- Combat log displays spell events
- UI responsive and intuitive
- Production build successful

Closes #feature-4-spell-casting"
```

---

## Verification Checklist

After implementation, verify:

- [ ] Character creation passes mana/spells to player
- [ ] Mana bar displays below luck stat
- [ ] Cast Spell button appears next to Special Attack
- [ ] SpellBook modal opens when clicked
- [ ] Can cast damage spell (reduces creature stamina)
- [ ] Can cast healing spell (restores stamina, capped at max)
- [ ] Can cast buff spell (applies to next attack)
- [ ] Can cast debuff spell (applies to next creature attack)
- [ ] Can cast drain spell (damages and heals)
- [ ] Can cast block spell (prevents next damage)
- [ ] Mana decreases after casting
- [ ] Cannot cast with insufficient mana (button disabled)
- [ ] Active effects modify attack calculations
- [ ] Active effects removed after consumption
- [ ] Creature casts spells at specified chance
- [ ] Creature mana decreases after casting
- [ ] Spell events appear in combat log
- [ ] Mana resets at battle start
- [ ] Campaign mode: mana resets between battles
- [ ] Cancel spell casting returns to battle
- [ ] Haptic feedback on spell cast
- [ ] Roll-your-own characters have no spells
- [ ] TypeScript compiles without errors
- [ ] Production build succeeds

---

## Architecture Notes

**Phase Flow:**
```
BATTLE → [Cast Spell button] → SPELL_CASTING → [select spell] → castSpell() →
  [creature response] → ROUND_RESULT → BATTLE
```

**Active Effects Lifecycle:**
1. Spell cast creates ActiveEffect in array
2. rollAttack() checks activeEffects before calculating
3. Effects applied to skill/damage
4. Single-use effects removed after consumption

**State Management:**
- `activeEffects: ActiveEffect[]` in GameState
- Spell library in `src/utils/spells.ts`
- Creature spell data in `src/data/creatures.ts`

**Key Design Decisions:**
- Spells replace attacks (either/or), not additional actions
- Single-use buffs/debuffs (no duration tracking)
- Mana resets each battle (consistent with inventory)
- Class-based spell loadouts (Warrior/Thief/Wizard)
- Creature AI uses random % chance to cast

---

## Future Enhancements (Not in This Plan)

- Mana potions in inventory
- More spell variety (stun, poison, shields with charges)
- Spell upgrade system
- Enemy-exclusive spells
- Spell combo system
- Mana regeneration mechanics
