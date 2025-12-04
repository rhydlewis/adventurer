# Fighting Fantasy Battle Simulator

A nostalgic mobile-first web app for simulating Fighting Fantasy combat.

## Features

- **Character Creation**: Choose from 3 presets (Warrior, Rogue, Barbarian) or roll your own stats
- **Authentic Combat**: Fighting Fantasy rules (2d6 + SKILL = Attack Strength)
- **Animated Dice**: Smooth rolling animations with haptic feedback
- **Combat History**: Full log of all battle rounds
- **Mobile-First**: Optimized for portrait mobile devices (320-428px)
- **Share Results**: Native share sheet support
- **URL Parameters**: Custom creatures via URL

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

Customize your opponent via URL parameters:

```
?creatureName=Dragon&creatureSkill=12&creatureStamina=30
```

**Parameters:**
- `creatureName` - Creature name (default: "Goblin")
- `creatureSkill` - SKILL value 1-12 (default: 5)
- `creatureStamina` - STAMINA value 1-99 (default: 6)

**Example:**
```
https://your-app.vercel.app?creatureName=Orc&creatureSkill=7&creatureStamina=8
```

## Game Rules

1. Roll 2d6 for your character's SKILL (result + 6)
2. Roll 2d6 for your character's STAMINA (result + 12)
3. Each combat round:
   - Both combatants roll 2d6
   - Add SKILL to roll = Attack Strength
   - Higher Attack Strength wins
   - Loser takes 2 STAMINA damage
   - Equal = Draw (no damage)
4. Battle ends when either STAMINA reaches 0

## Project Structure

```
src/
├── components/          # React components
│   ├── CharacterSelectScreen.tsx
│   ├── BattleScreen.tsx
│   ├── BattleEndScreen.tsx
│   ├── Die.tsx
│   ├── CharacterStats.tsx
│   └── CombatLogModal.tsx
├── store/              # Zustand state management
│   └── gameStore.ts
├── utils/              # Pure functions
│   └── combat.ts
├── types.ts            # TypeScript types
├── App.tsx             # Main app router
└── main.tsx            # Entry point
```

## License

MIT
