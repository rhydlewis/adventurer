import { useGameStore } from '../store/gameStore'

export function CombatLogModal() {
  const showFullLog = useGameStore((state) => state.showFullLog)
  const combatLog = useGameStore((state) => state.combatLog)
  const toggleFullLog = useGameStore((state) => state.toggleFullLog)
  const player = useGameStore((state) => state.player)
  const creature = useGameStore((state) => state.creature)

  if (!showFullLog || !player) return null

  const getResultColor = (entry: any) => {
    // Spell casts get blue/purple styling
    if (entry.spellCast) {
      return entry.spellCast.caster === 'player'
        ? 'bg-blue-100 border-blue-500'
        : 'bg-purple-100 border-purple-500'
    }

    // Luck tests get gold/yellow styling
    if (entry.isLuckTest) {
      if (entry.skipped) {
        return 'bg-gray-200 border-gray-400'
      }
      return entry.wasLucky
        ? 'bg-yellow-100 border-yellow-500'
        : 'bg-orange-100 border-orange-500'
    }

    // Regular combat
    switch (entry.result) {
      case 'player_hit':
        return 'bg-forest-green/20 border-forest-green'
      case 'creature_hit':
        return 'bg-deep-red/20 border-deep-red'
      default:
        return 'bg-gray-200 border-gray-400'
    }
  }

  const getResultText = (entry: any) => {
    // Check if this is a spell cast
    if (entry.spellCast) {
      const casterName = entry.spellCast.caster === 'player' ? 'You' : creature.name
      return `⚡ ${casterName} cast ${entry.spellCast.spellName} - ${entry.spellCast.effect}`
    }

    // Check if this is a luck test
    if (entry.isLuckTest) {
      if (entry.skipped) {
        return entry.target === 'player'
          ? `Luck test declined. You took ${entry.originalDamage} damage.`
          : `Luck test declined. ${creature.name} took ${entry.originalDamage} damage.`
      }

      const luckText = entry.wasLucky ? '✨ LUCKY!' : '💥 UNLUCKY!'
      const damageChange = entry.originalDamage !== entry.modifiedDamage
        ? ` (${entry.originalDamage} → ${entry.modifiedDamage})`
        : ''

      if (entry.target === 'player') {
        return `🍀 Luck Test: ${luckText} You took ${entry.modifiedDamage} damage${damageChange}`
      } else {
        return `🍀 Luck Test: ${luckText} ${creature.name} took ${entry.modifiedDamage} damage${damageChange}`
      }
    }

    // Check if this was a special attack
    const isSpecialAttack = entry.playerAttackStrength === 999 || entry.playerAttackStrength === 0

    if (isSpecialAttack) {
      if (entry.result === 'player_hit') {
        // Successful special attack
        return `⚡ SPECIAL ATTACK! Critical hit! ${creature.name} takes 4 damage.`
      } else {
        // Backfired special attack
        return `⚡ SPECIAL ATTACK BACKFIRED! You take 2 damage!`
      }
    }

    // Normal attack
    switch (entry.result) {
      case 'player_hit':
        return `You win! ${creature.name} takes 2 damage.`
      case 'creature_hit':
        return `${creature.name} wins! You take 2 damage.`
      default:
        return 'Draw! No damage.'
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={toggleFullLog}
      />

      {/* Modal */}
      <div className="fixed inset-x-0 bottom-0 z-50 bg-parchment rounded-t-2xl shadow-2xl max-h-[80vh] flex flex-col animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-dark-brown/20">
          <h2 className="text-xl font-cinzel font-bold text-dark-brown">
            Combat History
          </h2>
          <button
            onClick={toggleFullLog}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-dark-brown/10 transition-colors"
          >
            <span className="text-2xl text-dark-brown">×</span>
          </button>
        </div>

        {/* Scrollable Log */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {combatLog.length === 0 ? (
            <p className="text-center text-dark-brown/50 py-8">
              No combat history yet
            </p>
          ) : (
            combatLog.map((entry, index) => (
              <div
                key={`${entry.round}-${index}`}
                className={`p-4 rounded-lg border-2 ${getResultColor(entry)}`}
              >
                <div className="font-bold text-dark-brown mb-2">
                  Round {entry.round}
                </div>

                {/* Spell cast shows mana cost */}
                {entry.spellCast && (
                  <div className="text-sm text-dark-brown mb-2">
                    Mana Cost: {entry.spellCast.manaCost}
                  </div>
                )}

                {/* Luck test shows roll and luck value */}
                {entry.isLuckTest && !entry.skipped && (
                  <div className="text-sm text-dark-brown mb-2">
                    Luck Roll: {entry.luckRoll} (needed ≤ {player.luck + 1})
                  </div>
                )}

                {/* Only show attack strengths for normal attacks */}
                {!entry.isLuckTest && !entry.spellCast && entry.playerAttackStrength !== 999 && entry.playerAttackStrength !== 0 && (
                  <>
                    <div className="text-sm text-dark-brown mb-1">
                      {player.name}: Attack Strength {entry.playerAttackStrength}
                    </div>
                    <div className="text-sm text-dark-brown mb-2">
                      {creature.name}: Attack Strength {entry.creatureAttackStrength}
                    </div>
                  </>
                )}

                <div className="text-sm font-semibold text-dark-brown">
                  → {getResultText(entry)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  )
}
