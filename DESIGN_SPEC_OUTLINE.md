# Adventurer Game - Design Specification Outline

## 📋 Document Overview

**Purpose:** Transform the current Fighting Fantasy-style combat game into a rich single-player narrative RPG using Pathfinder/d20 mechanics

**Status:** DRAFT - Outline for Discussion

**Last Updated:** 2025-12-07

---

## 🎯 Vision & Goals

### Core Vision
Transform from a simple combat simulator into a narrative-driven single-player RPG that combines:
- Tactical d20 combat with meaningful choices
- Rich storytelling with branching narratives
- Exploration and world-building
- Character progression and customization
- Varied gameplay loops (combat, exploration, rest, story events)

### Design Pillars
1. **Narrative First** - Story drives the experience, combat serves the narrative
2. **Meaningful Choices** - Player decisions matter and have consequences
3. **Tactical Depth** - d20 mechanics provide strategic combat options
4. **Exploration Rewards** - Encourage curiosity and world discovery
5. **Solo-Friendly** - Balanced for single-character gameplay

### Success Metrics
- Players spend 30+ minutes per session (vs current 5-10)
- 70%+ story/exploration, 30% combat mix
- Replayability through different character builds and story paths
- Player investment in character progression and narrative outcomes

---

## 🗺️ Major System Changes

### 1. Combat System Migration (Fighting Fantasy → d20/Pathfinder)

#### Current State
- 2d6 + SKILL vs 2d6 + SKILL
- Fixed 2 damage per hit
- SKILL, STAMINA, LUCK attributes
- Simple opposed roll mechanics

#### Target State
- d20 + BAB + modifiers vs Armor Class
- Variable damage (1d8+STR, 2d6, etc.)
- Six attributes (STR, DEX, CON, INT, WIS, CHA)
- Saving throws, critical hits, attack of opportunity

#### Key Changes
```
[ ] Replace attribute system (SKILL/STAMINA/LUCK → STR/DEX/CON/INT/WIS/CHA)
[ ] Implement d20 attack roll vs AC
[ ] Add variable weapon damage dice
[ ] Create saving throw system
[ ] Implement critical hit mechanics
[ ] Add class-based progression (Fighter, Rogue, Wizard, Cleric)
[ ] Calculate derived stats (HP, AC, BAB, saves)
```

#### Questions to Resolve
- **Q1:** Full Pathfinder complexity or simplified variant?
- **Q2:** Character levels 1-20 or limited range (e.g., 1-5)?
- **Q3:** Include feats and skills or keep streamlined?
- **Q4:** How to handle solo play balance (normally designed for parties)?

---

### 2. Narrative System

#### Core Concept
Story node-based narrative with branching paths, choices, and consequences

#### Structure
```
Story Nodes
├── Text/Description
├── Location Context
├── Multiple Choices
│   ├── Requirements (skills, items, stats)
│   └── Outcomes (next node, combat, skill check)
└── State Changes (quest updates, items gained, etc.)
```

#### Components
```
[ ] Story Node System
    - Node definitions (text, choices, outcomes)
    - Choice requirements and validation
    - Branching logic

[ ] Campaign Structure
    - Multiple campaigns (starter, advanced, custom)
    - Chapter/act organization
    - Progress tracking

[ ] Dialogue System
    - NPC conversations
    - Character reactions
    - Flavor text and atmosphere

[ ] Quest System
    - Quest objectives and tracking
    - Rewards and completion
    - Side quests vs main story

[ ] Lore & Journal
    - Story recap/summary
    - Discovered lore entries
    - Character notes
```

#### Questions to Resolve
- **Q1:** Linear main story with optional side paths OR fully non-linear?
- **Q2:** How much branching? (limited branches vs exponential complexity)
- **Q3:** Permadeath or retry failed paths?
- **Q4:** Voice/tone? (Serious dark fantasy, light-hearted, humorous?)
- **Q5:** First campaign theme? (Epic quest, dungeon crawl, political intrigue?)

---

### 3. World & Exploration System

#### Core Concept
Interconnected locations forming a world map that players explore

#### Structure
```
World Map
├── Locations
│   ├── Villages/Towns (safe zones)
│   ├── Wilderness Areas (random encounters)
│   ├── Dungeons (structured challenges)
│   └── Points of Interest (events, treasures)
├── Travel System
│   ├── Fast travel (unlocked locations)
│   └── Manual travel (encounter chance)
└── Fog of War
    └── Reveal as explored
```

#### Components
```
[ ] Location System
    - Location definitions (name, description, image)
    - Connected locations (graph structure)
    - Location states (explored, cleared, etc.)

[ ] Random Encounters
    - Encounter tables per location
    - Scaling difficulty
    - Creature variety

[ ] Points of Interest
    - Landmarks
    - Hidden treasures
    - Optional challenges

[ ] Map UI
    - Visual world map
    - Click-to-travel interface
    - Show available paths
    - Mark quest locations
```

#### Questions to Resolve
- **Q1:** How large is the world? (5 locations, 20, 50+?)
- **Q2:** Open world from start OR gated progression?
- **Q3:** Random generation or hand-crafted locations?
- **Q4:** Travel time/resources (instant travel or survival mechanics)?

---

### 4. Rest & Resource Management

#### Core Concept
Downtime between challenges for recovery, preparation, and story moments

#### Rest Types
```
Short Rest (Quick Break)
├── Restore 25% HP
├── Restore 50% Mana
├── Duration: instant
└── Can use items/prepare spells

Long Rest (Camp/Inn)
├── Restore 100% HP
├── Restore 100% Mana
├── Restore limited-use abilities
├── Camp events (random encounters, story moments)
└── Crafting/item management

Town/Safe Haven
├── Full recovery
├── Access to merchants
├── Quest givers
├── Training/leveling up
└── Story progression
```

#### Components
```
[ ] Rest Mechanics
    - Short vs long rest rules
    - Resource recovery calculations
    - Rest limitations (once per location?)

[ ] Camp Events
    - Random night encounters
    - Story moments
    - Character development scenes

[ ] Merchant System
    - Buy/sell items
    - Upgrade equipment
    - Special merchant inventories

[ ] Crafting (Optional)
    - Combine items
    - Create potions
    - Upgrade gear
```

#### Questions to Resolve
- **Q1:** Resource scarcity? (limited rests force tactical decisions)
- **Q2:** Survival mechanics? (food, water, camping supplies)
- **Q3:** Random encounters during rest or guaranteed safety?
- **Q4:** How important is merchant system? (core feature or minor?)

---

### 5. Character Progression

#### Core Concept
Meaningful advancement through levels, abilities, and choices

#### Progression Systems
```
Experience & Leveling
├── XP from combat
├── XP from quests
├── XP from exploration
└── Level up bonuses (HP, BAB, saves, new abilities)

Class Features
├── Fighter: Combat feats, weapon specialization
├── Rogue: Sneak attack, skills, agility
├── Wizard: Spell progression, arcane knowledge
└── Cleric: Healing, divine magic, undead turning

Equipment
├── Weapons (damage, properties)
├── Armor (AC, DEX penalty)
├── Accessories (rings, amulets, belts)
└── Consumables (potions, scrolls)

Spells & Abilities
├── Spell levels (0-9 or limited?)
├── Spells per day
├── Special abilities/powers
└── Class features
```

#### Questions to Resolve
- **Q1:** Level range? (1-5 for focused experience or 1-20 for epic?)
- **Q2:** Multi-classing allowed?
- **Q3:** Equipment complexity? (simple +1 weapons or complex properties?)
- **Q4:** How often do players level up? (every 2 battles, every chapter?)

---

## 🏗️ Implementation Phases

### Phase 0: Planning & Design (Current)
- [x] Initial research
- [ ] Finalize design outline
- [ ] Create detailed specifications
- [ ] Define data structures
- [ ] Plan migration strategy

### Phase 1: Core d20 Mechanics (Foundation)
**Goal:** Replace Fighting Fantasy with Pathfinder combat

**Estimated Effort:** 2-3 weeks

```
[ ] New type definitions (attributes, character, creature)
[ ] Dice utilities (d4, d6, d8, d10, d12, d20)
[ ] Attribute modifier calculations
[ ] d20 attack roll vs AC system
[ ] Variable damage rolls
[ ] Saving throws
[ ] Critical hits
[ ] Class presets (Fighter, Rogue, Wizard)
[ ] Update all UI to show new stats
```

**Deliverable:** Game functions with d20 combat (no story yet)

### Phase 2: Narrative Foundation
**Goal:** Add basic story structure

**Estimated Effort:** 2-3 weeks

```
[ ] Story node system
[ ] Campaign data structure
[ ] Basic first campaign (5-10 nodes)
[ ] Story UI components
[ ] Choice selection interface
[ ] Quest tracking system
[ ] Victory/defeat narrative scenes
```

**Deliverable:** Playable mini-campaign with combat and story

### Phase 3: Exploration & World Map
**Goal:** Add world to explore

**Estimated Effort:** 2-3 weeks

```
[ ] Location system
[ ] World map UI
[ ] Travel mechanics
[ ] Random encounters
[ ] Points of interest
[ ] Map reveal/fog of war
[ ] Location-specific events
```

**Deliverable:** Explorable world with multiple locations

### Phase 4: Rest & Resource Management
**Goal:** Add downtime gameplay loop

**Estimated Effort:** 1-2 weeks

```
[ ] Rest mechanics (short/long)
[ ] Camp system
[ ] Merchant system
[ ] Item management improvements
[ ] Camp events
[ ] Town/safe haven system
```

**Deliverable:** Complete gameplay loop (explore → combat → rest → repeat)

### Phase 5: Character Progression
**Goal:** Deep RPG advancement

**Estimated Effort:** 2-3 weeks

```
[ ] XP and leveling system
[ ] Class features by level
[ ] Ability score increases
[ ] Feat selection (if included)
[ ] Skill system (if included)
[ ] Equipment upgrades
[ ] Spell progression
```

**Deliverable:** Full character advancement system

### Phase 6: Content & Polish
**Goal:** Expand world, balance, and refine

**Estimated Effort:** Ongoing

```
[ ] Create full campaign(s)
[ ] Balance testing
[ ] Additional creatures
[ ] More items and spells
[ ] Visual improvements
[ ] Sound effects/music
[ ] Save system enhancements
[ ] Accessibility features
```

**Deliverable:** Complete, polished game experience

---

## 🎮 Gameplay Loop Comparison

### Current Loop (Simple)
```
1. Select character preset
2. Fight creature
3. Repeat until death
```

### Target Loop (Rich)
```
1. Create/customize character
2. Story introduction
3. Explore location → Random encounter OR Story event OR Rest
4. Combat encounter (tactical d20 combat)
5. Victory → Loot, XP, story continuation
6. Choice: Continue exploring, Rest, Visit town, Pursue quest
7. Rest → Camp events, preparation, story moments
8. Level up → Meaningful progression choices
9. Return to step 3 until campaign complete
```

---

## 📊 Data Structure Overview

### High-Level Architecture
```
Game State
├── Character (player data)
│   ├── Attributes (STR, DEX, CON, INT, WIS, CHA)
│   ├── Derived Stats (HP, AC, BAB, Saves)
│   ├── Class & Level
│   ├── Inventory & Equipment
│   └── Spells & Abilities
├── Campaign Progress
│   ├── Current Location
│   ├── Current Story Node
│   ├── Visited Locations
│   ├── Active Quests
│   └── Completed Quests
├── World State
│   ├── Locations (explored, cleared, available)
│   ├── NPCs (met, alive, quests given)
│   └── Global Flags (events triggered, choices made)
└── Combat State (when in battle)
    ├── Combatants (player, enemies)
    ├── Initiative Order
    ├── Active Effects (buffs, conditions)
    └── Combat Log
```

---

## 🎨 UI/UX Changes Needed

### New Screens
```
[ ] Character Creation Screen
    - Attribute allocation
    - Class selection
    - Appearance customization

[ ] World Map Screen
    - Interactive map
    - Location selection
    - Quest markers

[ ] Story Screen
    - Narrative text display
    - Choice buttons
    - Character portraits

[ ] Rest Screen
    - Camp interface
    - Resource management
    - Merchant access

[ ] Character Sheet (Enhanced)
    - Full attribute display
    - Skills and feats
    - Equipment slots
    - Spell management

[ ] Quest Log
    - Active quests
    - Completed quests
    - Lore entries

[ ] Inventory (Enhanced)
    - Equipment slots
    - Item categories
    - Item details
```

### Updated Screens
```
[ ] Battle Screen
    - Show AC instead of opposed rolls
    - Display d20 rolls clearly
    - Show damage rolls separately
    - Critical hit indicators
    - Saving throw prompts

[ ] Character Stats Panel
    - Six attributes with modifiers
    - Derived stats (AC, BAB, saves)
    - Active effects with durations
    - Class features
```

---

## 🔧 Technical Considerations

### Backwards Compatibility
```
[ ] Migration path for existing saves?
    - Option 1: Clean break (new version, old saves incompatible)
    - Option 2: Migration script (convert old → new)
    - Option 3: Legacy mode (keep FF mechanics as option)

Decision: ____________
```

### Performance
```
[ ] Story node graph complexity
    - How to handle large branching trees efficiently?
    - Lazy loading of campaign data?

[ ] Save system
    - JSON save files
    - Cloud save support?
    - Auto-save frequency
```

### Content Management
```
[ ] Story authoring tools
    - JSON files or visual editor?
    - How to make content creation easy?

[ ] Modding support
    - Custom campaigns?
    - Community content?
```

---

## ❓ Key Decision Points

### Decision Matrix

| Decision | Options | Recommended | Notes |
|----------|---------|-------------|-------|
| **Complexity Level** | A) Full Pathfinder<br>B) Simplified d20<br>C) Hybrid | **B or C** | Full Pathfinder may be too complex for browser game |
| **Level Range** | A) 1-20<br>B) 1-10<br>C) 1-5 | **B (1-10)** | Enough progression without overwhelming |
| **Feats & Skills** | A) Full system<br>B) Simplified<br>C) Skip entirely | **B** | Some customization without analysis paralysis |
| **World Size** | A) 5-10 locations<br>B) 20-30 locations<br>C) 50+ locations | **A initially, B later** | Start focused, expand over time |
| **Story Structure** | A) Linear with choices<br>B) Branching paths<br>C) Fully open | **A or B** | C is exponentially complex to author |
| **Campaign Length** | A) 1-2 hours<br>B) 3-5 hours<br>C) 10+ hours | **A initially** | Short, replayable campaigns first |
| **Permadeath** | A) Yes (roguelike)<br>B) No (retry)<br>C) Optional | **C** | Let players choose their challenge |
| **Survival Mechanics** | A) Full (food, water)<br>B) Light (rest limits)<br>C) None | **B or C** | Don't overcomplicate |

---

## 📝 Next Steps

### To Finalize This Outline

1. **Review each section** and provide feedback
2. **Answer the "Questions to Resolve"**
3. **Make decisions** on the Decision Matrix items
4. **Prioritize features** (must-have vs nice-to-have)
5. **Refine implementation phases** based on priorities

### After Outline Approval

1. Create detailed specification for Phase 1 (d20 mechanics)
2. Design data structures and type definitions
3. Plan file structure and refactoring approach
4. Begin implementation

---

## 🎯 Success Criteria

This redesign will be considered successful when:

- [ ] Combat feels tactical and engaging (not random button mashing)
- [ ] Story provides context and motivation for battles
- [ ] Players have meaningful choices that affect outcomes
- [ ] Exploration feels rewarding (not just walking to next fight)
- [ ] Character progression provides sense of growth and power
- [ ] Gameplay loop has variety (combat + exploration + story + rest)
- [ ] Session length extends to 30+ minutes of engaged play
- [ ] Players want to replay with different characters/choices

---

## 💬 Discussion Topics

**Please provide feedback on:**

1. **Vision & Goals** - Does this align with what you're imagining?

2. **Scope** - Is this too ambitious? Not ambitious enough?

3. **Pathfinder Complexity** - How faithful to d20 do we want to be?
   - Full rules-as-written?
   - Streamlined for digital play?
   - D20 "inspired" but simplified?

4. **Story vs Combat Balance** - Target ratio?
   - 50/50?
   - 70/30 (story heavy)?
   - Player choice?

5. **First Campaign Theme** - What should the starter campaign be?
   - Classic dungeon crawl
   - Epic quest to save kingdom
   - Mystery/investigation
   - Personal story (revenge, redemption)
   - Other ideas?

6. **Priority Features** - What's most important to you?
   - Rank: Combat depth, Story richness, Exploration, Character builds, Other?

7. **Technical Approach** -
   - Big rewrite or incremental changes?
   - Keep existing code where possible?
   - Start fresh with new architecture?

---

**Let's discuss and refine this outline together before diving into detailed specs!**
