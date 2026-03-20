import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity,
  SafeAreaView, KeyboardAvoidingView, Platform, Animated,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';

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
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [focusedField, setFocusedField] = useState<keyof FormErrors | null>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
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

  const renderField = (
    label: string,
    icon: string,
    value: string,
    onChangeText: (t: string) => void,
    errorKey: keyof FormErrors,
    opts: {
      placeholder: string;
      keyboardType?: any;
      autoCapitalize?: any;
      isPassword?: boolean;
      showPw?: boolean;
      togglePw?: () => void;
    },
  ) => (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={[
        styles.inputWrapper,
        errors[errorKey] && styles.inputError,
        focusedField === errorKey && styles.inputFocused,
      ]}>
        <Ionicons
          name={icon as any}
          size={19}
          color={focusedField === errorKey ? theme.colors.primary : theme.colors.textMuted}
          style={styles.inputIcon}
        />
        <TextInput
          style={styles.input}
          placeholder={opts.placeholder}
          placeholderTextColor="#A0A5B1"
          value={value}
          onChangeText={(t) => { onChangeText(t); clearError(errorKey); }}
          onFocus={() => setFocusedField(errorKey)}
          onBlur={() => setFocusedField(null)}
          keyboardType={opts.keyboardType || 'default'}
          autoCapitalize={opts.autoCapitalize || 'none'}
          secureTextEntry={opts.isPassword && !opts.showPw}
        />
        {opts.isPassword && (
          <TouchableOpacity onPress={opts.togglePw} style={styles.eyeBtn}>
            <Ionicons
              name={opts.showPw ? 'eye-off-outline' : 'eye-outline'}
              size={19}
              color={focusedField === errorKey ? theme.colors.primary : theme.colors.textMuted}
            />
          </TouchableOpacity>
        )}
      </View>
      {errors[errorKey] && <Text style={styles.errorText}>{errors[errorKey]}</Text>}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          {/* Gradient Header */}
          <LinearGradient
            colors={['#3A1CD9', '#6B42FF', '#9B6DFF']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={styles.headerGradient}
          >
            <View style={[styles.decorCircle, { top: -20, right: -20, width: 100, height: 100 }]} />
            <View style={[styles.decorCircle, { bottom: -10, left: -15, width: 70, height: 70 }]} />

            <View style={styles.headerInner}>
              <View style={styles.logoCircle}>
                <Ionicons name="person-add" size={30} color="#FFF" />
              </View>
              <Text style={styles.headerTitle}>Create Account</Text>
              <Text style={styles.headerSub}>Join thousands of gig workers protected by GuideWire</Text>
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

            {renderField('Full Name', 'person-outline', fullName, setFullName, 'fullName', {
              placeholder: 'Enter your full name', autoCapitalize: 'words',
            })}
            {renderField('Email Address', 'mail-outline', email, setEmail, 'email', {
              placeholder: 'you@example.com', keyboardType: 'email-address',
            })}
            {renderField('Phone Number', 'call-outline', phone, setPhone, 'phone', {
              placeholder: '+91 XXXXX XXXXX', keyboardType: 'phone-pad',
            })}
            {renderField('Password', 'lock-closed-outline', password, setPassword, 'password', {
              placeholder: 'Min. 6 characters', isPassword: true, showPw: showPassword,
              togglePw: () => setShowPassword(!showPassword),
            })}
            {renderField('Confirm Password', 'lock-closed-outline', confirmPassword, setConfirmPassword, 'confirmPassword', {
              placeholder: 'Re-enter password', isPassword: true, showPw: showConfirm,
              togglePw: () => setShowConfirm(!showConfirm),
            })}

            {/* Create Account Button */}
            <TouchableOpacity onPress={handleSignUp} activeOpacity={0.85} style={{ marginTop: 8 }}>
              <LinearGradient
                colors={['#4B28E5', '#6B42FF']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={styles.createBtn}
              >
                <Text style={styles.createBtnText}>Create Account</Text>
                <Ionicons name="arrow-forward" size={18} color="#FFF" />
              </LinearGradient>
            </TouchableOpacity>

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
    marginTop: -20, marginHorizontal: 18, backgroundColor: '#FFF',
    borderRadius: 24, padding: 24,
    shadowColor: '#4B28E5', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06, shadowRadius: 20, elevation: 6,
  },

  // Step indicator
  stepRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24, paddingHorizontal: 4 },
  stepDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#E0E2EA' },
  stepActive: { backgroundColor: theme.colors.primary, width: 12, height: 12, borderRadius: 6 },
  stepLine: { flex: 1, height: 2, backgroundColor: '#E0E2EA', marginHorizontal: 4, maxWidth: 40 },
  stepLabel: { marginLeft: 'auto', fontSize: 12, fontWeight: '600', color: theme.colors.textMuted },

  // Inputs
  inputGroup: { marginBottom: 18 },
  inputLabel: { fontSize: 14, fontWeight: '700', color: theme.colors.textMain, marginBottom: 9, letterSpacing: 0.2 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFFFFF', borderRadius: 14,
    borderWidth: 2, borderColor: '#D4D6E0',
    paddingHorizontal: 16, height: 56,
  },
  inputFocused: { borderColor: theme.colors.primary, borderWidth: 2.5, backgroundColor: '#FFFFFF' },
  inputError: { borderColor: '#FF3B5C', borderWidth: 2 },
  inputIcon: { marginRight: 12 },
  input: {
    flex: 1, fontSize: 16, color: theme.colors.textMain, fontWeight: '500',
    paddingVertical: 4, outlineStyle: 'none',
  } as any,
  eyeBtn: { padding: 6 },
  errorText: { color: '#FF3B5C', fontSize: 12, fontWeight: '600', marginTop: 5, marginLeft: 4 },

  createBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    height: 54, borderRadius: 16,
  },
  createBtnText: { color: '#FFF', fontSize: 17, fontWeight: '700', marginRight: 8 },

  signInRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 20, paddingBottom: 4 },
  signInText: { fontSize: 14, color: theme.colors.textMuted, fontWeight: '500' },
  signInLink: { fontSize: 14, color: theme.colors.primary, fontWeight: '700' },
});
