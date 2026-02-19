# UI & Mobile Responsiveness Specification

## Overview

The application must be fully responsive and provide an optimal experience across all device sizes, from mobile phones (320px) to large desktop monitors (1920px+).

---

## Breakpoint System

Uses Tailwind CSS default breakpoints:

| Breakpoint | Min Width | Target Devices |
|------------|-----------|----------------|
| (default)  | 0px       | Mobile phones  |
| `sm`       | 640px     | Large phones, small tablets |
| `md`       | 768px     | Tablets |
| `lg`       | 1024px    | Laptops, small desktops |
| `xl`       | 1280px    | Desktops |
| `2xl`      | 1536px    | Large monitors |

**Mobile-First Approach**: Base styles target mobile, with `sm:`, `md:`, `lg:` prefixes adding enhancements for larger screens.

---

## Navigation Bar Requirements

### Mobile (< 640px)
- **Logo**: Smaller size (`w-5 h-5`)
- **Profile Switcher**: Name truncated to max 60px, "Studying:" prefix hidden
- **Navigation Tabs**: 
  - Horizontally scrollable (`overflow-x-auto`)
  - Icons only, labels hidden (`hidden sm:inline`)
  - No visible scrollbar (`scrollbar-hide` utility)
  - Smaller padding (`px-2 py-1.5`)
- **Notifications**: 
  - Smaller bell icon (`w-4 h-4`)
  - Dropdown uses fixed positioning, full-width (`fixed inset-x-2`)
- **Profile Button**: Smaller avatar (`w-7 h-7`), name hidden

### Desktop (≥ 640px)
- Full labels shown on navigation tabs
- Notification dropdown absolute positioned, fixed width (384px)
- Profile name visible next to avatar

---

## View-Specific Responsiveness

### Dashboard
- Stat cards: `grid-cols-1 md:grid-cols-3`
- Badge grid: `grid-cols-3 sm:grid-cols-4 lg:grid-cols-6`
- Sidebar: Hidden on mobile, `lg:col-span-1` on desktop

### Tasks View (Daily)
- Task cards: Full width, stacked vertically
- Add task form: Single column on mobile
- Circular progress: Centered on mobile, side-by-side on `sm:`

### Calendar View
- Header: Title and controls stack on mobile (`flex-col sm:flex-row`)
- Day cells: Reduced height on mobile (`min-h-[60px] sm:min-h-[120px]`)
- Day headers: Smaller text (`text-xs sm:text-base`)
- Month navigation: Compact buttons on mobile
- "Today" badge: Hidden on mobile to save space

### Exams View
- Header: Title/button stack on mobile (`flex-col sm:flex-row`)
- Exam cards: Full width on mobile
- Stats grid: `grid-cols-1 md:grid-cols-3`

### Subjects View
- Header: Stack on mobile like Exams
- Card padding: Reduced on mobile (`p-4 sm:p-6`)

### Analytics View
- Charts: Full width, reduced height on mobile
- Insights grid: `grid-cols-1 md:grid-cols-2`

### School Documents
- Upload area: Full width
- Document grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`

---

## Touch Targets

Minimum touch target sizes for mobile:
- Buttons: 44x44px minimum
- Links/interactive elements: 32px minimum height
- Adequate spacing between targets (8px minimum)

---

## Modal & Dropdown Behavior

### Mobile
- Modals: Full-screen or near full-screen (`w-full max-w-sm mx-4`)
- Dropdowns: Fixed position, full-width with margins (`fixed inset-x-2`)
- Close buttons: Larger touch targets

### Desktop
- Modals: Centered, max-width constrained
- Dropdowns: Absolute positioned relative to trigger

---

## Typography Scaling

| Element | Mobile | Desktop |
|---------|--------|---------|
| Page titles | `text-xl` | `text-2xl` - `text-3xl` |
| Section headers | `text-lg` | `text-xl` |
| Body text | `text-sm` | `text-base` |
| Captions/labels | `text-xs` | `text-sm` |
| Stat numbers | `text-2xl` | `text-4xl` |

---

## CSS Utilities

### Custom Utilities (defined in `index.css`)

```css
@layer utilities {
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
}
```

---

## Testing Requirements

### Must Test On:
1. **iPhone SE** (375px) - Small phone baseline
2. **iPhone 14** (390px) - Standard modern phone
3. **iPad Mini** (768px) - Tablet breakpoint
4. **iPad Pro** (1024px) - Large tablet / small laptop
5. **Desktop** (1280px+) - Standard desktop

### Test Scenarios:
- [ ] Navigation scrolls horizontally without breaking layout
- [ ] All modals are fully visible and scrollable
- [ ] Touch targets are easily tappable
- [ ] Text is readable without zooming
- [ ] Forms are usable with on-screen keyboard
- [ ] No horizontal overflow on any view

---

## Implementation Patterns

### Responsive Grid
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
```

### Stackable Header
```jsx
<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
  <h2 className="text-xl sm:text-2xl">Title</h2>
  <button className="...">Action</button>
</div>
```

### Responsive Text
```jsx
<span className="text-sm sm:text-base">Adaptive text</span>
```

### Mobile-Hidden Elements
```jsx
<span className="hidden sm:inline">Desktop only</span>
<span className="sm:hidden">Mobile only</span>
```

### Scrollable Container
```jsx
<div className="overflow-x-auto scrollbar-hide">
  <div className="flex gap-2 w-max">
    {/* horizontal scrolling content */}
  </div>
</div>
```

---

## Performance Considerations

- Use `flex-shrink-0` on scrollable items to prevent squishing
- Avoid fixed widths that break on small screens
- Use `w-full max-w-[...]` pattern for constrained full-width
- Lazy load images and heavy components on mobile

---

## Related Files

- [tailwind.config.js](../../tailwind.config.js) - Tailwind configuration
- [src/index.css](../../src/index.css) - Custom CSS utilities
- [ARCHITECTURE.md](../ARCHITECTURE.md) - Overall architecture
