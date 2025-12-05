import { useEffect, useRef } from 'react'
import { useGameStore } from '../store/gameStore'
import type { CreatureDifficulty } from '../types'

export function BattleEndScreen() {
  const player = useGameStore((state) => state.player)
  const creature = useGameStore((state) => state.creature)
  const currentRound = useGameStore((state) => state.currentRound)
  const campaignState = useGameStore((state) => state.campaignState)
  const resetGame = useGameStore((state) => state.resetGame)
  const recordBattleVictory = useGameStore((state) => state.recordBattleVictory)
  const endCampaign = useGameStore((state) => state.endCampaign)
  const hasProcessedCampaign = useRef(false)

  const playerWon = player ? player.currentStamina > 0 : false

  // Handle campaign mode routing (only once)
  useEffect(() => {
    if (campaignState?.isActive && !hasProcessedCampaign.current) {
      hasProcessedCampaign.current = true

      if (playerWon) {
        // Determine creature difficulty
        let difficulty: CreatureDifficulty = 'medium'
        if (creature.maxStamina <= 6) difficulty = 'easy'
        else if (creature.maxStamina >= 10) difficulty = 'hard'
        if (creature.maxStamina >= 15 && creature.skill >= 10) difficulty = 'legendary'

        recordBattleVictory(difficulty)
      } else {
        endCampaign()
      }
    }
  }, [campaignState, playerWon, creature, recordBattleVictory, endCampaign])

  if (!player) return null

  // Don't render normal battle end screen if in campaign mode
  if (campaignState?.isActive) {
    return null
  }

  const handleShare = async () => {
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(10)
    }

    const text = `${player.name} fought ${creature.name} and ${
      playerWon ? 'won' : 'was defeated'
    } in ${currentRound} rounds!`

    if (navigator.share) {
      try {
        await navigator.share({ text })
      } catch (err) {
        // User cancelled or share failed
        console.log('Share cancelled')
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(text)
        alert('Result copied to clipboard!')
      } catch (err) {
        console.error('Failed to copy:', err)
      }
    }
  }

  const handleFightAgain = () => {
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(10)
    }

    resetGame()
  }

  return (
    <div className="min-h-screen bg-parchment flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        {/* Victory/Defeat Message */}
        <h1
          className={`text-5xl font-cinzel font-bold mb-6 ${
            playerWon ? 'text-forest-green' : 'text-deep-red'
          }`}
        >
          {playerWon ? 'VICTORY IS YOURS!' : 'YOU ARE DEAD!'}
        </h1>

        {/* Round Count */}
        <p className="text-xl text-dark-brown font-cinzel mb-8">
          {playerWon ? `Victory in ${currentRound} rounds!` : `Defeated in ${currentRound} rounds.`}
        </p>

        {/* Final Stats */}
        <div className="bg-white/50 rounded-lg p-6 mb-8">
          <h2 className="font-cinzel font-bold text-lg text-dark-brown mb-4">
            Final Stats
          </h2>
          <div className="grid grid-cols-2 gap-4 text-dark-brown">
            <div>
              <div className="font-semibold mb-2">{player.name}</div>
              <div className="text-2xl font-bold">
                {player.currentStamina} STAMINA
              </div>
            </div>
            <div>
              <div className="font-semibold mb-2">{creature.name}</div>
              <div className="text-2xl font-bold">
                {creature.currentStamina} STAMINA
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <button
            onClick={handleShare}
            className="w-full py-4 px-6 rounded-lg font-cinzel font-bold text-lg text-white bg-dark-brown hover:bg-dark-brown/90 transition-colors shadow-lg"
          >
            SHARE RESULT
          </button>
          <button
            onClick={handleFightAgain}
            className="w-full py-4 px-6 rounded-lg font-cinzel font-bold text-lg text-white bg-deep-red hover:bg-deep-red/90 transition-colors shadow-lg"
          >
            FIGHT AGAIN
          </button>
        </div>
      </div>
    </div>
  )
}
