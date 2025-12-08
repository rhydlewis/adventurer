import { useGameStore } from '../store/gameStore'

interface NarrativeDisplayProps {
  onContinue: () => void
}

/**
 * NarrativeDisplay component shows story text before battles and after victories/defeats
 * Displays narrative text with appropriate styling and a continue button
 */
export function NarrativeDisplay({ onContinue }: NarrativeDisplayProps) {
  const currentNarrative = useGameStore((state) => state.currentNarrative)

  if (!currentNarrative) return null

  const { text, type } = currentNarrative

  // Determine styling based on narrative type
  const getBorderColor = () => {
    switch (type) {
      case 'intro':
        return 'border-blue-500'
      case 'victory':
        return 'border-green-500'
      case 'defeat':
        return 'border-red-500'
      default:
        return 'border-gray-500'
    }
  }

  const getTitle = () => {
    switch (type) {
      case 'intro':
        return '⚔️ Battle Awaits'
      case 'victory':
        return '🎉 Victory!'
      case 'defeat':
        return '💀 Defeat'
      default:
        return ''
    }
  }

  const getButtonText = () => {
    switch (type) {
      case 'intro':
        return 'Begin Battle'
      case 'victory':
        return 'Continue'
      case 'defeat':
        return 'Accept Fate'
      default:
        return 'Continue'
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className={`max-w-2xl w-full bg-gray-900 border-4 ${getBorderColor()} rounded-lg shadow-2xl`}>
        {/* Title */}
        <div className={`border-b-2 ${getBorderColor()} px-6 py-4`}>
          <h2 className="text-2xl font-bold text-white text-center">
            {getTitle()}
          </h2>
        </div>

        {/* Narrative Text */}
        <div className="px-6 py-8 max-h-[60vh] overflow-y-auto">
          <div className="prose prose-invert max-w-none">
            {text.split('\n\n').map((paragraph, index) => (
              <p
                key={index}
                className="text-gray-200 text-lg leading-relaxed mb-4 last:mb-0"
              >
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        {/* Continue Button */}
        <div className={`border-t-2 ${getBorderColor()} px-6 py-4 flex justify-center`}>
          <button
            onClick={onContinue}
            className={`
              px-8 py-3 rounded-lg font-bold text-lg
              transition-all duration-200
              ${
                type === 'victory'
                  ? 'bg-green-600 hover:bg-green-500 text-white'
                  : type === 'defeat'
                  ? 'bg-red-600 hover:bg-red-500 text-white'
                  : 'bg-blue-600 hover:bg-blue-500 text-white'
              }
              hover:scale-105 active:scale-95
              shadow-lg
            `}
          >
            {getButtonText()}
          </button>
        </div>
      </div>
    </div>
  )
}
