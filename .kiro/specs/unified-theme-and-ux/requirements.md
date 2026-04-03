# Requirements Document

## Introduction

This document specifies requirements for implementing a unified theme and production-grade user experience across the entire gig worker insurance mobile application. The app currently has inconsistent theming with some screens using dark themes (HomeScreen, ProfileScreen), others using violet/purple gradients (SignUpScreen), and varying visual treatments. This feature will transform the app to use a consistent light theme with navy blue primary colors, orange accents, professional card-based layouts, smooth animations, and polished micro-interactions matching modern production-grade mobile applications.

## Glossary

- **Theme_System**: The centralized theming configuration defined in theme.ts that provides colors, spacing, typography, and design tokens
- **Screen_Component**: A top-level React Native component representing a full screen in the application (e.g., HomeScreen, ProfileScreen, SignUpScreen)
- **Animation_System**: React Native's Animated API used for creating smooth transitions and micro-interactions
- **Card_Component**: A visual container with rounded corners, shadows, and elevation used to group related content
- **Micro_Interaction**: Small, subtle animations that provide feedback for user actions (button presses, swipes, taps)
- **Light_Theme**: A color scheme using light backgrounds (#F5F5F7), navy blue primary (#1A1B4B), and orange accents (#E8472A)
- **Navigation_Bar**: The bottom tab bar component that allows navigation between main screens
- **Loading_State**: Visual feedback shown while content is being fetched or processed
- **Skeleton_Screen**: A placeholder UI that mimics the structure of content while it loads
- **Haptic_Feedback**: Physical vibration feedback provided to users on touch interactions

## Requirements

### Requirement 1: Unified Light Theme Application

**User Story:** As a user, I want the app to have a consistent visual appearance across all screens, so that the experience feels cohesive and professional.

#### Acceptance Criteria

1. THE Theme_System SHALL use light background color #F5F5F7 as the primary background
2. THE Theme_System SHALL use navy blue #1A1B4B as the primary color for headers, buttons, and key UI elements
3. THE Theme_System SHALL use orange/coral colors (#E8472A, #FF7A45) as accent colors for CTAs and highlights
4. THE Theme_System SHALL use white #FFFFFF for card surfaces
5. WHEN any Screen_Component renders, THE Screen_Component SHALL use colors exclusively from Theme_System
6. THE Theme_System SHALL define consistent spacing values (xs: 4, s: 8, m: 16, l: 24, xl: 32)
7. THE Theme_System SHALL define consistent border radius values (s: 8, m: 14, l: 20, xl: 28)

### Requirement 2: Screen Theme Consistency

**User Story:** As a user, I want all screens to follow the same design language, so that navigation feels natural and predictable.

#### Acceptance Criteria

1. WHEN HomeScreen renders, THE HomeScreen SHALL use light background (#F5F5F7) instead of dark theme (#0D0B1E)
2. WHEN ProfileScreen renders, THE ProfileScreen SHALL use light background (#F5F5F7) instead of dark theme (#0D0B1E)
3. WHEN SignUpScreen renders, THE SignUpScreen SHALL use light background with navy blue accents instead of violet gradient theme
4. WHEN PolicySelectionScreen renders, THE PolicySelectionScreen SHALL use light background and navy blue primary colors
5. WHEN ClaimsScreen renders, THE ClaimsScreen SHALL use light background and navy blue primary colors
6. WHEN AnalyticsScreen renders, THE AnalyticsScreen SHALL use light background and navy blue primary colors
7. WHEN OnboardingScreen renders, THE OnboardingScreen SHALL use light background and navy blue primary colors
8. WHEN LocationScreen renders, THE LocationScreen SHALL use light background and navy blue primary colors
9. WHEN TermsScreen renders, THE TermsScreen SHALL use light background and navy blue primary colors
10. WHEN SignInScreen renders, THE SignInScreen SHALL use light background and navy blue primary colors

### Requirement 3: Card-Based Layout System

**User Story:** As a user, I want content to be organized in clean, professional cards, so that information is easy to scan and understand.

#### Acceptance Criteria

1. THE Card_Component SHALL have white background (#FFFFFF)
2. THE Card_Component SHALL have border radius between 14-24px based on card size
3. THE Card_Component SHALL have subtle shadow with color #1A1B4B at 4-8% opacity
4. THE Card_Component SHALL have consistent padding of 16-24px based on content density
5. WHEN multiple Card_Components are displayed, THE Screen_Component SHALL maintain consistent spacing of 12-16px between cards
6. THE Card_Component SHALL have elevation effect using shadowOffset, shadowOpacity, and shadowRadius

### Requirement 4: Typography Consistency

**User Story:** As a developer, I want typography to be consistent across the app, so that text hierarchy is clear and maintainable.

#### Acceptance Criteria

1. THE Theme_System SHALL define header style (fontSize: 20, fontWeight: 800, color: #1A1B4B)
2. THE Theme_System SHALL define title style (fontSize: 18, fontWeight: 700, color: #1A1B4B)
3. THE Theme_System SHALL define subtitle style (fontSize: 14, fontWeight: 600)
4. THE Theme_System SHALL define body style (fontSize: 13, fontWeight: 400)
5. THE Theme_System SHALL define small style (fontSize: 11, fontWeight: 500)
6. WHEN any Screen_Component renders text, THE Screen_Component SHALL use typography styles from Theme_System

### Requirement 5: Smooth Animation System

**User Story:** As a user, I want smooth animations when interacting with the app, so that the experience feels polished and responsive.

#### Acceptance Criteria

1. WHEN a Screen_Component mounts, THE Screen_Component SHALL animate content with fade-in effect using Animated.timing with duration 400-700ms
2. WHEN a Screen_Component mounts, THE Screen_Component SHALL animate content with slide-up effect using Animated.spring or Animated.timing
3. WHEN a button is pressed, THE button SHALL animate with scale transform from 1.0 to 0.96 using Animated.spring
4. WHEN a card is pressed, THE card SHALL animate with scale transform from 1.0 to 0.98 using Animated.spring
5. THE Animation_System SHALL use useNativeDriver: true for transform and opacity animations
6. WHEN animations complete, THE Animation_System SHALL restore original values smoothly

### Requirement 6: Navigation Bar Theme

**User Story:** As a user, I want the bottom navigation bar to match the app's light theme, so that it feels integrated with the rest of the interface.

#### Acceptance Criteria

1. THE Navigation_Bar SHALL have white background (#FFFFFF)
2. THE Navigation_Bar SHALL have top border with color #E8E8F0
3. WHEN a tab is active, THE Navigation_Bar SHALL display icon in navy blue rounded container (#1A1B4B)
4. WHEN a tab is inactive, THE Navigation_Bar SHALL display icon in muted color (#9B9BB5)
5. WHEN a tab is active, THE Navigation_Bar SHALL display label in navy blue (#1A1B4B) with fontWeight 700
6. WHEN a tab is inactive, THE Navigation_Bar SHALL display label in muted color (#9B9BB5) with fontWeight 600

### Requirement 7: Loading States and Skeleton Screens

**User Story:** As a user, I want to see loading indicators when content is being fetched, so that I know the app is working and not frozen.

#### Acceptance Criteria

1. WHEN data is being fetched, THE Screen_Component SHALL display Loading_State with ActivityIndicator in primary color (#1A1B4B)
2. WHERE a screen displays list content, WHEN data is loading, THE Screen_Component SHALL display Skeleton_Screen with animated placeholder cards
3. THE Skeleton_Screen SHALL use light gray background (#E8E8F0) for placeholder elements
4. THE Skeleton_Screen SHALL animate with pulse effect using Animated.loop and Animated.sequence
5. WHEN data loading completes, THE Screen_Component SHALL fade out Loading_State and fade in actual content with duration 300ms

### Requirement 8: Micro-Interactions and Button Feedback

**User Story:** As a user, I want tactile feedback when I interact with buttons and controls, so that I know my actions are registered.

#### Acceptance Criteria

1. WHEN a button is pressed, THE button SHALL provide visual feedback with opacity change to 0.7 or scale animation
2. WHEN a TouchableOpacity is used, THE TouchableOpacity SHALL have activeOpacity value between 0.6-0.85
3. WHERE platform supports haptic feedback, WHEN a primary action button is pressed, THE button SHALL trigger light haptic feedback
4. WHEN a swipe gesture is performed, THE gesture SHALL provide visual feedback with transform animation
5. WHEN a toggle or switch changes state, THE toggle SHALL animate state change with duration 200-300ms

### Requirement 9: Gradient Usage Consistency

**User Story:** As a designer, I want gradients to be used sparingly and consistently, so that they enhance rather than overwhelm the interface.

#### Acceptance Criteria

1. WHERE gradients are used for emphasis, THE gradient SHALL use navy blue shades (#1A1B4B to #2D2E7A)
2. WHERE gradients are used for CTAs, THE gradient SHALL use orange shades (#E8472A to #FF7A45)
3. THE gradient SHALL use LinearGradient with start and end points for consistent direction
4. WHEN a gradient is applied to a button, THE button SHALL maintain readability with white text (color: #FFFFFF)
5. THE Screen_Component SHALL limit gradient usage to hero sections, primary CTAs, or special emphasis cards

### Requirement 10: Accessibility and Touch Targets

**User Story:** As a user with accessibility needs, I want interactive elements to be easy to tap and properly labeled, so that I can use the app effectively.

#### Acceptance Criteria

1. THE interactive element SHALL have minimum touch target size of 44x44 points
2. THE button SHALL have minimum height of 48px for comfortable tapping
3. WHEN text is displayed, THE text SHALL have minimum font size of 11px for readability
4. THE color contrast between text and background SHALL meet WCAG AA standards (4.5:1 for normal text)
5. WHEN an icon-only button is used, THE button SHALL have accessible label for screen readers

### Requirement 11: Performance Optimization

**User Story:** As a user, I want the app to feel fast and responsive, so that I can complete tasks efficiently.

#### Acceptance Criteria

1. THE Screen_Component SHALL avoid unnecessary re-renders using React.memo or useMemo where appropriate
2. WHEN lists are rendered, THE Screen_Component SHALL use FlatList or ScrollView with appropriate optimization props
3. THE Animation_System SHALL use useNativeDriver: true to offload animations to native thread
4. WHEN images are displayed, THE Screen_Component SHALL optimize image sizes and use appropriate compression
5. THE Screen_Component SHALL debounce rapid user inputs with delay of 300-500ms where appropriate

### Requirement 12: Input Field Styling

**User Story:** As a user, I want input fields to be clearly visible and provide feedback when focused, so that I know where I'm typing.

#### Acceptance Criteria

1. THE input field SHALL have white background (#FFFFFF) with border color #E8E8F0
2. WHEN an input field is focused, THE input field SHALL change border color to navy blue (#1A1B4B) with borderWidth 2
3. WHEN an input field has an error, THE input field SHALL change border color to danger color (#E74C3C)
4. THE input field SHALL have border radius of 12-14px
5. THE input field SHALL have minimum height of 48-56px for comfortable interaction
6. WHEN an input field displays an error, THE Screen_Component SHALL display error message in danger color (#E74C3C) below the field

