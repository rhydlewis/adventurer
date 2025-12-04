import { useState } from 'react'
import { useGameStore } from '../store/gameStore'
import { PRESETS } from '../types'
import { rollDie, roll2d6 } from '../utils/combat'

interface RolledStats {
  skill: number
  stamina: number
}

export function CharacterSelectScreen() {
  const [playerName, setPlayerName] = useState('')
  const [showRollModal, setShowRollModal] = useState(false)
  const [rolledStats, setRolledStats] = useState<RolledStats | null>(null)
  const [isRolling, setIsRolling] = useState(false)

  const createCharacter = useGameStore((state) => state.createCharacter)

  const handlePresetSelect = (presetKey: string) => {
    if (!playerName.trim()) return

    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(10)
    }

    const preset = PRESETS[presetKey]
    createCharacter(playerName.trim(), preset.skill, preset.stamina)
  }

  const handleRollYourOwn = () => {
    if (!playerName.trim()) return

    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(10)
    }

    setShowRollModal(true)
    rollCharacterStats()
  }

  const rollCharacterStats = () => {
    setIsRolling(true)
    setRolledStats(null)

    // Simulate rolling animation
    setTimeout(() => {
      const skillRoll = rollDie()
      const staminaRoll = roll2d6()

      setRolledStats({
        skill: skillRoll + 6,
        stamina: staminaRoll + 12,
      })
      setIsRolling(false)

      // Haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate(20)
      }
    }, 1500)
  }

  const handleAcceptStats = () => {
    if (!rolledStats) return

    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(10)
    }

    createCharacter(playerName.trim(), rolledStats.skill, rolledStats.stamina)
    setShowRollModal(false)
  }

  const handleReroll = () => {
    rollCharacterStats()
  }

  const isNameValid = playerName.trim().length > 0

  const presetNames = [
    'Bjorn Smashface',
    'Krondor the Wise',
    'Lyra Flick-knife',
    'Nigel Forktongue',
    'KRAZZMATAZZZ',
    'Enid the Destroyer',
    'Betty Battleborn'
  ]

  const handlePresetName = (name: string) => {
    setPlayerName(name)
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(10)
    }
  }

  return (
    <div className="min-h-screen bg-parchment flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-cinzel font-bold text-dark-brown text-center mb-2">
          Advent-turer
        </h1>
        <h2 className="text-xl font-cinzel text-dark-brown text-center mb-8">
          Create Your Character
        </h2>

        <div className="bg-white/50 rounded-lg p-6 shadow-lg max-w-md mx-auto">
          <label className="block mb-4">
            <span className="text-dark-brown font-semibold mb-2 block">
              Your Name:
            </span>

            {/* Preset Names */}
            <div className="flex flex-wrap gap-2 mb-3">
              {presetNames.map((name) => (
                <button
                  key={name}
                  onClick={() => handlePresetName(name)}
                  className="px-3 py-1 text-sm rounded-full bg-dark-brown/10 text-dark-brown hover:bg-dark-brown/20 transition-colors border border-dark-brown/20"
                >
                  {name}
                </button>
              ))}
            </div>

            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Or enter your own name"
              className="w-full px-4 py-3 rounded-lg border-2 border-dark-brown/20 focus:border-dark-brown focus:outline-none text-dark-brown"
              maxLength={20}
            />
          </label>

          <div className="space-y-3">
            <p className="text-dark-brown font-semibold text-sm">
              Choose your character:
            </p>

            <button
              onClick={() => handlePresetSelect('warrior')}
              disabled={!isNameValid}
              className="w-full py-3 px-4 rounded-lg font-semibold text-white bg-deep-red hover:bg-deep-red/90 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              🗡️ WARRIOR<br/>(SKILL: 10, STAMINA: 20)
            </button>

            <button
              onClick={() => handlePresetSelect('rogue')}
              disabled={!isNameValid}
              className="w-full py-3 px-4 rounded-lg font-semibold text-white bg-deep-red hover:bg-deep-red/90 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              🪄 WIZARD<br/>(SKILL: 9, STAMINA: 18)
            </button>

            <button
              onClick={() => handlePresetSelect('barbarian')}
              disabled={!isNameValid}
              className="w-full py-3 px-4 rounded-lg font-semibold text-white bg-deep-red hover:bg-deep-red/90 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              🔪 THIEF<br/>(SKILL: 8, STAMINA: 24)
            </button>

            <button
              onClick={handleRollYourOwn}
              disabled={!isNameValid}
              className="w-full py-3 px-4 rounded-lg font-semibold text-dark-brown bg-white border-2 border-dark-brown hover:bg-dark-brown/10 disabled:bg-gray-200 disabled:border-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              Roll Your Own Stats
            </button>
          </div>
        </div>
      </div>

      {/* Roll Your Own Modal */}
      {showRollModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-parchment rounded-lg p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-2xl font-cinzel font-bold text-dark-brown text-center mb-6">
              Roll Your Stats
            </h3>

            {isRolling ? (
              <div className="text-center py-8">
                <div className="text-lg text-dark-brown animate-pulse">
                  Rolling dice...
                </div>
              </div>
            ) : rolledStats ? (
              <div className="space-y-4">
                <div className="bg-white/50 rounded-lg p-4 text-center">
                  <div className="text-sm text-dark-brown/70 mb-1">SKILL</div>
                  <div className="text-3xl font-bold text-dark-brown">
                    {rolledStats.skill}
                  </div>
                </div>

                <div className="bg-white/50 rounded-lg p-4 text-center">
                  <div className="text-sm text-dark-brown/70 mb-1">STAMINA</div>
                  <div className="text-3xl font-bold text-dark-brown">
                    {rolledStats.stamina}
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={handleReroll}
                    className="flex-1 py-3 px-4 rounded-lg font-semibold text-dark-brown bg-white border-2 border-dark-brown hover:bg-dark-brown/10 transition-colors"
                  >
                    Reroll
                  </button>
                  <button
                    onClick={handleAcceptStats}
                    className="flex-1 py-3 px-4 rounded-lg font-semibold text-white bg-forest-green hover:bg-forest-green/90 transition-colors"
                  >
                    Accept
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  )
}
