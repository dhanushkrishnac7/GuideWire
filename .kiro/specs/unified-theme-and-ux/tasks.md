# Implementation Plan: Unified Theme and UX

## Overview

This implementation plan transforms the gig worker insurance mobile application from inconsistent theming (dark themes, violet gradients) to a unified, production-grade light theme with navy blue primary colors, orange accents, and polished micro-interactions. The implementation follows a 4-phase approach: Foundation (theme system and components), Core Screens (SignUp, SignIn, Onboarding, Home, Profile), Feature Screens (PolicySelection, Claims, Analytics, Location, Terms), and Polish (animations, accessibility, performance).

## Tasks

- [x] 1. Enhance theme system with comprehensive design tokens
  - Extend `src/theme.ts` with complete color palette, shadows, and animation timings
  - Add `shadows` object with card and cardHover configurations
  - Add `animation` object with timing values (fast: 200, normal: 300, slow: 400, fadeIn: 600)
  - Ensure all color tokens use light theme values (background: #F5F5F7, primary: #1A1B4B, accent: #E8472A)
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.6, 1.7_

- [ ]* 1.1 Write property test for theme color consistency
  - **Property 1: Theme Color Consistency**
  - **Validates: Requirements 1.5**

- [x] 2. Create reusable Card component
  - [x] 2.1 Implement Card component in `src/components/Card.tsx`
    - Create Card component with children, style, onPress, and variant props
    - Implement 'default', 'elevated', and 'outlined' variants
    - Apply white background, border radius (14-24px), and theme shadows
    - Add press animation with scale transform (1.0 to 0.98) using Animated.spring
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.6_
  
  - [ ]* 2.2 Write property tests for Card component
    - **Property 3: Card Border Radius Range**
    - **Property 4: Card Shadow Configuration**
    - **Property 6: Card Padding Range**
    - **Property 11: Card Press Scale Animation**
    - **Validates: Requirements 3.2, 3.3, 3.4, 3.6, 5.4**

- [x] 3. Create reusable Button component
  - [x] 3.1 Implement Button component in `src/components/Button.tsx`
    - Create Button with title, onPress, variant, size, icon, disabled, and loading props
    - Implement 'primary', 'secondary', 'outline', and 'ghost' variants
    - Add press animation with scale transform (1.0 to 0.96) using Animated.spring
    - Set minimum height to 48px and minimum touch target to 44x44 points
    - Apply activeOpacity between 0.6-0.85 for TouchableOpacity
    - _Requirements: 5.3, 8.1, 8.2, 10.1, 10.2_
  
  - [ ]* 3.2 Write property tests for Button component
    - **Property 10: Button Press Scale Animation**
    - **Property 18: Button Visual Feedback**
    - **Property 19: TouchableOpacity Active Opacity Range**
    - **Property 26: Interactive Element Touch Target Size**
    - **Property 27: Button Minimum Height**
    - **Validates: Requirements 5.3, 8.1, 8.2, 10.1, 10.2**

- [x] 4. Create reusable Input component
  - [x] 4.1 Implement Input component in `src/components/Input.tsx`
    - Create Input with value, onChangeText, placeholder, label, error, icon, secureTextEntry, keyboardType, and autoCapitalize props
    - Apply white background with border color #E8E8F0
    - Implement focus state with navy blue border (#1A1B4B) and borderWidth 2
    - Implement error state with danger color border (#E74C3C)
    - Set border radius to 12-14px and height to 48-56px
    - Add border color animation on focus using Animated.timing
    - Display error message below field in danger color when error prop is provided
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6_
  
  - [ ]* 4.2 Write property tests for Input component
    - **Property 32: Input Field Border Radius Range**
    - **Property 33: Input Field Height Range**
    - **Validates: Requirements 12.4, 12.5**

- [x] 5. Create LoadingState component with skeleton screens
  - [x] 5.1 Implement LoadingState component in `src/components/LoadingState.tsx`
    - Create LoadingState with variant ('spinner' | 'skeleton'), skeletonType ('card' | 'list' | 'text'), and count props
    - Implement spinner variant with ActivityIndicator using theme.colors.primary
    - Implement skeleton variant with animated placeholder cards using light gray background (#E8E8F0)
    - Add pulse animation using Animated.loop and Animated.sequence
    - Implement fade transition (300ms) when switching from loading to content
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_
  
  - [ ]* 5.2 Write property tests for LoadingState component
    - **Property 14: Loading State Indicator Color**
    - **Property 15: Skeleton Screen for List Content**
    - **Property 16: Skeleton Screen Pulse Animation**
    - **Property 17: Loading to Content Transition**
    - **Validates: Requirements 7.1, 7.2, 7.4, 7.5**

- [ ] 6. Checkpoint - Ensure all component tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Refactor SignUpScreen to use unified theme
  - [x] 7.1 Update SignUpScreen background and theme colors
    - Change background from violet gradient to light theme (#F5F5F7)
    - Update header gradient from violet to navy blue shades (theme.colors.primary to theme.colors.primaryLight)
    - Replace all hardcoded colors with theme.colors references
    - _Requirements: 1.5, 2.3_
  
  - [x] 7.2 Replace form inputs with Input component
    - Replace custom input styling with Input component
    - Apply focus states with navy blue borders
    - Add error state handling with Input component error prop
    - _Requirements: 12.1, 12.2, 12.3, 12.6_
  
  - [x] 7.3 Replace buttons with Button component
    - Replace custom button with Button component using 'primary' variant
    - Ensure minimum height 48px and touch target 44x44 points
    - _Requirements: 10.1, 10.2_
  
  - [x] 7.4 Add screen mount animations
    - Implement fade-in animation with duration 400-700ms using Animated.timing
    - Implement slide-up animation using Animated.spring
    - Use useNativeDriver: true for transform and opacity
    - _Requirements: 5.1, 5.2, 5.5_
  
  - [ ]* 7.5 Write property tests for SignUpScreen
    - **Property 2: Screen Background Theme Compliance**
    - **Property 7: Typography Theme Compliance**
    - **Property 8: Screen Mount Fade Animation**
    - **Property 9: Screen Mount Slide Animation**
    - **Property 12: Native Driver for Transform Animations**
    - **Validates: Requirements 2.3, 4.6, 5.1, 5.2, 5.5**

- [ ] 8. Refactor SignInScreen to use unified theme
  - [ ] 8.1 Update SignInScreen background and theme colors
    - Change background to light theme (#F5F5F7)
    - Replace all hardcoded colors with theme.colors references
    - Update header to use navy blue gradient
    - _Requirements: 1.5, 2.10_
  
  - [ ] 8.2 Replace form inputs and buttons with components
    - Replace inputs with Input component
    - Replace buttons with Button component
    - Add screen mount animations (fade-in and slide-up)
    - _Requirements: 5.1, 5.2, 10.1, 10.2_
  
  - [ ]* 8.3 Write property tests for SignInScreen
    - **Property 2: Screen Background Theme Compliance**
    - **Property 8: Screen Mount Fade Animation**
    - **Property 9: Screen Mount Slide Animation**
    - **Validates: Requirements 2.10, 5.1, 5.2**

- [ ] 9. Refactor OnboardingScreen to use unified theme
  - [ ] 9.1 Update OnboardingScreen background and theme colors
    - Change background to light theme (#F5F5F7)
    - Replace all hardcoded colors with theme.colors references
    - Update cards to use Card component or apply card styling
    - _Requirements: 1.5, 2.7_
  
  - [ ] 9.2 Add animations and update buttons
    - Add screen mount animations (fade-in and slide-up)
    - Replace buttons with Button component
    - Add card press animations if cards are interactive
    - _Requirements: 5.1, 5.2, 5.4_
  
  - [ ]* 9.3 Write property tests for OnboardingScreen
    - **Property 2: Screen Background Theme Compliance**
    - **Property 8: Screen Mount Fade Animation**
    - **Validates: Requirements 2.7, 5.1**

- [x] 10. Refactor HomeScreen to use unified theme
  - [x] 10.1 Update HomeScreen from dark to light theme
    - Change background from dark (#0D0B1E) to light theme (#F5F5F7)
    - Update hero card gradient from purple to navy blue shades
    - Update trigger cards from dark to white cards with colored left border
    - Update all text colors from white/light to navy/dark with proper hierarchy
    - Replace all hardcoded colors with theme.colors references
    - _Requirements: 1.5, 2.1_
  
  - [x] 10.2 Refactor cards to use Card component
    - Replace custom card styling with Card component
    - Apply card shadows using theme.shadows.card
    - Ensure card spacing between cards is 12-16px
    - _Requirements: 3.1, 3.2, 3.3, 3.5, 3.6_
  
  - [x] 10.3 Add animations and loading states
    - Add screen mount animations (fade-in and slide-up)
    - Add card press animations for interactive cards
    - Add LoadingState component for data fetching
    - _Requirements: 5.1, 5.2, 5.4, 7.1, 7.2_
  
  - [ ]* 10.4 Write property tests for HomeScreen
    - **Property 2: Screen Background Theme Compliance**
    - **Property 5: Card Spacing Consistency**
    - **Property 22: Emphasis Gradient Colors**
    - **Validates: Requirements 2.1, 3.5, 9.1**

- [x] 11. Refactor ProfileScreen to use unified theme
  - [x] 11.1 Update ProfileScreen from dark to light theme
    - Change background from dark (#0D0B1E) to light theme (#F5F5F7)
    - Update hero card gradient from purple to navy blue shades
    - Update menu items from dark cards to white cards
    - Update avatar from purple to orange accent
    - Update all text from white to navy with proper hierarchy
    - Replace all hardcoded colors with theme.colors references
    - _Requirements: 1.5, 2.2_
  
  - [x] 11.2 Refactor cards and add animations
    - Replace custom card styling with Card component
    - Add screen mount animations (fade-in and slide-up)
    - Add card press animations for menu items
    - Update badges to use theme color palette
    - _Requirements: 3.1, 3.2, 5.1, 5.2, 5.4_
  
  - [ ]* 11.3 Write property tests for ProfileScreen
    - **Property 2: Screen Background Theme Compliance**
    - **Property 22: Emphasis Gradient Colors**
    - **Validates: Requirements 2.2, 9.1**

- [x] 12. Update Navigation Bar to light theme
  - [x] 12.1 Refactor BottomTabBar component in App.tsx
    - Change background from dark to white (#FFFFFF)
    - Change border from dark to light (#E8E8F0)
    - Update active icon container from purple to navy (#1A1B4B)
    - Update active label from purple to navy (#1A1B4B) with fontWeight 700
    - Update inactive icon/label from light gray to muted (#9B9BB5) with fontWeight 600
    - Maintain height at 80px for comfortable touch targets
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_
  
  - [ ]* 12.2 Write unit tests for Navigation Bar
    - Test active and inactive tab states
    - Test navigation between screens
    - Verify touch target sizes

- [ ] 13. Checkpoint - Ensure core screens are complete
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 14. Refactor PolicySelectionScreen to use unified theme
  - [ ] 14.1 Update PolicySelectionScreen background and theme colors
    - Change background to light theme (#F5F5F7)
    - Replace all hardcoded colors with theme.colors references
    - Update policy cards to use Card component
    - _Requirements: 1.5, 2.4_
  
  - [ ] 14.2 Add animations and update buttons
    - Add screen mount animations (fade-in and slide-up)
    - Replace buttons with Button component
    - Add card press animations for policy selection cards
    - Add LoadingState for pricing calculations
    - _Requirements: 5.1, 5.2, 5.4, 7.1_
  
  - [ ]* 14.3 Write property tests for PolicySelectionScreen
    - **Property 2: Screen Background Theme Compliance**
    - **Property 8: Screen Mount Fade Animation**
    - **Validates: Requirements 2.4, 5.1**

- [ ] 15. Refactor ClaimsScreen to use unified theme
  - [ ] 15.1 Update ClaimsScreen background and theme colors
    - Change background to light theme (#F5F5F7)
    - Replace all hardcoded colors with theme.colors references
    - Update claim cards to use Card component
    - _Requirements: 1.5, 2.5_
  
  - [ ] 15.2 Add animations and loading states
    - Add screen mount animations (fade-in and slide-up)
    - Add card press animations for claim cards
    - Add LoadingState with skeleton screens for claim list
    - Replace buttons with Button component
    - _Requirements: 5.1, 5.2, 5.4, 7.2_
  
  - [ ]* 15.3 Write property tests for ClaimsScreen
    - **Property 2: Screen Background Theme Compliance**
    - **Property 15: Skeleton Screen for List Content**
    - **Validates: Requirements 2.5, 7.2**

- [ ] 16. Refactor AnalyticsScreen to use unified theme
  - [ ] 16.1 Update AnalyticsScreen background and theme colors
    - Change background to light theme (#F5F5F7)
    - Replace all hardcoded colors with theme.colors references
    - Update analytics cards to use Card component
    - _Requirements: 1.5, 2.6_
  
  - [ ] 16.2 Add animations and loading states
    - Add screen mount animations (fade-in and slide-up)
    - Add LoadingState with skeleton screens for analytics data
    - Update chart colors to use theme color palette
    - _Requirements: 5.1, 5.2, 7.2_
  
  - [ ]* 16.3 Write property tests for AnalyticsScreen
    - **Property 2: Screen Background Theme Compliance**
    - **Property 8: Screen Mount Fade Animation**
    - **Validates: Requirements 2.6, 5.1**

- [ ] 17. Refactor LocationScreen to use unified theme
  - [ ] 17.1 Update LocationScreen background and theme colors
    - Change background to light theme (#F5F5F7)
    - Replace all hardcoded colors with theme.colors references
    - Update location cards to use Card component
    - _Requirements: 1.5, 2.8_
  
  - [ ] 17.2 Add animations and update buttons
    - Add screen mount animations (fade-in and slide-up)
    - Replace buttons with Button component
    - Add card press animations if location cards are interactive
    - _Requirements: 5.1, 5.2, 10.1, 10.2_
  
  - [ ]* 17.3 Write property tests for LocationScreen
    - **Property 2: Screen Background Theme Compliance**
    - **Validates: Requirements 2.8**

- [ ] 18. Refactor TermsScreen to use unified theme
  - [ ] 18.1 Update TermsScreen background and theme colors
    - Change background to light theme (#F5F5F7)
    - Replace all hardcoded colors with theme.colors references
    - Update content container to use Card component or card styling
    - _Requirements: 1.5, 2.9_
  
  - [ ] 18.2 Add animations and update buttons
    - Add screen mount animations (fade-in and slide-up)
    - Replace buttons with Button component
    - Add swipe gesture visual feedback if SwipeToAccept is used
    - _Requirements: 5.1, 5.2, 8.4, 10.1, 10.2_
  
  - [ ]* 18.3 Write property tests for TermsScreen
    - **Property 2: Screen Background Theme Compliance**
    - **Property 20: Swipe Gesture Visual Feedback**
    - **Validates: Requirements 2.9, 8.4**

- [ ] 19. Checkpoint - Ensure all screens are refactored
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 20. Implement gradient usage consistency
  - [ ] 20.1 Audit and update all gradient usage across screens
    - Ensure emphasis gradients use navy blue shades (theme.colors.primary to theme.colors.primaryLight)
    - Ensure CTA gradients use orange shades (theme.colors.accent to theme.colors.accentLight)
    - Verify all LinearGradient components have start and end points defined
    - Ensure gradient buttons have white text (#FFFFFF) for readability
    - Limit gradient usage to hero sections, primary CTAs, or special emphasis cards
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_
  
  - [ ]* 20.2 Write property tests for gradient usage
    - **Property 22: Emphasis Gradient Colors**
    - **Property 23: CTA Gradient Colors**
    - **Property 24: Gradient Configuration**
    - **Property 25: Gradient Button Text Color**
    - **Validates: Requirements 9.1, 9.2, 9.3, 9.4**

- [ ] 21. Implement accessibility improvements
  - [ ] 21.1 Audit and fix touch target sizes
    - Ensure all interactive elements have minimum touch target size of 44x44 points
    - Ensure all buttons have minimum height of 48px
    - Add padding to small interactive elements to meet touch target requirements
    - _Requirements: 10.1, 10.2_
  
  - [ ] 21.2 Audit and fix text readability
    - Ensure all text has minimum font size of 11px
    - Verify color contrast ratios meet WCAG AA standards (4.5:1 for normal text)
    - Add accessible labels to all icon-only buttons for screen readers
    - _Requirements: 10.3, 10.4, 10.5_
  
  - [ ]* 21.3 Write property tests for accessibility
    - **Property 26: Interactive Element Touch Target Size**
    - **Property 27: Button Minimum Height**
    - **Property 28: Text Minimum Font Size**
    - **Property 29: Text Color Contrast Ratio**
    - **Property 30: Icon Button Accessibility Label**
    - **Validates: Requirements 10.1, 10.2, 10.3, 10.4, 10.5**

- [ ] 22. Implement performance optimizations
  - [ ] 22.1 Optimize component rendering
    - Add React.memo to Card, Button, Input, and LoadingState components where appropriate
    - Use useMemo for expensive computations in screens
    - Ensure FlatList or ScrollView use appropriate optimization props for lists
    - _Requirements: 11.1, 11.2_
  
  - [ ] 22.2 Optimize animations
    - Verify all transform and opacity animations use useNativeDriver: true
    - Profile animation performance and ensure 60fps target
    - _Requirements: 11.3_
  
  - [ ] 22.3 Optimize images and inputs
    - Optimize image sizes and use appropriate compression
    - Implement debouncing for rapid user inputs with delay of 300-500ms
    - _Requirements: 11.4, 11.5_
  
  - [ ]* 22.4 Write property tests for performance
    - **Property 12: Native Driver for Transform Animations**
    - **Property 31: Input Debouncing**
    - **Validates: Requirements 11.3, 11.5**

- [ ] 23. Implement micro-interactions and polish
  - [ ] 23.1 Add haptic feedback where supported
    - Add light haptic feedback to primary action buttons on press
    - Test haptic feedback on iOS and Android devices
    - _Requirements: 8.3_
  
  - [ ] 23.2 Add toggle and switch animations
    - Ensure all toggles and switches animate state changes with duration 200-300ms
    - Add smooth transitions for all state changes
    - _Requirements: 8.5_
  
  - [ ]* 23.3 Write property tests for micro-interactions
    - **Property 13: Animation Value Restoration**
    - **Property 21: Toggle Animation Duration**
    - **Validates: Requirements 5.6, 8.5**

- [ ] 24. Final checkpoint - Comprehensive testing
  - [ ] 24.1 Run all unit tests and property tests
    - Verify all tests pass
    - Review test coverage report
    - Fix any failing tests
  
  - [ ] 24.2 Perform manual testing
    - Test all screens on iOS and Android
    - Verify animations are smooth (60fps)
    - Test accessibility with screen readers
    - Verify color contrast and readability
    - Test touch targets on physical devices
  
  - [ ] 24.3 Performance testing
    - Measure screen load times
    - Profile animation frame rates
    - Verify no unnecessary re-renders
    - Optimize any performance bottlenecks
  
  - [ ] 24.4 Visual regression testing
    - Capture screenshots of all screens
    - Compare against design specifications
    - Review and approve any visual changes

- [ ] 25. Final review and deployment preparation
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 26. Fix HomeScreen theme implementation (corrective task)
  - [ ] 26.1 Update HomeScreen container background color
    - Change container background from `#0D0B1E` to `theme.colors.background` (#F5F5F7)
    - _Requirements: 1.5, 2.1_
  
  - [ ] 26.2 Update HomeScreen hero card gradient
    - Change hero card gradient from purple `['#1A0A6B', '#3A1CD9', '#6B42FF']` to navy blue `[theme.colors.primary, theme.colors.primaryLight]`
    - _Requirements: 9.1_
  
  - [ ] 26.3 Update HomeScreen text colors for light theme
    - Change all white text colors to navy/dark colors using theme.colors.textMain, theme.colors.textSub, theme.colors.textMuted
    - Update section titles to use theme.colors.textMain
    - Update body text to use theme.colors.textSub
    - Update muted text to use theme.colors.textMuted
    - _Requirements: 1.5, 4.6_
  
  - [ ] 26.4 Update HomeScreen card backgrounds
    - Change trigger cards from `rgba(255,255,255,0.06)` to white `theme.colors.surface` with proper shadows
    - Change payout cards from `rgba(255,255,255,0.06)` to white `theme.colors.surface` with proper shadows
    - Apply theme.shadows.card to all card components
    - _Requirements: 3.1, 3.3, 3.6_
  
  - [ ] 26.5 Update HomeScreen top bar elements
    - Update location pill background to use light theme colors
    - Update avatar circle to use theme.colors.accent instead of theme.colors.primary for visual distinction
    - Update all icon colors to work with light backgrounds
    - _Requirements: 1.5_

- [ ] 27. Fix ProfileScreen theme implementation (corrective task)
  - [ ] 27.1 Update ProfileScreen container background color
    - Change container background from `#0D0B1E` to `theme.colors.background` (#F5F5F7)
    - _Requirements: 1.5, 2.2_
  
  - [ ] 27.2 Update ProfileScreen hero card gradient
    - Change hero card gradient from purple `['#1A0A6B', '#3A1CD9']` to navy blue `[theme.colors.primary, theme.colors.primaryLight]`
    - _Requirements: 9.1_
  
  - [ ] 27.3 Update ProfileScreen text colors for light theme
    - Change all white text colors to navy/dark colors using theme.colors.textMain, theme.colors.textSub, theme.colors.textMuted
    - Update top bar title to use theme.colors.textMain
    - Update menu labels to use theme.colors.textMain
    - Update menu sub-text to use theme.colors.textMuted
    - _Requirements: 1.5, 4.6_
  
  - [ ] 27.4 Update ProfileScreen card backgrounds
    - Change premium card from `rgba(75,40,229,0.2)` to white `theme.colors.surface` with proper shadows
    - Change exclusions card background to use light theme colors
    - Change menu card from `rgba(255,255,255,0.06)` to white `theme.colors.surface` with proper shadows
    - Apply theme.shadows.card to all card components
    - _Requirements: 3.1, 3.3, 3.6_
  
  - [ ] 27.5 Update ProfileScreen top bar and icons
    - Update top bar title color to theme.colors.textMain
    - Update settings icon color to theme.colors.textMuted
    - Update all menu item icon colors to work with light backgrounds
    - Update chevron colors to theme.colors.textMuted
    - _Requirements: 1.5_

- [ ] 28. Checkpoint - Verify HomeScreen and ProfileScreen theme fixes
  - Ensure both screens now use light theme with navy blue primary colors
  - Verify all text is readable with proper contrast
  - Verify all cards have white backgrounds with proper shadows
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- The implementation follows a phased approach: Foundation → Core Screens → Feature Screens → Polish
- All animations should use useNativeDriver: true for optimal performance
- All colors should reference theme.colors for consistency
- All spacing should use theme.spacing values
- All components should be reusable and follow the design system
