import { getHighScores } from '../utils/storage'

interface HighScoresModalProps {
  onClose: () => void
}

export function HighScoresModal({ onClose }: HighScoresModalProps) {
  const highScores = getHighScores()

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-parchment rounded-lg p-6 max-w-2xl w-full shadow-2xl border-2 border-yellow-600 max-h-[80vh] overflow-y-auto">
        <h3 className="text-3xl font-cinzel font-bold text-dark-brown text-center mb-6">
          High Scores
        </h3>

        {highScores.length === 0 ? (
          <div className="text-center text-dark-brown/70 py-8">
            No high scores yet. Be the first to complete a campaign!
          </div>
        ) : (
          <div className="space-y-3">
            {highScores.map((entry, index) => (
              <div
                key={`${entry.playerName}-${entry.timestamp}`}
                className={`bg-white/50 rounded-lg p-4 flex items-center gap-4 ${
                  index === 0 ? 'border-2 border-yellow-600' : ''
                }`}
              >
                {/* Rank */}
                <div className="flex-shrink-0 w-12 text-center">
                  <div
                    className={`text-2xl font-bold font-cinzel ${
                      index === 0
                        ? 'text-yellow-600'
                        : index === 1
                        ? 'text-gray-400'
                        : index === 2
                        ? 'text-amber-700'
                        : 'text-dark-brown'
                    }`}
                  >
                    #{index + 1}
                  </div>
                </div>

                {/* Player Info */}
                <div className="flex-1">
                  <div className="font-bold text-dark-brown text-lg">
                    {entry.playerName}
                  </div>
                  <div className="text-sm text-dark-brown/70">
                    {entry.battlesWon} {entry.battlesWon === 1 ? 'battle' : 'battles'} • {formatDate(entry.timestamp)}
                  </div>
                </div>

                {/* Score */}
                <div className="flex-shrink-0 text-right">
                  <div className="text-2xl font-bold text-forest-green">
                    {entry.score.toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={onClose}
          className="mt-6 w-full py-3 px-4 rounded-lg font-cinzel font-bold text-lg text-white bg-dark-brown hover:bg-dark-brown/90 transition-colors shadow-lg"
        >
          CLOSE
        </button>
      </div>
    </div>
  )
}
