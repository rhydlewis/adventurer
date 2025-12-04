import { useGameStore } from '../store/gameStore'
import { useState } from 'react'

interface InventoryPanelProps {
  isOpen: boolean
  onClose: () => void
}

export function InventoryPanel({ isOpen, onClose }: InventoryPanelProps) {
  const inventory = useGameStore((state) => state.inventory)
  const player = useGameStore((state) => state.player)
  const useItem = useGameStore((state) => state.useItem)
  const [usedItemId, setUsedItemId] = useState<string | null>(null)

  if (!player || inventory.length === 0) return null

  const getItemIcon = (itemType: string) => {
    switch (itemType) {
      case 'health_potion':
        return '🧪'
      case 'provision':
        return '🍖'
      case 'luck_potion':
        return '🍀'
      default:
        return '📦'
    }
  }

  const canUseItem = (item: any) => {
    if (item.remaining <= 0) return false

    // Can't heal above max stamina
    if (item.effect.type === 'heal' && player.currentStamina >= player.maxStamina) {
      return false
    }

    return true
  }

  const handleUseItem = (itemId: string) => {
    if (canUseItem(inventory.find(item => item.id === itemId))) {
      useItem(itemId)
      setUsedItemId(itemId)
      setTimeout(() => setUsedItemId(null), 400) // Clear animation after 400ms
    }
  }

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Slide-in Panel */}
      <div className={`fixed top-0 right-0 h-full w-80 max-w-[90vw] bg-parchment shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        {/* Header with close button */}
        <div className="flex items-center justify-between p-4 border-b border-dark-brown/20">
          <h3 className="font-cinzel font-bold text-lg text-dark-brown">
            Inventory
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-dark-brown/10 transition-colors"
          >
            <span className="text-xl text-dark-brown">×</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto h-full pb-20">
          <div className="space-y-3">
            {inventory.map((item) => (
              <div
                key={item.id}
                className={`bg-white/70 rounded-lg p-4 border border-dark-brown/20 ${usedItemId === item.id ? 'animate-item-use' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <div className="text-3xl">
                    {getItemIcon(item.type)}
                  </div>

                  <div className="flex-1">
                    <div className="font-semibold text-dark-brown mb-1">
                      {item.name}
                    </div>

                    <div className="text-sm text-dark-brown/70 mb-2">
                      {item.description}
                    </div>

                    <div className="text-xs text-dark-brown/50 mb-3">
                      Remaining: {item.remaining}
                    </div>

                    <button
                      onClick={() => handleUseItem(item.id)}
                      disabled={!canUseItem(item)}
                      className="w-full py-2 px-3 rounded text-sm font-semibold text-white bg-forest-green hover:bg-forest-green/90 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                      Use
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
