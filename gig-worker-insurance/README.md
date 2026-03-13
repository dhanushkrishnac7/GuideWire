# Gig Worker Insurance - Phase 1 Prototype

## Overview
This is the Phase 1 prototype for our automated gig worker insurance product. The goal for this phase is to build a high-fidelity, interactive simulator that showcases the real-time disruption detection and automated payouts.

### Concept Recap (The "Magic" Moments to build)
1. **The Core Dashboard:** Premium UI showing live risk factors, past earnings, and current coverage status.
2. **The Demo Trigger:** A set of developer buttons to simulate live events (e.g., Heavy Rain, Heatwave).
3. **The Instant Payout:** Dynamic calculation and a rewarding UI when they successfully avoid the disruption and receive auto-claims.
4. **The ROI Widget:** "You paid ₹200 and gained ₹3,200."

---

## 🚨 IMPORTANT: UI Consistency Instructions 🚨
We have agreed on a highly premium, vibrant, gradient-heavy UI (as shown in the provided screenshots). 

Since we are splitting the pages among the team, **inconsistencies will ruin the premium feel of the prototype.** To prevent this, we are using a **strict component-first approach**.

### Rule 1: NEVER Use Inline Styles or Hardcoded Colors
*   **Do not** type `style={{ color: '#4A148C', marginTop: 10 }}`. ESLint will throw an error and you will not be able to commit.
*   **Do not** use `StyleSheet.create` with your own random padding numbers or shades of gray.
*   **Always** import from `src/theme.ts`.

### Rule 2: Use the Theme File
The single source of truth for all colors, spacing, typography, and borders is `src/theme.ts`.
```typescript
import { theme } from '../theme';

// Correct Usage
const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background,
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.s,
  }
});
```

### Rule 3: Use Shared Core Components
Instead of building boxes from scratch, use the Lego blocks provided in `src/components/`.
For main UI cards, **always** use `<GradientCard>` imported from `src/components/GradientCard`.

```tsx
import { GradientCard } from '../components/GradientCard';

export const MyPage = () => (
  <GradientCard>
    {/* Your content */}
  </GradientCard>
)
```

### Rule 4: Shared Assets Only
If you need an icon, coordinate with the team to put the SVG inside an `/assets/icons` folder rather than dropping local images everywhere. 

---

## Setup & Running
1. Clone the repo and run `npm install`.
2. Run `npm start` (or `npm run ios` / `npm run android`).
3. If you get an ESLint error, it means you used an inline style somewhere! Fix it by moving the style to `StyleSheet.create` and pulling values from `theme.ts`.
