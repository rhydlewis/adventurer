import { useEffect, useState } from 'react'

interface DieProps {
  value: number | null
  isRolling: boolean
  label: string
}

export function Die({ value, isRolling, label }: DieProps) {
  const [displayValue, setDisplayValue] = useState<number>(1)

  useEffect(() => {
    if (isRolling) {
      // Cycle through random values during roll
      const interval = setInterval(() => {
        setDisplayValue(Math.floor(Math.random() * 6) + 1)
      }, 100)

      return () => clearInterval(interval)
    } else if (value !== null) {
      setDisplayValue(value)
    }
  }, [isRolling, value])

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="text-xs font-semibold text-dark-brown/70 uppercase">
        {label}
      </div>
      <div
        className={`w-24 h-24 bg-white rounded-lg flex items-center justify-center border-2 border-dark-brown/20 shadow-lg transition-transform ${
          isRolling ? 'animate-roll' : ''
        }`}
      >
        {value !== null ? (
          <div className="text-5xl font-bold text-dark-brown">
            {displayValue}
          </div>
        ) : (
          <div className="text-4xl text-dark-brown/30">?</div>
        )}
      </div>
    </div>
  )
}
