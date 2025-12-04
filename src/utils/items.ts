import type { Item, Character } from '../types'

export const DEFAULT_INVENTORY: Item[] = [
  {
    id: 'health_potion_1',
    type: 'health_potion',
    name: 'Healing Draught',
    description: 'Restores 4 STAMINA',
    effect: { type: 'heal', amount: 4 },
    remaining: 2
  },
  {
    id: 'skill_potion_1',
    type: 'skill_potion',
    name: 'Draught of Proficiency',
    description: 'Increases SKILL by 3',
    effect: { type: 'skill', amount: 3 },
    remaining: 1
  },
  {
    id: 'luck_potion_1',
    type: 'luck_potion',
    name: 'Draught of Destiny',
    description: 'Restores 1 LUCK',
    effect: { type: 'luck', amount: 1 },
    remaining: 1
  }
]

export function applyItemEffect(item: Item, character: Character): Character {
  const updatedCharacter = { ...character }

  switch (item.effect.type) {
    case 'heal':
      updatedCharacter.currentStamina = Math.min(
        character.currentStamina + item.effect.amount,
        character.maxStamina
      )
      break
    case 'luck':
      if ('luck' in character && 'maxLuck' in character) {
        updatedCharacter.luck = Math.min(
          (character.luck || 0) + item.effect.amount,
          character.maxLuck || 1
        )
      }
      break
    case 'skill':
      updatedCharacter.skill = character.skill + item.effect.amount
      break
  }

  return updatedCharacter
}