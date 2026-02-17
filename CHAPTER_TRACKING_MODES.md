# Chapter Tracking Modes

## Overview
The Study Tracker app now supports two distinct chapter tracking modes, allowing users to choose the level of detail that works best for them. This feature is profile-specific, meaning each child can have their own tracking mode.

## Tracking Modes

### 1. Smart Tracking (Default) ✨
**Best for:** Busy schedules, simple tracking, quick updates

**Features:**
- ✅ Simple checkbox interface for chapter completion
- 📊 Automatically tracks metadata:
  - Study time (calculated from completed tasks)
  - Number of tasks completed for that chapter
  - Last studied date (updated when tasks are completed)
- 🎨 Visual indicators for activity status
- ⚡ Quick and easy to use - minimal manual input required

**How it works:**
- Users simply check a box when they've finished studying a chapter
- The system automatically aggregates data from related tasks
- Visual cues show which chapters are active/inactive based on recent activity

### 2. Comprehensive Tracking 📊
**Best for:** Detailed planning, thorough review, structured study approach

**Features:**
- 📝 Manual completion tracking with multiple statuses (pending/started/completed)
- ⏱️ Manual study time entry
- ✔️ Track number of tasks completed
- 🔄 Revisions needed and completed
- 📅 Last studied date tracking
- 🎨 Color-coded activity indicators
- 📈 Full control over all metrics

**How it works:**
- Users manually update chapter status as they progress
- All metrics are editable and trackable
- Provides granular control over study planning and review

## User Experience

### First-Time Setup
1. When creating a new profile, the system defaults to **Smart Tracking** mode
2. Existing profiles without a tracking mode will be prompted to choose on their next profile switch
3. The selection modal clearly explains both options with visual examples

### Changing Modes
Users can change their tracking mode anytime through:
1. Profile Settings → Kids Profiles tab
2. Click Edit on any child's profile
3. Select preferred tracking mode from dropdown
4. Save changes

### Modal Selection
When a user switches to a profile without a tracking mode set:
- A modal appears explaining both options
- Users can select either mode by clicking the card
- The smart tracking option is clearly marked as "RECOMMENDED"
- A helpful tip explains that the setting can be changed later

## Technical Implementation

### Database Schema
```sql
-- profiles table
ALTER TABLE profiles 
ADD COLUMN chapter_tracking_mode VARCHAR(20) DEFAULT 'smart' 
CHECK (chapter_tracking_mode IN ('comprehensive', 'smart'));
```

### Profile Structure
```javascript
{
  id: <uuid>,
  user_id: <uuid>,
  name: <string>,
  class: <string>,
  chapter_tracking_mode: 'smart' | 'comprehensive',
  created_at: <timestamp>
}
```

### State Management
- `showTrackingModeNotification`: Controls modal visibility
- `pendingTrackingModeProfile`: Stores profile awaiting mode selection
- Mode is stored in database and synced across sessions

## Data Migration

### Existing Profiles
For profiles created before this feature:
- Database migration sets default to 'smart' mode
- On next profile switch, users are prompted to confirm or change their selection
- This ensures backward compatibility while providing control

### New Profiles
- All new profiles automatically get 'smart' mode as default
- Users can change this immediately in profile settings
- The onboarding flow includes tracking mode information

## User Interface Components

### Mode Selection Modal
- Full-screen overlay for clear visibility
- Two prominent option cards with hover effects
- Detailed description of each mode
- Visual icons and emoji for quick recognition
- "Recommended" badge on smart tracking
- Helpful tip about changing later

### Profile Edit Form
- Dropdown selector for tracking mode
- Live description update based on selection
- Clear labels and emoji for visual clarity
- Integrated seamlessly with name and class fields

## Benefits

### For Users
- **Flexibility**: Choose the tracking style that fits your workflow
- **Progressive Enhancement**: Start simple, upgrade to comprehensive if needed
- **Per-Child Settings**: Different tracking modes for different learning styles
- **No Lock-In**: Change modes anytime without data loss

### For Parents
- **Reduced Friction**: Smart mode removes barriers to adoption
- **Scalability**: Handle multiple children with different needs
- **Visibility**: Comprehensive mode provides detailed insights when needed
- **Control**: Full authority over tracking preferences

## Future Enhancements

### Potential Additions
1. **Migration Assistance**: Convert existing comprehensive chapter data to smart format (or vice versa)
2. **Analytics**: Compare effectiveness of different tracking modes
3. **Recommendations**: Suggest mode based on usage patterns
4. **Hybrid Mode**: Mix features from both modes
5. **Custom Modes**: Allow users to pick specific features they want

### Data Insights
- Track which mode is more popular
- Measure completion rates by mode type
- Understand correlations with points/badges earned
- Provide insights to optimize each mode

## Implementation Checklist

- [x] Database migration for chapter_tracking_mode field
- [x] Update profile creation to include default mode
- [x] Add mode selection to profile edit form
- [x] Create tracking mode selection modal
- [x] Implement profile switch trigger for mode selection
- [x] Update useProfiles hook with mode support
- [x] Add handler for mode selection and profile update
- [x] Implement comprehensive tracking UI for chapters
- [x] Implement smart tracking UI for chapters
- [x] Convert chapter data structure to support both modes
- [x] Add migration logic for existing chapter data
- [x] Testing and validation
- [x] User documentation

## Related Files

- `src/components/StudyTracker.jsx` - Main UI and mode selection (lines 526-600: chapter conversion, 3503-3643: tracking UIs)
- `src/hooks/useProfiles.js` - Profile management with mode support
- `supabase-chapter-tracking-mode-migration.sql` - Database schema
- `CHAPTER_TRACKING_MODES.md` - This documentation

## Notes

- The smart tracking mode aligns with modern UX principles of reducing cognitive load
- Comprehensive mode serves power users who want full control
- Default to smart mode reduces onboarding friction
- Clear upgrade path from smart to comprehensive if needs change
- Chapter data automatically normalizes on access - strings convert to objects based on tracking mode
- Both modes coexist seamlessly - switching modes doesn't lose data
