# GA4 Configuration Guide for Fortune Telling Website

This document provides the complete GA4 setup configuration for optimized dashboard management and reporting.

## Custom Dimensions Configuration

Configure these custom dimensions in your GA4 property (Admin > Custom Definitions > Custom Dimensions):

### User-Scoped Dimensions
| Parameter Name | Dimension Name | Description |
|---|---|---|
| `user_type` | User Type | New vs returning users |
| `age_group` | Age Group | User age range for personalization |
| `blood_group` | Blood Group | User blood type for fortune analysis |
| `birth_day_category` | Birth Day | Day of week born |
| `device_type` | Device Type | Mobile/Desktop detection |

### Event-Scoped Dimensions
| Parameter Name | Dimension Name | Description |
|---|---|---|
| `event_category` | Event Category | Primary event categorization |
| `form_type` | Form Type | Type of form interaction |
| `error_type` | Error Type | Categorized error tracking |
| `page_type` | Page Type | Page category for engagement |
| `fortune_type` | Fortune Type | New vs existing fortune |
| `share_method` | Share Method | Social sharing method |
| `funnel_step` | Funnel Step | Step number in conversion funnel |
| `progress_percentage` | Progress Percentage | Form completion progress |

## Conversion Events Configuration

Mark these events as conversions in GA4 (Admin > Events > Mark as Conversion):

### Primary Conversions
- `fortune_complete` - Main business goal completion
- `questionnaire_complete` - Funnel completion
- `email_submit` - Lead generation

### Secondary Conversions  
- `result_view` - Content engagement
- `session_start` - User engagement

## Enhanced Events Tracking

### Event Names (snake_case format)
| Old Event | New Event | Category | Purpose |
|---|---|---|---|
| `fortune_generated` | `fortune_complete` | user_journey | Main conversion |
| `questionnaire_started` | `questionnaire_begin` | user_journey | Funnel start |
| `questionnaire_completed` | `questionnaire_complete` | user_journey | Funnel end |
| `email_submitted` | `email_submit` | form_interaction | Lead capture |
| `result_viewed` | `result_view` | engagement | Content view |
| `error_occurred` | `error_occur` | error | Error tracking |
| `mobile_warning_shown` | `mobile_warning_show` | ui_interaction | UX tracking |

### New Enhanced Events
- `form_begin` - Form interaction start
- `form_progress` - Multi-step form tracking  
- `result_share` - Social sharing
- `session_start` - Enhanced session tracking
- `user_engagement` - Time-based engagement
- `page_view` - Enhanced page views

## Funnel Analysis Setup

### Primary Conversion Funnel
1. `session_start` (Entry)
2. `form_begin` (Email form)
3. `email_submit` (Lead capture)
4. `questionnaire_begin` (Questionnaire start)
5. `form_progress` (Step completion)
6. `questionnaire_complete` (Form complete)
7. `fortune_complete` (Main conversion)
8. `result_view` (Result engagement)

### Key Metrics to Track
- **Conversion Rate**: `fortune_complete` / `session_start`
- **Form Completion Rate**: `questionnaire_complete` / `questionnaire_begin`
- **Lead Quality**: `questionnaire_begin` / `email_submit`
- **Engagement Time**: Average `user_engagement` time
- **User Segmentation**: By `user_type`, `age_group`, `device_type`

## Dashboard Recommendations

### Key Reports to Create
1. **Conversion Funnel Analysis**: Track user journey from entry to completion
2. **User Segmentation**: Demographics and behavior patterns
3. **Error Analysis**: Track and categorize system issues
4. **Device Performance**: Mobile vs desktop engagement
5. **Fortune Personalization**: Success by user attributes

### Custom Audiences
- **High-Value Users**: Completed questionnaire, long engagement time
- **Drop-off Users**: Started but didn't complete questionnaire  
- **Return Users**: Multiple `session_start` events
- **Mobile Users**: `device_type` = 'mobile'

## Implementation Benefits

### 2025 GA4 Optimizations
- **Improved Event Naming**: Snake_case convention for better organization
- **Enhanced Parameters**: Rich context for every interaction
- **Conversion Tracking**: Clear business goal measurement
- **Funnel Visualization**: Complete user journey mapping
- **Custom Dimensions**: Detailed segmentation capabilities
- **Error Tracking**: Comprehensive system monitoring

### Dashboard Management
- **Consistent Naming**: Easy to find and organize events
- **Rich Context**: Every event includes relevant parameters  
- **Business Alignment**: Events map directly to business goals
- **Scalable Structure**: Easy to add new tracking as needed

## Usage Examples

### Setting Up Custom Reports
1. Go to GA4 > Explore > Funnel Exploration
2. Add steps: `questionnaire_begin` → `questionnaire_complete` → `fortune_complete`
3. Segment by `user_type` and `device_type`
4. Filter by `age_group` for demographic insights

### Creating Audiences
1. Navigate to Admin > Audiences
2. Create audience: "Completed Fortune Users"
3. Condition: `fortune_complete` event in last 30 days
4. Use for remarketing or retention analysis

This configuration provides comprehensive tracking aligned with GA4 2025 best practices for optimal dashboard management and business insights.