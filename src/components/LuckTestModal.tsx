import { useGameStore } from '../store/gameStore'

export function LuckTestModal() {
  const gamePhase = useGameStore((state) => state.gamePhase)
  const player = useGameStore((state) => state.player)
  const pendingLuckTest = useGameStore((state) => state.pendingLuckTest)
  const testLuck = useGameStore((state) => state.testLuck)
  const skipLuckTest = useGameStore((state) => state.skipLuckTest)

  if (gamePhase !== 'LUCK_TEST' || !player || !pendingLuckTest) {
    return null
  }

  const { damage, target } = pendingLuckTest
  const isPlayerTakingDamage = target === 'player'

  const contextMessage = isPlayerTakingDamage
    ? `You are about to take ${damage} damage!`
    : `You are about to deal ${damage} damage to the enemy!`

  const luckTestExplanation = isPlayerTakingDamage
    ? 'Test your luck to potentially reduce damage to 1, but risk increasing it to 3!'
    : 'Test your luck to potentially increase damage to 3, but risk reducing it to 1!'

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-parchment rounded-lg p-6 max-w-sm w-full shadow-2xl border-2 border-yellow-600">
        <h3 className="text-2xl font-cinzel font-bold text-dark-brown text-center mb-4">
          Test Your Luck?
        </h3>

        <div className="text-center mb-6">
          <div className="text-lg text-dark-brown mb-2">
            {contextMessage}
          </div>
          <div className="text-sm text-dark-brown/70 mb-4">
            {luckTestExplanation}
          </div>
          
          <div className="bg-yellow-100 rounded-lg p-3 mb-4">
            <div className="text-sm text-dark-brown/70 mb-1">YOUR LUCK</div>
            <div className="text-3xl font-bold text-yellow-600">
              {player.luck}
            </div>
            <div className="text-xs text-dark-brown/50 mt-1">
              Roll 2d6 ≤ {player.luck} to be lucky
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={skipLuckTest}
            className="flex-1 py-3 px-4 rounded-lg font-semibold text-dark-brown bg-white border-2 border-dark-brown hover:bg-dark-brown/10 transition-colors"
          >
            Accept Result
          </button>
          <button
            onClick={testLuck}
            className="flex-1 py-3 px-4 rounded-lg font-semibold text-white bg-yellow-600 hover:bg-yellow-700 transition-colors border-2 border-yellow-400"
          >
            Test Luck!
          </button>
        </div>

        <div className="text-xs text-center text-dark-brown/50 mt-3">
          Testing luck will reduce your LUCK by 1
        </div>
      </div>
    </div>
  )
}