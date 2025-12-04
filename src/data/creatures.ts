export type CreatureDifficulty = 'easy' | 'medium' | 'hard' | 'legendary'

export interface CreatureDefinition {
  id: string
  name: string
  skill: number
  stamina: number
  imageUrl: string
  difficulty: CreatureDifficulty
  description: string
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
  },
  {
    id: 'giant_rat',
    name: 'Giant Rat',
    skill: 4,
    stamina: 3,
    imageUrl: '/creatures/giant-rat.jpg',
    difficulty: 'easy',
    description: 'A diseased rodent of unusual size, with red eyes and matted fur.',
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
    stamina: 6,
    imageUrl: '/creatures/skeleton.jpg',
    difficulty: 'medium',
    description: 'Animated bones held together by dark magic, wielding ancient weapons.',
  },
  {
    id: 'warrior',
    name: 'Corrupted Warrior',
    skill: 7,
    stamina: 7,
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
    skill: 8,
    stamina: 8,
    imageUrl: '/creatures/wraith.jpg',
    difficulty: 'hard',
    description: 'A spectral horror that drains the life force from its victims.',
  },
  {
    id: 'werewolf',
    name: 'Werewolf',
    skill: 7,
    stamina: 9,
    imageUrl: '/creatures/werewolf.jpg',
    difficulty: 'hard',
    description: 'A cursed being, part human and part wolf, with savage ferocity.',
  },
  {
    id: 'owlbear',
    name: 'Owlbear',
    skill: 8,
    stamina: 10,
    imageUrl: '/creatures/owlbear.jpg',
    difficulty: 'hard',
    description: 'A monstrous hybrid of owl and bear, territorial and vicious.',
  },

  // Legendary Creatures
  {
    id: 'dragon',
    name: 'Dragon',
    skill: 10,
    stamina: 12,
    imageUrl: '/creatures/dragon.jpg',
    difficulty: 'legendary',
    description: 'An ancient wyrm with scales like armor and breath of fire.',
  },
  {
    id: 'lich',
    name: 'Lich',
    skill: 9,
    stamina: 11,
    imageUrl: '/creatures/lich.jpg',
    difficulty: 'legendary',
    description: 'A powerful undead sorcerer who has achieved immortality through dark magic.',
  },
]
