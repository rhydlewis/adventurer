import type { Character, Creature } from '../types'
import { useGameStore } from '../store/gameStore'

interface CharacterStatsProps {
  character: Character | Creature
  label: string
  tookDamage?: boolean
  wasHealed?: boolean
  imageUrl?: string
}

export function CharacterStats({ character, label, tookDamage = false, wasHealed = false, imageUrl }: CharacterStatsProps) {
  const staminaPercentage = (character.currentStamina / character.maxStamina) * 100
  const activeEffects = useGameStore((state) => state.activeEffects)

  // Calculate skill modifier for this character
  const isPlayer = label.toLowerCase().includes('you') || label.toLowerCase().includes('player')
  const target = isPlayer ? 'player' : 'creature'

  let skillMod = 0
  activeEffects.forEach(effect => {
    if (effect.target === target) {
      if (effect.type === 'skill_buff') {
        skillMod += effect.value
      } else if (effect.type === 'skill_debuff') {
        skillMod -= effect.value
      }
    }
  })

  return (
    <div className={`bg-white/50 rounded-lg p-4 ${tookDamage ? 'animate-blood-splatter' : ''} ${wasHealed ? 'animate-healing-glow' : ''}`}>
      <h3 className="font-cinzel font-bold text-lg text-dark-brown mb-3">
        {label}
      </h3>

      {/* Creature Image */}
      {imageUrl && (
        <div className="mb-4 rounded-lg overflow-hidden bg-dark-brown/5">
          <img
            src={imageUrl}
            alt={character.name}
            className="w-full max-w-[200px] md:max-w-[300px] mx-auto object-cover"
          />
        </div>
      )}

      <div className="text-dark-brown mb-2">
        <span className="font-semibold">{character.name}</span>
      </div>
      <div className="space-y-2">
        <div>
          <div className="text-sm text-dark-brown/70">SKILL</div>
          <div className="text-2xl font-bold text-dark-brown">
            {character.skill}
            {skillMod !== 0 && (
              <span className={skillMod > 0 ? 'text-green-600' : 'text-red-600'}>
                {' '}{skillMod > 0 ? '+' : ''}{skillMod}
              </span>
            )}
          </div>
        </div>
        <div>
          <div className="text-sm text-dark-brown/70">STAMINA</div>
          <div className="text-2xl font-bold text-dark-brown">
            {character.currentStamina} / {character.maxStamina}
          </div>
          {/* Stamina bar */}
          <div className="mt-1 h-2 bg-dark-brown/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-forest-green transition-all duration-300"
              style={{ width: `${staminaPercentage}%` }}
            />
          </div>
        </div>
        {/* Luck stat - only show for player characters */}
        {'luck' in character && character.luck !== undefined && (
          <div>
            <div className="text-sm text-dark-brown/70">LUCK</div>
            <div className="text-2xl font-bold text-yellow-600">
              {character.luck} / {character.maxLuck}
            </div>
            {/* Luck bar */}
            <div className="mt-1 h-2 bg-dark-brown/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-yellow-500 transition-all duration-300"
                style={{ width: `${(character.luck / character.maxLuck) * 100}%` }}
              />
            </div>
          </div>
        )}
        {/* Mana stat - only show if character has mana */}
        {'maxMana' in character && character.maxMana !== undefined && character.maxMana > 0 && (
          <div>
            <div className="text-sm text-dark-brown/70">MANA</div>
            <div className="text-2xl font-bold text-blue-600">
              {character.mana} / {character.maxMana}
            </div>
            {/* Mana bar */}
            <div className="mt-1 h-2 bg-dark-brown/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all duration-300"
                style={{ width: `${(character.mana! / character.maxMana) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
