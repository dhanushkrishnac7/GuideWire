import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet, Text, View,
  SafeAreaView, KeyboardAvoidingView, Platform, Animated,
  ScrollView, TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme, Icon } from '../theme';
import { Input } from '../components/Input';
import { Button } from '../components/Button';

interface Props {
  onSignUpSuccess: () => void;
  onGoToSignIn: () => void;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
}

export default function SignUpScreen({ onSignUpSuccess, onGoToSignIn }: Props) {
  const [fullName, setFullName] = useState('Rahul Sharma');
  const [email, setEmail] = useState('rahul.sharma@example.com');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [password, setPassword] = useState('demo1234');
  const [confirmPassword, setConfirmPassword] = useState('demo1234');
  const [errors, setErrors] = useState<FormErrors>({});

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: theme.animation.fadeIn, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 50, friction: 8, useNativeDriver: true }),
    ]).start();
  }, []);

  const clearError = (field: keyof FormErrors) => {
    setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!fullName.trim()) e.fullName = 'Full name is required';
    if (!email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Enter a valid email';
    if (!phone.trim()) e.phone = 'Phone number is required';
    else if (phone.replace(/\D/g, '').length < 10) e.phone = 'Enter a valid phone number';
    if (!password) e.password = 'Password is required';
    else if (password.length < 6) e.password = 'Minimum 6 characters';
    if (!confirmPassword) e.confirmPassword = 'Please confirm your password';
    else if (password !== confirmPassword) e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSignUp = () => {
    if (validate()) {
      onSignUpSuccess();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          {/* Gradient Header */}
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.primaryLight]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={styles.headerGradient}
          >
            <View style={[styles.decorCircle, { top: -20, right: -20, width: 100, height: 100 }]} />
            <View style={[styles.decorCircle, { bottom: -10, left: -15, width: 70, height: 70 }]} />

            <View style={styles.headerInner}>
              <View style={styles.logoCircle}>
                <Text style={{ fontSize: 30 }}>👤</Text>
              </View>
              <Text style={styles.headerTitle}>Create Account</Text>
              <Text style={styles.headerSub}>Join thousands of gig workers protected by GigShield</Text>
            </View>
          </LinearGradient>

          {/* Form Card */}
          <Animated.View style={[styles.formCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>

            {/* Step indicator */}
            <View style={styles.stepRow}>
              <View style={[styles.stepDot, styles.stepActive]} />
              <View style={styles.stepLine} />
              <View style={styles.stepDot} />
              <View style={styles.stepLine} />
              <View style={styles.stepDot} />
              <Text style={styles.stepLabel}>Step 1 of 3</Text>
            </View>

            <Input
              label="Full Name"
              icon={Icon.person}
              value={fullName}
              onChangeText={(t) => { setFullName(t); clearError('fullName'); }}
              placeholder="Enter your full name"
              autoCapitalize="words"
              error={errors.fullName}
            />

            <Input
              label="Email Address"
              icon={Icon.mail}
              value={email}
              onChangeText={(t) => { setEmail(t); clearError('email'); }}
              placeholder="you@example.com"
              keyboardType="email-address"
              error={errors.email}
            />

            <Input
              label="Phone Number"
              icon={Icon.phone}
              value={phone}
              onChangeText={(t) => { setPhone(t); clearError('phone'); }}
              placeholder="+91 XXXXX XXXXX"
              keyboardType="phone-pad"
              error={errors.phone}
            />

            <Input
              label="Password"
              icon={Icon.lock}
              value={password}
              onChangeText={(t) => { setPassword(t); clearError('password'); }}
              placeholder="Min. 6 characters"
              secureTextEntry
              error={errors.password}
            />

            <Input
              label="Confirm Password"
              icon={Icon.lock}
              value={confirmPassword}
              onChangeText={(t) => { setConfirmPassword(t); clearError('confirmPassword'); }}
              placeholder="Re-enter password"
              secureTextEntry
              error={errors.confirmPassword}
            />

            {/* Create Account Button */}
            <View style={{ marginTop: theme.spacing.s }}>
              <Button
                title="Create Account"
                onPress={handleSignUp}
                variant="primary"
                size="large"
                icon={Icon.arrowRight}
              />
            </View>

            {/* Sign In Link */}
            <View style={styles.signInRow}>
              <Text style={styles.signInText}>Already have an account? </Text>
              <TouchableOpacity onPress={onGoToSignIn}>
                <Text style={styles.signInLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  scrollContent: { flexGrow: 1 },

  headerGradient: {
    paddingTop: 50, paddingBottom: 40, alignItems: 'center',
    borderBottomLeftRadius: 36, borderBottomRightRadius: 36, overflow: 'hidden',
  },
  decorCircle: {
    position: 'absolute', borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  headerInner: { alignItems: 'center', zIndex: 1 },
  logoCircle: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center', alignItems: 'center', marginBottom: 12,
  },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#FFF', letterSpacing: 0.5 },
  headerSub: { fontSize: 13, fontWeight: '500', color: 'rgba(255,255,255,0.7)', marginTop: 6, textAlign: 'center', paddingHorizontal: 40 },

  formCard: {
    marginTop: -20, marginHorizontal: 18, backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl, padding: theme.spacing.l,
    ...theme.shadows.card,
  },

  // Step indicator
  stepRow: { flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.l, paddingHorizontal: 4 },
  stepDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: theme.colors.border },
  stepActive: { backgroundColor: theme.colors.primary, width: 12, height: 12, borderRadius: 6 },
  stepLine: { flex: 1, height: 2, backgroundColor: theme.colors.border, marginHorizontal: 4, maxWidth: 40 },
  stepLabel: { marginLeft: 'auto', fontSize: 12, fontWeight: '600', color: theme.colors.textMuted },

  signInRow: { flexDirection: 'row', justifyContent: 'center', marginTop: theme.spacing.l, paddingBottom: 4 },
  signInText: { fontSize: 14, color: theme.colors.textMuted, fontWeight: '500' },
  signInLink: { fontSize: 14, color: theme.colors.primary, fontWeight: '700' },
});
