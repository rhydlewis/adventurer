import { PRESETS } from '../types'
import { CREATURE_LIBRARY, type CreatureDefinition, type CreatureDifficulty } from '../data/creatures'

export interface QuickStartParams {
  character: {
    name: string
    skill: number
    stamina: number
    luck: number
    avatar?: string
    mana: number
    spells: string[]
  }
  creature: CreatureDefinition
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * Parse URL parameters for quick start functionality
 * Supports both preset-based and custom character stats
 *
 * Examples:
 * - /?preset=warrior&creature=goblin
 * - /?name=Hero&skill=10&stamina=20&luck=9&creature=dragon
 * - /?preset=rogue&creature=troll&avatar=elf
 */
export function parseQuickStartParams(): QuickStartParams | null {
  const params = new URLSearchParams(window.location.search)

  const preset = params.get('preset')
  const creatureParam = params.get('creature')
  const creatureName = params.get('creatureName')
  const creatureSkill = params.get('creatureSkill')
  const creatureStamina = params.get('creatureStamina')

  // Need at least a creature (from library or custom)
  if (!creatureParam && !creatureName) return null

  // Parse creature - either from library or custom
  let creature: CreatureDefinition | null = null

  if (creatureParam) {
    // Find creature in library
    creature = CREATURE_LIBRARY.find(c =>
      c.id === creatureParam.toLowerCase() ||
      c.name.toLowerCase() === creatureParam.toLowerCase()
    ) || null
  }

  // If not found in library, check for custom creature params
  if (!creature && creatureName && creatureSkill && creatureStamina) {
    creature = {
      id: creatureName.toLowerCase().replace(/\s+/g, '-'),
      name: creatureName,
      skill: clamp(parseInt(creatureSkill), 1, 12),
      stamina: clamp(parseInt(creatureStamina), 1, 30),
      imageUrl: '', // No image for custom creatures
      difficulty: 'medium' as CreatureDifficulty,
      description: 'A custom creature'
    }
  }

  if (!creature) return null

  // Default avatars for presets
  const presetAvatars: Record<string, string> = {
    warrior: 'paladin.jpg',
    rogue: 'rogue.jpg',
    barbarian: 'barbarian-1.jpg'
  }

  // Parse character
  let character
  if (preset && preset in PRESETS) {
    // Use preset
    const presetData = PRESETS[preset as keyof typeof PRESETS]
    const avatarParam = params.get('avatar')
    const avatar = avatarParam
      ? (avatarParam.endsWith('.jpg') ? avatarParam : `${avatarParam}.jpg`)
      : presetAvatars[preset] // Default avatar for preset

    character = {
      name: params.get('name') || capitalize(preset),
      skill: presetData.skill,
      stamina: presetData.stamina,
      luck: presetData.luck,
      mana: presetData.mana,
      spells: presetData.spells,
      avatar
    }
  } else {
    // Custom character or defaults
    const skill = params.get('skill')
    const stamina = params.get('stamina')
    const luck = params.get('luck')
    const avatarParam = params.get('avatar')
    const avatar = avatarParam
      ? (avatarParam.endsWith('.jpg') ? avatarParam : `${avatarParam}.jpg`)
      : undefined

    const parsedSkill = skill ? clamp(parseInt(skill), 7, 12) : 10
    const parsedStamina = stamina ? clamp(parseInt(stamina), 14, 24) : 20
    const parsedLuck = luck ? clamp(parseInt(luck), 7, 12) : 9

    // Check if stats match a preset
    let matchedPreset: typeof PRESETS[keyof typeof PRESETS] | null = null
    for (const presetData of Object.values(PRESETS)) {
      if (
        presetData.skill === parsedSkill &&
        presetData.stamina === parsedStamina &&
        presetData.luck === parsedLuck
      ) {
        matchedPreset = presetData
        break
      }
    }

    character = {
      name: params.get('name') || 'Hero',
      skill: parsedSkill,
      stamina: parsedStamina,
      luck: parsedLuck,
      mana: matchedPreset ? matchedPreset.mana : 0,
      spells: matchedPreset ? matchedPreset.spells : [],
      avatar
    }
  }

  console.log('🔗 QUICK START PARAMS PARSED:', {
    character: {
      name: character.name,
      skill: character.skill,
      stamina: character.stamina,
      luck: character.luck,
      mana: character.mana,
      spells: character.spells,
      avatar: character.avatar
    },
    creature: {
      name: creature.name,
      skill: creature.skill,
      stamina: creature.stamina,
      mana: creature.mana,
      maxMana: creature.maxMana,
      spells: creature.spells,
      spellCastChance: creature.spellCastChance
    }
  })

  return {
    character,
    creature
  }
}

/**
 * Generate a shareable URL with current character and creature setup
 * Prioritizes using presets when stats match, otherwise uses custom params
 */
export function generateShareURL(
  character: { name: string; skill: number; stamina: number; luck: number; avatar?: string },
  creature: { name: string; skill: number; stamina: number }
): string {
  const params = new URLSearchParams()

  // Check if character matches a preset
  let matchedPreset: string | null = null
  for (const [presetName, presetData] of Object.entries(PRESETS)) {
    if (
      presetData.skill === character.skill &&
      presetData.stamina === character.stamina &&
      presetData.luck === character.luck
    ) {
      matchedPreset = presetName
      break
    }
  }

  // Add character params
  if (matchedPreset) {
    params.set('preset', matchedPreset)
    if (character.name !== capitalize(matchedPreset)) {
      params.set('name', character.name)
    }
  } else {
    params.set('name', character.name)
    params.set('skill', character.skill.toString())
    params.set('stamina', character.stamina.toString())
    params.set('luck', character.luck.toString())
  }

  // Add avatar if present (strip .jpg extension for cleaner URLs)
  if (character.avatar) {
    const avatarName = character.avatar.replace(/\.jpg$/, '')
    params.set('avatar', avatarName)
  }

  // Find creature in library
  const creatureData = CREATURE_LIBRARY.find(c =>
    c.name === creature.name &&
    c.skill === creature.skill &&
    c.stamina === creature.stamina
  )

  if (creatureData) {
    params.set('creature', creatureData.id)
  } else {
    // Custom creature - use name
    params.set('creature', creature.name.toLowerCase().replace(/\s+/g, '-'))
  }

  const baseURL = window.location.origin + window.location.pathname
  return `${baseURL}?${params.toString()}`
}
