import { useState } from 'react'
import { useGameStore } from '../store/gameStore'
import { CreatureLibrary } from './CreatureLibrary'
import { CreatureDefinition } from '../data/creatures'
import { generateShareURL } from '../utils/urlParams'
import { ScoreDisplay } from './ScoreDisplay'
import { getProgressiveDifficulty } from '../utils/difficulty'

export function CreatureSelectScreen() {
  const [selectedCreature, setSelectedCreature] = useState<CreatureDefinition | null>(null)
  const [showCopiedMessage, setShowCopiedMessage] = useState(false)

  const selectCreature = useGameStore((state) => state.selectCreature)
  const startBattle = useGameStore((state) => state.startBattle)
  const player = useGameStore((state) => state.player)
  const campaignState = useGameStore((state) => state.campaignState)

  const handleCreatureSelect = (creature: CreatureDefinition) => {
    setSelectedCreature(creature)

    // Apply progressive difficulty if in campaign mode
    let adjustedSkill = creature.skill
    let adjustedStamina = creature.stamina

    if (campaignState?.isActive) {
      const difficulty = getProgressiveDifficulty(campaignState.battlesWon)
      adjustedSkill += difficulty.skillBonus
      adjustedStamina += difficulty.staminaBonus
    }

    selectCreature(
      creature.name,
      adjustedSkill,
      adjustedStamina,
      creature.imageUrl,
      creature.reactions,
      creature.mana,
      creature.maxMana,
      creature.spells,
      creature.spellCastChance,
      creature.id  // Pass creature ID for narrative lookup
    )
  }

  const handleStartBattle = () => {
    if (!selectedCreature) return

    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(10)
    }

    startBattle()
  }

  const handleShareSetup = async () => {
    if (!player || !selectedCreature) return

    const shareURL = generateShareURL(
      {
        name: player.name,
        skill: player.skill,
        stamina: player.maxStamina,
        luck: player.maxLuck,
        avatar: player.avatar
      },
      {
        name: selectedCreature.name,
        skill: selectedCreature.skill,
        stamina: selectedCreature.stamina
      }
    )

    try {
      await navigator.clipboard.writeText(shareURL)
      setShowCopiedMessage(true)

      // Haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate([10, 50, 10])
      }

      setTimeout(() => setShowCopiedMessage(false), 2000)
    } catch (err) {
      console.error('Failed to copy URL:', err)
    }
  }

  const battleNumber = campaignState?.isActive ? campaignState.battlesWon + 1 : null

  return (
    <div className="min-h-screen bg-parchment flex items-center justify-center p-4">
      <ScoreDisplay />
      <div className="w-full max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-cinzel font-bold text-dark-brown text-center mb-2">
          {battleNumber ? `Battle ${battleNumber}` : 'Choose Your Foe'}
        </h1>
        <h2 className="text-xl font-cinzel text-dark-brown text-center mb-8">
          {player?.name} - Ready for Battle
        </h2>

        <div className="bg-white/50 rounded-lg p-6 shadow-lg">
          <CreatureLibrary
            onSelectCreature={handleCreatureSelect}
            selectedCreatureId={selectedCreature?.id}
          />
          
          <button
            onClick={handleStartBattle}
            disabled={!selectedCreature}
            className="w-full mt-6 py-3 px-4 rounded-lg font-semibold text-white bg-deep-red hover:bg-deep-red/90 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {selectedCreature
              ? battleNumber
                ? `Begin Battle ${battleNumber}!`
                : `Battle ${selectedCreature.name}!`
              : 'Select a creature'}
          </button>

          {/* Share Setup Button */}
          {selectedCreature && (
            <div className="mt-3 relative">
              <button
                onClick={handleShareSetup}
                className="w-full py-2 px-4 rounded-lg font-semibold text-dark-brown bg-amber-200 hover:bg-amber-300 transition-colors border-2 border-amber-400"
              >
                🔗 Share Battle Setup
              </button>
              {showCopiedMessage && (
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-4 py-2 bg-forest-green text-white rounded-lg shadow-lg text-sm font-semibold whitespace-nowrap animate-slide-up">
                  ✓ Link copied to clipboard!
                </div>
              )}
            </div>
          )}

          {/* Image Attribution */}
          <p className="text-center text-xs text-dark-brown/50 mt-4">
            Monster art by{' '}
            <a
              href="https://mythjourneys.com/gallery/dungeons-and-dragons/free-dnd-monster-art/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-dark-brown/70"
            >
              MythJourneys
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}