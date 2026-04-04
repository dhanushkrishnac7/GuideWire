import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { theme, Icon } from './src/theme';
import PolicySelectionScreen from './src/screens/PolicySelectionScreen';
import SignInScreen from './src/screens/SignInScreen';
import SignUpScreen from './src/screens/SignUpScreen';
import LocationScreen from './src/screens/LocationScreen';
import TermsScreen from './src/screens/TermsScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import HomeScreen from './src/screens/HomeScreen';
import ClaimsScreen from './src/screens/ClaimsScreen';
import AnalyticsScreen from './src/screens/AnalyticsScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import SimulationScreen from './src/screens/SimulationScreen';
import AIFraudEngineScreen from './src/screens/AIFraudEngineScreen';
import { start as startTriggerEngine, stop as stopTriggerEngine } from './src/services/triggerEngine';
import { cleanupOldClaims } from './src/services/claimProcessor';
import { PayoutProvider } from './src/contexts/PayoutContext';

type Screen = 'SignIn' | 'SignUp' | 'Location' | 'Terms' | 'Onboarding' | 'Home' | 'PolicySelection' | 'Claims' | 'Analytics' | 'Profile' | 'Simulation' | 'AIFraudEngine';

const MAIN_SCREENS: Screen[] = ['Home', 'PolicySelection', 'Claims', 'Analytics', 'Simulation', 'AIFraudEngine', 'Profile'];

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('SignUp');
  const [userZone, setUserZone] = useState('Koramangala');
  const [userFleet, setUserFleet] = useState('Food Delivery');
  const [userPlan, setUserPlan] = useState('Pro');

  // Initialize trigger engine on app start
  useEffect(() => {
    try {
      startTriggerEngine();
      console.log('Trigger engine started successfully');
    } catch (error) {
      console.error('Failed to start trigger engine:', error);
    }

    // Run cleanup on app launch
    cleanupOldClaims().catch((error) => {
      console.error('Failed to run initial cleanup:', error);
    });

    // Schedule daily cleanup (every 24 hours)
    const cleanupInterval = setInterval(() => {
      cleanupOldClaims().catch((error) => {
        console.error('Failed to run scheduled cleanup:', error);
      });
    }, 24 * 60 * 60 * 1000); // 24 hours in milliseconds

    // Cleanup on unmount
    return () => {
      try {
        stopTriggerEngine();
        console.log('Trigger engine stopped');
      } catch (error) {
        console.error('Failed to stop trigger engine:', error);
      }
      clearInterval(cleanupInterval);
    };
  }, []);

  const navigate = (screen: string) => setCurrentScreen(screen as Screen);
  const isMainScreen = MAIN_SCREENS.includes(currentScreen);

  const renderScreen = () => {
    switch (currentScreen) {
      case 'SignIn':
        return <SignInScreen onSignIn={() => navigate('Onboarding')} onGoToSignUp={() => navigate('SignUp')} />;
      case 'SignUp':
        return <SignUpScreen onSignUpSuccess={() => navigate('Location')} onGoToSignIn={() => navigate('SignIn')} />;
      case 'Location':
        return <LocationScreen onConfirmLocation={() => navigate('Terms')} onBack={() => navigate('SignUp')} />;
      case 'Terms':
        return <TermsScreen onAccept={() => navigate('Onboarding')} onDecline={() => navigate('SignIn')} onBack={() => navigate('Location')} />;
      case 'Onboarding':
        return (
          <OnboardingScreen
            onComplete={(data) => {
              setUserZone(data.zone);
              setUserFleet(data.fleet);
              navigate('PolicySelection');
            }}
          />
        );
      case 'PolicySelection':
        return (
          <PolicySelectionScreen
            onBack={() => navigate('Home')}
            zone={userZone}
            fleet={userFleet}
            onPlanSelected={(plan) => { setUserPlan(plan); navigate('Home'); }}
          />
        );
      case 'Claims':
        return <ClaimsScreen zone={userZone} onNavigate={navigate} />;
      case 'Analytics':
        return <AnalyticsScreen zone={userZone} fleet={userFleet} onNavigate={navigate} />;
      case 'Profile':
        return <ProfileScreen zone={userZone} fleet={userFleet} plan={userPlan} onNavigate={navigate} />;
      case 'Simulation':
        return <SimulationScreen zone={userZone} onNavigate={navigate} />;
      case 'AIFraudEngine':
        return <AIFraudEngineScreen onNavigate={navigate} />;
      case 'Home':
      default:
        return <HomeScreen zone={userZone} fleet={userFleet} plan={userPlan} onNavigate={navigate} />;
    }
  };

  return (
    <PayoutProvider>
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        {renderScreen()}
        {isMainScreen && <BottomTabBar current={currentScreen} onNavigate={navigate} />}
      </View>
    </PayoutProvider>
  );
}

function BottomTabBar({ current, onNavigate }: { current: Screen; onNavigate: (s: string) => void }) {
  const tabs = [
    { id: 'Home', label: 'Home', icon: Icon.home, activeIcon: Icon.home },
    { id: 'PolicySelection', label: 'Policy', icon: Icon.wallet, activeIcon: Icon.wallet },
    { id: 'Claims', label: 'Claims', icon: Icon.claims, activeIcon: Icon.claims },
    { id: 'Analytics', label: 'Analytics', icon: Icon.analytics, activeIcon: Icon.analytics },
    { id: 'Simulation', label: 'Simulate', icon: Icon.flash, activeIcon: Icon.flash },
    { id: 'AIFraudEngine', label: 'AI Guard', icon: Icon.shield, activeIcon: Icon.shield },
    { id: 'Profile', label: 'Profile', icon: Icon.profile, activeIcon: Icon.profile },
  ];
  return (
    <View style={tabStyles.bar}>
      {tabs.map(tab => {
        const active = current === tab.id;
        return (
          <TouchableOpacity key={tab.id} style={tabStyles.item} onPress={() => onNavigate(tab.id)}>
            {active ? (
              <View style={tabStyles.activeBox}>
                <Text style={tabStyles.activeIcon}>{tab.activeIcon}</Text>
              </View>
            ) : (
              <Text style={tabStyles.inactiveIcon}>{tab.icon}</Text>
            )}
            <Text style={[tabStyles.label, active && tabStyles.labelActive]}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const tabStyles = StyleSheet.create({
  bar: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: 80,
    backgroundColor: theme.colors.surface, flexDirection: 'row',
    borderTopWidth: 1, borderTopColor: theme.colors.border,
  },
  item: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  activeBox: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: theme.colors.primary, justifyContent: 'center', alignItems: 'center', marginBottom: 2,
  },
  activeIcon: { fontSize: 18, color: '#FFF' },
  inactiveIcon: { fontSize: 20, color: theme.colors.textMuted, marginBottom: 2 },
  label: { fontSize: 10, color: theme.colors.textMuted, fontWeight: '600', marginTop: 2 },
  labelActive: { color: theme.colors.primary, fontWeight: '700' },
});
