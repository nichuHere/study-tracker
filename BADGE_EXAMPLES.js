/**
 * BADGE ICON SYSTEM - QUICK START GUIDE
 * =====================================
 * 
 * This file demonstrates how to use the new type-safe badge icon system.
 */

// ============================================================================
// BASIC USAGE EXAMPLES
// ============================================================================

import React from 'react';
import BadgeIcon, { BadgeIconWithLabel } from './components/BadgeIcon';
import { 
  getBadgeIcon, 
  getBadgeConfig, 
  isValidBadgeId,
  BADGE_ID_MAP 
} from './utils/badgeIcons';

// Example 1: Simple badge icon
function Example1() {
  return (
    <BadgeIcon 
      badgeId="daily_keep-going" 
      state="enabled" 
      size={64} 
    />
  );
}

// Example 2: Locked badge
function Example2() {
  return (
    <BadgeIcon 
      badgeId="weekly_ultimate-scholar" 
      state="disabled"  // Automatically applies grayscale + opacity
      size={48} 
    />
  );
}

// Example 3: Badge with label
function Example3() {
  return (
    <BadgeIconWithLabel
      badgeId="achv_task-master"
      state="enabled"
      size={64}
      showDescription={true}
      layout="vertical"
    />
  );
}

// Example 4: Dynamic badge based on user progress
function Example4({ userStats }) {
  const badge = {
    id: 'daily_keep-going',
    unlocked: userStats.studyMinutesToday >= 120
  };
  
  return (
    <div className="relative">
      <BadgeIcon 
        badgeId={badge.id}
        state={badge.unlocked ? 'enabled' : 'disabled'}
        size={64}
        className={badge.unlocked ? 'animate-bounce' : ''}
      />
      {!badge.unlocked && (
        <div className="absolute -bottom-1 left-0 right-0 h-1 bg-gray-300 rounded">
          <div 
            className="h-full bg-blue-500 rounded transition-all"
            style={{ width: `${(userStats.studyMinutesToday / 120) * 100}%` }}
          />
        </div>
      )}
    </div>
  );
}

// Example 5: Badge grid with all badges
function Example5({ allBadges, stats }) {
  return (
    <div className="grid grid-cols-4 gap-4">
      {allBadges.map(badge => {
        const unlocked = badge.checkUnlocked(stats);
        const newBadgeId = BADGE_ID_MAP[badge.id] || badge.id;
        
        return (
          <div 
            key={badge.id}
            className={`p-4 rounded-lg ${
              unlocked ? 'bg-gradient-to-br from-blue-100 to-purple-100' : 'bg-gray-100'
            }`}
          >
            <BadgeIcon
              badgeId={newBadgeId}
              state={unlocked ? 'enabled' : 'disabled'}
              size={48}
            />
            <p className="text-sm font-bold mt-2">{badge.name}</p>
            <p className="text-xs text-gray-600">
              {unlocked ? badge.description : badge.requirement}
            </p>
          </div>
        );
      })}
    </div>
  );
}

// Example 6: Using helper functions
function Example6() {
  // Validate badge ID
  if (!isValidBadgeId('daily_keep-going')) {
    console.error('Invalid badge ID!');
    return null;
  }
  
  // Get badge configuration
  const config = getBadgeConfig('daily_keep-going');
  console.log(config.name);         // "💪 Keep Going"
  console.log(config.description);  // "2 hours study today"
  console.log(config.category);     // "daily"
  
  // Get icon asset details
  const icon = getBadgeIcon('daily_keep-going', 'enabled', { 
    imgType: 'svg',  // Preferred type
    size: 64         // Preferred size (for PNG fallback)
  });
  
  console.log(icon.type);      // 'sprite' (currently using fallback)
  console.log(icon.src);       // Path to icons-new.png
  console.log(icon.position);  // { x: 0, y: 0, size: 64 }
  
  return (
    <div>
      <h3>{config.name}</h3>
      <BadgeIcon badgeId="daily_keep-going" state="enabled" size={64} />
    </div>
  );
}

// ============================================================================
// MIGRATION GUIDE: FROM SPRITE SHEET TO INDIVIDUAL FILES
// ============================================================================

/**
 * STEP 1: CREATE INDIVIDUAL BADGE ASSETS
 * =======================================
 * 
 * Current state: Using icons-new.png sprite sheet
 * Goal: Individual SVG/PNG files for better tree-shaking
 * 
 * File naming convention:
 *   {category}_{slug}_{state}.{ext}
 * 
 * Examples:
 *   src/image/badges/daily_keep-going_enabled.svg
 *   src/image/badges/daily_keep-going_disabled.svg
 *   src/image/badges/weekly_ultimate-scholar_enabled.svg
 *   src/image/badges/weekly_ultimate-scholar_disabled.svg
 * 
 * Directory structure:
 * 
 *   src/image/badges/
 *   ├── svg/
 *   │   ├── daily_keep-going_enabled.svg
 *   │   ├── daily_keep-going_disabled.svg
 *   │   └── ...
 *   └── png/
 *       ├── daily_keep-going_enabled_64.png
 *       ├── daily_keep-going_enabled_128.png
 *       └── ...
 */

/**
 * STEP 2: UPDATE badgeIcons.js WITH STATIC IMPORTS
 * =================================================
 * 
 * In src/utils/badgeIcons.js, add imports at the top:
 */

// SVG imports (preferred)
import dailyKeepGoingEnabled from '../image/badges/svg/daily_keep-going_enabled.svg';
import dailyKeepGoingDisabled from '../image/badges/svg/daily_keep-going_disabled.svg';
import dailyRockstarEnabled from '../image/badges/svg/daily_study-rockstar_enabled.svg';
import dailyRockstarDisabled from '../image/badges/svg/daily_study-rockstar_disabled.svg';
// ... import all other badges

// PNG fallbacks (optional, for older browsers)
import dailyKeepGoing64 from '../image/badges/png/daily_keep-going_enabled_64.png';
import dailyKeepGoing128 from '../image/badges/png/daily_keep-going_enabled_128.png';
// ... import other sizes

/**
 * STEP 3: UPDATE BADGE_ICON_REGISTRY
 * ===================================
 * 
 * Replace sprite fallback with actual imports:
 */

/*
export const BADGE_ICON_REGISTRY = [
  {
    id: 'daily_keep-going',
    category: 'daily',
    slug: 'keep-going',
    name: '💪 Keep Going',
    description: '2 hours study today',
    icon: {
      // OLD: Using sprite fallback
      // fallback: iconsSprite,
      // position: { x: 0, y: 0, size: 64 }
      
      // NEW: Using individual files
      svg_enabled: dailyKeepGoingEnabled,
      svg_disabled: dailyKeepGoingDisabled,
      png: {
        64: dailyKeepGoing64,
        128: dailyKeepGoing128,
        256: dailyKeepGoing256,
        512: dailyKeepGoing512
      }
    }
  },
  // ... update all badges
];
*/

/**
 * STEP 4: REMOVE SPRITE SHEET LOGIC (OPTIONAL)
 * =============================================
 * 
 * Once all badges use individual files, you can remove:
 * 
 * 1. In badgeIcons.js:
 *    - Remove: import iconsSprite from '../image/icons-new.png';
 *    - Remove sprite handling in getBadgeIcon()
 * 
 * 2. In BadgeIcon.jsx:
 *    - Remove sprite rendering logic (type === 'sprite')
 * 
 * 3. Delete sprite files:
 *    - Remove src/image/icons.png
 *    - Remove src/image/icons-new.png
 */

/**
 * STEP 5: VERIFY TREE-SHAKING
 * ============================
 * 
 * Check bundle size after migration:
 *   npm run build
 *   
 * Look for badge assets in build/static/media/
 * Only referenced badges should be included in bundle
 */

// ============================================================================
// CREATING NEW BADGE ASSETS
// ============================================================================

/**
 * SVG BADGE TEMPLATE (Recommended)
 * =================================
 * 
 * File: daily_new-badge_enabled.svg
 * 
 * <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
 *   <!-- Badge background -->
 *   <circle cx="32" cy="32" r="30" fill="#4F46E5" />
 *   
 *   <!-- Badge icon/symbol -->
 *   <path d="M32 16 L40 28 L32 40 L24 28 Z" fill="#FFF" />
 *   
 *   <!-- Optional: Shine/gradient effect -->
 *   <defs>
 *     <radialGradient id="shine">
 *       <stop offset="0%" stop-color="#FFF" stop-opacity="0.3"/>
 *       <stop offset="100%" stop-color="#FFF" stop-opacity="0"/>
 *     </radialGradient>
 *   </defs>
 *   <circle cx="32" cy="32" r="30" fill="url(#shine)" />
 * </svg>
 * 
 * File: daily_new-badge_disabled.svg
 * (Same structure but with grayscale colors)
 * 
 * <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
 *   <circle cx="32" cy="32" r="30" fill="#9CA3AF" />
 *   <path d="M32 16 L40 28 L32 40 L24 28 Z" fill="#D1D5DB" />
 * </svg>
 */

/**
 * PNG BADGE CREATION (For fallback)
 * ==================================
 * 
 * Tools:
 *   - Figma (export at multiple sizes)
 *   - Adobe Illustrator (export artboard)
 *   - Inkscape (batch export)
 * 
 * Required sizes: 24, 32, 48, 64, 128, 256, 512
 * 
 * Optimization:
 *   1. Export at 2x for retina (@2x suffix)
 *   2. Compress with TinyPNG or ImageOptim
 *   3. Consider WebP format for modern browsers
 */

// ============================================================================
// ACCESSIBILITY CHECKLIST
// ============================================================================

/**
 * ✅ Alt text provided
 * ✅ Color contrast ≥ 4.5:1 (WCAG AA)
 * ✅ Decorative mode supported (aria-hidden)
 * ✅ Semantic role="img" for informative badges
 * ✅ Keyboard navigation friendly
 * ✅ Screen reader tested
 * ✅ Focus indicators visible
 * ✅ State changes announced (enabled/disabled)
 */

// Example: Accessible badge button
function AccessibleBadgeButton({ badge, onClick }) {
  return (
    <button
      onClick={onClick}
      className="p-2 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
      aria-label={`View ${badge.name} badge details`}
    >
      <BadgeIcon 
        badgeId={badge.id} 
        state={badge.unlocked ? 'enabled' : 'disabled'}
        size={48}
        decorative={false}  // Will be announced by screen reader
      />
      <span className="sr-only">
        {badge.name} - {badge.unlocked ? 'Unlocked' : 'Locked'}
      </span>
    </button>
  );
}

// ============================================================================
// PERFORMANCE TIPS
// ============================================================================

/**
 * 1. Use SVG for scalability (single file, all sizes)
 * 2. Lazy load badges below the fold:
 *    const BadgeIcon = lazy(() => import('./components/BadgeIcon'));
 * 
 * 3. Memoize badge calculations:
 *    const badgeStatus = useMemo(() => 
 *      allBadges.map(b => ({ ...b, unlocked: b.checkUnlocked(stats) })),
 *      [stats]
 *    );
 * 
 * 4. Virtualize large badge lists (react-window)
 * 
 * 5. Cache badge icons (Service Worker)
 */

export {
  Example1,
  Example2,
  Example3,
  Example4,
  Example5,
  Example6,
  AccessibleBadgeButton
};
