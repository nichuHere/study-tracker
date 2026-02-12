/**
 * BadgeIcon Component - Type-safe, accessible badge icon renderer
 * 
 * Features:
 * - Automatic SVG/PNG asset resolution
 * - State-based rendering (enabled/disabled with grayscale)
 * - Accessibility attributes (alt, role, aria)
 * - Responsive sizing
 * - Sprite sheet fallback support
 */

import React from 'react';
import PropTypes from 'prop-types';
import { getBadgeIcon, getBadgeConfig, VALID_STATES, VALID_SIZES } from '../utils/badgeIcons';

/**
 * BadgeIcon - Renders badge icon with proper state and accessibility
 * 
 * @param {Object} props
 * @param {string} props.badgeId - Badge identifier (e.g., 'daily_keep-going' or 'keep-going')
 * @param {'enabled' | 'disabled'} [props.state='enabled'] - Icon state
 * @param {number} [props.size=64] - Icon size in pixels
 * @param {'svg' | 'png'} [props.imgType='svg'] - Preferred image type
 * @param {string} [props.className] - Additional CSS classes
 * @param {boolean} [props.decorative=false] - If true, hides from screen readers
 * @param {Object} [props.style] - Additional inline styles
 */
const BadgeIcon = ({ 
  badgeId, 
  state = 'enabled', 
  size = 64, 
  imgType = 'svg',
  className = '',
  decorative = false,
  style = {},
  ...rest 
}) => {
  // Get icon configuration
  const iconConfig = getBadgeIcon(badgeId, state, { imgType, size });
  const badgeConfig = getBadgeConfig(badgeId);
  
  // Handle missing badge
  if (!iconConfig || !badgeConfig) {
    console.warn(`[BadgeIcon] Cannot render badge: ${badgeId}`);
    return (
      <div 
        className={`inline-flex items-center justify-center bg-gray-200 rounded ${className}`}
        style={{ width: size, height: size, ...style }}
        role="img"
        aria-label="Badge not found"
      >
        <span className="text-gray-400 text-xs">?</span>
      </div>
    );
  }
  
  // Build accessibility attributes
  const a11yProps = decorative 
    ? { 'aria-hidden': 'true', alt: '' }
    : { 
        role: 'img',
        alt: iconConfig.alt,
        'aria-label': `${badgeConfig.name} badge - ${state}`
      };
  
  // Build CSS classes
  const baseClasses = 'badge-icon inline-block';
  const stateClasses = state === 'disabled' 
    ? 'grayscale opacity-60' 
    : '';
  const combinedClasses = `${baseClasses} ${stateClasses} ${className}`.trim();
  
  // Render based on icon type
  if (iconConfig.type === 'sprite') {
    // Sprite sheet rendering with CSS background-position
    const { position } = iconConfig;
    const spriteStyle = {
      width: size,
      height: size,
      backgroundImage: `url(${iconConfig.src})`,
      backgroundSize: `${position.size * 4}px ${position.size * 4}px`, // Assuming 4x4 grid
      backgroundPosition: `-${position.x}px -${position.y}px`,
      backgroundRepeat: 'no-repeat',
      display: 'inline-block',
      ...style
    };
    
    return (
      <span
        className={combinedClasses}
        style={spriteStyle}
        {...a11yProps}
        {...rest}
      />
    );
  }
  
  // Standard image rendering (SVG/PNG)
  return (
    <img
      src={iconConfig.src}
      alt={decorative ? '' : iconConfig.alt}
      className={combinedClasses}
      style={{ width: size, height: size, ...style }}
      {...a11yProps}
      {...rest}
    />
  );
};

// PropTypes for development type checking
BadgeIcon.propTypes = {
  badgeId: PropTypes.string.isRequired,
  state: PropTypes.oneOf(VALID_STATES),
  size: PropTypes.oneOf([...VALID_SIZES, PropTypes.number]),
  imgType: PropTypes.oneOf(['svg', 'png']),
  className: PropTypes.string,
  decorative: PropTypes.bool,
  style: PropTypes.object
};

export default BadgeIcon;

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

/**
 * BadgeIconWithLabel - Badge icon with name/description label
 */
export const BadgeIconWithLabel = ({ 
  badgeId, 
  state, 
  size = 48,
  showDescription = false,
  layout = 'vertical', // 'vertical' | 'horizontal'
  className = ''
}) => {
  const badgeConfig = getBadgeConfig(badgeId);
  
  if (!badgeConfig) return null;
  
  const isHorizontal = layout === 'horizontal';
  const containerClasses = isHorizontal 
    ? 'flex items-center gap-2' 
    : 'flex flex-col items-center gap-1';
  
  return (
    <div className={`${containerClasses} ${className}`}>
      <BadgeIcon 
        badgeId={badgeId} 
        state={state} 
        size={size}
      />
      <div className={isHorizontal ? 'flex flex-col' : 'text-center'}>
        <span className="text-sm font-medium text-gray-500">
          {badgeConfig.name}
        </span>
        {showDescription && (
          <span className="text-xs text-gray-500">
            {badgeConfig.description}
          </span>
        )}
      </div>
    </div>
  );
};

BadgeIconWithLabel.propTypes = {
  badgeId: PropTypes.string.isRequired,
  state: PropTypes.oneOf(VALID_STATES),
  size: PropTypes.number,
  showDescription: PropTypes.bool,
  layout: PropTypes.oneOf(['vertical', 'horizontal']),
  className: PropTypes.string
};
