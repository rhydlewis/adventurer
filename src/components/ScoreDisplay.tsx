import { useGameStore } from '../store/gameStore'

export function ScoreDisplay() {
  const campaignState = useGameStore((state) => state.campaignState)

  if (!campaignState?.isActive) return null

  return (
    <div className="fixed top-4 left-4 bg-white/90 rounded-lg p-3 shadow-lg z-50">
      <div className="text-sm font-bold text-dark-brown font-cinzel">
        Score: {campaignState.score.toLocaleString()}
      </div>
      <div className="text-xs text-dark-brown/70">
        Battles: {campaignState.battlesWon}
      </div>
    </div>
  )
}
