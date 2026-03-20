import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, SafeAreaView,
  ScrollView, Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../theme';

interface Props {
  onAccept: () => void;
  onDecline: () => void;
}

const TERMS_SECTIONS = [
  {
    title: '1. Acceptance of Terms',
    body: 'By creating an account and using GuideWire services, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree with any part of these terms, you may not use our services.',
  },
  {
    title: '2. Insurance Coverage',
    body: 'GuideWire provides parametric weather-based insurance for gig workers. Coverage is automatically triggered when predefined weather conditions (temperature, rainfall, wind speed) exceed configured thresholds at your registered location. Payouts are processed automatically within 24–48 hours of a qualifying event.',
  },
  {
    title: '3. Location Data Usage',
    body: 'We collect and use your location data solely for the purpose of determining weather conditions at your work area and triggering eligible insurance payouts. Your location data is encrypted and stored securely. We do not sell or share your location data with third parties for advertising purposes.',
  },
  {
    title: '4. Premium Payments',
    body: 'Policy premiums are charged on a per-day or monthly basis depending on your selected plan. Premiums are non-refundable once coverage has been activated for a given period. Failure to pay premiums on time may result in a lapse of coverage.',
  },
  {
    title: '5. Claims & Payouts',
    body: 'Claims are automatically evaluated and processed based on verified weather data from our partner meteorological services. You will receive notifications about qualifying events and payout status. Disputes regarding payouts can be submitted through the app within 30 days of the event.',
  },
  {
    title: '6. Privacy Policy',
    body: 'We collect personal information (name, email, phone number, location) to provide our insurance services. Your data is protected using industry-standard encryption. You may request deletion of your data at any time by contacting support. We comply with applicable data protection regulations including GDPR and India\'s Digital Personal Data Protection Act.',
  },
  {
    title: '7. Account Termination',
    body: 'You may terminate your account at any time through the app settings. GuideWire reserves the right to suspend or terminate accounts that violate these terms, engage in fraudulent activity, or misuse the platform.',
  },
  {
    title: '8. Limitation of Liability',
    body: 'GuideWire\'s liability is limited to the coverage amount specified in your active policy. We are not liable for indirect, incidental, or consequential damages arising from the use of our services.',
  },
  {
    title: '9. Changes to Terms',
    body: 'We may update these terms from time to time. You will be notified of material changes via email or in-app notification. Continued use of the service after changes constitutes acceptance of the updated terms.',
  },
];

export default function TermsScreen({ onAccept, onDecline }: Props) {
  const [agreed, setAgreed] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const checkScale = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  const toggleAgree = () => {
    const next = !agreed;
    setAgreed(next);
    Animated.spring(checkScale, {
      toValue: next ? 1 : 0.5,
      tension: 200, friction: 10, useNativeDriver: true,
    }).start();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#3A1CD9', '#6B42FF']}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={[styles.decorCircle, { bottom: -10, left: -10, width: 70, height: 70 }]} />
        <View style={styles.headerContent}>
          <View style={styles.stepRow}>
            <View style={[styles.stepDot, styles.stepDone]} />
            <View style={[styles.stepLine, styles.stepLineDone]} />
            <View style={[styles.stepDot, styles.stepDone]} />
            <View style={[styles.stepLine, styles.stepLineDone]} />
            <View style={[styles.stepDot, styles.stepActive]} />
            <Text style={styles.stepLabel}>Step 3 of 3</Text>
          </View>
          <Text style={styles.headerTitle}>📋 Terms & Policy</Text>
          <Text style={styles.headerSub}>Please review and accept to continue</Text>
        </View>
      </LinearGradient>

      {/* Terms Content */}
      <Animated.View style={[styles.scrollWrapper, { opacity: fadeAnim }]}>
        <ScrollView
          style={styles.termsScroll}
          contentContainerStyle={styles.termsContent}
          showsVerticalScrollIndicator={true}
        >
          <View style={styles.termsCard}>
            <View style={styles.termsHeaderRow}>
              <MaterialCommunityIcons name="file-document-outline" size={22} color={theme.colors.primary} />
              <Text style={styles.termsMainTitle}>Terms of Service & Privacy Policy</Text>
            </View>
            <Text style={styles.termsDate}>Last updated: March 2026</Text>

            {TERMS_SECTIONS.map((section, index) => (
              <View key={index} style={styles.sectionBlock}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
                <Text style={styles.sectionBody}>{section.body}</Text>
              </View>
            ))}

            <View style={styles.contactBox}>
              <Ionicons name="mail-outline" size={18} color={theme.colors.primary} />
              <Text style={styles.contactText}>
                Questions? Contact us at support@guidewire-gig.com
              </Text>
            </View>
          </View>
        </ScrollView>
      </Animated.View>

      {/* Bottom Agreement */}
      <View style={styles.bottomBar}>
        {/* Checkbox */}
        <TouchableOpacity style={styles.checkRow} onPress={toggleAgree} activeOpacity={0.7}>
          <Animated.View style={[
            styles.checkbox,
            agreed ? styles.checkboxChecked : styles.checkboxUnchecked,
            { transform: [{ scale: checkScale }] },
          ]}>
            {agreed && <Ionicons name="checkmark-sharp" size={20} color="#FFF" />}
          </Animated.View>
          <View style={{ flex: 1 }}>
            <Text style={styles.checkLabel}>
              I have read and agree to the{' '}
              <Text style={styles.linkText}>Terms of Service</Text> and{' '}
              <Text style={styles.linkText}>Privacy Policy</Text>
            </Text>
            {!agreed && <Text style={styles.checkHint}>Tap the checkbox to proceed</Text>}
          </View>
        </TouchableOpacity>

        {/* Buttons */}
        <View style={styles.btnRow}>
          <TouchableOpacity style={styles.declineBtn} onPress={onDecline} activeOpacity={0.7}>
            <Text style={styles.declineBtnText}>Decline</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={agreed ? onAccept : undefined}
            activeOpacity={agreed ? 0.85 : 1}
            style={{ flex: 1.5 }}
          >
            <LinearGradient
              colors={agreed ? ['#4B28E5', '#6B42FF'] : ['#C4C6CE', '#C4C6CE']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.acceptBtn}
            >
              <Text style={styles.acceptBtnText}>Accept & Continue</Text>
              <Ionicons name="checkmark-circle" size={18} color="#FFF" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  decorCircle: { position: 'absolute', borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.08)' },

  header: {
    paddingTop: 50, paddingBottom: 24, paddingHorizontal: 24,
    borderBottomLeftRadius: 32, borderBottomRightRadius: 32, overflow: 'hidden',
  },
  headerContent: { zIndex: 1 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#FFF', marginBottom: 6 },
  headerSub: { fontSize: 13, fontWeight: '500', color: 'rgba(255,255,255,0.7)' },

  // Step indicator
  stepRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  stepDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: 'rgba(255,255,255,0.3)' },
  stepActive: { backgroundColor: '#FFF', width: 12, height: 12, borderRadius: 6 },
  stepDone: { backgroundColor: '#4CD964', width: 12, height: 12, borderRadius: 6 },
  stepLine: { width: 32, height: 2, backgroundColor: 'rgba(255,255,255,0.2)', marginHorizontal: 4 },
  stepLineDone: { backgroundColor: '#4CD964' },
  stepLabel: { marginLeft: 'auto', fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.7)' },

  // Terms scroll
  scrollWrapper: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },
  termsScroll: { flex: 1 },
  termsContent: { paddingBottom: 16 },
  termsCard: {
    backgroundColor: '#FFF', borderRadius: 20, padding: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04, shadowRadius: 10, elevation: 3,
  },
  termsHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  termsMainTitle: { fontSize: 17, fontWeight: '700', color: theme.colors.textMain, marginLeft: 10 },
  termsDate: { fontSize: 12, color: theme.colors.textMuted, marginBottom: 20, fontWeight: '500' },

  sectionBlock: { marginBottom: 20 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: theme.colors.textMain, marginBottom: 8 },
  sectionBody: { fontSize: 13, color: theme.colors.textMuted, lineHeight: 20, fontWeight: '400' },

  contactBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F0EDFF', borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 14, marginTop: 8,
  },
  contactText: { fontSize: 13, color: theme.colors.primary, fontWeight: '500', marginLeft: 10, flex: 1 },

  // Bottom bar
  bottomBar: {
    backgroundColor: '#FFF', paddingHorizontal: 20, paddingVertical: 16,
    borderTopWidth: 1, borderTopColor: '#F0F1F5',
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.03, shadowRadius: 8, elevation: 5,
  },
  checkRow: {
    flexDirection: 'row', alignItems: 'center', marginBottom: 18,
    backgroundColor: '#EEF0FF', borderRadius: 16,
    paddingHorizontal: 16, paddingVertical: 18,
    borderWidth: 2, borderColor: '#D7D9FF',
    shadowColor: theme.colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05, shadowRadius: 10, elevation: 2,
  },
  checkbox: {
    width: 28, height: 28, borderRadius: 8,
    justifyContent: 'center', alignItems: 'center', marginRight: 14,
  },
  checkboxUnchecked: {
    borderWidth: 3, borderColor: '#9B8AE8',
    backgroundColor: '#FFF',
  },
  checkboxChecked: {
    backgroundColor: '#4B28E5', borderWidth: 3, borderColor: '#4B28E5',
  },
  checkLabel: { fontSize: 14, color: theme.colors.textMain, lineHeight: 21, fontWeight: '600' },
  checkHint: { fontSize: 11, color: theme.colors.primary, marginTop: 3, fontWeight: '500' },
  linkText: { color: theme.colors.primary, fontWeight: '700', textDecorationLine: 'underline' },

  btnRow: { flexDirection: 'row', gap: 12 },
  declineBtn: {
    flex: 1, height: 50, borderRadius: 14,
    borderWidth: 1.5, borderColor: '#E0E2EA',
    justifyContent: 'center', alignItems: 'center',
  },
  declineBtnText: { fontSize: 15, fontWeight: '600', color: theme.colors.textMuted },
  acceptBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    height: 50, borderRadius: 14,
  },
  acceptBtnText: { color: '#FFF', fontSize: 15, fontWeight: '700', marginRight: 8 },
});
