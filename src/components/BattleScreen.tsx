import { useGameStore } from '../store/gameStore'
import { CharacterStats } from './CharacterStats'
import { Die } from './Die'
import { CombatLogModal } from './CombatLogModal'
import { InventoryPanel } from './InventoryPanel'
import { SpeechBubble } from './SpeechBubble'
import { LuckTestModal } from './LuckTestModal'
import { ScoreDisplay } from './ScoreDisplay'
import { SpellBook } from './SpellBook'
import { NarrativeDisplay } from './NarrativeDisplay'
import { useState, useEffect } from 'react'

export function BattleScreen() {
  const player = useGameStore((state) => state.player)
  const creature = useGameStore((state) => state.creature)
  const gamePhase = useGameStore((state) => state.gamePhase)
  const lastRoundSummary = useGameStore((state) => state.lastRoundSummary)
  const currentPlayerRoll = useGameStore((state) => state.currentPlayerRoll)
  const currentCreatureRoll = useGameStore((state) => state.currentCreatureRoll)
  const combatLog = useGameStore((state) => state.combatLog)
  const currentRound = useGameStore((state) => state.currentRound)
  const lastSpecialAttackRound = useGameStore((state) => state.lastSpecialAttackRound)
  const rollAttack = useGameStore((state) => state.rollAttack)
  const rollSpecialAttack = useGameStore((state) => state.rollSpecialAttack)
  const toggleFullLog = useGameStore((state) => state.toggleFullLog)
  const activeReaction = useGameStore((state) => state.activeReaction)
  const clearReaction = useGameStore((state) => state.clearReaction)
  const openSpellBook = useGameStore((state) => state.openSpellBook)
  const advancePhase = useGameStore((state) => state.advancePhase)

  const [playerWasHealed, setPlayerWasHealed] = useState(false)
  const [previousPlayerStamina, setPreviousPlayerStamina] = useState(player?.currentStamina || 0)
  const [isInventoryOpen, setIsInventoryOpen] = useState(false)

  // Track stamina changes to trigger healing animation
  useEffect(() => {
    if (player && player.currentStamina > previousPlayerStamina) {
      setPlayerWasHealed(true)
      const timer = setTimeout(() => setPlayerWasHealed(false), 600)
      return () => clearTimeout(timer)
    }
    setPreviousPlayerStamina(player?.currentStamina || 0)
  }, [player?.currentStamina, previousPlayerStamina])

  // Handle narrative continuation
  const handleNarrativeContinue = () => {
    if (gamePhase === 'BATTLE_INTRO') {
      // Clear narrative and advance to battle
      advancePhase('BATTLE')
    }
    // For BATTLE_END, the existing flow handles navigation
  }

  if (!player) return null

  const isRolling = gamePhase === 'DICE_ROLLING'
  const showResults = gamePhase === 'ROUND_RESULT'

  // Check if damage was taken in the most recent round
  const lastRound = combatLog[0]
  const playerTookDamage = showResults && lastRound?.result === 'player_hit'
  const creatureTookDamage = showResults && lastRound?.result === 'creature_hit'

  // Special attack cooldown check (can use once every 3 rounds)
  const specialAttackAvailable = lastSpecialAttackRound === null || currentRound - lastSpecialAttackRound >= 3
  const roundsUntilSpecialAttack = lastSpecialAttackRound === null
    ? 0
    : Math.max(0, 3 - (currentRound - lastSpecialAttackRound))

  // Debug logging for blood effect
  if (showResults) {
    console.log('🩸 BLOOD EFFECT DEBUG:', {
      gamePhase,
      currentRound,
      combatLogLength: combatLog.length,
      lastRoundExists: !!lastRound,
      lastRound: lastRound ? {
        round: lastRound.round,
        result: lastRound.result,
        playerAttackStrength: lastRound.playerAttackStrength,
        creatureAttackStrength: lastRound.creatureAttackStrength,
        isSpellCast: !!lastRound.spellCast,
      } : null,
      playerTookDamage,
      creatureTookDamage,
      explanation: lastRound?.result === 'player_hit'
        ? 'player_hit means PLAYER WAS HIT (creature won) → player should show blood'
        : lastRound?.result === 'creature_hit'
        ? 'creature_hit means CREATURE WAS HIT (player won) → creature should show blood'
        : 'draw or no round - no blood',
      ALL_COMBAT_LOG: combatLog.map(entry => ({
        round: entry.round,
        result: entry.result,
        pStr: entry.playerAttackStrength,
        cStr: entry.creatureAttackStrength
      }))
    })
  }

  return (
    <div className="min-h-screen bg-parchment flex flex-col p-4">
      <ScoreDisplay />
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-cinzel font-bold text-dark-brown text-center">
          Battle!
        </h1>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="relative">
          <CharacterStats
            character={player}
            label="You"
            tookDamage={playerTookDamage}
            wasHealed={playerWasHealed}
            imageUrl={player.avatar ? `/characters/${player.avatar}` : undefined}
          />
          {/* Player Speech Bubble */}
          {activeReaction && activeReaction.entity === 'player' && (
            <SpeechBubble
              text={activeReaction.text}
              isVisible={true}
              position="left"
              onComplete={clearReaction}
            />
          )}
        </div>
        <div className="relative">
          <CharacterStats
            character={creature}
            label="Enemy"
            tookDamage={creatureTookDamage}
            imageUrl={creature.imageUrl}
          />
          {/* Creature Speech Bubble */}
          {activeReaction && activeReaction.entity === 'creature' && (
            <SpeechBubble
              text={activeReaction.text}
              isVisible={true}
              position="right"
              onComplete={clearReaction}
            />
          )}
        </div>
      </div>

      {/* Dice Area */}
      <div className="flex-1 flex items-center justify-center mb-6">
        <div className="flex gap-8">
          <Die
            value={currentPlayerRoll}
            isRolling={isRolling}
            label="You"
          />
          <Die
            value={currentCreatureRoll}
            isRolling={isRolling}
            label={creature.name}
          />
        </div>
      </div>


      {/* Round Result Banner */}
      {lastRoundSummary && (
        <button
          onClick={toggleFullLog}
          className="mb-4 p-4 bg-white/70 rounded-lg text-dark-brown text-sm text-center hover:bg-white/90 transition-colors"
        >
          <div>{lastRoundSummary}</div>
          <div className="text-xs text-dark-brown/50 mt-1">
            ↓ Tap for history
          </div>
        </button>
      )}

      {/* Attack Buttons */}
      <div className="space-y-3">
        {/* Attack and Special Attack row */}
        <div className="flex gap-2">
          <button
            onClick={rollAttack}
            disabled={isRolling || showResults}
            className="flex-1 py-3 px-6 rounded-lg font-cinzel font-bold text-xl text-white bg-deep-red hover:bg-deep-red/90 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-lg"
          >
            {isRolling || showResults ? 'Rolling...' : '🗡️ ATTACK'}
          </button>

          <button
            onClick={rollSpecialAttack}
            disabled={isRolling || showResults || !specialAttackAvailable}
            className="flex-1 py-3 px-6 rounded-lg font-cinzel font-bold text-xl text-white bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all active:scale-95 disabled:active:scale-100 shadow-lg"
          >
            {!specialAttackAvailable
              ? `⚔️ SPECIAL (${roundsUntilSpecialAttack})`
              : '⚔️ SPECIAL'}
          </button>
        </div>

        {/* Cast Spell and Inventory row */}
        <div className="flex gap-2">
          {/* Cast Spell button - 50% width */}
          <button
            onClick={openSpellBook}
            disabled={
              isRolling ||
              showResults ||
              !player?.spells?.length ||
              player?.mana === 0
            }
            className="flex-1 py-3 px-6 bg-blue-600 text-white rounded font-cinzel font-bold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all active:scale-95 disabled:active:scale-100"
          >
            {!player?.spells?.length
              ? 'Cast Spell (No Spells)'
              : player?.mana === 0
                // ? `Cast Spell (⚡ 0/${player?.maxMana})`
                // : `Cast Spell (⚡ ${player?.mana}/${player?.maxMana})`
                ? `⚡️Cast Spell`
                : `⚡️Cast Spell`
            }
          </button>

          {/* Inventory button - 50% width */}
          <button
            onClick={() => setIsInventoryOpen(true)}
            disabled={gamePhase !== 'BATTLE'}
            className="flex-1 py-3 px-6 bg-forest-green text-white rounded font-cinzel font-bold hover:bg-forest-green/90 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all active:scale-95 disabled:active:scale-100"
          >
            🧪 Inventory
          </button>
        </div>
      </div>

      {/* Combat Log Modal */}
      <CombatLogModal />

      {/* Luck Test Modal */}
      <LuckTestModal />

      {/* Spell Book modal */}
      {gamePhase === 'SPELL_CASTING' && <SpellBook />}

      {/* Narrative Display - Show during BATTLE_INTRO and BATTLE_END */}
      {(gamePhase === 'BATTLE_INTRO' || gamePhase === 'BATTLE_END') && (
        <NarrativeDisplay onContinue={handleNarrativeContinue} />
      )}

      {/* Inventory Popover - Only show during BATTLE phase */}
      {gamePhase === 'BATTLE' && (
        <InventoryPanel
          isOpen={isInventoryOpen}
          onClose={() => setIsInventoryOpen(false)}
        />
      )}
    </div>
  )
}
