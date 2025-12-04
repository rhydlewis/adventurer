import { useState } from 'react'
import { CREATURE_LIBRARY, CreatureDefinition, CreatureDifficulty } from '../data/creatures'

interface CreatureLibraryProps {
  onSelectCreature: (creature: CreatureDefinition) => void
  selectedCreatureId?: string
}

export function CreatureLibrary({ onSelectCreature, selectedCreatureId }: CreatureLibraryProps) {
  const [difficultyFilter, setDifficultyFilter] = useState<CreatureDifficulty | 'all'>('all')

  const filteredCreatures = difficultyFilter === 'all'
    ? CREATURE_LIBRARY
    : CREATURE_LIBRARY.filter(c => c.difficulty === difficultyFilter)

  const handleCreatureClick = (creature: CreatureDefinition) => {
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(10)
    }
    onSelectCreature(creature)
  }

  const getDifficultyColor = (difficulty: CreatureDifficulty) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-forest-green text-white'
      case 'medium':
        return 'bg-yellow-600 text-white'
      case 'hard':
        return 'bg-orange-600 text-white'
      case 'legendary':
        return 'bg-deep-red text-white'
    }
  }

  return (
    <div className="w-full">
      {/* Difficulty Filter */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => setDifficultyFilter('all')}
          className={`px-3 py-1 rounded-full text-sm font-semibold transition-colors ${
            difficultyFilter === 'all'
              ? 'bg-dark-brown text-white'
              : 'bg-dark-brown/10 text-dark-brown hover:bg-dark-brown/20'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setDifficultyFilter('easy')}
          className={`px-3 py-1 rounded-full text-sm font-semibold transition-colors ${
            difficultyFilter === 'easy'
              ? 'bg-forest-green text-white'
              : 'bg-forest-green/20 text-forest-green hover:bg-forest-green/30'
          }`}
        >
          Easy
        </button>
        <button
          onClick={() => setDifficultyFilter('medium')}
          className={`px-3 py-1 rounded-full text-sm font-semibold transition-colors ${
            difficultyFilter === 'medium'
              ? 'bg-yellow-600 text-white'
              : 'bg-yellow-600/20 text-yellow-700 hover:bg-yellow-600/30'
          }`}
        >
          Medium
        </button>
        <button
          onClick={() => setDifficultyFilter('hard')}
          className={`px-3 py-1 rounded-full text-sm font-semibold transition-colors ${
            difficultyFilter === 'hard'
              ? 'bg-orange-600 text-white'
              : 'bg-orange-600/20 text-orange-700 hover:bg-orange-600/30'
          }`}
        >
          Hard
        </button>
        <button
          onClick={() => setDifficultyFilter('legendary')}
          className={`px-3 py-1 rounded-full text-sm font-semibold transition-colors ${
            difficultyFilter === 'legendary'
              ? 'bg-deep-red text-white'
              : 'bg-deep-red/20 text-deep-red hover:bg-deep-red/30'
          }`}
        >
          Legendary
        </button>
      </div>

      {/* Creature Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
        {filteredCreatures.map((creature) => (
          <button
            key={creature.id}
            onClick={() => handleCreatureClick(creature)}
            className={`group relative bg-white/50 rounded-lg p-3 transition-all hover:shadow-lg hover:scale-105 ${
              selectedCreatureId === creature.id
                ? 'ring-4 ring-deep-red shadow-lg scale-105'
                : ''
            }`}
          >
            {/* Difficulty Badge */}
            <div className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-bold ${getDifficultyColor(creature.difficulty)}`}>
              {creature.difficulty.toUpperCase()}
            </div>

            {/* Creature Image */}
            <div className="aspect-square mb-2 rounded-lg overflow-hidden bg-dark-brown/5">
              <img
                src={creature.imageUrl}
                alt={creature.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Creature Info */}
            <h3 className="font-cinzel font-bold text-dark-brown text-sm md:text-base mb-1">
              {creature.name}
            </h3>

            <div className="flex justify-between text-xs text-dark-brown/70 mb-2">
              <span>SKILL: {creature.skill}</span>
              <span>STAM: {creature.stamina}</span>
            </div>

            {/* Description (visible on hover on desktop, always visible on mobile) */}
            <p className="text-xs text-dark-brown/60 line-clamp-2 md:line-clamp-none md:opacity-0 md:group-hover:opacity-100 transition-opacity">
              {creature.description}
            </p>

            {/* Selected Indicator */}
            {selectedCreatureId === creature.id && (
              <div className="absolute inset-0 bg-deep-red/10 rounded-lg pointer-events-none" />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
