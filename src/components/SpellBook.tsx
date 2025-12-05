import { useGameStore } from '../store/gameStore'
import { SPELL_LIBRARY } from '../utils/spells'

export function SpellBook() {
  const player = useGameStore((state) => state.player)
  const castSpell = useGameStore((state) => state.castSpell)
  const cancelSpellCast = useGameStore((state) => state.cancelSpellCast)

  if (!player) return null

  const playerSpells = player.spells.map(id => SPELL_LIBRARY[id]).filter(Boolean)

  const handleCastSpell = (spellId: string) => {
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(10)
    }
    castSpell(spellId)
  }

  const handleCancel = () => {
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(10)
    }
    cancelSpellCast()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-amber-50 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl border-4 border-amber-900">
        <h2 className="text-3xl font-cinzel font-bold text-dark-brown text-center mb-6">
          Spell Book
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {playerSpells.map((spell) => {
            const canAfford = player.mana >= spell.manaCost

            return (
              <div
                key={spell.id}
                className={`bg-white/70 rounded-lg p-4 border-2 transition-all ${
                  canAfford
                    ? 'border-blue-500 hover:bg-white/90 hover:shadow-lg'
                    : 'border-gray-300 opacity-50'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-cinzel font-bold text-dark-brown">
                    {spell.name}
                  </h3>
                  <span className="text-sm font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded">
                    ⚡ {spell.manaCost}
                  </span>
                </div>

                <p className="text-sm text-gray-700 mb-4">
                  {spell.description}
                </p>

                <button
                  onClick={() => handleCastSpell(spell.id)}
                  disabled={!canAfford}
                  className={`w-full py-2 px-4 rounded font-cinzel font-bold transition-all ${
                    canAfford
                      ? 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {canAfford ? 'Cast Spell' : 'Insufficient Mana'}
                </button>
              </div>
            )
          })}
        </div>

        <button
          onClick={handleCancel}
          className="w-full py-3 px-6 bg-gray-600 text-white rounded font-cinzel font-bold hover:bg-gray-700 transition-all active:scale-95"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
