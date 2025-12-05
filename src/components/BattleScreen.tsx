import { useGameStore } from '../store/gameStore'
import { CharacterStats } from './CharacterStats'
import { Die } from './Die'
import { CombatLogModal } from './CombatLogModal'
import { InventoryPanel } from './InventoryPanel'
import { SpeechBubble } from './SpeechBubble'
import { LuckTestModal } from './LuckTestModal'
import { ScoreDisplay } from './ScoreDisplay'
import { SpellBook } from './SpellBook'
import { useState, useEffect } from 'react'

export function BattleScreen() {
  const player = useGameStore((state) => state.player)
  const creature = useGameStore((state) => state.creature)
  const gamePhase = useGameStore((state) => state.gamePhase)
  const lastRoundSummary = useGameStore((state) => state.lastRoundSummary)
  const currentPlayerRoll = useGameStore((state) => state.currentPlayerRoll)
  const currentCreatureRoll = useGameStore((state) => state.currentCreatureRoll)
  const combatLog = useGameStore((state) => state.combatLog)
  const rollAttack = useGameStore((state) => state.rollAttack)
  const rollSpecialAttack = useGameStore((state) => state.rollSpecialAttack)
  const toggleFullLog = useGameStore((state) => state.toggleFullLog)
  const activeReaction = useGameStore((state) => state.activeReaction)
  const clearReaction = useGameStore((state) => state.clearReaction)
  const openSpellBook = useGameStore((state) => state.openSpellBook)

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

  if (!player) return null

  const isRolling = gamePhase === 'DICE_ROLLING'
  const showResults = gamePhase === 'ROUND_RESULT'

  // Check if damage was taken in the most recent round
  const lastRound = combatLog[0]
  const playerTookDamage = showResults && lastRound?.result === 'creature_hit'
  const creatureTookDamage = showResults && lastRound?.result === 'player_hit'

  return (
    <div className="min-h-screen bg-parchment flex flex-col p-4">
      <ScoreDisplay />
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="w-12"></div> {/* Spacer for centering */}
        <h1 className="text-3xl font-cinzel font-bold text-dark-brown">
          Battle!
        </h1>
        {/* Inventory Button - Only show during BATTLE phase */}
        {gamePhase === 'BATTLE' && (
          <button
            onClick={() => setIsInventoryOpen(true)}
            className="w-12 h-12 rounded-full bg-forest-green hover:bg-forest-green/90 text-white flex items-center justify-center shadow-lg transition-colors"
            title="Open Inventory"
          >
            🎒
          </button>
        )}
        {gamePhase !== 'BATTLE' && <div className="w-12"></div>} {/* Spacer when button is hidden */}
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
        <button
          onClick={rollAttack}
          disabled={isRolling || showResults}
          className="w-full py-4 px-6 rounded-lg font-cinzel font-bold text-xl text-white bg-deep-red hover:bg-deep-red/90 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-lg"
        >
          {isRolling || showResults ? 'Rolling...' : 'ATTACK'}
        </button>

        {/* Special actions row - Special Attack and Cast Spell */}
        <div className="flex gap-2 mb-2">
          {/* Special Attack button - 50% width */}
          <button
            onClick={rollSpecialAttack}
            disabled={isRolling || showResults}
            className="flex-1 py-3 px-6 bg-purple-600 text-white rounded font-cinzel font-bold hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all active:scale-95 disabled:active:scale-100"
          >
            Special Attack
          </button>

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
                ? `Cast Spell (⚡ 0/${player?.maxMana})`
                : `Cast Spell (⚡ ${player?.mana}/${player?.maxMana})`
            }
          </button>
        </div>
      </div>

      {/* Combat Log Modal */}
      <CombatLogModal />

      {/* Luck Test Modal */}
      <LuckTestModal />

      {/* Spell Book modal */}
      {gamePhase === 'SPELL_CASTING' && <SpellBook />}

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
