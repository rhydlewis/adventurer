import type { Reactions } from '../types'

export type CreatureDifficulty = 'easy' | 'medium' | 'hard' | 'legendary'

export interface CreatureDefinition {
  id: string
  name: string
  skill: number
  stamina: number
  imageUrl: string
  difficulty: CreatureDifficulty
  description: string
  reactions?: Reactions
}

export const CREATURE_LIBRARY: CreatureDefinition[] = [
  // Easy Creatures
  {
    id: 'goblin',
    name: 'Goblin',
    skill: 5,
    stamina: 4,
    imageUrl: '/creatures/goblin.jpg',
    difficulty: 'easy',
    description: 'A small, wicked creature with sharp teeth and a nasty disposition.',
    reactions: {
      gloat: ['Hehe! Take that!', 'You weak!', 'Goblin strong!', 'Me hurt you good!'],
      cry: ['Ow ow ow!', 'That hurt!', 'No fair!', 'Goblin sad now...'],
      victory: ['Goblin win! Goblin best!', 'Me told you so!', 'Victory dance time!'],
      loss: ['No no no!', 'This not over!', 'Goblin will remember...', 'Unfair fight!']
    }
  },
  {
    id: 'giant_rat',
    name: 'Giant Rat',
    skill: 4,
    stamina: 3,
    imageUrl: '/creatures/giant-rat.jpg',
    difficulty: 'easy',
    description: 'A diseased rodent of unusual size, with red eyes and matted fur.',
    reactions: {
      gloat: ['*Squeak squeak!*', '*Hisses menacingly*', '*Gnashes teeth*', '*Chittering victory*'],
      cry: ['*Pained squeal*', '*Whimpers*', '*Scurries back*', '*Wounded hiss*'],
      victory: ['*Triumphant squeaking*', '*Stands over fallen foe*', '*Victory dance*'],
      loss: ['*Final squeak*', '*Collapses*', '*Defeated whimper*']
    }
  },
  {
    id: 'zombie',
    name: 'Zombie',
    skill: 5,
    stamina: 5,
    imageUrl: '/creatures/zombie.jpg',
    difficulty: 'easy',
    description: 'A shambling undead creature, slow but relentless.',
  },

  // Medium Creatures
  {
    id: 'skeleton',
    name: 'Skeleton',
    skill: 6,
    stamina: 8,
    imageUrl: '/creatures/skeleton.jpg',
    difficulty: 'medium',
    description: 'Animated bones held together by dark magic, wielding ancient weapons.',
    reactions: {
      gloat: ['*Bone rattling laughter*', '*Clacks jaw menacingly*', 'Your flesh will join my bones!', '*Skeletal grin*'],
      cry: ['*Bones crack*', '*Rattles in pain*', 'My ancient bones!', '*Jaw chatters*'],
      victory: ['Death claims another!', '*Victory rattle*', 'Join the eternal army!', '*Bones dance*'],
      loss: ['*Bones scatter*', 'I return... to dust...', '*Final rattle*', 'The magic... fades...']
    }
  },
  {
    id: 'warrior',
    name: 'Corrupted Warrior',
    skill: 8,
    stamina: 12,
    imageUrl: '/creatures/warrior.jpg',
    difficulty: 'medium',
    description: 'A fallen champion corrupted by dark forces, still deadly in combat.',
  },
  {
    id: 'cube',
    name: 'Gelatinous Cube',
    skill: 6,
    stamina: 8,
    imageUrl: '/creatures/cube.jpg',
    difficulty: 'medium',
    description: 'A translucent ooze that dissolves anything it engulfs.',
  },

  // Hard Creatures
  {
    id: 'wraith',
    name: 'Wraith',
    skill: 12,
    stamina: 13,
    imageUrl: '/creatures/wraith.jpg',
    difficulty: 'hard',
    description: 'A spectral horror that drains the life force from its victims.',
  },
  {
    id: 'werewolf',
    name: 'Werewolf',
    skill: 14,
    stamina: 15,
    imageUrl: '/creatures/werewolf.jpg',
    difficulty: 'hard',
    description: 'A cursed being, part human and part wolf, with savage ferocity.',
  },
  {
    id: 'owlbear',
    name: 'Owlbear',
    skill: 12,
    stamina: 20,
    imageUrl: '/creatures/owlbear.jpg',
    difficulty: 'hard',
    description: 'A monstrous hybrid of owl and bear, territorial and vicious.',
  },

  // Legendary Creatures
  {
    id: 'dragon',
    name: 'Dragon',
    skill: 15,
    stamina: 25,
    imageUrl: '/creatures/dragon.jpg',
    difficulty: 'legendary',
    description: 'An ancient wyrm with scales like armor and breath of fire.',
    reactions: {
      gloat: ['BURN, MORTAL!', 'Your flesh sizzles nicely!', 'I am eternal!', 'Feel my ancient wrath!'],
      cry: ['IMPOSSIBLE!', 'You dare wound me?!', 'My scales... cracked?', 'This cannot be!'],
      victory: ['I AM SUPREME!', 'Another hero falls before me!', 'Your bones will join my hoard!', 'Bow before the dragon!'],
      loss: ['This... is not... the end...', 'I will return... stronger...', 'You have not seen the last of me!', 'My kin will avenge me...']
    }
  },
  {
    id: 'lich',
    name: 'Lich',
    skill: 14,
    stamina: 22,
    imageUrl: '/creatures/lich.jpg',
    difficulty: 'legendary',
    description: 'A powerful undead sorcerer who has achieved immortality through dark magic.',
  },
]
