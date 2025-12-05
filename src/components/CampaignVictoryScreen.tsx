import { useGameStore } from '../store/gameStore'
import { calculateRecovery } from '../utils/recovery'

export function CampaignVictoryScreen() {
  const player = useGameStore((state) => state.player)
  const campaignState = useGameStore((state) => state.campaignState)
  const applyCampaignRecovery = useGameStore((state) => state.applyCampaignRecovery)
  const endCampaign = useGameStore((state) => state.endCampaign)

  if (!player || !campaignState) return null

  const lastBattle = campaignState.battleHistory[campaignState.battleHistory.length - 1]
  const recovery = calculateRecovery(player)

  const handleContinue = () => {
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(10)
    }

    applyCampaignRecovery()
  }

  const handleEndCampaign = () => {
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(10)
    }

    endCampaign()
  }

  return (
    <div className="min-h-screen bg-parchment flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        {/* Victory Message */}
        <h1 className="text-5xl font-cinzel font-bold mb-6 text-forest-green">
          VICTORY!
        </h1>

        {/* Battle Info */}
        <p className="text-xl text-dark-brown font-cinzel mb-8">
          Battle {lastBattle?.battleNumber} Complete
        </p>

        {/* Battle Score */}
        <div className="bg-white/50 rounded-lg p-6 mb-6">
          <h2 className="font-cinzel font-bold text-lg text-dark-brown mb-4">
            Battle Score
          </h2>
          <div className="text-4xl font-bold text-forest-green mb-4">
            +{lastBattle?.score.toLocaleString()}
          </div>
          <div className="text-sm text-dark-brown/70 space-y-1">
            <div>Rounds: {lastBattle?.roundsCompleted}</div>
            <div>Damage Dealt: {lastBattle?.damageDealt}</div>
            <div>Damage Taken: {lastBattle?.damageTaken}</div>
            {lastBattle?.damageTaken === 0 && (
              <div className="text-forest-green font-bold">PERFECT VICTORY!</div>
            )}
          </div>
        </div>

        {/* Total Campaign Score */}
        <div className="bg-dark-brown/10 rounded-lg p-4 mb-6">
          <div className="text-sm text-dark-brown/70 mb-1">Total Campaign Score</div>
          <div className="text-3xl font-bold text-dark-brown font-cinzel">
            {campaignState.score.toLocaleString()}
          </div>
        </div>

        {/* Recovery Stats */}
        <div className="bg-white/50 rounded-lg p-6 mb-8">
          <h2 className="font-cinzel font-bold text-lg text-dark-brown mb-4">
            Recovery
          </h2>
          <div className="text-dark-brown space-y-2">
            <div>
              <span className="text-forest-green font-bold">+{recovery.staminaRestored}</span> STAMINA restored
            </div>
            {recovery.luckRestored > 0 && (
              <div>
                <span className="text-forest-green font-bold">+{recovery.luckRestored}</span> LUCK restored
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <button
            onClick={handleContinue}
            className="w-full py-4 px-6 rounded-lg font-cinzel font-bold text-lg text-white bg-forest-green hover:bg-forest-green/90 transition-colors shadow-lg"
          >
            CHOOSE NEXT FOE
          </button>
          <button
            onClick={handleEndCampaign}
            className="w-full py-4 px-6 rounded-lg font-cinzel font-bold text-lg text-white bg-dark-brown hover:bg-dark-brown/90 transition-colors shadow-lg"
          >
            END CAMPAIGN
          </button>
        </div>
      </div>
    </div>
  )
}
