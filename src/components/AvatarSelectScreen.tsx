import { useState } from 'react'
import { useGameStore } from '../store/gameStore'

const AVATARS = [
  'barbarian-1.jpg',
  'barbarian-2.jpg',
  'elf.jpg',
  'elf-ranger.jpg',
  'gnome.jpg',
  'necromancer.jpg',
  'paladin.jpg',
  'rogue.jpg',
  'sorcerer.jpg',
  'thief.jpg',
  'wizard.jpg',
]

export function AvatarSelectScreen() {
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null)
  const selectAvatar = useGameStore((state) => state.selectAvatar)
  const player = useGameStore((state) => state.player)

  const handleAvatarSelect = (avatar: string) => {
    setSelectedAvatar(avatar)
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(10)
    }
  }

  const handleProceed = () => {
    if (!selectedAvatar) return
    
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(10)
    }
    
    selectAvatar(selectedAvatar)
  }

  const getAvatarName = (filename: string) => {
    return filename.replace('.jpg', '').replace('-', ' ').split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  return (
    <div className="min-h-screen bg-parchment flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-cinzel font-bold text-dark-brown text-center mb-2">
          Choose Your Avatar
        </h1>
        <h2 className="text-xl font-cinzel text-dark-brown text-center mb-8">
          {player?.name}
        </h2>

        <div className="bg-white/50 rounded-lg p-6 shadow-lg">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
            {AVATARS.map((avatar) => (
              <button
                key={avatar}
                onClick={() => handleAvatarSelect(avatar)}
                className={`relative aspect-square rounded-lg overflow-hidden border-4 transition-all hover:scale-105 ${
                  selectedAvatar === avatar
                    ? 'border-deep-red shadow-lg'
                    : 'border-dark-brown/20 hover:border-dark-brown/40'
                }`}
              >
                <img
                  src={`/characters/${avatar}`}
                  alt={getAvatarName(avatar)}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-2 text-center">
                  {getAvatarName(avatar)}
                </div>
                {selectedAvatar === avatar && (
                  <div className="absolute inset-0 bg-deep-red/20 flex items-center justify-center">
                    <div className="bg-deep-red text-white rounded-full w-8 h-8 flex items-center justify-center">
                      ✓
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>

          <button
            onClick={handleProceed}
            disabled={!selectedAvatar}
            className="w-full py-3 px-4 rounded-lg font-semibold text-white bg-deep-red hover:bg-deep-red/90 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {selectedAvatar ? 'Continue to Creature Selection' : 'Select an Avatar'}
          </button>

           {/* Image Attribution */}
          <p className="text-center text-xs text-dark-brown/50 mt-4">
            Character art by{' '}
            <a
              href="https://mythjourneys.com/gallery/dungeons-and-dragons/free-dnd-character-art/"
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