import type { Character, Creature } from '../types'

interface CharacterStatsProps {
  character: Character | Creature
  label: string
  tookDamage?: boolean
  imageUrl?: string
}

export function CharacterStats({ character, label, tookDamage = false, imageUrl }: CharacterStatsProps) {
  const staminaPercentage = (character.currentStamina / character.maxStamina) * 100

  return (
    <div className={`bg-white/50 rounded-lg p-4 ${tookDamage ? 'animate-blood-splatter' : ''}`}>
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
      </div>
    </div>
  )
}
