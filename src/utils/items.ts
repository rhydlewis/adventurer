import type { Item, Character } from '../types'

export const DEFAULT_INVENTORY: Item[] = [
  {
    id: 'health_potion_1',
    type: 'health_potion',
    name: 'Health Potion',
    description: 'Restores 4 STAMINA',
    effect: { type: 'heal', amount: 4 },
    remaining: 2
  },
  {
    id: 'provision_1',
    type: 'provision',
    name: 'Provision',
    description: 'Restores 4 STAMINA',
    effect: { type: 'heal', amount: 4 },
    remaining: 2
  },
  {
    id: 'luck_potion_1',
    type: 'luck_potion',
    name: 'Luck Potion',
    description: 'Restores LUCK',
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
  }

  return updatedCharacter
}