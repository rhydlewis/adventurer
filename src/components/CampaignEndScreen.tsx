import { useState } from 'react'
import { useGameStore } from '../store/gameStore'
import { getHighScores } from '../utils/storage'
import { HighScoresModal } from './HighScoresModal'

export function CampaignEndScreen() {
  const player = useGameStore((state) => state.player)
  const campaignState = useGameStore((state) => state.campaignState)
  const resetGame = useGameStore((state) => state.resetGame)
  const [showHighScores, setShowHighScores] = useState(false)

  if (!player || !campaignState) return null

  const highScores = getHighScores()
  const playerRank = highScores.findIndex(
    (entry) => entry.playerName === player.name && entry.score === campaignState.score
  ) + 1

  const handleNewGame = () => {
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(10)
    }

    resetGame()
  }

  const handleViewHighScores = () => {
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(10)
    }

    setShowHighScores(true)
  }

  return (
    <>
      <div className="min-h-screen bg-parchment flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          {/* Campaign End Message */}
          <h1 className="text-5xl font-cinzel font-bold mb-6 text-dark-brown">
            CAMPAIGN COMPLETE
          </h1>

          {/* Final Score */}
          <div className="bg-white/50 rounded-lg p-6 mb-6">
            <h2 className="font-cinzel font-bold text-lg text-dark-brown mb-4">
              Final Score
            </h2>
            <div className="text-5xl font-bold text-forest-green mb-4">
              {campaignState.score.toLocaleString()}
            </div>
            {playerRank > 0 && playerRank <= 10 && (
              <div className="text-lg text-dark-brown font-bold">
                #{playerRank} on the High Scores!
              </div>
            )}
          </div>

          {/* Campaign Statistics */}
          <div className="bg-white/50 rounded-lg p-6 mb-8">
            <h2 className="font-cinzel font-bold text-lg text-dark-brown mb-4">
              Campaign Statistics
            </h2>
            <div className="grid grid-cols-2 gap-4 text-dark-brown">
              <div>
                <div className="text-sm text-dark-brown/70">Battles Won</div>
                <div className="text-2xl font-bold">{campaignState.battlesWon}</div>
              </div>
              <div>
                <div className="text-sm text-dark-brown/70">Perfect Victories</div>
                <div className="text-2xl font-bold">{campaignState.perfectVictories}</div>
              </div>
              <div>
                <div className="text-sm text-dark-brown/70">Damage Dealt</div>
                <div className="text-2xl font-bold">{campaignState.totalDamageDealt}</div>
              </div>
              <div>
                <div className="text-sm text-dark-brown/70">Damage Taken</div>
                <div className="text-2xl font-bold">{campaignState.totalDamageTaken}</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <button
              onClick={handleViewHighScores}
              className="w-full py-4 px-6 rounded-lg font-cinzel font-bold text-lg text-white bg-dark-brown hover:bg-dark-brown/90 transition-colors shadow-lg"
            >
              VIEW HIGH SCORES
            </button>
            <button
              onClick={handleNewGame}
              className="w-full py-4 px-6 rounded-lg font-cinzel font-bold text-lg text-white bg-deep-red hover:bg-deep-red/90 transition-colors shadow-lg"
            >
              NEW GAME
            </button>
          </div>
        </div>
      </div>

      {showHighScores && (
        <HighScoresModal onClose={() => setShowHighScores(false)} />
      )}
    </>
  )
}
