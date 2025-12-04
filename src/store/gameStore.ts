import { create } from 'zustand'
import type { GameState, GamePhase, CombatLogEntry } from '../types'
import {
  roll2d6,
  calculateAttackStrength,
  determineCombatResult,
  parseCreatureFromURL,
} from '../utils/combat'

interface GameStore extends GameState {
  // Actions
  createCharacter: (name: string, skill: number, stamina: number) => void
  startBattle: () => void
  rollAttack: () => void
  advancePhase: (phase: GamePhase) => void
  resetGame: () => void
  toggleFullLog: () => void
}

// Load creature from URL on initialization
const creatureData = parseCreatureFromURL()

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
  lastRoundSummary: '',
  showFullLog: false,
}

export const useGameStore = create<GameStore>((set, get) => ({
  ...initialState,

  createCharacter: (name: string, skill: number, stamina: number) => {
    set({
      player: {
        name,
        skill,
        maxStamina: stamina,
        currentStamina: stamina,
      },
    })
  },

  startBattle: () => {
    set({
      gamePhase: 'BATTLE',
      currentRound: 0,
      combatLog: [],
      currentPlayerRoll: null,
      currentCreatureRoll: null,
      lastRoundSummary: 'BEGIN BATTLE!',
    })
  },

  rollAttack: () => {
    const state = get()
    if (!state.player || state.gamePhase !== 'BATTLE') return

    // Haptic feedback on button press
    if (navigator.vibrate) {
      navigator.vibrate(10)
    }

    // Transition to DICE_ROLLING and clear previous rolls
    set({
      gamePhase: 'DICE_ROLLING',
      currentPlayerRoll: null,
      currentCreatureRoll: null
    })

    // Simulate dice rolling delay
    setTimeout(() => {
      const playerRoll = roll2d6()
      const creatureRoll = roll2d6()

      // Haptic feedback when dice land
      if (navigator.vibrate) {
        navigator.vibrate(20)
      }

      const playerAttackStrength = calculateAttackStrength(
        playerRoll,
        state.player!.skill
      )
      const creatureAttackStrength = calculateAttackStrength(
        creatureRoll,
        state.creature.skill
      )

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

      // Update stamina based on result
      let newPlayerStamina = state.player!.currentStamina
      let newCreatureStamina = state.creature.currentStamina

      if (result === 'player_hit') {
        newCreatureStamina = Math.max(0, newCreatureStamina - 2)
        // Strong haptic for damage dealt
        if (navigator.vibrate) {
          navigator.vibrate([20, 50, 20])
        }
      } else if (result === 'creature_hit') {
        newPlayerStamina = Math.max(0, newPlayerStamina - 2)
        // Strong haptic for damage taken
        if (navigator.vibrate) {
          navigator.vibrate([20, 50, 20])
        }
      }

      // Generate round summary
      let summary = `Round ${newRound}: Your attack ${playerAttackStrength}, ${state.creature.name}'s attack ${creatureAttackStrength}. `
      if (result === 'player_hit') {
        summary += `You win! ${state.creature.name} takes 2 damage.`
      } else if (result === 'creature_hit') {
        summary += `${state.creature.name} wins! You take 2 damage.`
      } else {
        summary += 'Draw! No damage.'
      }

      // Transition to ROUND_RESULT
      set({
        gamePhase: 'ROUND_RESULT',
        currentRound: newRound,
        combatLog: [logEntry, ...state.combatLog],
        currentPlayerRoll: playerRoll,
        currentCreatureRoll: creatureRoll,
        lastRoundSummary: summary,
        player: {
          ...state.player!,
          currentStamina: newPlayerStamina,
        },
        creature: {
          ...state.creature,
          currentStamina: newCreatureStamina,
        },
      })

      // Auto-advance after ROUND_RESULT
      setTimeout(() => {
        const currentState = get()
        if (
          currentState.player!.currentStamina <= 0 ||
          currentState.creature.currentStamina <= 0
        ) {
          set({ gamePhase: 'BATTLE_END' })
        } else {
          set({ gamePhase: 'BATTLE' })
        }
      }, 1000)
    }, 1500)
  },

  advancePhase: (phase: GamePhase) => {
    set({ gamePhase: phase })
  },

  resetGame: () => {
    // Reload creature from URL in case it changed
    const creatureData = parseCreatureFromURL()

    set({
      ...initialState,
      creature: {
        name: creatureData.name,
        skill: creatureData.skill,
        maxStamina: creatureData.stamina,
        currentStamina: creatureData.stamina,
      },
    })
  },

  toggleFullLog: () => {
    set((state) => ({ showFullLog: !state.showFullLog }))
  },
}))
