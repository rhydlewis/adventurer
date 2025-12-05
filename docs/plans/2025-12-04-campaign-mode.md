# Campaign Mode Implementation Plan

## Overview
Add campaign mode with score tracking and progressive battles. Players can continue after victory with partial healing, fighting increasingly difficult creatures.

## User Requirements
- **Default Mode**: Single battle (campaign is optional)
- **Victory Recovery**: 50% damage healed, +1 LUCK restored (capped at max)
- **Creature Selection**: Can fight same creature multiple times
- **Difficulty**: Progressive scaling based on battle count
- **Score Display**: Always visible during campaign
- **High Scores**: Track player names with scores

## Implementation Phases

### Phase 1: Type Definitions and State Schema

**File**: `src/types.ts`

Add new interfaces:

```typescript
export interface CampaignState {
  isActive: boolean
  score: number
  battlesWon: number
  totalDamageDealt: number
  totalDamageTaken: number
  perfectVictories: number // No damage taken
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
```

Update GamePhase type:
```typescript
export type GamePhase =
  | 'CHARACTER_SELECT'
  | 'AVATAR_SELECT'
  | 'CREATURE_SELECT'
  | 'BATTLE'
  | 'DICE_ROLLING'
  | 'LUCK_TEST'
  | 'ROUND_RESULT'
  | 'BATTLE_END'
  | 'CAMPAIGN_VICTORY'  // NEW
  | 'CAMPAIGN_END'      // NEW
```

### Phase 2: Utility Functions

**File**: `src/utils/scoring.ts` (NEW)

```typescript
export function calculateBattleScore(params: {
  roundsCompleted: number
  damageDealt: number
  damageTaken: number
  creatureDifficulty: CreatureDifficulty
  isPerfectVictory: boolean
  currentStreak: number
}): number {
  // Base points: 100 per round survived
  let score = params.roundsCompleted * 100

  // Difficulty multiplier
  const difficultyMultipliers = {
    easy: 1.0,
    medium: 1.5,
    hard: 2.0,
    legendary: 3.0
  }
  score *= difficultyMultipliers[params.creatureDifficulty]

  // Bonuses
  if (params.isPerfectVictory) score += 1000
  if (params.damageTaken === 0) score += 500
  score += params.damageDealt * 50
  score += params.currentStreak * 200

  return Math.floor(score)
}
```

**File**: `src/utils/difficulty.ts` (NEW)

```typescript
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
```

**File**: `src/utils/recovery.ts` (NEW)

```typescript
export function calculateRecovery(player: Character): {
  staminaRestored: number
  luckRestored: number
} {
  const damageDealt = player.maxStamina - player.currentStamina
  const staminaRestored = Math.floor(damageDealt * 0.5)

  const luckRestored = player.luck < player.maxLuck ? 1 : 0

  return { staminaRestored, luckRestored }
}
```

**File**: `src/utils/storage.ts` (NEW)

```typescript
const HIGH_SCORES_KEY = 'ff_battle_high_scores'
const MAX_HIGH_SCORES = 10

export function saveHighScore(entry: HighScoreEntry): void {
  const scores = getHighScores()
  scores.push(entry)
  scores.sort((a, b) => b.score - a.score)
  localStorage.setItem(HIGH_SCORES_KEY, JSON.stringify(scores.slice(0, MAX_HIGH_SCORES)))
}

export function getHighScores(): HighScoreEntry[] {
  const data = localStorage.getItem(HIGH_SCORES_KEY)
  return data ? JSON.parse(data) : []
}
```

### Phase 3: Store Updates

**File**: `src/store/gameStore.ts`

Add to state interface (around line 35):
```typescript
campaignState: CampaignState | null
```

Add new actions:
```typescript
startCampaign: () => void
endCampaign: () => void
recordBattleVictory: () => void
applyCampaignRecovery: () => void
```

Implementation details:

1. **startCampaign** (after selectCreature):
   - Set `campaignState.isActive = true`
   - Store starting stats
   - Initialize score tracking

2. **recordBattleVictory** (called from battle end):
   - Calculate battle score using scoring.ts
   - Update campaign totals
   - Add to battleHistory
   - Transition to 'CAMPAIGN_VICTORY' phase

3. **applyCampaignRecovery** (called before next battle):
   - Use recovery.ts to heal 50% damage
   - Restore 1 LUCK (capped)
   - Apply progressive difficulty to next creature
   - Reset to 'CREATURE_SELECT' phase

4. **endCampaign** (on defeat or manual end):
   - Save high score via storage.ts
   - Transition to 'CAMPAIGN_END' phase
   - Show final stats

### Phase 4: New Components

**File**: `src/components/ScoreDisplay.tsx` (NEW)

Small overlay showing current campaign score and battles won. Position: top-right of screen during battle and creature selection.

```typescript
export function ScoreDisplay() {
  const campaignState = useGameStore((state) => state.campaignState)

  if (!campaignState?.isActive) return null

  return (
    <div className="fixed top-4 right-4 bg-white/90 rounded-lg p-3 shadow-lg">
      <div className="text-sm font-bold text-dark-brown">
        Score: {campaignState.score.toLocaleString()}
      </div>
      <div className="text-xs text-dark-brown/70">
        Battles: {campaignState.battlesWon}
      </div>
    </div>
  )
}
```

**File**: `src/components/CampaignVictoryScreen.tsx` (NEW)

Shows between battles:
- Battle score breakdown
- Total campaign score
- Recovery stats (stamina/luck restored)
- "Choose Next Foe" button
- "End Campaign" button

**File**: `src/components/CampaignEndScreen.tsx` (NEW)

Shows on defeat or campaign end:
- Final score
- Battles won
- Statistics (damage dealt/taken, perfect victories)
- High score ranking
- "View High Scores" button
- "New Game" button

**File**: `src/components/HighScoresModal.tsx` (NEW)

Modal displaying top 10 high scores with:
- Rank, player name, score, battles won, date

### Phase 5: UI Integration

**File**: `src/components/CharacterSelectScreen.tsx`

Add "Start Campaign" button next to "Continue" after character creation. Sets campaign mode before proceeding to avatar selection.

**File**: `src/components/CreatureSelectScreen.tsx`

1. Add ScoreDisplay component (top-right)
2. If in campaign mode:
   - Show "Battle X" heading
   - Apply progressive difficulty to displayed creature stats
   - Change button text to "Begin Battle X"

**File**: `src/components/BattleScreen.tsx`

1. Add ScoreDisplay component (top-right)
2. No other changes needed

**File**: `src/components/BattleEndScreen.tsx`

Update victory/defeat logic:
- If `campaignState.isActive`:
  - On victory: call `recordBattleVictory()` → go to CAMPAIGN_VICTORY
  - On defeat: call `endCampaign()` → go to CAMPAIGN_END
- Else: show normal victory/defeat screen

**File**: `src/App.tsx`

Add route handling for new phases:
```typescript
if (gamePhase === 'CAMPAIGN_VICTORY') {
  return <CampaignVictoryScreen />
}

if (gamePhase === 'CAMPAIGN_END') {
  return <CampaignEndScreen />
}
```

### Phase 6: Testing & Edge Cases

1. **Test campaign flow**: Start → Win → Continue → Win → End
2. **Test defeat mid-campaign**: Verify high score saved
3. **Test recovery math**: Verify 50% healing and luck restoration
4. **Test progressive difficulty**: Verify scaling after 2, 4, 6 battles
5. **Test high scores**: Verify sorting and persistence
6. **Test score calculation**: Verify all bonuses apply correctly
7. **Test same creature selection**: Should allow repeats

## Implementation Order

1. Add type definitions to types.ts
2. Create utility functions (scoring, difficulty, recovery, storage)
3. Update gameStore with new state and actions
4. Create ScoreDisplay component (used by multiple screens)
5. Create CampaignVictoryScreen component
6. Create CampaignEndScreen component
7. Create HighScoresModal component
8. Update CharacterSelectScreen (add campaign start)
9. Update CreatureSelectScreen (show score, apply difficulty)
10. Update BattleScreen (show score)
11. Update BattleEndScreen (route to campaign screens)
12. Update App.tsx (add routes)
13. Test complete flow
14. Fix bugs and refine

## Notes

- Campaign mode is **opt-in**: Default behavior remains single-battle
- Score persists only in localStorage (no backend)
- Progressive difficulty applies to creatures automatically
- Players can end campaign early from victory screen
- Defeat ends campaign immediately with score saved
