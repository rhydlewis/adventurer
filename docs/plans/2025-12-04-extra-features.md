# Fighting Fantasy Battle Simulator - 5 Feature Implementation Plan

**Project:** Advent-turer Battleground
**Goal:** Add creature pictures, potions, luck testing, spell casting, and victory statistics
**Priority:** Visual appeal first (creature pictures) → gameplay depth (potions/luck/spells) → progression (statistics)

---

## Implementation Order & Dependencies

```
Feature 1: Creature Pictures (visual foundation)
    ↓
Feature 2: Potions & Provisions (introduces inventory system)
    ↓
Feature 3: Testing Your Luck (uses potions, adds strategic depth)
    ↓
Feature 4: Spell Casting (complex combat system)
    ↓
Feature 5: Victory Statistics (tracks all features)
```

---

## Feature 1: Creature Pictures with Predefined Library

**Goal:** Replace URL-based creature selection with visual creature library featuring images

### Critical Files
- **NEW:** `/Users/rhyd/code/advent-urer/src/data/creatures.ts` - Creature registry with images
- **NEW:** `/Users/rhyd/code/advent-urer/src/components/CreatureLibrary.tsx` - Visual picker UI
- **NEW:** `/Users/rhyd/code/advent-urer/public/creatures/` - Image assets directory
- **MODIFY:** `/Users/rhyd/code/advent-urer/src/types.ts` - Add CreatureDefinition, imageUrl to Creature
- **MODIFY:** `/Users/rhyd/code/advent-urer/src/store/gameStore.ts` - Add selectCreature action
- **MODIFY:** `/Users/rhyd/code/advent-urer/src/components/CharacterSelectScreen.tsx` - Integrate creature selection
- **MODIFY:** `/Users/rhyd/code/advent-urer/src/components/BattleScreen.tsx` - Display creature image

### Implementation Steps

1. **Create creature image assets** (10-15 creatures)
   - Create `/public/creatures/` directory
   - Add images: goblin.png, orc.png, troll.png, dragon.png, skeleton.png, etc.
   - Optimize for web (<200KB each, WebP format preferred)

2. **Define creature data structure**
   - Create `src/data/creatures.ts`
   - Export `CREATURE_LIBRARY: CreatureDefinition[]` with:
     - Easy: Goblin (5/4), Giant Rat (4/3)
     - Medium: Orc (6/5), Skeleton (6/6)
     - Hard: Troll (8/8), Werewolf (7/8)
     - Legendary: Dragon (10/12), Demon (9/10)
   - Each entry includes: id, name, skill, stamina, imageUrl, difficulty, description

3. **Update types**
   - Add `CreatureDefinition` interface
   - Add `imageUrl: string` to `Creature` interface
   - Add `difficulty: 'easy' | 'medium' | 'hard' | 'legendary'` enum

4. **Create CreatureLibrary component**
   - Responsive grid (2 cols mobile, 3-4 desktop)
   - Each card: image, name, stats, difficulty badge
   - Selection state with visual indicator
   - Filter by difficulty
   - Hover effects with descriptions

5. **Update character select flow**
   - Add creature selection step before character creation
   - Show selected creature preview
   - Allow changing creature selection
   - Update store with selectCreature action

6. **Add images to battle UI**
   - Display creature image in BattleScreen above stats
   - Responsive sizing (max 200px mobile, 300px desktop)
   - Add to CharacterStats component (optional imageUrl prop)

### Verification
- All creatures display in library with images
- Can select creature and proceed to character creation
- Creature image appears in battle
- URL-based creature selection still works as fallback
- Mobile responsive

---

## Feature 2: Potions & Provisions

**Goal:** Add consumable items that reset each battle (Health Potions, Provisions, Luck Potions)

### Critical Files
- **NEW:** `/Users/rhyd/code/advent-urer/src/utils/items.ts` - Item definitions and effects
- **NEW:** `/Users/rhyd/code/advent-urer/src/components/InventoryPanel.tsx` - Item UI
- **MODIFY:** `/Users/rhyd/code/advent-urer/src/types.ts` - Add Item, ItemType interfaces
- **MODIFY:** `/Users/rhyd/code/advent-urer/src/store/gameStore.ts` - Add inventory state and useItem action
- **MODIFY:** `/Users/rhyd/code/advent-urer/src/components/BattleScreen.tsx` - Display inventory panel
- **MODIFY:** `/Users/rhyd/code/advent-urer/src/components/CharacterStats.tsx` - Add healing animation
- **MODIFY:** `/Users/rhyd/code/advent-urer/src/index.css` - Add item usage animations

### Implementation Steps

1. **Define item system**
   - Create `src/utils/items.ts`
   - Export `DEFAULT_INVENTORY` with starting items:
     - 2x Health Potion (restore 4 STAMINA)
     - 2x Provision (restore 4 STAMINA)
     - 1x Luck Potion (restore LUCK, for Feature 3)
   - Export `applyItemEffect(item, character)` function

2. **Update types**
   - Add `ItemType = 'health_potion' | 'luck_potion' | 'provision'`
   - Add `Item` interface with id, type, name, description, effect, remaining
   - Add `inventory: Item[]` to GameState
   - Add `luck`, `maxLuck` to Character (prep for Feature 3)

3. **Update store**
   - Initialize `inventory: []` in state
   - In `startBattle`: Set inventory to fresh copy of DEFAULT_INVENTORY
   - Add `useItem(itemId)` action:
     - Find item, check remaining > 0
     - Apply effect (restore stamina)
     - Decrement remaining
     - Show feedback, haptic vibration
   - Reset inventory in `resetGame`

4. **Create InventoryPanel component**
   - Grid layout showing each item type
   - Item cards: icon (🧪/🍖), name, description, remaining count
   - "Use" buttons (disabled when remaining = 0 or at max stamina)
   - Responsive layout

5. **Integrate into BattleScreen**
   - Add InventoryPanel between dice area and attack buttons
   - Only show during BATTLE phase (not rolling/results)
   - Collapsible section (optional)

6. **Add visual feedback**
   - CSS animation for item usage (flash/glow)
   - Green healing animation on CharacterStats
   - Track stamina changes to trigger animations

### Verification
- Inventory displays with correct starting items
- Can use health potion to restore stamina
- Items disabled when depleted
- Cannot heal above max stamina
- Inventory resets on new battle
- Animations and haptics work

---

## Feature 3: Testing Your Luck

**Goal:** Implement Fighting Fantasy LUCK mechanic - test luck after damage to modify outcome

### Critical Files
- **NEW:** `/Users/rhyd/code/advent-urer/src/utils/luck.ts` - Luck test mechanics
- **NEW:** `/Users/rhyd/code/advent-urer/src/components/LuckTestModal.tsx` - Luck test UI
- **MODIFY:** `/Users/rhyd/code/advent-urer/src/types.ts` - Add LUCK_TEST phase, LuckTestResult
- **MODIFY:** `/Users/rhyd/code/advent-urer/src/store/gameStore.ts` - Integrate luck into combat flow
- **MODIFY:** `/Users/rhyd/code/advent-urer/src/components/CharacterSelectScreen.tsx` - Roll luck stat
- **MODIFY:** `/Users/rhyd/code/advent-urer/src/components/CharacterStats.tsx` - Display LUCK stat
- **MODIFY:** `/Users/rhyd/code/advent-urer/src/components/BattleScreen.tsx` - Show luck test modal

### Implementation Steps

1. **Define luck mechanics**
   - Create `src/utils/luck.ts`
   - Export `testLuck(currentLuck)` - rolls 2d6, checks if <= LUCK
   - Export `modifyDamage(damage, type, wasLucky)`:
     - Reduce damage: Lucky = 1 damage, Unlucky = 3 damage
     - Increase damage: Lucky = 3 damage, Unlucky = 1 damage
   - Use existing roll2d6 from combat.ts

2. **Update types**
   - Add `luck: number` and `maxLuck: number` to Character
   - Add `luck` to PresetCharacter
   - Update PRESETS with luck values (8-11 range)
   - Add `LUCK_TEST` to GamePhase enum
   - Add `LuckTestResult` interface
   - Add `pendingLuckTest` to GameState

3. **Update character creation**
   - In CharacterSelectScreen: Roll 1d6+6 for luck in "Roll Your Own"
   - Add luck to preset buttons
   - In store: Update createCharacter to accept luck parameter

4. **Add LUCK display**
   - Update CharacterStats to show LUCK stat below STAMINA
   - Gold/yellow color theme for luck
   - Include luck bar visualization

5. **Modify combat flow**
   - In `rollAttack` action:
     - After calculating damage, if damage > 0:
       - Store pending damage
       - Transition to LUCK_TEST phase
       - Offer luck test
     - If damage = 0 (draw), skip luck test

6. **Create LuckTestModal**
   - Modal overlay appearing during LUCK_TEST phase
   - Show context: "You took 2 damage" or "Enemy took 2 damage"
   - Two buttons: "Test Your Luck" (shows current LUCK) and "Accept Result"
   - Animate dice roll
   - Show result: "LUCKY!" or "UNLUCKY!" with damage modification
   - Auto-close after 2 seconds

7. **Implement luck test actions**
   - Add `testLuck` action:
     - Roll luck test
     - Modify pending damage based on result
     - Reduce luck by 1
     - Update stamina with modified damage
     - Transition to ROUND_RESULT
     - Add haptic feedback
   - Add `skipLuckTest` action:
     - Apply pending damage as-is
     - Transition to ROUND_RESULT
   - Both update combat log with luck test info

8. **Integrate into BattleScreen**
   - Render LuckTestModal when gamePhase === 'LUCK_TEST'
   - Pass player, creature, pendingDamage as props

### Verification
- LUCK stat displays on character
- After taking damage, luck test modal appears
- Testing luck modifies damage correctly (1 or 3)
- LUCK decreases by 1 after test
- Can decline luck test
- Luck test for creature damage works
- Luck Potion restores luck (from Feature 2)
- Combat log shows luck test results

---

## Feature 4: Spell Casting (Both Player & Creatures)

**Goal:** Add spell casting system with mana, spells for both player and creatures

### Critical Files
- **NEW:** `/Users/rhyd/code/advent-urer/src/utils/spells.ts` - Spell definitions and effects
- **NEW:** `/Users/rhyd/code/advent-urer/src/components/SpellBook.tsx` - Spell selection UI
- **NEW:** `/Users/rhyd/code/advent-urer/src/components/SpellCastAnimation.tsx` - Visual spell effects
- **MODIFY:** `/Users/rhyd/code/advent-urer/src/types.ts` - Add Spell, mana to Character/Creature
- **MODIFY:** `/Users/rhyd/code/advent-urer/src/store/gameStore.ts` - Add spell casting logic
- **MODIFY:** `/Users/rhyd/code/advent-urer/src/components/CharacterSelectScreen.tsx` - Assign spells by class
- **MODIFY:** `/Users/rhyd/code/advent-urer/src/components/CharacterStats.tsx` - Display MANA stat
- **MODIFY:** `/Users/rhyd/code/advent-urer/src/components/BattleScreen.tsx` - Add "Cast Spell" button
- **MODIFY:** `/Users/rhyd/code/advent-urer/src/components/CombatLogModal.tsx` - Show spell events
- **MODIFY:** `/Users/rhyd/code/advent-urer/src/data/creatures.ts` - Add spells to creatures

### Implementation Steps

1. **Define spell system**
   - Create `src/utils/spells.ts`
   - Export `SPELL_LIBRARY` with 8-10 spells:
     - Magic Missile (3 mana): 3 damage
     - Fireball (5 mana): 5 damage
     - Healing Light (4 mana): 4 stamina restore
     - Shield (3 mana): +2 skill for 1 round
     - Weakness (4 mana): -2 enemy skill for 1 round
     - Drain (6 mana): 4 damage + heal 2
   - Export `applySpellEffect(spell, caster, target)`
   - Export `getStartingSpells(characterClass)`

2. **Update types**
   - Add `SpellEffect = 'damage' | 'heal' | 'skill_boost' | 'skill_drain'`
   - Add `Spell` interface with id, name, description, effect, power, manaCost
   - Add `mana`, `maxMana`, `spells: string[]` to Character
   - Add optional `mana`, `maxMana`, `spells`, `spellCastChance` to Creature
   - Add `SPELL_SELECT` to GamePhase

3. **Update character creation**
   - Warriors: 10 mana, 2 spells (Magic Missile, Shield)
   - Wizards: 16 mana, 4 spells (Magic Missile, Fireball, Healing Light, Shield)
   - Thieves: 12 mana, 3 spells (Magic Missile, Weakness, Drain)
   - Update class descriptions in CharacterSelectScreen

4. **Add spells to creatures**
   - Update `src/data/creatures.ts`:
     - Wizard Boss: 12 mana, [Fireball, Drain]
     - Dark Sorcerer: 15 mana, [Fireball, Weakness, Magic Missile]
     - Dragon: 20 mana, [Fireball, Drain]
   - Set spellCastChance (30-50%)

5. **Add MANA display**
   - Update CharacterStats to show MANA below LUCK
   - Blue/purple color theme
   - Show as "MANA X / Y" with bar

6. **Create SpellBook component**
   - Modal overlay for spell selection
   - Display player's available spells
   - Each spell card: name, description, mana cost, castable indicator
   - "Cast" button for each spell
   - "Cancel" button to return
   - Disable if insufficient mana

7. **Add spell casting to battle**
   - In BattleScreen: Add "Cast Spell" button next to Attack
   - Only show if player has spells
   - Click opens SpellBook
   - Disable during rolling/results

8. **Implement spell casting logic**
   - Add `castSpell(spellId)` action:
     - Verify mana cost
     - Apply spell effect (damage, heal, buff)
     - Deduct mana
     - Create combat log entry
     - Creature responds (attack or spell)
     - Check battle end
   - Add `openSpellBook` to transition to SPELL_SELECT
   - Add `cancelSpellCast` to return to BATTLE

9. **Add creature spell AI**
   - In combat flow, after player action:
     - Roll vs spellCastChance
     - If casting: choose random spell with sufficient mana
     - Apply spell effect
     - Log to combat log

10. **Create spell animations**
    - Create SpellCastAnimation component
    - Different effects per type:
      - Damage: Red flash
      - Heal: Green glow
      - Buff: Blue shimmer
    - Brief 1-2 second animation

11. **Update combat log**
    - Show spell casting events
    - Display mana cost
    - Different visual from normal attacks

### Verification
- Mana displays for characters
- Different classes have different spells
- Can cast damage spell (reduces creature stamina)
- Can cast healing spell (restores stamina, not above max)
- Mana decreases after casting
- Cannot cast with insufficient mana
- Creature can cast spells
- Spell effects in combat log
- Mana resets on new battle

---

## Feature 5: Victory Statistics & Achievements

**Goal:** Track statistics across battles, persist in localStorage, display achievements

### Critical Files
- **NEW:** `/Users/rhyd/code/advent-urer/src/utils/achievements.ts` - Achievement definitions
- **NEW:** `/Users/rhyd/code/advent-urer/src/utils/statistics.ts` - Persistence layer
- **NEW:** `/Users/rhyd/code/advent-urer/src/components/StatisticsScreen.tsx` - Statistics dashboard
- **NEW:** `/Users/rhyd/code/advent-urer/src/components/AchievementUnlocked.tsx` - Notification toast
- **MODIFY:** `/Users/rhyd/code/advent-urer/src/types.ts` - Add Achievement, PlayerStatistics
- **MODIFY:** `/Users/rhyd/code/advent-urer/src/store/gameStore.ts` - Track and persist stats
- **MODIFY:** `/Users/rhyd/code/advent-urer/src/components/CharacterSelectScreen.tsx` - Add stats button
- **MODIFY:** `/Users/rhyd/code/advent-urer/src/components/BattleEndScreen.tsx` - Show updated stats
- **MODIFY:** `/Users/rhyd/code/advent-urer/src/App.tsx` - Render statistics overlay

### Implementation Steps

1. **Define achievements**
   - Create `src/utils/achievements.ts`
   - Export `ACHIEVEMENT_DEFINITIONS` with 15-20 achievements:
     - "First Blood" - Win first battle
     - "Warrior" - Win 10 battles
     - "Legend" - Win 50 battles
     - "Streak of 5/10" - Win streaks
     - "Giant Slayer" - Defeat legendary creature
     - "Speed Runner" - Win in 3 rounds
     - "Survivor" - Win with 2 stamina
     - "Lucky Strike" - Win 3 luck tests in one battle
     - "Spellcaster" - Cast 20 spells total
   - Export `checkAchievements(stats, battleData)`

2. **Update types**
   - Add `Achievement` interface
   - Add `CreatureStats` interface
   - Add `PlayerStatistics` interface
   - Add `statistics`, `showStatistics` to GameState

3. **Create statistics persistence**
   - Create `src/utils/statistics.ts`
   - Export `loadStatistics()` - from localStorage
   - Export `saveStatistics(stats)` - to localStorage
   - Export `getEmptyStatistics()` - default state
   - Handle schema migrations

4. **Initialize statistics in store**
   - Load statistics on store init
   - Add `loadStatistics` action
   - Add `saveStatistics` action

5. **Update battle end logic**
   - Add `updateStatistics` action (called on battle end):
     - Increment totalBattles
     - Update wins/losses
     - Update streaks
     - Update fastest victory
     - Update creature-specific stats
     - Call checkAchievements
     - Save to localStorage

6. **Create StatisticsScreen**
   - Full-screen modal layout
   - Overall stats section: battles, wins, losses, win rate, streaks, rounds
   - Per-creature stats: W-L for each creature
   - Achievements grid: locked/unlocked with dates
   - Close button

7. **Create achievement notification**
   - Toast notification (top center)
   - Gold theme
   - Icon, name, description
   - Slide-in animation
   - Auto-dismiss after 3 seconds
   - Queue multiple achievements

8. **Add statistics to character select**
   - Add "View Statistics" button
   - Show win streak badge if active
   - Open StatisticsScreen on click

9. **Update battle end screen**
   - Show stats update with +1 indicators
   - Highlight win streak if maintained
   - Show "NEW RECORD!" if personal best
   - Display newly unlocked achievements
   - Render achievement notifications

10. **Add reset statistics option**
    - In StatisticsScreen: "Reset Statistics" button
    - Confirmation dialog
    - Clear localStorage and reset state

### Verification
- Statistics update after battle
- Data persists across refresh
- Win streak increments/resets correctly
- Achievements unlock when conditions met
- Notification appears for new achievements
- Statistics screen displays all data
- Per-creature stats track correctly
- Personal bests highlighted
- Reset statistics works

---

## Testing Strategy

### After Each Feature
1. **Feature 1**: Creature selection works, images display, battle shows creature
2. **Feature 2**: Items usable, inventory resets, animations work
3. **Feature 3**: Luck tests work, potions restore luck, damage modifies correctly
4. **Feature 4**: Spells castable, mana system works, creatures cast spells
5. **Feature 5**: Statistics track, achievements unlock, persist across sessions

### Integration Testing
- Test all features together in one battle
- Use item → test luck → cast spell → win → check statistics
- Verify no conflicts between systems
- Test on mobile and desktop
- Test with different creatures and character classes

### Performance
- Check image loading times
- Verify localStorage doesn't block UI
- Test with many achievements unlocked
- Ensure animations don't cause lag

---

## Deployment Checklist

- [ ] All features implemented and tested
- [ ] No TypeScript errors (`npm run build`)
- [ ] All images optimized and committed
- [ ] localStorage handles errors gracefully
- [ ] Mobile responsive on all screens
- [ ] Haptic feedback works
- [ ] Combat log shows all event types
- [ ] Statistics persist correctly
- [ ] Git commit with feature summary
- [ ] Deploy to Vercel
- [ ] Test on actual mobile device

---

## Architecture Summary

**State Management:** All features integrate into single Zustand store with phase-based state machine

**Data Persistence:**
- Creature library: Static data in `/src/data/creatures.ts`
- Statistics: localStorage via `/src/utils/statistics.ts`
- Battle state: In-memory Zustand store (resets on refresh)

**Component Hierarchy:**
```
App.tsx
├── CharacterSelectScreen (with CreatureLibrary)
├── BattleScreen
│   ├── CharacterStats (with images, all stats)
│   ├── Die components
│   ├── InventoryPanel
│   ├── SpellBook modal
│   ├── LuckTestModal
│   └── CombatLogModal
├── BattleEndScreen (with stats updates)
└── StatisticsScreen overlay
```

**File Organization:**
- `/src/components/` - React components
- `/src/store/` - Zustand store
- `/src/utils/` - Pure functions (combat, items, luck, spells, statistics, achievements)
- `/src/data/` - Static data (creatures, spells library)
- `/public/creatures/` - Image assets

---

## Estimated Complexity

- **Feature 1 (Creature Pictures)**: Medium - Asset management, component structure
- **Feature 2 (Potions)**: Low - Simple state management and UI
- **Feature 3 (Luck)**: Medium - Combat flow modification, new phase
- **Feature 4 (Spells)**: High - Complex interactions, AI, multiple components
- **Feature 5 (Statistics)**: Medium - Persistence, achievement logic, large UI

**Total Estimate**: ~40-60 implementation steps across all features

---

## Success Criteria

✅ All 5 features fully functional
✅ No breaking changes to existing gameplay
✅ Mobile-responsive and touch-friendly
✅ Maintains Fighting Fantasy theme and feel
✅ Statistics persist across sessions
✅ All interactions have visual/haptic feedback
✅ TypeScript type-safe throughout
✅ Build succeeds without errors
✅ Deployed to production

