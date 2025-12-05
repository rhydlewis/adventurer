import { create } from 'zustand'
import type { GameState, GamePhase, CombatLogEntry, CombatResult, ReactionType, Reactions, BattleRecord, CreatureDifficulty, Character, Creature } from '../types'
import {
  roll2d6,
  calculateAttackStrength,
  determineCombatResult,
  parseCreatureFromURL,
} from '../utils/combat'
import { DEFAULT_INVENTORY, applyItemEffect } from '../utils/items'
import { performLuckTest } from '../utils/luck'
import { calculateBattleScore } from '../utils/scoring'
import { calculateRecovery } from '../utils/recovery'
import { saveHighScore } from '../utils/storage'
import { SPELL_LIBRARY, applySpellEffect } from '../utils/spells'

interface GameStore extends GameState {
  // Actions
  selectCreature: (name: string, skill: number, stamina: number, imageUrl?: string, reactions?: Reactions) => void
  createCharacter: (name: string, skill: number, stamina: number, luck: number, mana: number, spells: string[]) => void
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
  // Spell casting actions
  openSpellBook: () => void
  castSpell: (spellId: string) => void
  cancelSpellCast: () => void
  // Campaign actions
  startCampaign: () => void
  endCampaign: () => void
  recordBattleVictory: (creatureDifficulty: CreatureDifficulty) => void
  applyCampaignRecovery: () => void
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
  pendingLuckTest: null,
  activeEffects: [],
  lastRoundSummary: '',
  showFullLog: false,
  activeReaction: null,
  campaignState: null,
}

// Helper function to check battle end and advance phase
const checkBattleEndAndAdvance = (get: () => GameStore, set: (state: Partial<GameStore>) => void, delay: number) => {
  setTimeout(() => {
    const currentState = get()
    if (
      currentState.player!.currentStamina <= 0 ||
      currentState.creature.currentStamina <= 0
    ) {
      // Trigger victory/loss reactions
      if (currentState.player!.currentStamina <= 0) {
        get().triggerReaction('creature', 'victory')
        setTimeout(() => get().triggerReaction('player', 'loss'), 1000)
      } else {
        get().triggerReaction('player', 'victory')
        setTimeout(() => get().triggerReaction('creature', 'loss'), 1000)
      }
      set({ gamePhase: 'BATTLE_END' })
    } else {
      set({ gamePhase: 'BATTLE' })
    }
  }, delay)
}

export const useGameStore = create<GameStore>((set, get) => ({
  ...initialState,

  selectCreature: (name: string, skill: number, stamina: number, imageUrl?: string, reactions?: Reactions) => {
    set({
      creature: {
        name,
        skill,
        maxStamina: stamina,
        currentStamina: stamina,
        imageUrl,
        reactions,
      },
    })
  },

  createCharacter: (name: string, skill: number, stamina: number, luck: number, mana: number, spells: string[]) => {
    set({
      player: {
        name,
        skill,
        maxStamina: stamina,
        currentStamina: stamina,
        luck,
        maxLuck: luck,
        mana,
        maxMana: mana,
        spells,
        reactions: {
          gloat: ['Take that!', 'Too easy!', 'Mwah ha ha!', 'I smash you up!', 'Hah!', 'Surrender!', 'I triumph!',
            'Defeat is inevitable!'],
          cry: ['Ouch!', 'That hurt!', 'Aargh!', 'This is bad...', 'Ouch!', 'My wounds!', 'I am injured!',
            'This is the WORST!'],
          victory: ['I did it!', 'Victory!', 'Yes! I won!', 'I am victorious!', 'Victory is mine!',
            'I have prevailed!', 'Triumph!', 'I stand undeafted!'],
          loss: ['No...', 'I failed...', 'This cannot be...', 'I will return...', 'Defeat...', 'I am beaten...',
            'This is not over...', 'I shall rise again!']          }
      },
      gamePhase: 'AVATAR_SELECT',
    })
  },

  selectAvatar: (avatar: string) => {
    const state = get()
    if (!state.player) return

    set({
      player: {
        ...state.player,
        avatar,
      },
      gamePhase: 'CREATURE_SELECT',
    })
  },

  startBattle: () => {
    const state = get()

    set({
      gamePhase: 'BATTLE',
      currentRound: 0,
      combatLog: [],
      currentPlayerRoll: null,
      currentCreatureRoll: null,
      inventory: JSON.parse(JSON.stringify(DEFAULT_INVENTORY)), // Deep copy
      activeEffects: [],
      lastRoundSummary: 'BEGIN BATTLE!',
      // Reset player mana
      player: state.player ? {
        ...state.player,
        mana: state.player.maxMana,
        currentStamina: state.player.maxStamina,
        luck: state.player.maxLuck,
      } : null,
      // Reset creature mana if it has spells
      creature: state.creature.mana ? {
        ...state.creature,
        mana: state.creature.maxMana,
        currentStamina: state.creature.maxStamina,
      } : state.creature
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

      // Apply active effects to skill values
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
        state.player!.skill + playerSkillMod
      )
      const creatureAttackStrength = calculateAttackStrength(
        creatureRoll,
        state.creature.skill + creatureSkillMod
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

      let updatedCreature = state.creature
      let summary = ''

      // Apply block effects and calculate damage
      if (result === 'creature_hit') {
        let damage = 2
        if (creatureBlocked) {
          // Creature blocked - no damage
          damage = 0
          summary = `${state.creature.name} blocks your attack with magic!`

          updatedCreature = {
            ...state.creature,
            currentStamina: state.creature.currentStamina,
          }

          // Trigger reactions for blocked attack
          get().triggerReaction('creature', 'gloat')

          set({
            gamePhase: 'ROUND_RESULT',
            currentRound: newRound,
            combatLog: [logEntry, ...state.combatLog],
            currentPlayerRoll: playerRoll,
            currentCreatureRoll: creatureRoll,
            lastRoundSummary: summary,
            creature: updatedCreature,
            activeEffects: currentState.activeEffects.filter(effect => {
              // Remove skill buffs/debuffs and triggered blocks
              if (effect.type === 'skill_buff' || effect.type === 'skill_debuff') return false
              if (effect.type === 'block' && effect.target === 'creature') return false
              return true
            })
          })

          checkBattleEndAndAdvance(get, set, 1000)
        } else {
          // Normal hit - apply damage
          updatedCreature = {
            ...state.creature,
            currentStamina: Math.max(0, state.creature.currentStamina - damage),
          }
          summary = `You hit ${state.creature.name} for ${damage} damage!`

          // Trigger gloat reaction
          get().triggerReaction('player', 'gloat')

          set({
            gamePhase: 'ROUND_RESULT',
            currentRound: newRound,
            combatLog: [logEntry, ...state.combatLog],
            currentPlayerRoll: playerRoll,
            currentCreatureRoll: creatureRoll,
            lastRoundSummary: summary,
            creature: updatedCreature,
            activeEffects: currentState.activeEffects.filter(effect => {
              // Remove skill buffs/debuffs
              if (effect.type === 'skill_buff' || effect.type === 'skill_debuff') return false
              return true
            })
          })

          checkBattleEndAndAdvance(get, set, 1000)
        }
      } else if (result === 'player_hit') {
        if (playerBlocked) {
          // Player blocked - no damage
          summary = 'You block the attack with your arcane barrier!'

          set({
            gamePhase: 'ROUND_RESULT',
            currentRound: newRound,
            combatLog: [logEntry, ...state.combatLog],
            currentPlayerRoll: playerRoll,
            currentCreatureRoll: creatureRoll,
            lastRoundSummary: summary,
            activeEffects: currentState.activeEffects.filter(effect => {
              // Remove skill buffs/debuffs and triggered blocks
              if (effect.type === 'skill_buff' || effect.type === 'skill_debuff') return false
              if (effect.type === 'block' && effect.target === 'player') return false
              return true
            })
          })

          checkBattleEndAndAdvance(get, set, 1000)
        } else {
          // Creature hits player - offer luck test to reduce damage
          set({
            gamePhase: 'LUCK_TEST',
            currentRound: newRound,
            combatLog: [logEntry, ...state.combatLog],
            currentPlayerRoll: playerRoll,
            currentCreatureRoll: creatureRoll,
            pendingLuckTest: {
              damage: 2,
              target: 'player',
              type: 'reduce'
            },
            activeEffects: currentState.activeEffects.filter(effect => {
              // Remove skill buffs/debuffs (blocks stay if not triggered)
              if (effect.type === 'skill_buff' || effect.type === 'skill_debuff') return false
              return true
            })
          })
        }
      } else {
        // Draw - no damage, skip luck test
        summary = 'Draw! Both attacks were equal.'

        set({
          gamePhase: 'ROUND_RESULT',
          currentRound: newRound,
          combatLog: [logEntry, ...state.combatLog],
          currentPlayerRoll: playerRoll,
          currentCreatureRoll: creatureRoll,
          lastRoundSummary: summary,
          activeEffects: currentState.activeEffects.filter(effect => {
            // Remove skill buffs/debuffs
            if (effect.type === 'skill_buff' || effect.type === 'skill_debuff') return false
            return true
          })
        })

        // Auto-advance after ROUND_RESULT (only for draw case)
        checkBattleEndAndAdvance(get, set, 1000)
      }
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
      // Roll for backfire (1-4 = success 67%, 5-6 = backfire 33%)
      const backfireRoll = Math.floor(Math.random() * 6) + 1
      const backfired = backfireRoll > 4

      const newRound = state.currentRound + 1

      let result: 'player_hit' | 'creature_hit' | 'draw'

      if (backfired) {
        // Backfire! Player takes damage
        result = 'creature_hit'

        // Create log entry (using special values to indicate special attack)
        const logEntry = {
          round: newRound,
          playerRoll: -1, // Special marker for backfired special attack
          creatureRoll: 0,
          playerAttackStrength: 0,
          creatureAttackStrength: 999,
          result,
        }

        // Trigger luck test for backfire damage
        set({
          gamePhase: 'LUCK_TEST',
          currentRound: newRound,
          combatLog: [logEntry, ...state.combatLog],
          currentPlayerRoll: 0, // Display indicators
          currentCreatureRoll: 99,
          pendingLuckTest: {
            damage: 2,
            target: 'player',
            type: 'reduce'
          }
        })

      } else {
        // Success! Creature takes double damage
        result = 'player_hit'

        // Create log entry (using special values to indicate special attack)
        const logEntry = {
          round: newRound,
          playerRoll: -2, // Special marker for successful special attack
          creatureRoll: 0,
          playerAttackStrength: 999,
          creatureAttackStrength: 0,
          result,
        }

        // Apply special attack damage directly (no luck test for dealing damage)
        const newCreatureStamina = Math.max(0, state.creature.currentStamina - 4)
        const summary = `Round ${newRound}: Special attack hits for 4 damage!`

        // Trigger gloat reaction
        get().triggerReaction('player', 'gloat')

        set({
          gamePhase: 'ROUND_RESULT',
          currentRound: newRound,
          combatLog: [logEntry, ...state.combatLog],
          currentPlayerRoll: 99, // Display indicators
          currentCreatureRoll: 0,
          lastRoundSummary: summary,
          creature: {
            ...state.creature,
            currentStamina: newCreatureStamina,
          },
        })

        // Auto-advance after ROUND_RESULT
        checkBattleEndAndAdvance(get, set, 1000)
      }
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

    // Check if item can be used (e.g., can't heal above max stamina or restore luck above max)
    if (item.effect.type === 'heal' && state.player.currentStamina >= state.player.maxStamina) {
      return
    }
    if (item.effect.type === 'luck' && state.player.luck >= state.player.maxLuck) {
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

  triggerReaction: (entity: 'player' | 'creature', reactionType: ReactionType) => {
    const state = get()
    const targetEntity = entity === 'player' ? state.player : state.creature

    if (!targetEntity?.reactions) return

    const reactions = targetEntity.reactions[reactionType]
    if (!reactions || reactions.length === 0) return

    // Select random reaction
    const randomReaction = reactions[Math.floor(Math.random() * reactions.length)]

    set({
      activeReaction: {
        text: randomReaction,
        entity,
        timestamp: Date.now()
      }
    })
  },

  clearReaction: () => {
    set({ activeReaction: null })
  },

  testLuck: () => {
    const state = get()
    if (!state.player || !state.pendingLuckTest || state.gamePhase !== 'LUCK_TEST') return

    const { damage, target, type } = state.pendingLuckTest
    const luckTestResult = performLuckTest(state.player.luck, damage, type)

    // Haptic feedback for luck test
    if (navigator.vibrate) {
      navigator.vibrate(luckTestResult.wasLucky ? [10, 50, 10] : [50, 100, 50])
    }

    // Apply damage and reduce luck
    let newPlayerStamina = state.player.currentStamina
    let newCreatureStamina = state.creature.currentStamina
    let newPlayerLuck = state.player.luck - 1

    if (target === 'player') {
      newPlayerStamina = Math.max(0, newPlayerStamina - luckTestResult.modifiedDamage)
    } else {
      newCreatureStamina = Math.max(0, newCreatureStamina - luckTestResult.modifiedDamage)
    }

    // Trigger reactions based on luck test result and context
    if (target === 'player') {
      // Testing luck to reduce damage taken - only react if unlucky (taking MORE damage)
      if (!luckTestResult.wasLucky) {
        get().triggerReaction('player', 'cry')
      }
      // If lucky, no reaction - you still got hit, just less
    } else {
      // Testing luck to increase damage dealt - gloat if lucky
      if (luckTestResult.wasLucky) {
        get().triggerReaction('player', 'gloat')
      }
      // If unlucky, no strong reaction needed
    }

    const summary = target === 'player'
      ? `You took ${luckTestResult.modifiedDamage} damage (${luckTestResult.wasLucky ? 'LUCKY!' : 'UNLUCKY!'})`
      : `Enemy took ${luckTestResult.modifiedDamage} damage (${luckTestResult.wasLucky ? 'LUCKY!' : 'UNLUCKY!'})`

    // Add luck test entry to combat log
    const luckLogEntry = {
      round: state.currentRound,
      playerRoll: luckTestResult.roll,
      creatureRoll: 0,
      playerAttackStrength: 0,
      creatureAttackStrength: 0,
      result: target === 'player' ? 'creature_hit' : 'player_hit' as CombatResult,
      isLuckTest: true,
      luckRoll: luckTestResult.roll,
      wasLucky: luckTestResult.wasLucky,
      originalDamage: damage,
      modifiedDamage: luckTestResult.modifiedDamage,
      target: target,
      skipped: false,
    }

    set({
      gamePhase: 'ROUND_RESULT',
      pendingLuckTest: null,
      lastRoundSummary: summary,
      combatLog: [luckLogEntry, ...state.combatLog],
      player: {
        ...state.player,
        currentStamina: newPlayerStamina,
        luck: Math.max(0, newPlayerLuck),
      },
      creature: {
        ...state.creature,
        currentStamina: newCreatureStamina,
      },
    })

    // Auto-advance after ROUND_RESULT
    // Increased delay to allow luck test reactions to be seen
    checkBattleEndAndAdvance(get, set, 2500)
  },

  skipLuckTest: () => {
    const state = get()
    if (!state.player || !state.pendingLuckTest || state.gamePhase !== 'LUCK_TEST') return

    const { damage, target } = state.pendingLuckTest

    // Apply original damage without modification
    let newPlayerStamina = state.player.currentStamina
    let newCreatureStamina = state.creature.currentStamina

    if (target === 'player') {
      newPlayerStamina = Math.max(0, newPlayerStamina - damage)
      // Trigger damage reactions
      const reactionChoice = Math.floor(Math.random() * 2)
      if (reactionChoice === 0) {
        get().triggerReaction('creature', 'gloat')
      } else {
        get().triggerReaction('player', 'cry')
      }
    } else {
      newCreatureStamina = Math.max(0, newCreatureStamina - damage)
      // Trigger damage reactions
      const reactionChoice = Math.floor(Math.random() * 2)
      if (reactionChoice === 0) {
        get().triggerReaction('player', 'gloat')
      } else {
        get().triggerReaction('creature', 'cry')
      }
    }

    // Haptic feedback for damage
    if (navigator.vibrate) {
      navigator.vibrate([20, 50, 20])
    }

    const summary = target === 'player'
      ? `You took ${damage} damage`
      : `Enemy took ${damage} damage`

    // Add luck test skipped entry to combat log
    const luckLogEntry = {
      round: state.currentRound,
      playerRoll: 0,
      creatureRoll: 0,
      playerAttackStrength: 0,
      creatureAttackStrength: 0,
      result: 'draw' as CombatResult,
      isLuckTest: true,
      luckRoll: 0,
      wasLucky: false,
      originalDamage: damage,
      modifiedDamage: damage,
      target: target,
      skipped: true,
    }

    set({
      gamePhase: 'ROUND_RESULT',
      pendingLuckTest: null,
      lastRoundSummary: summary,
      combatLog: [luckLogEntry, ...state.combatLog],
      player: {
        ...state.player,
        currentStamina: newPlayerStamina,
      },
      creature: {
        ...state.creature,
        currentStamina: newCreatureStamina,
      },
    })

    // Auto-advance after ROUND_RESULT
    checkBattleEndAndAdvance(get, set, 1000)
  },

  // Spell casting actions
  openSpellBook: () => {
    const state = get()
    if (state.gamePhase !== 'BATTLE') return

    set({ gamePhase: 'SPELL_CASTING' })
  },

  cancelSpellCast: () => {
    set({ gamePhase: 'BATTLE' })
  },

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

  startCampaign: () => {
    const state = get()
    if (!state.player) return

    set({
      campaignState: {
        isActive: true,
        score: 0,
        battlesWon: 0,
        totalDamageDealt: 0,
        totalDamageTaken: 0,
        perfectVictories: 0,
        currentStreak: 0,
        startingStats: {
          skill: state.player.skill,
          stamina: state.player.maxStamina,
          luck: state.player.maxLuck,
        },
        battleHistory: [],
      }
    })
  },

  endCampaign: () => {
    const state = get()
    if (!state.campaignState || !state.player) return

    // Save high score
    saveHighScore({
      playerName: state.player.name,
      score: state.campaignState.score,
      battlesWon: state.campaignState.battlesWon,
      timestamp: Date.now(),
    })

    set({ gamePhase: 'CAMPAIGN_END' })
  },

  recordBattleVictory: (creatureDifficulty: CreatureDifficulty) => {
    const state = get()
    if (!state.campaignState || !state.player) return

    const damageDealt = state.creature.maxStamina - state.creature.currentStamina
    const damageTaken = state.player.maxStamina - state.player.currentStamina
    const isPerfectVictory = damageTaken === 0

    // Calculate battle score
    const battleScore = calculateBattleScore({
      roundsCompleted: state.currentRound,
      damageDealt,
      damageTaken,
      creatureDifficulty,
      isPerfectVictory,
      currentStreak: state.campaignState.currentStreak,
    })

    // Create battle record
    const battleRecord: BattleRecord = {
      battleNumber: state.campaignState.battlesWon + 1,
      creature: state.creature.name,
      victory: true,
      score: battleScore,
      roundsCompleted: state.currentRound,
      damageDealt,
      damageTaken,
    }

    // Update campaign state
    set({
      campaignState: {
        ...state.campaignState,
        score: state.campaignState.score + battleScore,
        battlesWon: state.campaignState.battlesWon + 1,
        totalDamageDealt: state.campaignState.totalDamageDealt + damageDealt,
        totalDamageTaken: state.campaignState.totalDamageTaken + damageTaken,
        perfectVictories: state.campaignState.perfectVictories + (isPerfectVictory ? 1 : 0),
        currentStreak: state.campaignState.currentStreak + 1,
        battleHistory: [...state.campaignState.battleHistory, battleRecord],
      },
      gamePhase: 'CAMPAIGN_VICTORY',
    })
  },

  applyCampaignRecovery: () => {
    const state = get()
    if (!state.campaignState || !state.player) return

    // Calculate recovery
    const recovery = calculateRecovery(state.player)

    // Apply recovery to player
    const newStamina = Math.min(
      state.player.maxStamina,
      state.player.currentStamina + recovery.staminaRestored
    )
    const newLuck = Math.min(
      state.player.maxLuck,
      state.player.luck + recovery.luckRestored
    )

    set({
      player: {
        ...state.player,
        currentStamina: newStamina,
        luck: newLuck,
      },
      gamePhase: 'CREATURE_SELECT',
    })
  },
}))
