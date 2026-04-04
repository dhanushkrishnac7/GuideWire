import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity,
  SafeAreaView, KeyboardAvoidingView, Platform, Animated,
  ScrollView, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme, Icon } from '../theme';

const { width } = Dimensions.get('window');

interface Props {
  onSignIn: () => void;
  onGoToSignUp: () => void;
}

export default function SignInScreen({ onSignIn, onGoToSignUp }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [focusedField, setFocusedField] = useState<'email' | 'password' | null>(null);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const logoScale = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 50, friction: 8, useNativeDriver: true }),
      Animated.spring(logoScale, { toValue: 1, tension: 60, friction: 5, useNativeDriver: true }),
    ]).start();
  }, []);

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!email.trim()) newErrors.email = 'Email or phone is required';
    if (!password.trim()) newErrors.password = 'Password is required';
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignIn = () => {
    if (validate()) {
      onSignIn();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Gradient Header */}
          <LinearGradient
            colors={['#3A1CD9', '#6B42FF', '#9B6DFF']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={styles.headerGradient}
          >
            {/* Decorative circles */}
            <View style={[styles.decorCircle, { top: -30, left: -30, width: 120, height: 120 }]} />
            <View style={[styles.decorCircle, { top: 20, right: -20, width: 80, height: 80 }]} />
            <View style={[styles.decorCircle, { bottom: -20, left: '40%', width: 60, height: 60 }]} />

            <Animated.View style={[styles.logoContainer, { transform: [{ scale: logoScale }] }]}>
              <View style={styles.logoCircle}>
                <Text style={{ fontSize: 36 }}>🛡️</Text>
              </View>
              <Text style={styles.appName}>Humsafar</Text>
              <Text style={styles.appTagline}>Zero-Touch Income Protection</Text>
            </Animated.View>
          </LinearGradient>

          {/* Form Card */}
          <Animated.View style={[
            styles.formCard,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}>
            <Text style={styles.welcomeText}>Welcome Warrior 👋</Text>
            <Text style={styles.subtitleText}>Sign in to access your protective shield</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email or Phone</Text>
              <View style={[
                styles.inputWrapper,
                errors.email && styles.inputError,
                focusedField === 'email' && styles.inputFocused,
              ]}>
                <Text style={[
                  styles.inputIcon,
                  { color: focusedField === 'email' ? theme.colors.primary : theme.colors.textMuted }
                ]}>{Icon.mail}</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email or phone"
                  placeholderTextColor="#A0A5B1"
                  value={email}
                  onChangeText={(t) => { setEmail(t); setErrors(e => ({ ...e, email: undefined })); }}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={[
                styles.inputWrapper,
                errors.password && styles.inputError,
                focusedField === 'password' && styles.inputFocused,
              ]}>
                <Text style={[
                  styles.inputIcon,
                  { color: focusedField === 'password' ? theme.colors.primary : theme.colors.textMuted }
                ]}>{Icon.lock}</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  placeholderTextColor="#A0A5B1"
                  value={password}
                  onChangeText={(t) => { setPassword(t); setErrors(e => ({ ...e, password: undefined })); }}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                  <Text style={[
                    styles.eyeIcon,
                    { color: focusedField === 'password' ? theme.colors.primary : theme.colors.textMuted }
                  ]}>{showPassword ? Icon.eyeOff : Icon.eye}</Text>
                </TouchableOpacity>
              </View>
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
            </View>

            {/* Forgot Password */}
            <TouchableOpacity style={styles.forgotRow}>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* Sign In Button */}
            <TouchableOpacity onPress={handleSignIn} activeOpacity={0.85}>
              <LinearGradient
                colors={['#4B28E5', '#6B42FF']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={styles.signInBtn}
              >
                <Text style={styles.signInBtnText}>Sign In</Text>
                <Text style={styles.signInBtnArrow}>{Icon.arrowRight}</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Social Buttons */}
            <View style={styles.socialRow}>
              <TouchableOpacity style={styles.socialBtn}>
                <Text style={styles.socialIcon}>G</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialBtn}>
                <Text style={styles.socialIcon}>🍎</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialBtn}>
                <Text style={styles.socialIcon}>f</Text>
              </TouchableOpacity>
            </View>

            {/* Sign Up Link */}
            <View style={styles.signUpRow}>
              <Text style={styles.signUpText}>Don't have an account? </Text>
              <TouchableOpacity onPress={onGoToSignUp}>
                <Text style={styles.signUpLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1 },

  // Gradient Header
  headerGradient: {
    paddingTop: 60, paddingBottom: 50, alignItems: 'center',
    borderBottomLeftRadius: 40, borderBottomRightRadius: 40, overflow: 'hidden',
  },
  decorCircle: {
    position: 'absolute', borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  logoContainer: { alignItems: 'center', zIndex: 1 },
  logoCircle: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 12,
  },
  appName: { fontSize: 28, fontWeight: '800', color: '#FFF', letterSpacing: 1 },
  appTagline: { fontSize: 14, fontWeight: '500', color: 'rgba(255,255,255,0.75)', marginTop: 4 },

  // Form Card
  formCard: {
    marginTop: -24, marginHorizontal: 20, backgroundColor: '#FFF',
    borderRadius: 24, padding: 28,
    shadowColor: '#4B28E5', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08, shadowRadius: 24, elevation: 8,
  },
  welcomeText: { fontSize: 24, fontWeight: '800', color: theme.colors.textMain, marginBottom: 6 },
  subtitleText: { fontSize: 14, color: theme.colors.textMuted, marginBottom: 28, fontWeight: '500' },

  // Inputs
  inputGroup: { marginBottom: 20 },
  inputLabel: { fontSize: 14, fontWeight: '700', color: theme.colors.textMain, marginBottom: 10, letterSpacing: 0.2 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFFFFF', borderRadius: 14,
    borderWidth: 2, borderColor: '#D4D6E0',
    paddingHorizontal: 16, height: 56,
  },
  inputFocused: { borderColor: theme.colors.primary, borderWidth: 2.5, backgroundColor: '#FFFFFF' },
  inputError: { borderColor: '#FF3B5C', borderWidth: 2 },
  inputIcon: { marginRight: 12, fontSize: 20 },
  input: {
    flex: 1, fontSize: 16, color: theme.colors.textMain, fontWeight: '500',
    paddingVertical: 4, outlineStyle: 'none',
  } as any,
  eyeBtn: { padding: 6 },
  eyeIcon: { fontSize: 20 },
  errorText: { color: '#FF3B5C', fontSize: 12, fontWeight: '600', marginTop: 6, marginLeft: 4 },

  forgotRow: { alignSelf: 'flex-end', marginBottom: 24 },
  forgotText: { color: theme.colors.primary, fontSize: 13, fontWeight: '600' },

  // Sign In Button
  signInBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    height: 54, borderRadius: 16,
  },
  signInBtnText: { color: '#FFF', fontSize: 17, fontWeight: '700', marginRight: 8 },
  signInBtnArrow: { color: '#FFF', fontSize: 18 },

  // Divider
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 24 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#ECEDF2' },
  dividerText: { marginHorizontal: 16, color: theme.colors.textMuted, fontSize: 12, fontWeight: '600' },

  // Social Buttons
  socialRow: { flexDirection: 'row', justifyContent: 'center', gap: 16, marginBottom: 24 },
  socialBtn: {
    width: 52, height: 52, borderRadius: 16,
    backgroundColor: '#F5F6FA', borderWidth: 1, borderColor: '#ECEDF2',
    justifyContent: 'center', alignItems: 'center',
  },
  socialIcon: { fontSize: 22, fontWeight: '700' },

  // Sign Up
  signUpRow: { flexDirection: 'row', justifyContent: 'center', paddingBottom: 8 },
  signUpText: { fontSize: 14, color: theme.colors.textMuted, fontWeight: '500' },
  signUpLink: { fontSize: 14, color: theme.colors.primary, fontWeight: '700' },
});
