# Badges

## Overview

Achievement badge system that rewards study milestones. Badges are organized by category (daily, weekly, achievement) and tier (common, rare, epic, legendary). The system includes a type-safe icon resolver and accessibility support.

---

## Requirements

### Functional Requirements
- Unlock badges based on study metrics
- Display badges with enabled/disabled states
- Show badge details (name, description, requirement)
- Support multiple image formats (SVG, PNG, sprite)
- Maintain backward compatibility with legacy IDs

### Non-Functional Requirements
- Tree-shakeable icon imports
- Full accessibility support (WCAG AA)
- Deterministic badge resolution
- Memoized asset resolution

---

## Badge Registry

### Daily Badges
| ID | Name | Requirement | Tier |
|----|------|-------------|------|
| daily_keep-going | Keep Going | 2+ hours study/day | Rare |
| daily_study-rockstar | Study Rockstar | 3+ hours study/day | Legendary |

### Weekly Badges
| ID | Name | Requirement | Tier |
|----|------|-------------|------|
| weekly_weekly-warrior | Weekly Warrior | 10+ hours/week | Rare |
| weekly_study-champion | Study Champion | 15+ hours/week | Epic |
| weekly_ultimate-scholar | Ultimate Scholar | 21+ hours/week | Legendary |

### Achievement Badges
| ID | Name | Requirement | Tier |
|----|------|-------------|------|
| achv_knowledge-seeker | Knowledge Seeker | 5+ subjects | Common |
| achv_star-student | Star Student | 80%+ completion rate | Common |
| achv_task-master | Task Master | 5+ tasks/day | Rare |

---

## Data Model

### Badge Definition
```javascript
{
  id: 'daily_keep-going',
  name: 'Keep Going',
  description: '2 hours study today',
  requirement: 'Study for 2+ hours in one day',
  tier: 'rare',
  category: 'daily',
  checkUnlocked: (stats) => stats.studyMinutesToday >= 120,
  animate: false,
  special: false
}
```

### Stats Object (for checkUnlocked)
| Field | Type | Description |
|-------|------|-------------|
| studyMinutesToday | number | Minutes studied today |
| studyMinutesWeek | number | Minutes studied this week |
| completedToday | number | Tasks completed today |
| completionRate | number | Overall completion % |
| totalSubjects | number | Number of subjects |

---

## Badge Tiers

| Tier | Points | Rarity | Visual |
|------|--------|--------|--------|
| Common | 50 | Easy to earn | Basic border |
| Rare | 100 | Moderate effort | Blue border |
| Epic | 200 | Significant achievement | Purple border |
| Legendary | 500 | Elite status | Gold border + animation |

---

## Business Rules

1. **Unlock Criteria**:
   - Each badge has a `checkUnlocked` function
   - Returns true/false based on stats
   - Checked on dashboard render

2. **Badge States**:
   - Enabled: Full color, interactive
   - Disabled: Grayscale, 60% opacity

3. **Legacy IDs**:
   - Old format: `keep-going`
   - New format: `daily_keep-going`
   - Auto-mapping supported

4. **Points**:
   - Awarded once per badge unlock
   - Based on tier value

---

## User Interface

### Badge Display
- Grid layout
- Icon with optional label
- Tooltip with requirements
- Visual state (enabled/disabled)

### BadgeIcon Component
```jsx
<BadgeIcon 
  badgeId="daily_keep-going"
  state="enabled"
  size={64}
  imgType="svg"
  decorative={false}
/>
```

### BadgeIconWithLabel
```jsx
<BadgeIconWithLabel
  badgeId="weekly_study-champion"
  state="enabled"
  size={48}
  showDescription={true}
  layout="vertical"
/>
```

---

## Component API

### BadgeIcon Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| badgeId | string | required | Badge identifier |
| state | 'enabled'/'disabled' | 'enabled' | Display state |
| size | number | 64 | Size in pixels |
| imgType | 'svg'/'png' | 'svg' | Image format |
| className | string | '' | Additional CSS |
| decorative | boolean | false | Hide from screen readers |
| style | object | {} | Inline styles |

---

## Helper Functions

### getBadgeIcon(badgeId, state, options)
Returns icon asset information:
```javascript
const icon = getBadgeIcon('daily_keep-going', 'enabled', { imgType: 'svg' });
// { src: '...', type: 'svg', alt: '...' }
```

### getBadgeConfig(badgeId)
Returns badge metadata:
```javascript
const config = getBadgeConfig('daily_keep-going');
// { id, name, description, tier, category, ... }
```

### isValidBadgeId(badgeId)
Validates badge ID:
```javascript
isValidBadgeId('daily_keep-going'); // true
isValidBadgeId('invalid'); // false
```

### BADGE_ID_MAP
Legacy to new ID mapping:
```javascript
{
  'keep-going': 'daily_keep-going',
  'ultimate-scholar': 'weekly_ultimate-scholar',
  // ...
}
```

---

## Accessibility

### Screen Reader Support
- Semantic alt text
- ARIA role="img"
- aria-label with badge name/description
- Decorative mode (aria-hidden)

### Implementation
```jsx
// Informative (announced)
<BadgeIcon badgeId="..." state="enabled" decorative={false} />

// Decorative (hidden)
<BadgeIcon badgeId="..." state="enabled" decorative={true} />
```

---

## File Structure

```
src/
├── utils/
│   └── badgeIcons.js       # Registry, resolver functions
├── components/
│   └── BadgeIcon.jsx       # React component
└── image/
    └── badges/             # Individual badge images
        ├── daily_keep-going_enabled.svg
        ├── daily_keep-going_disabled.svg
        └── ...
```

---

## Adding New Badges

### Step 1: Add to Registry
```javascript
// In src/utils/badgeIcons.js
const BADGE_REGISTRY = {
  // ... existing badges
  'achv_new-badge': {
    name: 'New Badge',
    description: 'Do something cool',
    tier: 'rare',
    category: 'achievement'
  }
};
```

### Step 2: Add Image Assets
- Create enabled/disabled variants
- SVG preferred (scalable)
- Place in `src/image/badges/`

### Step 3: Add Unlock Logic
```javascript
// In Dashboard.jsx ALL_BADGES array
{
  id: 'new-badge',
  checkUnlocked: (s) => s.someMetric >= threshold
}
```

---

## Components

| Component | File | Purpose |
|-----------|------|---------|
| BadgeIcon | `src/components/BadgeIcon.jsx` | Render badge icons |
| Dashboard | `src/components/Dashboard.jsx` | Badge unlock checks |
| badgeIcons | `src/utils/badgeIcons.js` | Registry & helpers |

---

## Related Specs

- [POINTS_SYSTEM.md](POINTS_SYSTEM.md) - Badge tier points
- [TASKS.md](TASKS.md) - Stats for unlock criteria
