# Fighting Fantasy Battle Simulator - Design Document

**Date:** 2025-12-04
**Purpose:** Personal nostalgia project with potential for friend sharing
**Platform:** Mobile-only web app (Vercel hosted)
**Vision:** Foundation for future features (items, abilities, adventure mode)

---

## Design Decisions Summary

- **Architecture:** React + Zustand + State Machine Pattern
- **Dice:** 2D animated dice (focus on feel over 3D complexity)
- **Character Creation:** Proper FF rolling (1d6+6 SKILL, 2d6+12 STAMINA) + 3 preset quick-starts
- **Creature Selection:** URL parameters now, designed for creature library later
- **Visual Style:** Nostalgic but clean - FF fonts/colors, modern polished UI
- **Device:** Mobile-only (320-428px width, portrait primary)
- **Combat Log:** Minimal banner showing last round, tap to expand full history
- **Feedback:** Haptics only (no sound)
- **Sharing:** Native mobile share sheet
- **End Game:** Full reset to character selection

---

## Game States & Data Model

### State Machine Flow
```
CHARACTER_SELECT → BATTLE → DICE_ROLLING → ROUND_RESULT → BATTLE (loop) → BATTLE_END
```

### Zustand Store Structure
```typescript
interface GameState {
  // Game phase
  gamePhase: 'CHARACTER_SELECT' | 'BATTLE' | 'DICE_ROLLING' | 'ROUND_RESULT' | 'BATTLE_END'

  // Player
  player: {
    name: string
    skill: number
    maxStamina: number
    currentStamina: number
  }

  // Creature (from URL or default)
  creature: {
    name: string
    skill: number
    maxStamina: number
    currentStamina: number
  }

  // Combat tracking
  currentRound: number
  combatLog: Array<{
    round: number
    playerRoll: number
    creatureRoll: number
    playerAttackStrength: number
    creatureAttackStrength: number
    result: 'player_hit' | 'creature_hit' | 'draw'
  }>

  // UI state
  lastRoundSummary: string
  showFullLog: boolean
}
```

### Key Actions
- `createCharacter(preset | rolled)` - Initialize player
- `startBattle()` - Load creature from URL, transition to BATTLE
- `rollAttack()` - Roll dice, calculate results, update stamina
- `advancePhase()` - Move through states
- `resetGame()` - Back to CHARACTER_SELECT

---

## Component Structure

### Hierarchy
```
<App>
  ├─ <CharacterSelectScreen>
  │   ├─ <PresetButton> (x3: Warrior, Rogue, Barbarian)
  │   ├─ <RollYourOwnButton>
  │   └─ <CharacterRollModal> (shows dice rolling for stats)
  │
  ├─ <BattleScreen>
  │   ├─ <BattleHeader> (title)
  │   ├─ <StatsGrid>
  │   │   ├─ <CharacterStats> (player)
  │   │   └─ <CharacterStats> (creature)
  │   ├─ <DiceArea>
  │   │   ├─ <Die> (player's die, animated)
  │   │   └─ <Die> (creature's die, animated)
  │   ├─ <RoundResultBanner> (minimal, tap to expand)
  │   ├─ <CombatLogModal> (full history, shown when banner tapped)
  │   └─ <AttackButton> (large, disabled during DICE_ROLLING)
  │
  └─ <BattleEndScreen>
      ├─ <VictoryDefeatMessage>
      ├─ <ShareButton> (native share sheet)
      └─ <FightAgainButton>
```

### Component Philosophy
- Each screen is a separate component based on `gamePhase`
- Shared components (`<CharacterStats>`, `<Die>`) are reusable
- Components read from Zustand store, dispatch actions on user interaction
- No prop drilling - components access store directly
- Animations handled in individual components (CSS transitions + React state)
- **No routing needed** - single-page app where `gamePhase` determines what renders

---

## Character Selection Flow

### Preset Characters
```typescript
const PRESETS = {
  warrior: { skill: 10, stamina: 20 },
  rogue: { skill: 9, stamina: 18 },
  barbarian: { skill: 8, stamina: 24 }
}
```

### UI Flow
1. **Initial screen:** Title, name input field, 4 buttons (3 presets + "Roll Your Own")
2. **Name required:** All buttons disabled until name is entered
3. **Preset selection:** Click button → instant transition to BATTLE with those stats
4. **Roll Your Own:**
   - Opens modal overlay
   - "Rolling SKILL..." → animates 1d6, shows result, displays "SKILL: X" (result + 6)
   - "Rolling STAMINA..." → animates 2d6, shows result, displays "STAMINA: Y" (result + 12)
   - Shows final stats with "Accept" and "Reroll" buttons
   - Accept → transition to BATTLE

### Rolling Animation
When rolling stats, the `<Die>` component cycles through random numbers (1-6) for ~1 second, then lands on the actual roll. Haptic feedback on final result. This gives the satisfying "physical dice" feel without 3D complexity.

### Creature Loading
On mount, App reads URL params (`?creatureName=Orc&creatureSkill=7&creatureStamina=6`). If present, loads creature. If missing params, falls back to defaults (Goblin, 5, 6). Creature is stored in Zustand and ready when player finishes character selection.

---

## Battle Loop & Dice Animation

### Combat Round Sequence

1. **BATTLE phase:** Player sees stats, last round result (or "BEGIN BATTLE!"), large ATTACK button

2. **Player taps ATTACK:**
   - Transition to DICE_ROLLING phase (button disabled)
   - Haptic feedback (light tap)
   - Roll 2d6 for player, 2d6 for creature simultaneously

3. **DICE_ROLLING phase (~1.5 seconds):**
   - Both dice animate (cycling through 1-6 rapidly)
   - Dice land on results at same time
   - Medium haptic on dice landing
   - Calculate attack strengths:
     - Player: roll + player.skill
     - Creature: roll + creature.skill

4. **ROUND_RESULT phase (~1 second auto-advance):**
   - Compare attack strengths
   - If player higher: creature takes 2 damage, heavy haptic
   - If creature higher: player takes 2 damage, heavy haptic
   - If equal: draw, no damage, light haptic
   - Update stamina values (animate number change)
   - Generate round summary text
   - Add to combat log array

5. **Check win condition:**
   - If either stamina ≤ 0 → BATTLE_END
   - Otherwise → back to BATTLE phase (loop continues)

### Dice Component
Simple 2D div styled as die face with dots. CSS animation: rotate + scale during roll, spring back on land. No 3D library needed.

---

## Combat Log & Result Display

### Round Result Banner (Minimal UI)
- Fixed position near top of screen (below stats grid)
- Shows only the most recent round: `"Round 3: You rolled 8, Orc rolled 6. You win! Orc takes 2 damage."`
- Color-coded: green background for player wins, red for player hit, gray for draws
- Subtle tap indicator (like "↓ Tap for history")
- Tapping opens `<CombatLogModal>`

### Combat Log Modal
- Slides up from bottom (native mobile sheet feel)
- Semi-transparent backdrop, tap to close
- Scrollable list of all rounds (newest at top)
- Each round formatted consistently:
  ```
  Round 5: You rolled 11, Orc rolled 9
  → You win! Orc takes 2 damage.

  Round 4: You rolled 7, Orc rolled 7
  → Draw! No damage.
  ```
- Same color-coding as banner for quick scanning
- Close button at top

### Battle End Screen
- Large dramatic text: "VICTORY IS YOURS!" (green) or "YOU ARE DEAD!" (red)
- Shows final stats (your stamina vs creature stamina)
- Round count: "Victory in 7 rounds!"
- Two large buttons:
  - "SHARE RESULT" → native share sheet with text: "[YourName] fought [Creature] and [won/was defeated]!"
  - "FIGHT AGAIN" → reset to character select

---

## Styling & Mobile UX

### Visual Design (Nostalgic but Clean)

**Colors:**
- Background: Warm off-white (#F4E8D0 - parchment-inspired)
- Primary text: Dark brown (#3E2723)
- Accent: Deep red (#B71C1C) for damage/danger
- Success: Forest green (#2E7D32)

**Typography:**
- Headings: Google Fonts "Cinzel" (medieval serif, clean & readable)
- Body: System font stack (SF Pro on iOS) for performance
- Fallback: Georgia → serif

**Design Principles:**
- No textures/grain - clean flat colors for modern feel
- Generous whitespace
- Clear visual hierarchy

### Mobile Layout (Portrait, 375px baseline)
- **Vertical stack flow:** Title → Stats → Dice → Banner → Button
- **Stats Grid:** 2 columns, clearly separated with subtle border
- **Touch targets:** All buttons minimum 48px height
- **Spacing:** Generous padding (16-24px) for thumb-friendly UI
- **Dice area:** Large (120px dice) for visual impact
- **Fixed button:** ATTACK button sticky at bottom, always accessible

### Animations
- Dice roll: CSS keyframe rotation + scale
- Stamina damage: Number count-down with red flash
- Phase transitions: Fade in/out (200ms)
- All 60fps, GPU-accelerated transforms

### Haptic Timing
- Button press: `navigator.vibrate(10)` - light tap
- Dice land: `navigator.vibrate(20)` - medium
- Damage dealt: `navigator.vibrate([20, 50, 20])` - strong pattern

---

## URL Parameters & Sharing

### URL Parameter Handling
```typescript
// On app mount, parse URL once:
const params = new URLSearchParams(window.location.search)
const creature = {
  name: params.get('creatureName') || 'Goblin',
  skill: parseInt(params.get('creatureSkill')) || 5,
  stamina: parseInt(params.get('creatureStamina')) || 6
}
```

### Validation
- If skill/stamina are invalid (NaN, negative, or >50), fall back to defaults
- No error messages - just silently use defaults (better UX for sharing)
- Valid ranges: Skill 1-12, Stamina 1-99 (Fighting Fantasy typical ranges)

### Example URLs
```
https://yourapp.vercel.app
→ Fights default Goblin (5/6)

https://yourapp.vercel.app?creatureName=Dragon&creatureSkill=12&creatureStamina=30
→ Fights scary Dragon (12/30)
```

### Share Implementation
```typescript
const shareResult = async () => {
  const text = `${player.name} fought ${creature.name} and ${
    player.currentStamina > 0 ? 'won' : 'was defeated'
  }!`

  if (navigator.share) {
    await navigator.share({ text })
  } else {
    // Fallback: copy to clipboard
    navigator.clipboard.writeText(text)
    // Show toast: "Copied to clipboard!"
  }
}
```

### Future Extension Hook
When you add creature library later, you can generate shareable URLs: "Share this creature" button creates URL with params so friends can fight it.

---

## Future Extensibility Hooks

### How the Design Supports Future Features

**1. Items & Equipment:**
- Add `player.equipment: Array<Item>` to state
- Items modify skill/stamina: `effectiveSkill = player.skill + equipmentBonus()`
- New game phase: `INVENTORY` (access from battle screen)
- Components already modular - add `<InventoryScreen>` easily

**2. Special Abilities:**
- Add `abilities: Array<Ability>` to player/creature
- New phase: `ABILITY_SELECT` (after ATTACK, before DICE_ROLLING)
- Abilities modify combat: "Fury: +2 to attack this round"
- Combat log already tracks details - just extend the format

**3. Multiple Creatures (Sequential):**
- Change `creature` to `creatures: Array<Creature>` with `currentCreatureIndex`
- After defeating one, check if more remain: `if (currentCreatureIndex < creatures.length - 1)` → fight next
- Victory screen shows: "Defeated 3/3 creatures!"

**4. Creature Library:**
- Create `creatures.ts` with preset creature data
- Add `<CreatureSelectScreen>` phase before battle
- Grid of creature cards to choose from
- URL params still work as override/sharing mechanism

**5. Adventure Mode:**
- Add `adventure: { currentNode, choices }` to state
- New phases: `STORY`, `CHOICE`, `BATTLE`, `STORY`...
- Battles become part of adventure flow instead of standalone
- Same battle components, just different navigation

**Why This Works:**
- State machine pattern makes adding phases simple
- Zustand store easily extended with new fields
- Components are small and focused - add new ones without touching existing
- No routing means no URL complexity when adding features

---

## Tech Stack & Implementation

### Dependencies
```json
{
  "react": "^18.3.0",
  "zustand": "^4.5.0",
  "typescript": "^5.0.0"
}
```

### Dev Dependencies
```json
{
  "vite": "^5.0.0",
  "tailwindcss": "^3.4.0"
}
```

### Why These Choices
- **Vite:** Fast dev server, optimized builds, perfect for single-page apps
- **Zustand:** Minimal state management (1kb), no boilerplate, perfect for game state
- **Tailwind:** Utility-first CSS, fast mobile-first styling, no CSS file bloat
- **TypeScript:** Type safety for game logic, prevents stat/state bugs

### Project Structure
```
src/
├── store/
│   └── gameStore.ts          # Zustand store with actions
├── components/
│   ├── CharacterSelectScreen.tsx
│   ├── BattleScreen.tsx
│   ├── BattleEndScreen.tsx
│   ├── Die.tsx               # Reusable dice component
│   ├── CharacterStats.tsx    # Reusable stat display
│   └── CombatLogModal.tsx
├── utils/
│   └── combat.ts             # Pure functions: rollDice(), calculateAttack()
├── types.ts                  # TypeScript interfaces
└── App.tsx                   # Main router based on gamePhase
```

### Vercel Deployment
- Simple: `vercel.json` with build command
- No environment variables needed
- Mobile-optimized meta tags in `index.html`

### Implementation Order
1. Set up Vite + Tailwind project
2. Create Zustand store with types
3. Build CharacterSelectScreen (simplest)
4. Build BattleScreen with static UI
5. Add dice animation and combat logic
6. Add BattleEndScreen
7. Polish: haptics, animations, share
8. Deploy to Vercel

---

## Summary

This design provides a solid foundation for a nostalgic Fighting Fantasy battle simulator that captures the feel of the original gamebooks while leveraging modern web technologies. The state machine architecture and modular component design ensure the app can grow naturally as new features are added, while the mobile-first approach and haptic feedback create an engaging, tactile experience.

The URL parameter system enables easy sharing of custom battles, and the clean separation between game logic (Zustand store) and presentation (React components) keeps the codebase maintainable as complexity grows.