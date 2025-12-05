import { useEffect } from 'react'
import { useGameStore } from './store/gameStore'
import { CharacterSelectScreen } from './components/CharacterSelectScreen'
import { AvatarSelectScreen } from './components/AvatarSelectScreen'
import { CreatureSelectScreen } from './components/CreatureSelectScreen'
import { BattleScreen } from './components/BattleScreen'
import { BattleEndScreen } from './components/BattleEndScreen'
import { CampaignVictoryScreen } from './components/CampaignVictoryScreen'
import { CampaignEndScreen } from './components/CampaignEndScreen'
import { parseQuickStartParams } from './utils/urlParams'

function App() {
  const gamePhase = useGameStore((state) => state.gamePhase)
  const createCharacter = useGameStore((state) => state.createCharacter)
  const selectAvatar = useGameStore((state) => state.selectAvatar)
  const selectCreature = useGameStore((state) => state.selectCreature)
  const startBattle = useGameStore((state) => state.startBattle)

  // Quick start from URL parameters
  useEffect(() => {
    const quickStart = parseQuickStartParams()

    if (quickStart) {
      // Auto-create character
      createCharacter(
        quickStart.character.name,
        quickStart.character.skill,
        quickStart.character.stamina,
        quickStart.character.luck
      )

      // Auto-select avatar if provided
      if (quickStart.character.avatar) {
        selectAvatar(quickStart.character.avatar)
      }

      // Auto-select creature
      selectCreature(
        quickStart.creature.name,
        quickStart.creature.skill,
        quickStart.creature.stamina,
        quickStart.creature.imageUrl,
        quickStart.creature.reactions
      )

      // Start battle immediately
      startBattle()
    }
  }, [createCharacter, selectAvatar, selectCreature, startBattle])

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

  if (gamePhase === 'CAMPAIGN_VICTORY') {
    return <CampaignVictoryScreen />
  }

  if (gamePhase === 'CAMPAIGN_END') {
    return <CampaignEndScreen />
  }

  return null
}

export default App
