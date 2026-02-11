/**
 * Badge Icon Resolver - Type-safe icon system for badge collection
 * 
 * Supports SVG (primary) and PNG fallbacks with deterministic mapping.
 * All imports are static for tree-shaking optimization.
 */

import iconsSprite from '../image/icons-new.png';

// Individual badge imports
import keepGoingBadge from '../image/badges/keep-going.png';
import studyRockstarBadge from '../image/badges/study-rockstar.png';
import weeklyWarriorBadge from '../image/badges/weekly-warrior.png';
import studyChampionBadge from '../image/badges/study-champion.png';
import ultimateScholarBadge from '../image/badges/ultimate-scholar.png';
import starStudentBadge from '../image/badges/star-student.png';
import taskMasterBadge from '../image/badges/task-master.png';
import knowledgeSeekerBadge from '../image/badges/knowledge-seeker.png';

// ============================================================================
// TYPE DEFINITIONS (JSDoc for type safety)
// ============================================================================

/**
 * @typedef {'enabled' | 'disabled'} BadgeState
 * @typedef {'svg' | 'png'} ImageType
 * @typedef {24 | 32 | 48 | 64 | 128 | 256 | 512} IconSize
 * @typedef {'daily' | 'weekly' | 'achv'} BadgeCategory
 */

/**
 * @typedef {Object} BadgeIconConfig
 * @property {string} id - Full badge ID (e.g., 'daily_keep-going')
 * @property {BadgeCategory} category - Badge category
 * @property {string} slug - Badge slug
 * @property {string} name - Display name
 * @property {string} description - Badge description
 * @property {Object} icon - Icon asset paths
 * @property {string} [icon.svg_enabled] - SVG enabled state path
 * @property {string} [icon.svg_disabled] - SVG disabled state path
 * @property {Object} [icon.png] - PNG fallback paths by size
 */

// ============================================================================
// BADGE ICON REGISTRY (Static imports for tree-shaking)
// ============================================================================

/**
 * Complete badge icon configuration registry
 * Filenames follow pattern: {category}_{slug}_{state}.{ext}
 * @type {BadgeIconConfig[]}
 */
export const BADGE_ICON_REGISTRY = [
  // DAILY STUDY BADGES
  {
    id: 'daily_keep-going',
    category: 'daily',
    slug: 'keep-going',
    name: '💪 Keep Going',
    description: '2 hours study today',
    icon: {
      // Using individual badge file
      png_enabled: keepGoingBadge,
      png_disabled: keepGoingBadge, // Same image, grayscale applied by component
      // Fallback to sprite if needed
      fallback: iconsSprite,
      position: { x: 0, y: 0, size: 64 }
    }
  },
  {
    id: 'daily_study-rockstar',
    category: 'daily',
    slug: 'study-rockstar',
    name: '🌟 Study Rockstar',
    description: '3 hours study today',
    icon: {
      png_enabled: studyRockstarBadge,
      png_disabled: studyRockstarBadge,
      fallback: iconsSprite,
      position: { x: 64, y: 0, size: 128 }
    }
  },
  
  // WEEKLY STUDY BADGES
  {
    id: 'weekly_weekly-warrior',
    category: 'weekly',
    slug: 'weekly-warrior',
    name: '⚔️ Weekly Warrior',
    description: '10 hrs this week',
    icon: {
      png_enabled: weeklyWarriorBadge,
      png_disabled: weeklyWarriorBadge,
      fallback: iconsSprite,
      position: { x: 0, y: 64, size: 64 }
    }
  },
  {
    id: 'weekly_study-champion',
    category: 'weekly',
    slug: 'study-champion',
    name: '🏅 Study Champion',
    description: '15 hrs this week',
    icon: {
      png_enabled: studyChampionBadge,
      png_disabled: studyChampionBadge,
      fallback: iconsSprite,
      position: { x: 64, y: 64, size: 128 }
    }
  },
  {
    id: 'weekly_ultimate-scholar',
    category: 'weekly',
    slug: 'ultimate-scholar',
    name: '👑 Ultimate Scholar',
    description: '21+ hrs this week!',
    icon: {
      png_enabled: ultimateScholarBadge,
      png_disabled: ultimateScholarBadge,
      fallback: iconsSprite,
      position: { x: 128, y: 64, size: 64 }
    }
  },
  
  // ACHIEVEMENT BADGES
  {
    id: 'achv_star-student',
    category: 'achv',
    slug: 'star-student',
    name: '⭐ Star Student',
    description: '80%+ completion',
    icon: {
      png_enabled: starStudentBadge,
      png_disabled: starStudentBadge,
      fallback: iconsSprite,
      position: { x: 0, y: 128, size: 64 }
    }
  },
  {
    id: 'achv_task-master',
    category: 'achv',
    slug: 'task-master',
    name: '🔥 Task Master',
    description: '5+ tasks today',
    icon: {
      png_enabled: taskMasterBadge,
      png_disabled: taskMasterBadge,
      fallback: iconsSprite,
      position: { x: 64, y: 128, size: 64 }
    }
  },
  {
    id: 'achv_knowledge-seeker',
    category: 'achv',
    slug: 'knowledge-seeker',
    name: '📖 Knowledge Seeker',
    description: '5+ subjects',
    icon: {
      png_enabled: knowledgeSeekerBadge,
      png_disabled: knowledgeSeekerBadge,
      fallback: iconsSprite,
      position: { x: 128, y: 128, size: 64 }
    }
  }
];

// ============================================================================
// BADGE ID MAPPING (Old ID to New ID)
// ============================================================================

/**
 * Maps old badge IDs to new standardized badge IDs
 * @type {Object.<string, string>}
 */
export const BADGE_ID_MAP = {
  'keep-going': 'daily_keep-going',
  'study-rockstar': 'daily_study-rockstar',
  'weekly-warrior': 'weekly_weekly-warrior',
  'study-champion': 'weekly_study-champion',
  'ultimate-scholar': 'weekly_ultimate-scholar',
  'star-student': 'achv_star-student',
  'task-master': 'achv_task-master',
  'knowledge-seeker': 'achv_knowledge-seeker'
};

// ============================================================================
// ICON RESOLVER FUNCTIONS
// ============================================================================

/**
 * Get badge configuration by ID (supports both old and new ID formats)
 * @param {string} badgeId - Badge identifier
 * @returns {BadgeIconConfig | null}
 */
export function getBadgeConfig(badgeId) {
  // Normalize ID (handle old format)
  const normalizedId = BADGE_ID_MAP[badgeId] || badgeId;
  
  const config = BADGE_ICON_REGISTRY.find(b => b.id === normalizedId);
  
  if (!config) {
    console.warn(`[BadgeIcons] Unknown badge ID: ${badgeId}`);
    return null;
  }
  
  return config;
}

/**
 * Get badge icon asset path/config for rendering
 * @param {string} badgeId - Badge identifier
 * @param {BadgeState} state - Icon state ('enabled' | 'disabled')
 * @param {Object} options - Rendering options
 * @param {ImageType} [options.imgType='svg'] - Preferred image type
 * @param {IconSize} [options.size=64] - Preferred icon size (for PNG fallback)
 * @returns {Object | null} Icon configuration for rendering
 */
export function getBadgeIcon(badgeId, state = 'enabled', options = {}) {
  const { size = 64 } = options;
  const config = getBadgeConfig(badgeId);
  
  if (!config) {
    return null;
  }
  
  // Prefer SVG if available
  const svgKey = `svg_${state}`;
  if (config.icon[svgKey]) {
    return {
      type: 'svg',
      src: config.icon[svgKey],
      alt: `${config.name} - ${state}`,
      state
    };
  }
  
  // Check for single PNG file (png_enabled/png_disabled)
  const pngKey = `png_${state}`;
  if (config.icon[pngKey]) {
    return {
      type: 'png',
      src: config.icon[pngKey],
      alt: `${config.name} - ${state}`,
      state
    };
  }
  
  // PNG fallback: find nearest size >= requested (multi-size PNGs)
  if (config.icon.png) {
    const availableSizes = Object.keys(config.icon.png)
      .map(Number)
      .sort((a, b) => a - b);
    
    const selectedSize = availableSizes.find(s => s >= size) || availableSizes[availableSizes.length - 1];
    
    return {
      type: 'png',
      src: config.icon.png[selectedSize],
      alt: `${config.name} - ${state}`,
      state,
      size: selectedSize
    };
  }
  
  // Ultimate fallback: sprite sheet
  if (config.icon.fallback) {
    return {
      type: 'sprite',
      src: config.icon.fallback,
      alt: `${config.name} - ${state}`,
      state,
      position: config.icon.position || { x: 0, y: 0, size: 64 }
    };
  }
  
  return null;
}

/**
 * Get all badge IDs by category
 * @param {BadgeCategory} category - Badge category
 * @returns {string[]}
 */
export function getBadgesByCategory(category) {
  return BADGE_ICON_REGISTRY
    .filter(b => b.category === category)
    .map(b => b.id);
}

/**
 * Validate badge ID exists
 * @param {string} badgeId - Badge identifier
 * @returns {boolean}
 */
export function isValidBadgeId(badgeId) {
  const normalizedId = BADGE_ID_MAP[badgeId] || badgeId;
  return BADGE_ICON_REGISTRY.some(b => b.id === normalizedId);
}

// ============================================================================
// CONSTANTS EXPORT
// ============================================================================

export const VALID_BADGE_IDS = BADGE_ICON_REGISTRY.map(b => b.id);
export const VALID_CATEGORIES = ['daily', 'weekly', 'achv'];
export const VALID_STATES = ['enabled', 'disabled'];
export const VALID_SIZES = [24, 32, 48, 64, 128, 256, 512];
