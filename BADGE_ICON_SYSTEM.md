# 🏆 Badge Icon System - Technical Documentation

## Overview

Type-safe, tree-shakeable badge icon resolver system with comprehensive accessibility support.

## Architecture

```
src/
├── utils/
│   └── badgeIcons.js           # Icon registry & resolver functions
├── components/
│   └── BadgeIcon.jsx            # React component for rendering
└── image/
    ├── icons-new.png            # Current: Sprite sheet fallback
    └── badges/                  # Future: Individual SVG/PNG files
        ├── daily_keep-going_enabled.svg
        ├── daily_keep-going_disabled.svg
        └── ...
```

## Core Features

### ✅ Type Safety
- JSDoc type definitions for IDE autocomplete
- Strict PropTypes validation
- Compile-time ID validation

### ✅ Performance
- Static imports for tree-shaking
- Deterministic asset resolution (no dynamic require)
- Memoized sprite positioning

### ✅ Accessibility
- Semantic `alt` text generation
- ARIA attributes (`role="img"`, `aria-label`)
- Decorative mode (`aria-hidden`)
- Keyboard navigation support

### ✅ State Management
- Enabled/Disabled states
- Automatic grayscale filter for disabled
- Locked state visual feedback

---

## Usage Guide

### Basic Usage

```jsx
import BadgeIcon from './components/BadgeIcon';

// Simple icon
<BadgeIcon badgeId="daily_keep-going" state="enabled" size={64} />

// Locked/disabled state
<BadgeIcon badgeId="weekly_ultimate-scholar" state="disabled" size={48} />

// With custom styling
<BadgeIcon 
  badgeId="achv_task-master" 
  state="enabled" 
  size={128}
  className="hover:scale-110 transition-transform"
  style={{ borderRadius: '50%' }}
/>
```

### Using Helper Functions

```jsx
import { getBadgeIcon, getBadgeConfig, isValidBadgeId } from './utils/badgeIcons';

// Validate badge ID
if (isValidBadgeId('daily_keep-going')) {
  // ID is valid
}

// Get badge metadata
const config = getBadgeConfig('daily_keep-going');
console.log(config.name);        // "💪 Keep Going"
console.log(config.description); // "2 hours study today"

// Get icon asset for manual rendering
const icon = getBadgeIcon('daily_keep-going', 'enabled', { 
  imgType: 'svg', 
  size: 64 
});
console.log(icon.src);   // Asset path
console.log(icon.type);  // 'svg' | 'png' | 'sprite'
```

### Badge Icon with Label

```jsx
import { BadgeIconWithLabel } from './components/BadgeIcon';

<BadgeIconWithLabel
  badgeId="weekly_study-champion"
  state="enabled"
  size={64}
  showDescription={true}
  layout="horizontal"
/>
```

---

## Badge ID Format

**Standard Format:** `{category}_{slug}_{state}`

### Valid Categories
- `daily` - Daily study badges
- `weekly` - Weekly achievement badges
- `achv` - General achievement badges

### Valid States
- `enabled` - Badge unlocked (full color)
- `disabled` - Badge locked (grayscale, dimmed)

### Example IDs
```
daily_keep-going
daily_study-rockstar
weekly_weekly-warrior
weekly_study-champion
weekly_ultimate-scholar
achv_star-student
achv_task-master
achv_knowledge-seeker
```

### Legacy ID Support
Old badge IDs (without category prefix) are automatically mapped:
```js
'keep-going' → 'daily_keep-going'
'ultimate-scholar' → 'weekly_ultimate-scholar'
```

---

## Adding New Badges

### Step 1: Add to Registry

Edit `src/utils/badgeIcons.js`:

```js
export const BADGE_ICON_REGISTRY = [
  // ... existing badges
  
  // New badge
  {
    id: 'weekly_perfect-attendance',
    category: 'weekly',
    slug: 'perfect-attendance',
    name: '📅 Perfect Attendance',
    description: '7 days study streak',
    icon: {
      // Option A: Using sprite sheet (temporary)
      fallback: iconsSprite,
      position: { x: 192, y: 0, size: 64 }
      
      // Option B: Individual files (preferred - see Step 2)
      // svg_enabled: perfectAttendanceEnabled,
      // svg_disabled: perfectAttendanceDisabled,
    }
  }
];
```

### Step 2: Add Individual Assets (Optional but Recommended)

#### SVG Files (Preferred)
```bash
badges/
├── weekly_perfect-attendance_enabled.svg   # Full color version
└── weekly_perfect-attendance_disabled.svg  # Grayscale/muted version
```

Import in `badgeIcons.js`:
```js
import perfectAttendanceEnabled from '../image/badges/weekly_perfect-attendance_enabled.svg';
import perfectAttendanceDisabled from '../image/badges/weekly_perfect-attendance_disabled.svg';

// Then use in registry:
icon: {
  svg_enabled: perfectAttendanceEnabled,
  svg_disabled: perfectAttendanceDisabled
}
```

#### PNG Fallbacks (Multi-size)
```bash
badges/png/
├── weekly_perfect-attendance_enabled_24.png
├── weekly_perfect-attendance_enabled_64.png
├── weekly_perfect-attendance_enabled_128.png
└── ...
```

Import and register:
```js
import paEnabled24 from '../image/badges/png/weekly_perfect-attendance_enabled_24.png';
import paEnabled64 from '../image/badges/png/weekly_perfect-attendance_enabled_64.png';

icon: {
  svg_enabled: perfectAttendanceEnabled,
  svg_disabled: perfectAttendanceDisabled,
  png: {
    24: paEnabled24,
    64: paEnabled64,
    128: paEnabled128,
    // ... other sizes
  }
}
```

### Step 3: Update Badge Logic

In `Dashboard.jsx`, add unlock condition:

```js
const ALL_BADGES = [
  // ... existing badges
  {
    id: 'perfect-attendance',
    name: '📅 Perfect Attendance',
    description: '7 days streak',
    requirement: 'Study for 7 consecutive days',
    tier: 'epic',
    category: 'weekly',
    checkUnlocked: (s) => s.currentStreak >= 7
  }
];
```

### Step 4: Add ID Mapping (if using legacy IDs)

```js
export const BADGE_ID_MAP = {
  // ... existing mappings
  'perfect-attendance': 'weekly_perfect-attendance'
};
```

---

## Asset Resolution Priority

The system resolves assets in this order:

1. **SVG (Preferred)** - `svg_enabled` / `svg_disabled`
2. **PNG Fallback** - Nearest size >= requested from `png` object
3. **Sprite Sheet** - `fallback` with `position` coordinates

Example flow for `getBadgeIcon('daily_keep-going', 'enabled', { size: 64 })`:

```
1. Check for icon.svg_enabled ✅
   → Return SVG if exists
   
2. Check for icon.png[64] or larger ✅
   → Return nearest PNG size >= 64
   
3. Check for icon.fallback ✅
   → Return sprite sheet with background-position
   
4. Not found ❌
   → Return null (component shows "?" placeholder)
```

---

## Component Props Reference

### `<BadgeIcon>`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `badgeId` | `string` | **required** | Badge identifier (e.g., `'daily_keep-going'`) |
| `state` | `'enabled' \| 'disabled'` | `'enabled'` | Visual state of the badge |
| `size` | `number` | `64` | Icon size in pixels |
| `imgType` | `'svg' \| 'png'` | `'svg'` | Preferred image format |
| `className` | `string` | `''` | Additional CSS classes |
| `decorative` | `boolean` | `false` | Hide from screen readers (aria-hidden) |
| `style` | `object` | `{}` | Inline styles |

### `<BadgeIconWithLabel>`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `badgeId` | `string` | **required** | Badge identifier |
| `state` | `'enabled' \| 'disabled'` | `'enabled'` | Visual state |
| `size` | `number` | `48` | Icon size in pixels |
| `showDescription` | `boolean` | `false` | Show badge description text |
| `layout` | `'vertical' \| 'horizontal'` | `'vertical'` | Label layout direction |
| `className` | `string` | `''` | Additional CSS classes |

---

## API Reference

### Functions

#### `getBadgeConfig(badgeId)`
Get complete badge metadata including name, description, requirements.

**Returns:** `BadgeIconConfig | null`

```js
const config = getBadgeConfig('daily_keep-going');
// {
//   id: 'daily_keep-going',
//   category: 'daily',
//   slug: 'keep-going',
//   name: '💪 Keep Going',
//   description: '2 hours study today',
//   icon: { ... }
// }
```

#### `getBadgeIcon(badgeId, state, options)`
Resolve badge icon asset for rendering.

**Parameters:**
- `badgeId` (string) - Badge identifier
- `state` ('enabled' | 'disabled') - Icon state
- `options` (object)
  - `imgType` ('svg' | 'png') - Preferred format
  - `size` (number) - Preferred size for PNG fallback

**Returns:** `{ type, src, alt, state, position? } | null`

```js
const icon = getBadgeIcon('daily_keep-going', 'enabled', { size: 64 });
// {
//   type: 'sprite',
//   src: '/static/media/icons-new.png',
//   alt: '💪 Keep Going - enabled',
//   state: 'enabled',
//   position: { x: 0, y: 0, size: 64 }
// }
```

#### `getBadgesByCategory(category)`
Get all badge IDs in a specific category.

**Returns:** `string[]`

```js
const dailyBadges = getBadgesByCategory('daily');
// ['daily_keep-going', 'daily_study-rockstar']
```

#### `isValidBadgeId(badgeId)`
Check if badge ID exists in registry.

**Returns:** `boolean`

```js
if (isValidBadgeId('daily_keep-going')) {
  // Valid badge
}
```

---

## Accessibility Best Practices

### Screen Reader Support
```jsx
// Informative badge (announced to screen readers)
<BadgeIcon 
  badgeId="daily_keep-going" 
  state="enabled"
  decorative={false}  // Default - generates aria-label
/>

// Decorative badge (hidden from screen readers)
<BadgeIcon 
  badgeId="daily_keep-going" 
  state="enabled"
  decorative={true}   // Sets aria-hidden="true"
/>
```

### Keyboard Navigation
```jsx
<button 
  className="focus:ring-2 focus:ring-blue-500"
  onClick={() => handleBadgeClick(badge)}
>
  <BadgeIcon badgeId={badge.id} state="enabled" />
  <span className="sr-only">{badge.name} badge</span>
</button>
```

### Color Contrast
- Enabled badges must meet WCAG AA contrast ratio (4.5:1)
- Disabled badges use grayscale filter + 60% opacity
- Always include text labels alongside decorative icons

---

## Performance Optimization

### Tree Shaking
All imports are static - unused badges won't be bundled:

```js
// ✅ Good - static import
import dailyIcon from './daily_keep-going_enabled.svg';

// ❌ Bad - dynamic require (breaks tree-shaking)
const icon = require(`./${badgeId}_enabled.svg`);
```

### Image Optimization

**SVG (Recommended)**
- Minify with SVGO
- Remove metadata/comments
- Use `viewBox` instead of fixed width/height

**PNG**
- Compress with TinyPNG or similar
- Provide 2x/3x for retina displays
- Use WebP with PNG fallback

**Sprite Sheets**
- Current temporary solution
- Good for many small icons
- Less flexible than individual files

---

## Migration Path

### Current State (Phase 1)
✅ Using `icons-new.png` sprite sheet  
✅ Type-safe resolver system in place  
✅ Component ready for individual files  

### Future State (Phase 2)
🔄 Replace sprite with individual SVGs  
🔄 Add PNG fallbacks for older browsers  
🔄 Implement lazy loading for large badge collections  

### Migration Steps
1. **Extract sprites** into individual 64x64 PNG files
2. **Create SVG versions** (preferred for scalability)
3. **Update registry** to reference new files
4. **Remove sprite fallback** code
5. **Test accessibility** with screen readers
6. **Optimize bundle size** (check webpack analysis)

---

## Troubleshooting

### Badge not rendering
```js
// Check if ID is valid
console.log(isValidBadgeId('my-badge')); // false

// Check registry
console.log(VALID_BADGE_IDS);
```

### Wrong icon showing
```js
// Verify ID mapping
console.log(BADGE_ID_MAP['keep-going']); // 'daily_keep-going'

// Check sprite position
const icon = getBadgeIcon('daily_keep-going', 'enabled');
console.log(icon.position); // { x: 0, y: 0, size: 64 }
```

### Grayscale not applying
```css
/* Ensure Tailwind utilities are available */
.grayscale {
  filter: grayscale(100%);
}
```

### PropTypes warnings
```js
// Ensure valid prop values
<BadgeIcon 
  badgeId="daily_keep-going"     // ✅ Valid
  state="enabled"                 // ✅ Valid ('enabled' | 'disabled')
  size={64}                       // ✅ Valid (number)
  imgType="svg"                   // ✅ Valid ('svg' | 'png')
/>
```

---

## Examples

### Responsive Badge Grid
```jsx
<div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
  {badges.map(badge => (
    <BadgeIconWithLabel
      key={badge.id}
      badgeId={badge.id}
      state={badge.unlocked ? 'enabled' : 'disabled'}
      showDescription={true}
      layout="vertical"
    />
  ))}
</div>
```

### Animated Badge Unlock
```jsx
const [state, setState] = useState('disabled');

useEffect(() => {
  if (userUnlockedBadge) {
    // Animate unlock
    setState('enabled');
    playUnlockAnimation();
  }
}, [userUnlockedBadge]);

<BadgeIcon 
  badgeId="weekly_ultimate-scholar" 
  state={state}
  className={state === 'enabled' ? 'animate-bounce' : ''}
/>
```

### Badge Progress Indicator
```jsx
<div className="relative">
  <BadgeIcon badgeId="daily_keep-going" state="disabled" />
  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-300 rounded">
    <div 
      className="h-full bg-blue-500 rounded transition-all"
      style={{ width: `${(currentHours / 2) * 100}%` }}
    />
  </div>
  <span className="text-xs text-gray-500">{currentHours}/2 hrs</span>
</div>
```

---

## Testing

### Unit Tests (Jest)
```js
import { getBadgeIcon, isValidBadgeId } from './utils/badgeIcons';

test('validates known badge IDs', () => {
  expect(isValidBadgeId('daily_keep-going')).toBe(true);
  expect(isValidBadgeId('invalid-badge')).toBe(false);
});

test('resolves sprite fallback', () => {
  const icon = getBadgeIcon('daily_keep-going', 'enabled');
  expect(icon.type).toBe('sprite');
  expect(icon.position).toBeDefined();
});
```

### Accessibility Tests (React Testing Library)
```js
import { render, screen } from '@testing-library/react';
import BadgeIcon from './BadgeIcon';

test('provides meaningful alt text', () => {
  render(<BadgeIcon badgeId="daily_keep-going" state="enabled" />);
  expect(screen.getByRole('img')).toHaveAttribute('alt', expect.stringContaining('Keep Going'));
});

test('hides decorative badges from screen readers', () => {
  render(<BadgeIcon badgeId="daily_keep-going" decorative={true} />);
  expect(screen.getByRole('img', { hidden: true })).toHaveAttribute('aria-hidden', 'true');
});
```

---

## License & Credits

Created for StudyTracker App badge gamification system.
Badge design inspired by Pokemon badge collection mechanics.

**Technologies:**
- React 18
- Lucide React (icons)
- Tailwind CSS
- PropTypes

