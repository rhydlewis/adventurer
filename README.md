# Fighting Fantasy Battle Simulator

A nostalgic mobile-first web app for simulating Fighting Fantasy combat with authentic game mechanics, visual creature library, and dynamic reactions system.

## Features

### Core Gameplay
- **Character Creation**: Choose from 3 presets (Warrior, Rogue, Barbarian) or roll your own stats (SKILL, STAMINA, LUCK)
- **Visual Creature Library**: Select from 15+ creatures with artwork, difficulty ratings, and unique personalities
- **Avatar Selection**: Choose from 11 character portraits
- **Authentic Combat**: Fighting Fantasy rules (2d6 + SKILL = Attack Strength)
- **Testing Your Luck**: Modify damage outcomes by testing luck (decreases by 1 each use)
- **Special Attacks**: High-risk, high-reward moves (67% chance for 4 damage, 33% chance backfire for 2 damage)
- **Reactions System**: Dynamic speech bubbles from characters and creatures during combat
- **Inventory System**: Use consumable items during battle:
  - **Healing Draught** (2x): Restores 4 STAMINA
  - **Draught of Proficiency** (1x): Increases SKILL by 3
  - **Draught of Destiny** (1x): Restores 1 LUCK

### UI/UX Features
- **Animated Dice**: Smooth rolling animations with haptic feedback
- **Combat History**: Full log of all battle rounds including luck tests
- **Mobile-First**: Optimized for portrait mobile devices (320-428px)
- **Share Battle Setup**: Generate shareable URLs with character and creature configurations
- **URL Quick Start**: Jump straight into battle via URL parameters

## Tech Stack

- **React 18** with TypeScript
- **Zustand** for state management
- **Tailwind CSS** for styling
- **Vite** for build tooling
- **Vercel** for deployment

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Deployment

Deploy to Vercel:

```bash
vercel
```

Or push to GitHub and connect to Vercel for automatic deployments.

## URL Parameters

Jump straight into battle or share specific setups using URL parameters.

### Quick Start with Presets

Use preset characters from the creature library:

```
/?preset=warrior&creature=goblin
/?preset=rogue&creature=dragon
/?preset=barbarian&creature=troll&avatar=necromancer
```

**Preset Options:**
- `warrior` - SKILL: 10, STAMINA: 20, LUCK: 9 (Default avatar: paladin)
- `rogue` - SKILL: 9, STAMINA: 18, LUCK: 11 (Default avatar: rogue)
- `barbarian` - SKILL: 8, STAMINA: 24, LUCK: 8 (Default avatar: barbarian-1)

### Custom Character Stats

Create custom characters with specific stats:

```
/?name=Gandalf&skill=12&stamina=16&luck=11&creature=dragon&avatar=wizard
/?skill=10&stamina=20&luck=9&creature=orc
```

**Character Parameters:**
- `name` - Character name (default: "Hero")
- `skill` - SKILL value 7-12 (auto-clamped)
- `stamina` - STAMINA value 14-24 (auto-clamped)
- `luck` - LUCK value 7-12 (auto-clamped)
- `avatar` - Avatar filename without .jpg (e.g., "wizard", "paladin")

**Available Avatars:**
`barbarian-1`, `barbarian-2`, `elf-ranger`, `elf`, `gnome`, `necromancer`, `paladin`, `rogue`, `sorcerer`, `thief`, `wizard`

### Creatures from Library

Select creatures by ID or name:

```
/?preset=warrior&creature=dragon
/?preset=rogue&creature=giant_rat
```

**Creature Library:**
- **Easy**: Goblin, Giant Rat, Zombie, Skeleton
- **Medium**: Orc, Werewolf, Giant Spider, Vampire
- **Hard**: Troll, Minotaur, Dark Sorcerer, Golem
- **Legendary**: Dragon, Demon Lord, Lich King

### Custom Creatures

Create custom opponents with specific stats:

```
/?creatureName=CustomBoss&creatureSkill=10&creatureStamina=25
/?preset=warrior&creatureName=Dragon&creatureSkill=8&creatureStamina=12
```

**Custom Creature Parameters:**
- `creatureName` - Creature name (string)
- `creatureSkill` - SKILL value 1-12 (auto-clamped)
- `creatureStamina` - STAMINA value 1-30 (auto-clamped)

**Note:** Custom creatures don't have images or reactions.

### Complete Example

```
https://your-app.vercel.app/?name=Merlin&skill=12&stamina=16&luck=11&creature=dragon&avatar=wizard
```

## Game Rules

### Character Creation
1. Choose a preset or roll your own:
   - **SKILL**: Roll 1d6 + 6 (range: 7-12)
   - **STAMINA**: Roll 2d6 + 12 (range: 14-24)
   - **LUCK**: Roll 1d6 + 6 (range: 7-12)
2. Select an avatar portrait
3. Choose your opponent from the creature library

### Combat
Each round:
1. Both combatants roll 2d6
2. Add SKILL to roll = Attack Strength
3. Higher Attack Strength wins
4. Loser can **Test Your Luck** to modify damage:
   - Roll 2d6, if ≤ LUCK: **LUCKY** (1 damage instead of 2)
   - Roll 2d6, if > LUCK: **UNLUCKY** (3 damage instead of 2)
   - Testing luck decreases your LUCK by 1
5. Equal Attack Strength = Draw (no damage)
6. Battle ends when either STAMINA reaches 0

### Special Actions

**Special Attack:**
- 67% chance: Deal 4 damage to enemy
- 33% chance: Backfire! Take 2 damage (can test luck)

**Use Items:**
- **Healing Draught**: Restore 4 STAMINA (can't exceed max)
- **Draught of Proficiency**: Permanently increase SKILL by 3 for this battle
- **Draught of Destiny**: Restore 1 LUCK (can't exceed max)

**Testing Your Luck:**
- Offered after taking or dealing damage
- Roll 2d6 vs current LUCK
- Success: Reduce damage from 2→1 or increase from 2→3
- Failure: Increase damage from 2→3 or reduce from 2→1
- LUCK decreases by 1 after each test

## Project Structure

```
src/
├── components/          # React components
│   ├── CharacterSelectScreen.tsx
│   ├── AvatarSelectScreen.tsx
│   ├── CreatureSelectScreen.tsx
│   ├── CreatureLibrary.tsx
│   ├── BattleScreen.tsx
│   ├── BattleEndScreen.tsx
│   ├── Die.tsx
│   ├── CharacterStats.tsx
│   ├── CombatLogModal.tsx
│   ├── InventoryPanel.tsx
│   ├── LuckTestModal.tsx
│   └── SpeechBubble.tsx
├── store/              # Zustand state management
│   └── gameStore.ts
├── utils/              # Pure functions
│   ├── combat.ts       # Combat mechanics
│   ├── items.ts        # Item effects
│   ├── luck.ts         # Luck testing
│   └── urlParams.ts    # URL parsing & generation
├── data/               # Static data
│   └── creatures.ts    # Creature library
├── types.ts            # TypeScript types
├── App.tsx             # Main app router
└── main.tsx            # Entry point

public/
├── creatures/          # Creature artwork
└── characters/         # Character avatars
```

## Share Battle Setups

After selecting a character and creature, click **"🔗 Share Battle Setup"** to generate a shareable URL. The app automatically:
- Uses presets when stats match (shorter URLs)
- Falls back to custom parameters for unique characters
- Strips file extensions for cleaner URLs
- Copies the URL to your clipboard

## Features Roadmap

- [x] Character creation with presets
- [x] Authentic Fighting Fantasy combat
- [x] Creature library with artwork
- [x] Testing Your Luck mechanic
- [x] Inventory system with potions
- [x] Special attacks
- [x] Dynamic reactions system
- [x] URL quick start
- [x] Share battle setups
- [ ] Victory statistics & achievements (Feature 5 - planned)
- [ ] Spell casting system (Feature 4 - planned)

## Credits

- Monster artwork by [MythJourneys](https://mythjourneys.com/gallery/dungeons-and-dragons/free-dnd-monster-art/)
- Based on the Fighting Fantasy game system by Steve Jackson and Ian Livingstone

## License

MIT
