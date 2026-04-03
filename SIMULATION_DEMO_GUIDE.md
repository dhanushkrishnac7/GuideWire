# Simulation Demo Guide - Enhanced Notification Flow

## Overview
The simulation screen now provides a complete demonstration of the automated parametric insurance system with visual notifications and real-time payout tracking across all screens.

## What's New

### 1. **Step-by-Step Notification Flow**
When you trigger a simulation, you'll see a toast notification that progresses through 4 stages:

- **Stage 1: Detecting** (1.5s) - "Trigger Detected" with scan icon
- **Stage 2: Verifying** (1.5s) - "Verifying Eligibility" checking online status and location
- **Stage 3: Processing** (1.5s) - "Processing Payout" sending money to UPI
- **Stage 4: Success** (3s) - "Payment Received!" with the payout amount

Each stage has a unique color and icon to make the flow clear for judges.

### 2. **Global Payout Tracker**
- A green banner appears on Home, Claims, and other screens showing total payouts
- Updates in real-time when new payouts are triggered
- Shows "NEW" badge for latest payout
- Tappable to navigate to Claims screen
- Pulses to draw attention

### 3. **Enhanced Simulation Screen**
- Clear "How to Demo" instructions at the top
- Step-by-step guide for judges
- Event log shows all triggered events with timestamps
- Cooldown timers prevent duplicate triggers

### 4. **Cross-Screen Updates**
- Payout amounts update across ALL screens instantly
- Home screen shows updated total
- Claims screen reflects new claims
- Profile screen shows updated earnings
- Analytics screen updates charts

## How to Demo for Judges

### Step 1: Navigate to Simulation Tab
- Open the app
- Tap the "Simulation" tab (lightning bolt icon) in the bottom navigation

### Step 2: Trigger an Event
- Choose any trigger button (Rain, Heat, or Traffic)
- Tap the button to simulate the condition

### Step 3: Watch the Notification Flow
- **Detecting**: System detects the parametric condition
- **Verifying**: Checks worker is online and in the affected zone
- **Processing**: Executes automatic payout to UPI
- **Success**: Confirms payment received

### Step 4: See Real-Time Updates
- Green payout banner appears at top of screens
- Total payout amount updates
- Event log shows the new claim
- Navigate to other tabs to see updates everywhere

### Step 5: Demonstrate Multiple Triggers
- Wait for cooldown period (shown on button)
- Trigger different conditions (rain, heat, traffic)
- Show how the system handles multiple events
- Demonstrate the 2-hour cooldown protection

## Key Features to Highlight

### 1. **Zero-Touch Automation**
- No manual claim filing required
- Automatic detection of conditions
- Instant verification and payout
- No human intervention needed

### 2. **Parametric Triggers**
- Rain: >10mm/hr triggers ₹350 payout
- Heat: >42°C triggers ₹200 payout
- Traffic: <15km/h triggers ₹120 payout

### 3. **Smart Verification**
- Online status check
- Geofence validation (5km radius)
- Zone matching
- All automated in seconds

### 4. **Instant Payouts**
- Direct to UPI account
- No waiting period
- Automatic retry on failure
- Transaction ID tracking

### 5. **Cooldown Protection**
- 2-hour cooldown between same trigger types
- Prevents duplicate payouts
- Visible countdown timer
- Automatic reset

## Technical Implementation

### New Components
1. **PayoutNotificationToast** - Animated toast showing 4-stage flow
2. **GlobalPayoutBanner** - Persistent payout tracker across screens
3. **PayoutContext** - React Context for global state management

### Files Modified
- `SimulationScreen.tsx` - Added notification flow and instructions
- `App.tsx` - Wrapped with PayoutProvider
- `HomeScreen.tsx` - Added global payout banner
- `ClaimsScreen.tsx` - Added global payout banner

### Files Created
- `src/components/PayoutNotificationToast.tsx`
- `src/components/GlobalPayoutBanner.tsx`
- `src/contexts/PayoutContext.tsx`

## Demo Script for Judges

**Opening Statement:**
"Let me demonstrate our zero-touch parametric insurance system. This prototype shows how gig workers receive automatic payouts when weather or traffic conditions affect their work."

**Step 1 - Show Simulation:**
"I'm now in the Simulation tab. This allows us to manually trigger conditions that would normally be detected automatically by our API integrations."

**Step 2 - Trigger Event:**
"Let's simulate heavy rain. [Tap Rain button] Watch the notification flow..."

**Step 3 - Explain Flow:**
- "First, the system detects the rain condition"
- "Then it verifies the worker is online and in the affected zone"
- "Next, it processes the payout to their UPI account"
- "Finally, it confirms the payment was received"

**Step 4 - Show Updates:**
"Notice the green banner at the top showing total payouts. Let's navigate to other screens..."
- [Go to Home] "The payout is reflected here"
- [Go to Claims] "The claim history is updated"
- [Go to Profile] "Earnings are updated"

**Step 5 - Demonstrate Protection:**
"The system has a 2-hour cooldown to prevent duplicate payouts for the same condition. See the timer on the button."

**Closing Statement:**
"This demonstrates how our system provides instant, automatic income protection for gig workers without any manual claims process."

## Benefits for Judges to Understand

1. **Speed**: Payouts in seconds, not days
2. **Automation**: No paperwork or manual claims
3. **Transparency**: Every step is visible and tracked
4. **Reliability**: Automatic retry on failures
5. **Protection**: Cooldown prevents abuse
6. **Scalability**: Can handle thousands of workers simultaneously
7. **Real-time**: Updates across all screens instantly

## Testing Checklist

- [ ] Trigger rain event - see notification flow
- [ ] Check payout banner appears on Home screen
- [ ] Navigate to Claims - verify claim is logged
- [ ] Trigger heat event - see different notification
- [ ] Check total payout updates correctly
- [ ] Try triggering same event during cooldown - button disabled
- [ ] Navigate between screens - payout banner persists
- [ ] Check event log shows all triggers with timestamps
- [ ] Verify cooldown timer counts down correctly
- [ ] Test multiple trigger types in sequence

## Notes

- All payouts are simulated (no real money)
- Cooldown is 2 hours in production, shown in real-time
- Event log stores last 10 events
- Payout amounts are configurable per trigger type
- System works offline with mock data for demo purposes
