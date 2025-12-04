import { useGameStore } from './store/gameStore'
import { CharacterSelectScreen } from './components/CharacterSelectScreen'
import { BattleScreen } from './components/BattleScreen'
import { BattleEndScreen } from './components/BattleEndScreen'

function App() {
  const gamePhase = useGameStore((state) => state.gamePhase)

  if (gamePhase === 'CHARACTER_SELECT') {
    return <CharacterSelectScreen />
  }

  if (
    gamePhase === 'BATTLE' ||
    gamePhase === 'DICE_ROLLING' ||
    gamePhase === 'ROUND_RESULT'
  ) {
    return <BattleScreen />
  }

  if (gamePhase === 'BATTLE_END') {
    return <BattleEndScreen />
  }

  return null
}

export default App
