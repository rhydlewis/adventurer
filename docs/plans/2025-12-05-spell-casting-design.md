# Spell Casting System Design

**Date:** 2025-12-05
**Feature:** Spell Casting (Both Player & Creatures)
**Status:** Design Complete, Ready for Implementation

---

## Overview

Add a spell casting system to the Fighting Fantasy Battle Simulator where players can choose to cast spells instead of attacking. Spells cost mana, which resets each battle. Different character classes have different spell loadouts and mana pools. Select creatures can also cast spells using simple AI logic.

---

## Core Design Decisions

1. **Spell vs Attack:** Spells replace attacks - players choose either attack OR cast spell each round
2. **Spell Effects:** Support all types - damage, healing, buffs/debuffs, utility (drain, block)
3. **Mana System:** Full reset at battle start (consistent with inventory/potion system)
4. **Class-Based:** Character classes (Warrior, Thief, Wizard) get different spell loadouts
5. **Creature AI:** Random chance (%) to cast spell instead of attacking
6. **Effect Duration:** Buffs/debuffs are single-use (applied to next attack only) - no round tracking needed

---

## Architecture Approach

**SPELL_CASTING Phase Pattern** - Add new phase similar to existing LUCK_TEST phase:
- Player clicks "Cast Spell" → transition to SPELL_CASTING phase
- Show spell selection modal
- Execute spell → return to BATTLE phase
- **Pros:** Consistent with existing patterns, clear state management, minimal refactoring
- **Cons:** Slight UX overhead from phase transitions (acceptable trade-off)

---

## Type Definitions

**New Types (add to `src/types.ts`):**

```typescript
// Spell effect types
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

**Extend Existing Types:**

```typescript
// Character interface
export interface Character {
  // ... existing fields
  mana: number
  maxMana: number
  spells: string[]  // Array of spell IDs
}

// Creature interface
export interface Creature {
  // ... existing fields
  mana?: number
  maxMana?: number
  spells?: string[]
  spellCastChance?: number  // Percentage (0-100)
}

// GameState interface
export interface GameState {
  // ... existing fields
  activeEffects: ActiveEffect[]
}

// GamePhase type
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

---

## Spell Library & Class Loadouts

**Create `src/utils/spells.ts`:**

```typescript
import type { Spell } from '../types'

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

**Character Class Loadouts:**

- **Warrior:** 12 mana, spells: [magic_missile, shield, block]
  - Focus: Defensive combat specialist

- **Thief:** 14 mana, spells: [magic_missile, weakness, drain]
  - Focus: Tactical debuffer with life steal

- **Wizard:** 16 mana, spells: [magic_missile, fireball, healing_light, shield]
  - Focus: Full spellcaster, most versatile

**Update `src/types.ts` PRESETS:**

```typescript
export const PRESETS: Record<string, PresetCharacter> = {
  warrior: { skill: 10, stamina: 20, luck: 9, mana: 12, spells: ['magic_missile', 'shield', 'block'] },
  thief: { skill: 9, stamina: 18, luck: 11, mana: 14, spells: ['magic_missile', 'weakness', 'drain'] },
  wizard: { skill: 8, stamina: 16, luck: 9, mana: 16, spells: ['magic_missile', 'fireball', 'healing_light', 'shield'] },
}
```

---

## Creature Spell Casting

**Update `src/data/creatures.ts`** - Add spell casting to 4 creatures:

```typescript
// Goblin Shaman - Easy tier, weak spellcaster
{
  id: 'goblin_shaman',
  name: 'Goblin Shaman',
  skill: 5,
  stamina: 6,
  difficulty: 'easy',
  mana: 6,
  maxMana: 6,
  spells: ['magic_missile'], // Only basic spell
  spellCastChance: 25, // Hesitant caster
  // ... other fields
}

// Wraith - Hard tier, debuff specialist
{
  id: 'wraith',
  name: 'Wraith',
  skill: 7,
  stamina: 8,
  difficulty: 'hard',
  mana: 12,
  maxMana: 12,
  spells: ['magic_missile', 'weakness', 'drain'],
  spellCastChance: 35,
  // ... other fields
}

// Lich - Legendary tier, full spellcaster
{
  id: 'lich',
  name: 'Lich',
  skill: 9,
  stamina: 10,
  difficulty: 'legendary',
  mana: 18,
  maxMana: 18,
  spells: ['fireball', 'drain', 'weakness', 'block'],
  spellCastChance: 45, // Aggressive caster
  // ... other fields
}

// Dragon - Legendary tier, raw power
{
  id: 'dragon',
  name: 'Ancient Dragon',
  skill: 10,
  stamina: 12,
  difficulty: 'legendary',
  mana: 20,
  maxMana: 20,
  spells: ['fireball', 'drain'],
  spellCastChance: 30, // Less frequent, more devastating
  // ... other fields
}
```

---

## State Management

**Updates to `src/store/gameStore.ts`:**

**New Actions:**

```typescript
interface GameStore extends GameState {
  // ... existing actions
  openSpellBook: () => void
  castSpell: (spellId: string) => void
  cancelSpellCast: () => void
}
```

**Action Implementations:**

### `openSpellBook()`
- Transition from BATTLE to SPELL_CASTING phase
- Simple state change: `set({ gamePhase: 'SPELL_CASTING' })`

### `castSpell(spellId: string)`
Main spell casting logic:

1. **Validate:**
   - Player exists
   - Player has spell in their spells array
   - Spell exists in SPELL_LIBRARY
   - Player has sufficient mana

2. **Execute spell:**
   - Call `applySpellEffect(spell, player, creature, gameState)`
   - Update player/creature stamina
   - Update activeEffects array
   - Deduct mana cost from player

3. **Log to combat:**
   - Extend CombatLogEntry with spell fields
   - Record spell name, mana cost, effect description

4. **Creature response:**
   - If creature has spells and mana:
     - Roll 1-100 vs spellCastChance
     - If successful: cast random affordable spell
     - Else: normal attack
   - If no spells: normal attack via rollAttack()

5. **Check battle end:**
   - If either stamina <= 0: transition to BATTLE_END
   - Else: transition to BATTLE phase

6. **Haptic feedback:** Medium vibration on cast

### `cancelSpellCast()`
- Return from SPELL_CASTING to BATTLE phase
- No mana cost, no action consumed

**Initialization Changes:**

- `createCharacter()`: Accept `mana`, `maxMana`, `spells` parameters
- `startBattle()`: Reset `player.mana = player.maxMana` (like stamina reset)
- Initial state: `activeEffects: []`

---

## Combat Flow Integration

**Applying Active Effects in `rollAttack()`:**

Before calculating attack strengths:

```typescript
// Check for active effects
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

// Apply to attack strength calculation
const playerAttackStrength = calculateAttackStrength(player.skill + playerSkillMod, playerRoll)
const creatureAttackStrength = calculateAttackStrength(creature.skill + creatureSkillMod, creatureRoll)

// Apply block effects to damage
if (result === 'creature_hit' && creatureBlocked) {
  damage = 0
  // Remove block effect
}
if (result === 'player_hit' && playerBlocked) {
  damage = 0
  // Remove block effect
}

// Remove consumed single-use effects after combat resolves
activeEffects = activeEffects.filter(e => e.type !== 'skill_buff' && e.type !== 'skill_debuff')
```

**Creature Spell Casting Logic:**

After player action (attack or spell), creature responds:

```typescript
if (creature.spells && creature.mana > 0) {
  const roll = Math.floor(Math.random() * 100) + 1

  if (roll <= creature.spellCastChance) {
    // Filter spells by affordability
    const affordableSpells = creature.spells.filter(
      spellId => SPELL_LIBRARY[spellId].manaCost <= creature.mana
    )

    if (affordableSpells.length > 0) {
      // Pick random spell
      const randomSpell = affordableSpells[Math.floor(Math.random() * affordableSpells.length)]
      const spell = SPELL_LIBRARY[randomSpell]

      // Cast spell (same logic as player)
      applySpellEffect(spell, creature, player, gameState)
      creature.mana -= spell.manaCost

      // Log to combat
      // Continue to battle end check
      return
    }
  }
}

// Default: normal attack
rollAttack()
```

**Combat Log Extension:**

```typescript
export interface CombatLogEntry {
  round: number
  playerRoll: number
  creatureRoll: number
  playerAttackStrength: number
  creatureAttackStrength: number
  result: CombatResult

  // Luck test fields
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
    effect: string // "dealt 5 damage", "healed 4 stamina", etc.
  }
}
```

---

## Spell Effect Application

**Create `src/utils/spells.ts` helper function:**

```typescript
export function applySpellEffect(
  spell: Spell,
  caster: Character | Creature,
  target: Character | Creature,
  gameState: GameState
): {
  updatedCaster: Character | Creature
  updatedTarget: Character | Creature
  updatedEffects: ActiveEffect[]
  description: string
} {
  let updatedCaster = { ...caster }
  let updatedTarget = { ...target }
  let updatedEffects = [...gameState.activeEffects]
  let description = ''

  switch (spell.effect.type) {
    case 'damage':
      updatedTarget.currentStamina = Math.max(0, target.currentStamina - spell.effect.power)
      description = `dealt ${spell.effect.power} damage`
      break

    case 'heal':
      const healAmount = Math.min(spell.effect.power, caster.maxStamina - caster.currentStamina)
      updatedCaster.currentStamina += healAmount
      description = `restored ${healAmount} stamina`
      break

    case 'buff':
    case 'debuff':
      const effectTarget = spell.effect.statModifier!.target === 'self'
        ? (caster === gameState.player ? 'player' : 'creature')
        : (caster === gameState.player ? 'creature' : 'player')

      const effectType = spell.effect.statModifier!.stat === 'skill'
        ? (spell.effect.type === 'buff' ? 'skill_buff' : 'skill_debuff')
        : (spell.effect.type === 'buff' ? 'luck_buff' : 'luck_debuff')

      updatedEffects.push({
        type: effectType,
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
        target: caster === gameState.player ? 'player' : 'creature'
      })
      description = `raised an arcane barrier`
      break
  }

  return { updatedCaster, updatedTarget, updatedEffects, description }
}
```

---

## UI Components

### New Component: `src/components/SpellBook.tsx`

Modal overlay during SPELL_CASTING phase:

**Layout:**
- Grid of spell cards (1 col mobile, 2 cols desktop)
- Modal backdrop overlay

**Spell Card:**
- Spell name (large, bold)
- Description (smaller text)
- Mana cost display: "⚡ 3 MANA"
- "Cast" button
- Visual states:
  - Affordable: normal colors, enabled
  - Unaffordable: grayed out, disabled
  - Hover: highlight

**Bottom Section:**
- "Cancel" button to return to BATTLE phase

**Styling:**
- Match existing theme (Fighting Fantasy aesthetic)
- Blue/purple mana theme
- Smooth fade-in animation

### Update: `src/components/BattleScreen.tsx`

**Special Actions Row:**
- Layout: `[Special Attack (50%)] [Cast Spell (50%)]`
- Both buttons same height, side-by-side

**Cast Spell Button:**
- Always visible (not conditionally rendered)
- Disabled states:
  - `player.spells.length === 0` → "Cast Spell (No Spells)"
  - `player.mana === 0` → "Cast Spell (⚡ 0/12)"
  - `gamePhase === 'DICE_ROLLING' | 'ROUND_RESULT' | 'LUCK_TEST'`
- Enabled state: "Cast Spell (⚡ 12/16)"
- onClick: `openSpellBook()`

**Conditional Rendering:**
```tsx
{gamePhase === 'SPELL_CASTING' && <SpellBook />}
```

### Update: `src/components/CharacterStats.tsx`

**Add Mana Bar:**
- Position: Below LUCK stat
- Label: "MANA"
- Display: "12 / 16"
- Progress bar: blue/purple gradient
- Only render if `character.maxMana > 0`

**Example:**
```
SKILL: 10
STAMINA: 18 / 20 [████████████░░░]
LUCK: 9 / 11 [██████████████░░]
MANA: 12 / 16 [███████████░░░░░]
```

### Update: `src/components/CombatLogModal.tsx`

**Display Spell Entries:**

When `entry.spellCast` exists:
- Icon: ⚡ (lightning bolt)
- Text: `"{caster} cast {spellName} ({manaCost} mana) - {effect}"`
- Example: "⚡ Player cast Fireball (5 mana) - dealt 5 damage"
- Different color/style from normal attacks

---

## Edge Cases & Validation

### Validation in `castSpell()`:

```typescript
castSpell: (spellId: string) => {
  const { player, creature, activeEffects } = get()

  // Validation checks
  if (!player) return
  if (!player.spells.includes(spellId)) {
    console.error('Player does not have this spell')
    return
  }

  const spell = SPELL_LIBRARY[spellId]
  if (!spell) {
    console.error('Spell not found')
    return
  }

  if (player.mana < spell.manaCost) {
    console.error('Insufficient mana')
    return
  }

  // Proceed with casting...
}
```

### Edge Cases:

1. **Healing at max stamina:**
   - Allow spell cast
   - healAmount = 0
   - Description: "already at full health"

2. **Overkill damage:**
   - Stamina can't go below 0
   - Use `Math.max(0, currentStamina - damage)`

3. **Multiple active effects:**
   - Array can hold multiple simultaneous effects
   - Example: player has skill_buff, creature has skill_debuff

4. **Block effect:**
   - Takes precedence over damage calculation
   - Sets damage to 0
   - Removes itself after blocking one attack
   - Removed from activeEffects array immediately

5. **Campaign mode:**
   - Mana resets to max in `startBattle()`
   - Consistent with stamina/inventory reset

6. **No spells available:**
   - Cast Spell button always visible but disabled
   - Shows "(No Spells)" text

7. **Creature with no mana:**
   - Skip spell casting AI logic entirely
   - Always use normal attack

8. **Spell cost exceeds current mana:**
   - Spell card disabled in SpellBook
   - Visual: grayed out, "Cast" button disabled

### Haptic Feedback:

- **On spell cast:** Medium vibration (350ms)
- **On spell impact (damage/heal):** Light vibration (200ms)
- Use existing haptic utility function

---

## Testing Checklist

- [ ] Character creation assigns correct mana/spells per class
- [ ] Mana displays in CharacterStats component
- [ ] Cast Spell button appears and has correct enabled/disabled states
- [ ] SpellBook modal opens on button click
- [ ] Can cast damage spell (reduces creature stamina)
- [ ] Can cast healing spell (restores player stamina, capped at max)
- [ ] Can cast buff spell (applies to next player attack)
- [ ] Can cast debuff spell (applies to next creature attack)
- [ ] Can cast drain spell (damages and heals)
- [ ] Can cast block spell (prevents next damage)
- [ ] Mana decreases after casting
- [ ] Cannot cast with insufficient mana
- [ ] Spell effects appear in combat log
- [ ] Active effects apply during rollAttack()
- [ ] Active effects removed after consumption
- [ ] Creature casts spells at specified chance
- [ ] Creature mana decreases after casting
- [ ] Mana resets at battle start
- [ ] Campaign mode: mana resets between battles
- [ ] Cancel spell casting returns to BATTLE phase
- [ ] Haptic feedback works on cast

---

## Implementation Complexity

**Estimated Effort:** Medium-High

**Key Files to Create:**
- `src/utils/spells.ts` - Spell library and effect logic
- `src/components/SpellBook.tsx` - Spell selection UI

**Key Files to Modify:**
- `src/types.ts` - Add spell-related types
- `src/store/gameStore.ts` - Add spell casting actions and logic
- `src/components/BattleScreen.tsx` - Add Cast Spell button and SpellBook
- `src/components/CharacterStats.tsx` - Add mana display
- `src/components/CombatLogModal.tsx` - Display spell events
- `src/data/creatures.ts` - Add spells to 4 creatures
- `src/components/CharacterSelectScreen.tsx` - Update class descriptions

**Integration Points:**
- Combat system (rollAttack modifications)
- Luck test system (both use similar phase patterns)
- Inventory system (similar reset behavior)
- Campaign system (mana persistence)

---

## Success Criteria

✅ Players can cast spells instead of attacking
✅ Three character classes have distinct spell loadouts
✅ Mana system works (cost, deduction, reset)
✅ All spell types functional (damage, heal, buff, debuff, drain, block)
✅ Active effects apply to combat correctly
✅ Four creatures can cast spells with AI
✅ Spell events logged and displayed
✅ UI responsive and intuitive
✅ No breaking changes to existing combat
✅ TypeScript type-safe throughout
✅ Campaign mode compatible
