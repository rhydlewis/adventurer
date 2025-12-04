import { useGameStore } from './store/gameStore'
import { CharacterSelectScreen } from './components/CharacterSelectScreen'
import { AvatarSelectScreen } from './components/AvatarSelectScreen'
import { CreatureSelectScreen } from './components/CreatureSelectScreen'
import { BattleScreen } from './components/BattleScreen'
import { BattleEndScreen } from './components/BattleEndScreen'

function App() {
  const gamePhase = useGameStore((state) => state.gamePhase)

  if (gamePhase === 'CHARACTER_SELECT') {
    return <CharacterSelectScreen />
  }

  if (gamePhase === 'AVATAR_SELECT') {
    return <AvatarSelectScreen />
  }

  if (gamePhase === 'CREATURE_SELECT') {
    return <CreatureSelectScreen />
  }

  if (
    gamePhase === 'BATTLE' ||
    gamePhase === 'DICE_ROLLING' ||
    gamePhase === 'LUCK_TEST' ||
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
