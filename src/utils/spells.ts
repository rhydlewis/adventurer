import type { Spell, SpellEffect, ActiveEffect, Character, Creature, GameState } from '../types'

export const SPELL_LIBRARY: Record<string, Spell> = {
  // Damage spells
  magic_missile: {
    id: 'magic_missile',
    name: 'Magic Missile',
    description: 'Deal 3 guaranteed damage',
    manaCost: 3,
    effect: { type: 'damage', power: 3 }
  },
  fireball: {
    id: 'fireball',
    name: 'Fireball',
    description: 'Deal 5 damage with a blazing inferno',
    manaCost: 5,
    effect: { type: 'damage', power: 5 }
  },

  // Healing
  healing_light: {
    id: 'healing_light',
    name: 'Healing Light',
    description: 'Restore 4 stamina',
    manaCost: 4,
    effect: { type: 'heal', power: 4 }
  },

  // Buffs/Debuffs
  shield: {
    id: 'shield',
    name: 'Shield',
    description: '+2 skill on your next attack',
    manaCost: 3,
    effect: {
      type: 'buff',
      power: 0,
      statModifier: { stat: 'skill', amount: 2, target: 'self' }
    }
  },
  weakness: {
    id: 'weakness',
    name: 'Weakness',
    description: '-2 enemy skill on their next attack',
    manaCost: 4,
    effect: {
      type: 'debuff',
      power: 0,
      statModifier: { stat: 'skill', amount: -2, target: 'enemy' }
    }
  },

  // Utility
  drain: {
    id: 'drain',
    name: 'Drain Life',
    description: 'Deal 3 damage and heal 2',
    manaCost: 6,
    effect: { type: 'drain', power: 3 }
  },
  block: {
    id: 'block',
    name: 'Arcane Block',
    description: 'Prevent all damage from next attack',
    manaCost: 5,
    effect: { type: 'block', power: 0 }
  }
}

export function applySpellEffect(
  spell: Spell,
  caster: Character | Creature,
  target: Character | Creature,
  activeEffects: ActiveEffect[],
  casterIsPlayer: boolean
): {
  updatedCaster: Character | Creature
  updatedTarget: Character | Creature
  updatedEffects: ActiveEffect[]
  description: string
} {
  let updatedCaster = { ...caster }
  let updatedTarget = { ...target }
  let updatedEffects = [...activeEffects]
  let description = ''

  switch (spell.effect.type) {
    case 'damage':
      updatedTarget.currentStamina = Math.max(0, target.currentStamina - spell.effect.power)
      description = `dealt ${spell.effect.power} damage`
      break

    case 'heal':
      const healAmount = Math.min(spell.effect.power, caster.maxStamina - caster.currentStamina)
      updatedCaster.currentStamina += healAmount
      description = healAmount > 0 ? `restored ${healAmount} stamina` : 'already at full health'
      break

    case 'buff':
    case 'debuff':
      const effectTarget = spell.effect.statModifier!.target === 'self'
        ? (casterIsPlayer ? 'player' : 'creature')
        : (casterIsPlayer ? 'creature' : 'player')

      const effectType = spell.effect.statModifier!.stat === 'skill'
        ? (spell.effect.type === 'buff' ? 'skill_buff' : 'skill_debuff')
        : (spell.effect.type === 'buff' ? 'luck_buff' : 'luck_debuff')

      updatedEffects.push({
        type: effectType as 'skill_buff' | 'skill_debuff' | 'luck_buff' | 'luck_debuff',
        value: Math.abs(spell.effect.statModifier!.amount),
        target: effectTarget
      })
      description = `applied ${spell.name} effect`
      break

    case 'drain':
      updatedTarget.currentStamina = Math.max(0, target.currentStamina - spell.effect.power)
      const drainHeal = Math.min(2, caster.maxStamina - caster.currentStamina)
      updatedCaster.currentStamina += drainHeal
      description = `drained ${spell.effect.power} stamina and healed ${drainHeal}`
      break

    case 'block':
      updatedEffects.push({
        type: 'block',
        value: 1,
        target: casterIsPlayer ? 'player' : 'creature'
      })
      description = 'raised an arcane barrier'
      break
  }

  return { updatedCaster, updatedTarget, updatedEffects, description }
}
