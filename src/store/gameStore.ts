import { create } from 'zustand'
import type { GameState, GamePhase, CombatLogEntry } from '../types'
import {
  roll2d6,
  calculateAttackStrength,
  determineCombatResult,
  parseCreatureFromURL,
} from '../utils/combat'
import { DEFAULT_INVENTORY, applyItemEffect } from '../utils/items'

interface GameStore extends GameState {
  // Actions
  selectCreature: (name: string, skill: number, stamina: number, imageUrl?: string) => void
  createCharacter: (name: string, skill: number, stamina: number) => void
  startBattle: () => void
  rollAttack: () => void
  rollSpecialAttack: () => void
  advancePhase: (phase: GamePhase) => void
  resetGame: () => void
  toggleFullLog: () => void
  useItem: (itemId: string) => void
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
  inventory: [],
  lastRoundSummary: '',
  showFullLog: false,
}

export const useGameStore = create<GameStore>((set, get) => ({
  ...initialState,

  selectCreature: (name: string, skill: number, stamina: number, imageUrl?: string) => {
    set({
      creature: {
        name,
        skill,
        maxStamina: stamina,
        currentStamina: stamina,
        imageUrl,
      },
    })
  },

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
      inventory: JSON.parse(JSON.stringify(DEFAULT_INVENTORY)), // Deep copy
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

  rollSpecialAttack: () => {
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
      // Roll for backfire (1-4 = success 75%, 5-6 = backfire 25%)
      const backfireRoll = Math.floor(Math.random() * 4) + 1
      const backfired = backfireRoll > 3

      const newRound = state.currentRound + 1

      let newPlayerStamina = state.player!.currentStamina
      let newCreatureStamina = state.creature.currentStamina
      let summary = ''
      let result: 'player_hit' | 'creature_hit' | 'draw'

      if (backfired) {
        // Backfire! Player takes damage
        newPlayerStamina = Math.max(0, newPlayerStamina - 2)
        summary = `Round ${newRound}: SPECIAL ATTACK BACKFIRED! You take 2 damage!`
        result = 'creature_hit'

        // Haptic feedback for backfire
        if (navigator.vibrate) {
          navigator.vibrate([20, 50, 20])
        }
      } else {
        // Success! Creature takes double damage
        newCreatureStamina = Math.max(0, newCreatureStamina - 4)
        summary = `Round ${newRound}: SPECIAL ATTACK! Critical hit! ${state.creature.name} takes 4 damage!`
        result = 'player_hit'

        // Strong haptic for critical hit
        if (navigator.vibrate) {
          navigator.vibrate([20, 50, 20, 50, 20])
        }
      }

      // Create log entry (using special values to indicate special attack)
      const logEntry = {
        round: newRound,
        playerRoll: backfired ? -1 : -2, // Special markers for special attack
        creatureRoll: 0,
        playerAttackStrength: backfired ? 0 : 999,
        creatureAttackStrength: backfired ? 999 : 0,
        result,
      }

      // Transition to ROUND_RESULT
      set({
        gamePhase: 'ROUND_RESULT',
        currentRound: newRound,
        combatLog: [logEntry, ...state.combatLog],
        currentPlayerRoll: backfired ? 0 : 99, // Display indicators
        currentCreatureRoll: backfired ? 99 : 0,
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

  useItem: (itemId: string) => {
    const state = get()
    if (!state.player || state.gamePhase !== 'BATTLE') return

    const item = state.inventory.find(item => item.id === itemId)
    if (!item || item.remaining <= 0) return

    // Check if item can be used (e.g., can't heal above max stamina)
    if (item.effect.type === 'heal' && state.player.currentStamina >= state.player.maxStamina) {
      return
    }

    // Apply item effect
    const updatedPlayer = applyItemEffect(item, state.player)

    // Update inventory - decrement remaining count
    const updatedInventory = state.inventory.map(invItem =>
      invItem.id === itemId
        ? { ...invItem, remaining: invItem.remaining - 1 }
        : invItem
    )

    // Haptic feedback for item usage
    if (navigator.vibrate) {
      navigator.vibrate([10, 50, 10])
    }

    set({
      player: updatedPlayer,
      inventory: updatedInventory,
    })
  },

  toggleFullLog: () => {
    set((state) => ({ showFullLog: !state.showFullLog }))
  },
}))
