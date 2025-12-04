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
      gloat: ['*Squeak!*', '*Hiss!*', '*Sniff* (scratches at air)', '*Chittering aggressively*'],
      cry: ['*High-pitched squeal!*', '*Whimpers sadly*', '*Tries to hide*', '*Rustles fur in pain*'],
      victory: ['*Proud squeaking!*', '*Sniffs victoriously*', '*Dances a twitchy jig*', '*Gnaws at surroundings*'],
      loss: ['*A pained shriek!*', '*Flees quickly*', '*Tail between legs*', '*Silence*']
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
    reactions: {
      gloat: ['Uuuurgh...', 'Braaains...', '*Groans deeply*', '*Moans a wet, hollow sound*'],
      cry: ['Hnnngh...', '*A painful, raspy wheeze*', '*Stumbles back*', '*A low, guttural noise*'],
      victory: ['Urrgh! Braaains!', '*Shuffles closer menacingly*', '*Rattles chains/bones*', '*A triumphant, slow groan*'],
      loss: ['*Body collapses with a thud*', '...', '*Lies still*', '*One last, weak groan*']
    }
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
      gloat: ['*Clack-clack-clack*', 'Another soul for the master!', 'Your life force is mine!', '*A hollow, rattling laugh*'],
      cry: ['*Bone shatters*', '*Rattles violently*', 'The magic wanes!', '*Hisses, losing form*'],
      victory: ['*Clatters triumphantly*', 'Your doom is sealed!', '*Swings weapon wildly*', 'The darkness prevails!'],
      loss: ['*Bones scatter*', '*The animating light fades*', 'NO!', '*A faint, final clatter*']
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
    reactions: {
      gloat: ['Fall, as I have fallen!', 'The darkness consumes all!', 'Your strength is pathetic!', '*A ragged, corrupted snarl*'],
      cry: ['*A pained roar of frustration*', 'The corruption burns!', 'This wound... is deep!', '*Clutches old armor*'],
      victory: ['The battle is won!', 'For the great corruption!', 'I was once a hero, now I am inevitable!', 'Hah! Pathetic resistance.'],
      loss: ['*A final, agonizing scream*', 'The light... returns...', 'I am free...', '*Silence, the dark force departs*']
    }
  },
  {
    id: 'cube',
    name: 'Gelatinous Cube',
    skill: 6,
    stamina: 8,
    imageUrl: '/creatures/cube.jpg',
    difficulty: 'medium',
    description: 'A translucent ooze that dissolves anything it engulfs.',
    reactions: {
      gloat: ['*Slosh-slosh*', '*Squelch!*', '*A silent, ominous wobble*', '*Engulfs nearby debris*'],
      cry: ['*A frustrated, viscous splatter*', '*Recedes slightly*', '*Jiggles unhappily*', '*A thin, high-pitched suction sound*'],
      victory: ['*Ominous ingestion sounds*', '*Grows slightly larger*', '*Traps opponent*', '*Bubble of air escapes a digestive chamber*'],
      loss: ['*Splits and reforms weakly*', '*Dissolves into a puddle*', '*Loses all structural integrity*', '*The clear surface fogs over*']
    }
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
    reactions: {
      gloat: ['Your soul is mine!', 'Feel the eternal chill!', 'Succumb to despair!', '*A chilling, non-human shriek*'],
      cry: ['The light... it burns!', '*A tormented, echoing wail*', 'I cannot be touched!', '*Flickers violently*'],
      victory: ['Another life extinguished!', 'The dark path is clear!', 'I am death given form!', '*A dreadful, mournful cry of triumph*'],
      loss: ['NO! Not back to the void!', 'My master will know!', '*Dissipates into shadow*', 'I will haunt you...']
    }
  },
  {
    id: 'werewolf',
    name: 'Werewolf',
    skill: 14,
    stamina: 15,
    imageUrl: '/creatures/werewolf.jpg',
    difficulty: 'hard',
    description: 'A cursed being, part human and part wolf, with savage ferocity.',
    reactions: {
      gloat: ['*Savage howl!*', 'Your blood will be spilt!', 'I will tear you limb from limb!', '*A terrifying growl that cuts through the air*'],
      cry: ['*A pained yelp that sounds almost human*', '*Snarls in pure rage*', 'This is not possible!', '*Tries to bite the wound*'],
      victory: ['*The triumphant howl of the hunt!*', 'Fresh meat!', 'The curse is strong!', 'Hah! None can match my ferocity!'],
      loss: ['*Reverts to human form, whimpering*', 'The moon... fails me...', '*A final, weak whimper*', '...done...']
    }
  },
  {
    id: 'owlbear',
    name: 'Owlbear',
    skill: 12,
    stamina: 20,
    imageUrl: '/creatures/owlbear.jpg',
    difficulty: 'hard',
    description: 'A monstrous hybrid of owl and bear, territorial and vicious.',
    reactions: {
      gloat: ['*A screeching roar!*', '*Ruffles feathers aggressively*', '*Claws tear the ground*', 'Hoo-RAWR! (An intimidating hoot-growl)'],
      cry: ['*A pained, guttural growl*', '*Hissing and clicking beak*', '*Stumbles back, unbalanced*', '*One eye blinks slowly*'],
      victory: ['*Stands tall, beating wings*', 'Hoo-RAWR! (Victorious roar)', '*Puffs chest feathers*', 'Leave my territory!'],
      loss: ['*Slumps heavily to the ground*', '*A weak, final hoot*', '...', '*Feathers and fur droop*']
    }
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
    reactions: {
      gloat: ['A predictable end.', 'Your struggles are amusing to me.', 'Magic inexhaustible!', 'The grave calls you, foolish mortal.'],
      cry: ['A temporary setback!', 'My phylactery is safe!', 'The spell resists!', '*A dry, frustrated cackle*'],
      victory: ['Immortality is mine!', 'Kneel before your new master!', 'Your soul shall serve me forever!', 'The balance is restored (to the undead).'],
      loss: ['My reign... curtailed...', 'Impossible! I was prepared!', 'A curse upon your lineage!', '*Dissolves into ash with a cold whisper*']
    }
  },
]