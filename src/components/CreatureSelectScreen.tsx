import { useState } from 'react'
import { useGameStore } from '../store/gameStore'
import { CreatureLibrary } from './CreatureLibrary'
import { CreatureDefinition } from '../data/creatures'

export function CreatureSelectScreen() {
  const [selectedCreature, setSelectedCreature] = useState<CreatureDefinition | null>(null)
  
  const selectCreature = useGameStore((state) => state.selectCreature)
  const startBattle = useGameStore((state) => state.startBattle)
  const player = useGameStore((state) => state.player)

  const handleCreatureSelect = (creature: CreatureDefinition) => {
    setSelectedCreature(creature)
    selectCreature(creature.name, creature.skill, creature.stamina, creature.imageUrl, creature.reactions)
  }

  const handleStartBattle = () => {
    if (!selectedCreature) return
    
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(10)
    }
    
    startBattle()
  }

  return (
    <div className="min-h-screen bg-parchment flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-cinzel font-bold text-dark-brown text-center mb-2">
          Choose Your Foe
        </h1>
        <h2 className="text-xl font-cinzel text-dark-brown text-center mb-8">
          {player?.name} - Ready for Battle
        </h2>

        <div className="bg-white/50 rounded-lg p-6 shadow-lg">
          <CreatureLibrary
            onSelectCreature={handleCreatureSelect}
            selectedCreatureId={selectedCreature?.id}
          />
          
          <button
            onClick={handleStartBattle}
            disabled={!selectedCreature}
            className="w-full mt-6 py-3 px-4 rounded-lg font-semibold text-white bg-deep-red hover:bg-deep-red/90 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {selectedCreature ? `Battle ${selectedCreature.name}!` : 'Select a creature'}
          </button>

          {/* Image Attribution */}
          <p className="text-center text-xs text-dark-brown/50 mt-4">
            Monster art by{' '}
            <a
              href="https://mythjourneys.com/gallery/dungeons-and-dragons/free-dnd-monster-art/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-dark-brown/70"
            >
              MythJourneys
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}