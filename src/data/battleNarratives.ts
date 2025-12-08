import type { BattleNarrative } from '../types'

/**
 * Battle narratives provide story context for creature encounters
 * Each narrative includes intro text (before battle), victory text, and defeat text
 */
export const BATTLE_NARRATIVES: BattleNarrative[] = [
  // Easy Creatures
  {
    creatureId: 'goblin',
    intro: `A goblin scout jumps out from behind a moss-covered rock, brandishing a rusty, notched dagger!

"Give me shinies or me hurt you!" it squeaks, yellow eyes gleaming with malice. The creature bounces on its toes, eager for violence.`,
    victoryText: `The goblin squeals in terror and flees into the underbrush, dropping a few tarnished coins in its haste.

You've made these roads a little safer for travelers. The goblin's crude camp nearby yields a small amount of loot.`,
    defeatText: `The goblin cackles gleefully as you fall to one knee, vision fading. "Told you! Goblin strong! Goblin best warrior!"

Your adventure ends here, at the hands of this wretched creature. Perhaps you underestimated your foe...`
  },

  {
    creatureId: 'goblin_shaman',
    intro: `A goblin draped in crude fetishes and bone ornaments points a gnarled staff at you, its tip crackling with unstable magical energy.

"You make BIG mistake coming here!" it shrieks. "Goblin magic POWERFUL! Me show you!"

Arcane symbols glow faintly in the air around the shaman. This will be more challenging than a common goblin...`,
    victoryText: `The goblin shaman's staff clatters to the ground as the creature collapses, its magical energies dissipating into harmless sparks.

You've defeated a wielder of dark magic. The local villagers will sleep easier knowing this threat is gone. Among the shaman's belongings, you find several interesting trinkets.`,
    defeatText: `Wild magical energy overwhelms you as the goblin shaman's spell finds its mark. The last thing you hear is its triumphant cackling.

"Me TOLD you! Goblin magic strong! Very strong!"

Perhaps you should have taken this spellcaster more seriously...`
  },

  {
    creatureId: 'giant_rat',
    intro: `A diseased rodent the size of a large dog emerges from the shadows, its matted fur crawling with fleas. Red eyes fix on you with primal hunger.

It hisses, revealing yellowed fangs dripping with something you hope isn't rabies. The creature tenses, ready to pounce.`,
    victoryText: `The giant rat squeals its last and goes still. You carefully avoid touching the diseased corpse.

The area is safer now, though you'll want to wash your hands thoroughly. You make a mental note to avoid the sewers where these things breed.`,
    defeatText: `The giant rat's teeth sink deep into your flesh. Disease courses through your veins as consciousness fades.

Your last thought is bitter irony - defeated not by a dragon or demon, but by vermin. Perhaps your companions will avenge you... or at least learn from your mistakes.`
  },

  {
    creatureId: 'zombie',
    intro: `A shambling corpse lurches into view, dragging one leg behind it. The stench of decay is overwhelming. Dead eyes lock onto you with terrible purpose.

"Braaains..." it moans, reaching toward you with decomposing hands. Whatever this person was in life, death has made them your enemy.`,
    victoryText: `The zombie collapses in a heap of rotting flesh, its unholy animation finally ended. You step back from the corpse, breathing through your mouth.

Someone should probably burn this body. Whatever necromancer raised this abomination is still out there, but at least this victim can rest now.`,
    defeatText: `Cold, dead hands drag you down. The last thing you feel is teeth tearing into your flesh as the zombie feeds.

In death, you too may rise as one of these cursed creatures. Such is the terrible fate of those who fall to the undead...`
  },

  // Medium Creatures
  {
    creatureId: 'skeleton',
    intro: `Bones rattle together as an animated skeleton steps into view, wielding ancient, rust-pitted weapons. Dark magic holds the bones together where sinew once did.

Empty eye sockets regard you with eerie intelligence. This is no mindless undead - something malevolent drives this creature.

"Your bones will join mine," it hisses in a voice like wind through a crypt.`,
    victoryText: `Your weapon shatters the skeleton's skull, and the dark magic animating it fails. Bones clatter to the ground, once again lifeless.

The evil that gave this corpse motion has been dispelled. You've struck a blow against the forces of necromancy, though you wonder who created this abomination.`,
    defeatText: `The skeleton's blade pierces your chest. As life drains away, you hear that terrible voice again:

"The master will be pleased. Another soul for the collection."

Your body falls beside the scattered bones. In time, perhaps you too will serve this mysterious master...`
  },

  {
    creatureId: 'corvid',
    intro: `A massive one-eyed crow descends from the shadows, its single eye glowing with malevolent intelligence. This is no ordinary bird - dark magic radiates from its midnight feathers.

"CAW! CAW! The eye sees all! The eye sees your DOOM!" it shrieks, and you realize this creature can speak.

Magical energy crackles around its talons. This will be no ordinary fight.`,
    victoryText: `The evil crow crashes to the ground, its magical energies fading. That single eye closes for the last time.

"The darkness... will remember you..." it croaks with its dying breath.

You've slain a creature of dark magic. Whatever force empowered this bird, it's one enemy fewer in the world.`,
    defeatText: `The crow's magic proves too powerful. Shadow energy engulfs you as you fall.

"CAW! CAW! The eye is victorious! Another hero falls!"

In the gathering darkness, you see that terrible glowing eye, watching, always watching...`
  },

  {
    creatureId: 'warrior',
    intro: `A corrupted warrior stumbles forward, once-proud armor now blackened and twisted by dark forces. You can see the person they used to be - a noble defender, now lost to shadow.

"Fall, as I have fallen," they rasp through a helm that seems fused to their skull. "The corruption takes all eventually. Why do you resist?"

Behind the malice, you sense desperation. But mercy won't stay their blade.`,
    victoryText: `The corrupted warrior falls to their knees, the dark energy leaving their body in wisps of shadow.

"Thank... you..." they whisper, their true voice emerging for just a moment. "I am... free..."

The warrior's body dissolves to ash, but their eyes - clear at last - show gratitude. You've given them the peace they couldn't find in life.`,
    defeatText: `The corrupted warrior's blade finds its mark. As darkness takes you, you hear their voice, almost sympathetic:

"Now you understand. The corruption claims all who fight it. Soon... you will join us..."

Your last thought is terror - not of death, but of becoming what you fought against.`
  },

  {
    creatureId: 'cube',
    intro: `The corridor ahead is blocked by a translucent, quivering mass - a gelatinous cube! Within its transparent body, you can see the dissolved remains of previous victims.

The ooze slides forward with a wet squelching sound, its acidic body leaving a trail of corroded stone. There's no reasoning with this creature, no mercy in its alien hunger.

You must fight or be digested.`,
    victoryText: `Your attacks rupture the cube's membrane. It collapses into a pool of harmless slime, its cohesion destroyed.

As the acidic remains seep between the floor stones, you notice various items that were being slowly dissolved - perhaps something useful survived the cube's digestive process.`,
    defeatText: `The cube engulfs you completely. Acid burns your skin as you're pulled into its transparent body.

Your last sight is the dungeon corridor, distorted through the cube's gelatinous mass. Consciousness fades as digestion begins. In time, your bones will join the others, warning future adventurers who are too slow to escape...`
  },

  // Hard Creatures
  {
    creatureId: 'wraith',
    intro: `The temperature plummets as a spectral horror materializes before you - a wraith, draped in tattered shadows that seem to drink the light itself.

"Your soul... I hunger..." it hisses, its voice echoing from nowhere and everywhere at once. Ghostly hands reach toward you, radiating soul-chilling cold.

This creature exists between life and death, and it wants to drag you into its twilight realm.`,
    victoryText: `Your weapon, blessed or enchanted, finds purchase in the wraith's immaterial form. It shrieks - a sound that rattles your very soul - before dissipating into nothingness.

"NO! Not... the void... not again..."

The wraith is gone, banished to whatever hell spawned it. The temperature slowly returns to normal, but the memory of that cold will haunt you for days.`,
    defeatText: `The wraith's icy touch freezes your very soul. Life drains from your body as the creature feeds, its hollow eyes gleaming with terrible satisfaction.

"Another... to join me... in eternal... cold..."

Your body crumples to the ground, but your soul - your soul is trapped, screaming silently in the wraith's domain. Death would have been a mercy.`
  },

  {
    creatureId: 'werewolf',
    intro: `A savage howl splits the night. Before you stands a nightmare - a massive werewolf, part human and part beast, cursed to be neither and both.

"Your blood will paint the moon red!" it snarls, saliva dripping from terrible fangs. Muscles ripple beneath matted fur as it prepares to pounce.

The curse has consumed whatever humanity this creature once possessed. Only the beast remains, and it hungers.`,
    victoryText: `Your blessed weapon strikes true. The werewolf staggers back with a very human cry of pain.

As life fades from its eyes, the beast's form begins to shift. The fur recedes, the snout shortens, and you see the face of the person they were before the curse took hold - peaceful at last.

"Thank you..." they whisper with their dying breath. The full moon's hold is broken.`,
    defeatText: `The werewolf's jaws close around your throat. Your scream is cut short as savage claws tear into your flesh.

"Fresh meat! The hunt is successful!"

As consciousness fades, you feel a terrible burning in your wounds. They say those who survive a werewolf's bite are cursed to become one themselves.

You won't have to worry about that. You didn't survive.`
  },

  {
    creatureId: 'owlbear',
    intro: `A terrible hybrid creature crashes through the underbrush - an owlbear, bearing the worst aspects of both animals. The size and strength of a bear combined with an owl's savage hunting instincts.

It fixes you with huge, unblinking eyes, then releases a sound that's part hoot, part roar. Massive claws tear at the earth.

This is its territory. You are prey. The owlbear will not let you leave alive.`,
    victoryText: `The owlbear crashes to the ground with a sound like a falling tree. Its chest rises and falls once more, then is still.

You've slain one of nature's most dangerous predators. Local hunters have tried for years to kill this beast. They'll sing songs of this victory in the tavern.

Owlbear feathers are prized by collectors. You carefully harvest a few as proof of your kill.`,
    defeatText: `The owlbear's talons find their mark. You feel ribs crack as it drives you to the ground.

The last thing you see are those huge, emotionless owl eyes, and then the tearing begins.

Later, other adventurers will find your remains scattered around the owlbear's nest, a warning to all who would challenge the lord of this forest.`
  },

  // Legendary Creatures
  {
    creatureId: 'dragon',
    intro: `The ancient dragon awakens, scales gleaming like molten gold in the firelight. Its eyes - older than kingdoms, wiser than any sage - fix upon you with terrible intelligence.

"Another foolish mortal seeks my hoard. Very well..." The dragon's voice rumbles like an avalanche. "Let us see if you are worthy... or merely another meal to be savored."

The dragon rises to its full, magnificent height. Mountains seem small by comparison.

"I have burned empires to ash, little one. What makes you think YOU will fare any better?"

This is it. Everything has led to this moment. Victory or death - there is no middle ground.`,
    victoryText: `Impossibly, incredibly, your final blow strikes true. The mighty dragon's form collapses with an earth-shaking BOOM that will be felt for miles.

As its ancient eyes dim, the dragon speaks one last time:

"You... are... worthy..."

Treasure beyond imagination lies before you - gold, jewels, magical artifacts. But more than that, you've accomplished what few mortals ever do. You've slain a dragon.

Legends will be written of this day. Bards will sing your name for a thousand years. You are truly a HERO.`,
    defeatText: `The dragon's flame engulfs you completely. Armor melts, flesh burns, but mercifully, consciousness fades quickly.

"Sleep well in my belly, little hero. You fought more bravely than most."

Your tale ends here, but not in dishonor. You challenged a DRAGON. Few have such courage. The bards will sing of your bravery, even as they lament your fate.

Perhaps, in some small way, that is its own kind of immortality.`
  },

  {
    creatureId: 'lich',
    intro: `Reality itself seems to warp as the lich enters, dark magic bending the laws of nature around its undead form. Robes that were once fine silk now hang in tatters from a skeletal frame.

"A predictable end awaits you, mortal," the lich intones, its voice devoid of emotion. "I have transcended death itself. What chance do you have against one who has unraveled the very secrets of mortality?"

Magical energy crackles between its bony fingers. This creature was once a wizard of immense power. Death has only made it stronger.

"Your soul shall serve me for eternity. Let us begin your... education."`,
    victoryText: `Your weapon shatters the lich's phylactery - the vessel containing its soul. The creature's eyes widen in what might be fear.

"Impossible! I was prepared for everything! I had CENTURIES to—"

The lich dissolves into ash with a cold whisper, its dark magic finally undone. Without the phylactery, even this master of necromancy cannot escape true death.

You've accomplished the impossible. The lich's reign of terror is ended. Scrolls and tomes of forbidden knowledge surround you - dangerous, but valuable.

This victory will echo through the ages. You have saved countless lives from this creature's dark ambitions.`,
    defeatText: `The lich's spell tears through your defenses like paper. You fall to your knees as necrotic energy consumes you.

"Immortality is mine, and mine alone," the lich states matter-of-factly. "A curse upon your lineage for your impudence."

As darkness claims you, you see the lich turn away, already dismissing you from thought. To a being that has lived for centuries, you were merely a momentary distraction.

Your soul is trapped, bound to serve this terrible master for eternity. Death would have been a mercy.`
  }
]

/**
 * Get battle narrative for a specific creature
 */
export function getBattleNarrative(creatureId: string): BattleNarrative | undefined {
  return BATTLE_NARRATIVES.find(n => n.creatureId === creatureId)
}

/**
 * Get intro text for a creature (fallback if no narrative defined)
 */
export function getIntroText(creatureName: string, creatureId: string): string {
  const narrative = getBattleNarrative(creatureId)
  if (narrative) {
    return narrative.intro
  }

  // Fallback generic intro
  return `A ${creatureName} appears before you, ready for battle!`
}

/**
 * Get victory text for a creature (fallback if no narrative defined)
 */
export function getVictoryText(creatureName: string, creatureId: string): string {
  const narrative = getBattleNarrative(creatureId)
  if (narrative) {
    return narrative.victoryText
  }

  // Fallback generic victory
  return `You have defeated the ${creatureName}! Victory is yours!`
}

/**
 * Get defeat text for a creature (fallback if no narrative defined)
 */
export function getDefeatText(creatureName: string, creatureId: string): string {
  const narrative = getBattleNarrative(creatureId)
  if (narrative) {
    return narrative.defeatText
  }

  // Fallback generic defeat
  return `The ${creatureName} has defeated you. Your adventure ends here...`
}
