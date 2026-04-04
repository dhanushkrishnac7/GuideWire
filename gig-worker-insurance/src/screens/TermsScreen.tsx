import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, SafeAreaView,
  ScrollView, Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme, Icon } from '../theme';

interface Props {
  onAccept: () => void;
  onDecline: () => void;
  onBack: () => void;
}

const TERMS_SECTIONS = [
  {
    title: '1. AGREEMENT TO TERMS',
    body: 'These Terms of Service constitute a legally binding agreement made between you, whether personally or on behalf of an entity ("User" or "you") and GigShield ("Company," "we," "us," or "our"). By accessing the platform, you acknowledge that you have read, understood, and agreed to be bound by all of these Terms of Service.',
  },
  {
    title: '2. DEFINITIONS',
    body: '● "Parametric Trigger": A predefined environmental or social event (e.g., Rain >50mm/hr) that automatically initiates a payout. \n● "GScore": A proprietary ML-driven reliability metric used for risk profiling. \n● "Zero-Touch": Fully automated claim processing without human intervention.',
  },
  {
    title: '3. SCOPE OF PARAMETRIC COVERAGE',
    body: 'GigShield provides automated income protection triggered exclusively by verified environmental data (Rain, Heat, AQI, Floods) and social disruptions (Curfews, Strikes). Performance is monitored within the User\'s active "Work Zone" geofence. Coverage is subject to a 2-hour cooldown period between identical trigger events.',
  },
  {
    title: '4. DYNAMIC PRICING & BILLING',
    body: 'Premiums are determined dynamically using our ML Risk Intelligence models. Billing occurs on a weekly recurring basis. Users acknowledge that premiums may fluctuate based on hyper-local risk exposure and GScore adjustments. All premium payments are final and non-refundable upon commencement of the coverage week.',
  },
  {
    title: '5. AUTOMATED CLAIMS & SETTLEMENT',
    body: 'Claims are processed via a "Zero-Touch" automated pipeline. Upon verification of a parametric trigger, funds are settled instantly via UPI. User acknowledges that payouts are subject to successful "Isolation Forest" fraud validation and identity verification.',
  },
  {
    title: '6. COMPREHENSIVE EXCLUSIONS',
    body: 'GigShield explicitly excludes coverage for any losses directly or indirectly arising from: (a) War, hostilities, or acts of foreign enemies; (b) Ionizing radiation or contamination by radioactivity; (c) Sovereign acts including nationalization, confiscation or requisition; (d) Intentional fraud, GPS spoofing, or criminal conduct; (e) Use of intoxicating liquor or prohibited substances; and (f) Any loss covered by separate Health, Life, or Personal Accident insurance.',
  },
  {
    title: '7. DATA PRIVACY & SECURITY',
    body: 'We adhere to a "Privacy-First" model under the Digital Personal Data Protection Act of India. We collect only necessary telemetry (Identity, Fleet, Geofence presence). Your data is encrypted and never sold to third-party advertisers.',
  },
  {
    title: '8. LIMITATION OF LIABILITY',
    body: 'To the maximum extent permitted by law, GigShield\'s liability is capped at 5x the weekly premium paid. We are not liable for consequential damages, platform downtime due to external server failures, or inaccuracies in third-party meteorological data.',
  },
  {
    title: '9. GOVERNING LAW & JURISDICTION',
    body: 'These Terms shall be governed by and defined following the laws of India. Any disputes arising shall be subject to the exclusive jurisdiction of the courts in Bangalore, Karnataka.',
  },
  {
    title: '10. MODIFICATIONS & SEVERABILITY',
    body: 'We reserve the right to modify these terms at any time. If any part of these terms is found to be unenforceable, the remainder shall continue in full force and effect.',
  },
];

export default function TermsScreen({ onAccept, onDecline, onBack }: Props) {
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
        colors={['#1A1B4B', '#2D2E7A']}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={[styles.decorCircle, { bottom: -10, left: -10, width: 70, height: 70 }]} />
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <Text style={styles.backIcon}>{Icon.back}</Text>
          </TouchableOpacity>
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
              <Text style={styles.termsHeaderIcon}>{Icon.document}</Text>
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
              <Text style={styles.contactIcon}>{Icon.mail}</Text>
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
            {agreed && <Text style={styles.checkmark}>{Icon.check}</Text>}
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
              colors={agreed ? ['#1A1B4B', '#2D2E7A'] : ['#C4C6CE', '#C4C6CE']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.acceptBtn}
            >
              <Text style={styles.acceptBtnText}>Accept & Continue</Text>
              <Text style={styles.acceptBtnIcon}>{Icon.checkCircle}</Text>
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
  backBtn: { marginBottom: 12, alignSelf: 'flex-start', padding: 4 },
  backIcon: { fontSize: 22, color: '#FFF' },
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
  termsHeaderIcon: { fontSize: 22, color: theme.colors.primary },
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
  contactIcon: { fontSize: 18, color: theme.colors.primary },
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
  checkmark: { fontSize: 20, color: '#FFF', fontWeight: '700' },
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
  acceptBtnIcon: { color: '#FFF', fontSize: 18 },
});
