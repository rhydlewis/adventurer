import React, { useEffect, useState } from 'react'

interface SpeechBubbleProps {
  text: string
  isVisible: boolean
  position: 'left' | 'right'
  onComplete?: () => void
}

export function SpeechBubble({ text, isVisible, position, onComplete }: SpeechBubbleProps) {
  const [shouldRender, setShouldRender] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true)
      // Small delay to trigger animation
      setTimeout(() => setIsAnimating(true), 10)

      // Auto-hide after 2.5 seconds
      const timer = setTimeout(() => {
        setIsAnimating(false)
        // Wait for animation to complete before removing from DOM
        setTimeout(() => {
          setShouldRender(false)
          onComplete?.()
        }, 300)
      }, 2500)
      return () => clearTimeout(timer)
    } else {
      setIsAnimating(false)
      setTimeout(() => setShouldRender(false), 300)
    }
  }, [isVisible, onComplete])

  if (!shouldRender) return null

  const bubbleClasses = `
    absolute z-20 max-w-xs p-3 rounded-lg shadow-lg
    bg-white border-2 border-gray-300
    text-sm font-medium text-gray-800
    transition-all duration-300 transform
    ${isAnimating ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
    ${position === 'left' ? '-top-16 left-0 ml-2' : '-top-16 right-0 mr-2'}
  `

  const tailClasses = `
    absolute w-0 h-0 border-solid
    ${position === 'left' 
      ? 'left-4 border-l-0 border-r-8 border-r-white border-t-8 border-t-transparent border-b-8 border-b-transparent' 
      : 'right-4 border-r-0 border-l-8 border-l-white border-t-8 border-t-transparent border-b-8 border-b-transparent'
    }
    -bottom-2
  `

  return (
    <div className={bubbleClasses}>
      <div className="relative">
        {text}
        <div className={tailClasses}></div>
      </div>
    </div>
  )
}
