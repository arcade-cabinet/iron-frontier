# Iron Frontier - Branding & Visual Identity

## Brand Essence

**Iron Frontier** evokes the spirit of the American frontier (1880s-1890s) reimagined through a steampunk lens. It's a world where steam-powered machines, brass gears, and iron locomotives have transformed the Wild West.

### Core Themes
- **Frontier Spirit**: Exploration, independence, opportunity
- **Steam & Brass**: Industrial aesthetics, clockwork mechanisms
- **Grit & Warmth**: Dusty trails, amber sunsets, weathered wood
- **Mystery & Discovery**: Hidden treasures, eccentric inventors, frontier legends

### Tagline
> "Tales of the Steam Frontier"

### Setting Description
> The year is 1887. Steam and brass have conquered the frontier. Fortune awaits those brave enough to claim it.

---

## Visual Identity

### Logo Treatment

The title "IRON FRONTIER" should:
- Use a bold serif font with industrial character
- Feature a gradient from amber-300 → amber-500 → amber-700
- Include subtle metallic/brass texture feel
- Be accompanied by decorative gear elements

```
     ⚙️
IRON FRONTIER
Tales of the Steam Frontier
```

### Color Palette

#### Primary Colors (Brass/Gold Family)
| Name | Tailwind | Hex | Usage |
|------|----------|-----|-------|
| Brass Light | amber-300 | #FCD34D | Highlights, glows |
| Brass | amber-500 | #F59E0B | Primary accent |
| Brass Dark | amber-700 | #B45309 | Buttons, borders |
| Copper | orange-600 | #EA580C | Secondary accent |

#### Background Colors (Earth/Stone)
| Name | Tailwind | Hex | Usage |
|------|----------|-----|-------|
| Night Stone | stone-950 | #0C0A09 | Deepest background |
| Dark Stone | stone-900 | #1C1917 | Primary background |
| Stone | stone-800 | #292524 | Cards, panels |
| Frontier Brown | amber-950 | #451A03 | Game UI background |

#### Text Colors
| Name | Tailwind | Hex | Usage |
|------|----------|-----|-------|
| Bright | amber-100 | #FEF3C7 | Primary text |
| Standard | amber-200 | #FDE68A | Body text |
| Muted | amber-300 | #FCD34D | Secondary text |
| Subtle | stone-400 | #A8A29E | Hints, disabled |

#### Semantic Colors
| Purpose | Color | Tailwind |
|---------|-------|----------|
| Health | Red | red-500 |
| XP/Level | Amber | amber-400 |
| Gold/Currency | Yellow | yellow-500 |
| Quest | Yellow | yellow-600 |
| Common Item | Amber | amber-600 |
| Uncommon Item | Green | green-500 |
| Rare Item | Purple | purple-500 |
| Legendary Item | Gold | yellow-400 |

---

## Typography

### Font Stack
```css
font-family: 
  'Playfair Display',  /* Display/Titles - serif with character */
  'Merriweather',      /* Body - readable serif */
  Georgia,             /* Fallback serif */
  serif;

/* For UI elements */
font-family:
  'Inter',             /* Clean UI text */
  system-ui,
  sans-serif;
```

### Type Scale
| Element | Size | Weight | Tracking |
|---------|------|--------|----------|
| Game Title | 3rem-3.75rem | Bold | Wide |
| Subtitle | 0.875rem | Normal | Widest |
| Section Header | 1.25rem | Bold | Normal |
| Body | 0.875rem | Normal | Normal |
| Caption | 0.75rem | Normal | Normal |
| Button | 1rem | Medium | Normal |

### Text Styling
- Titles: `text-transparent bg-clip-text bg-gradient-to-b from-amber-300 via-amber-500 to-amber-700`
- Subtitles: `text-amber-600/80 tracking-widest uppercase`
- Body: `text-amber-100` or `text-stone-300`
- Muted: `text-stone-400` or `text-amber-300/70`

---

## UI Components

### Cards
```tsx
// Standard game card
<Card className="bg-amber-950/90 border-amber-700/50 backdrop-blur-sm">
```

### Buttons
```tsx
// Primary action
<Button className="bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-white shadow-lg shadow-amber-900/30 border border-amber-500/30">

// Secondary action
<Button className="bg-stone-700 hover:bg-stone-600 text-stone-200">

// Ghost/Subtle
<Button variant="ghost" className="text-amber-200 hover:text-amber-100 hover:bg-amber-800/50">
```

### Inputs
```tsx
<input className="
  w-full px-4 py-3 rounded-lg text-center
  bg-stone-800 border-2 border-amber-700/50
  text-amber-100 placeholder:text-stone-500
  focus:outline-none focus:border-amber-500
  font-serif text-lg
" />
```

### Progress Bars
```tsx
// Health bar container
<Progress className="h-2 bg-amber-900/50" />

// XP bar (thinner)
<Progress className="h-1.5 bg-amber-900/50" />
```

### Badges
```tsx
// Item rarity badges
const rarityColors = {
  common: 'bg-amber-600 text-amber-950',
  uncommon: 'bg-green-500 text-green-950',
  rare: 'bg-purple-500 text-purple-950',
  legendary: 'bg-yellow-500 text-yellow-950',
};
```

---

## Iconography

### Style Guidelines
- Line icons (stroke width 2) for UI actions
- Filled icons for status indicators
- Brass/amber tint for thematic elements
- Simple, recognizable silhouettes

### Core Icons Needed
| Icon | Usage | Style |
|------|-------|-------|
| Gear/Cog | Loading, settings, steampunk motif | Filled, animated |
| Heart | Health | Filled, red |
| Star | XP, level | Filled, amber |
| Coin | Currency | Outline with $ |
| Backpack | Inventory | Outline |
| Scroll | Quests | Outline |
| Menu (hamburger) | Menu access | Outline |
| Settings (gear) | Settings panel | Outline |
| Play | Start game | Filled |
| Info | About/help | Outline circle |

### Gear Motif
The rotating gear is a signature visual element:
- Used in splash screen (animated)
- Background decoration (slow rotation, low opacity)
- Loading states
- Branding elements

```tsx
// Gear SVG path (can be reused)
<path d="M50 10c-2.5 0-4.5 2-4.5 4.5v5c-3.5.5-6.8 1.5-9.8 3l-3.5-3.5c-1.8-1.8-4.7-1.8-6.4 0l-6.4 6.4c-1.8 1.8-1.8 4.7 0 6.4l3.5 3.5c-1.5 3-2.5 6.3-3 9.8h-5c-2.5 0-4.5 2-4.5 4.5v9c0 2.5 2 4.5 4.5 4.5h5c.5 3.5 1.5 6.8 3 9.8l-3.5 3.5c-1.8 1.8-1.8 4.7 0 6.4l6.4 6.4c1.8 1.8 4.7 1.8 6.4 0l3.5-3.5c3 1.5 6.3 2.5 9.8 3v5c0 2.5 2 4.5 4.5 4.5h9c2.5 0 4.5-2 4.5-4.5v-5c3.5-.5 6.8-1.5 9.8-3l3.5 3.5c1.8 1.8 4.7 1.8 6.4 0l6.4-6.4c1.8-1.8 1.8-4.7 0-6.4l-3.5-3.5c1.5-3 2.5-6.3 3-9.8h5c2.5 0 4.5-2 4.5-4.5v-9c0-2.5-2-4.5-4.5-4.5h-5c-.5-3.5-1.5-6.8-3-9.8l3.5-3.5c1.8-1.8 1.8-4.7 0-6.4l-6.4-6.4c-1.8-1.8-4.7-1.8-6.4 0l-3.5 3.5c-3-1.5-6.3-2.5-9.8-3v-5c0-2.5-2-4.5-4.5-4.5h-9zM50 35c8.3 0 15 6.7 15 15s-6.7 15-15 15-15-6.7-15-15 6.7-15 15-15z" />
```

---

## Animation Guidelines

### Motion Principles
1. **Purposeful**: Animations guide attention, not distract
2. **Swift**: Keep durations short (150-300ms for UI, up to 800ms for emphasis)
3. **Eased**: Use `ease-out` for enters, `ease-in` for exits
4. **Respectful**: Honor `prefers-reduced-motion`

### Standard Durations
| Type | Duration | Easing |
|------|----------|--------|
| Button press | 150ms | ease-out |
| Panel slide | 300ms | ease-out |
| Fade in | 200ms | ease-out |
| Fade out | 150ms | ease-in |
| Page transition | 400ms | ease-in-out |
| Emphasis | 600-800ms | spring |

### Signature Animations
- **Gear rotation**: 20-30s full rotation, linear, infinite
- **Typewriter text**: 30ms per character
- **Item pickup**: Scale up + fade notification
- **Level up**: Golden pulse/glow effect

### Framer Motion Patterns
```tsx
// Fade in from below
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.6 }}

// Scale + fade for modals
initial={{ scale: 0.9, opacity: 0 }}
animate={{ scale: 1, opacity: 1 }}
exit={{ scale: 0.9, opacity: 0 }}

// Stagger children
transition={{ staggerChildren: 0.1 }}
```

---

## Sound Design (Future)

### Audio Palette
- **Ambient**: Steam hiss, distant train whistles, wind
- **UI**: Mechanical clicks, brass taps, gear sounds
- **Actions**: Coin clinks, paper rustles, door creaks
- **Music**: Acoustic western + industrial undertones

### Sound Triggers
| Event | Sound Type |
|-------|------------|
| Button tap | Soft mechanical click |
| Panel open | Gear engage / slide |
| Item pickup | Coin clink + chime |
| NPC talk | Speech bubble pop |
| Quest accept | Triumphant brass note |
| Level up | Fanfare + steam release |

---

## Responsive Design

### Breakpoints
| Name | Width | Target |
|------|-------|--------|
| xs | 360px | Small phones |
| sm | 390px | Standard phones |
| md | 428px | Large phones |
| lg | 768px | Tablets |
| xl | 1024px+ | Desktop |

### Mobile-First Approach
- Default styles target mobile (360-428px)
- Scale up for larger screens
- Touch targets minimum 44x44px
- Bottom navigation for thumb reach
- Safe area padding for notches

### Layout Adaptations
```
Mobile (360-767px):
┌─────────────────────┐
│ [HUD - Top]         │
├─────────────────────┤
│                     │
│    3D Game View     │
│                     │
├─────────────────────┤
│ [Action Bar - Bot]  │
└─────────────────────┘

Tablet+ (768px+):
┌─────────────────────────────────┐
│ [HUD - Top Left]    [Stats - R] │
├─────────────────────────────────┤
│                                 │
│         3D Game View            │
│                                 │
├─────────────────────────────────┤
│      [Action Bar - Centered]    │
└─────────────────────────────────┘
```

---

## Brand Voice

### Tone
- **Adventurous**: Excitement for discovery
- **Warm**: Friendly, welcoming
- **Mysterious**: Hints at deeper stories
- **Witty**: Light humor, clever wordplay

### NPC Dialogue Style
- Western dialect ("Howdy", "reckon", "ain't")
- Steampunk vocabulary ("clockwork", "aether", "automaton")
- Period-appropriate expressions
- Distinct personalities per NPC type

### Example Text
```
"Howdy, stranger. Name's Cornelius Gearwright. 
I deal in precision mechanisms and frontier necessities.
Got brass screws, copper wire, and the occasional 
automaton eye - if you know what to do with it."
```

### UI Copy Style
- Clear, concise labels
- Action-oriented buttons ("Begin Adventure", not "Start")
- Helpful but brief tooltips
- Thematic menu names ("Saddlebag" for inventory, "Journal" for quests)
