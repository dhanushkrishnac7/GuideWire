import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, Animated, Switch
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';

interface Props {
  onNavigate: (screen: string) => void;
}

type ThreatType = 'None' | 'Spoofing' | 'MultiApp' | 'GhostRiding' | 'LowActivity';

export default function AIFraudEngineScreen({ onNavigate }: Props) {
  // Injectable Risk Signatures
  const [spoofing, setSpoofing] = useState(false);
  const [multiApp, setMultiApp] = useState(false);
  const [ghostRiding, setGhostRiding] = useState(false);
  const [lowActivity, setLowActivity] = useState(false);

  // Pipeline State
  const [engineState, setEngineState] = useState<'idle' | 'ingesting' | 'analyzing' | 'complete'>('idle');
  const [detectedThreat, setDetectedThreat] = useState<ThreatType>('None');

  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Run the AI Pipeline
  const runEngine = () => {
    setEngineState('ingesting');
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();

    // Stage 1: Data Ingestion
    setTimeout(() => {
      setEngineState('analyzing');
    }, 1500);

    // Stage 2: Synthesis and Threat Classification
    setTimeout(() => {
      let threat: ThreatType = 'None';
      if (spoofing) threat = 'Spoofing';
      else if (multiApp) threat = 'MultiApp';
      else if (ghostRiding) threat = 'GhostRiding';
      else if (lowActivity) threat = 'LowActivity';

      setDetectedThreat(threat);
      setEngineState('complete');
    }, 3500);
  };

  const resetEngine = () => {
    setEngineState('idle');
    setSpoofing(false);
    setMultiApp(false);
    setGhostRiding(false);
    setLowActivity(false);
    setDetectedThreat('None');
    fadeAnim.setValue(0);
  };

  // Threat Card Data Mapping
  const threatDetails = {
    Spoofing: {
      title: 'Location Spoofing Detected',
      desc: 'Kinematic anomaly identified. Speed spikes violate street physics and local BSSID signatures contradict GPS telemetry.',
      icon: 'location',
      color: '#E8472A'
    },
    MultiApp: {
      title: 'Multi-App Harvesting Prevented',
      desc: 'Deduplication triggered. UPI VPA and e-Shram identity already registered an active claim under an overlapping rain event radius.',
      icon: 'copy',
      color: '#FF7A45'
    },
    GhostRiding: {
      title: 'Ghost Riding Identified',
      desc: 'Automated tapping suspected. Sensor Fusion analysis shows complete lack of correlated IMU (accelerometer/gyroscope) vibrations expected on a two-wheeler.',
      icon: 'phone-portrait',
      color: '#9B6DFF'
    },
    LowActivity: {
      title: 'Activity Manipulation Flagged',
      desc: 'Algorithmic tiering rejection. Worker has tracked fewer than 5 active delivery days in the rolling 30-day window.',
      icon: 'calendar',
      color: '#A06000'
    },
    None: {
      title: 'Pipeline Clear',
      desc: 'No adversarial signatures detected. Telemetry passes all risk thresholds.',
      icon: 'shield-checkmark',
      color: theme.colors.success
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.headerTitle}>AI Security Engine</Text>
        <View style={styles.livePill}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>SYSTEM ONLINE</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.sectionDesc}>
          Inject real-time risk signatures to test the parametric zero-touch fraud pipeline.
        </Text>

        {engineState === 'idle' && (
          <View style={styles.signatureContainer}>
            <Text style={styles.sectionTitle}>INJECT RISK SIGNATURES</Text>

            {/* Signature 1: Spoofing */}
            <View style={styles.signatureCard}>
              <View style={styles.sigHeader}>
                <Ionicons name="location" size={20} color={theme.colors.primary} />
                <Text style={styles.sigTitle}>Kinematic & RF Anomaly</Text>
                <Switch value={spoofing} onValueChange={setSpoofing} trackColor={{ false: '#E0E2EA', true: '#E8472A' }} />
              </View>
              <Text style={styles.sigDesc}>Simulates fake GPS software via mismatched Wi-Fi BSSID and unnatural movement vectors.</Text>
            </View>

            {/* Signature 2: Multi-App */}
            <View style={styles.signatureCard}>
              <View style={styles.sigHeader}>
                <Ionicons name="copy" size={20} color={theme.colors.primary} />
                <Text style={styles.sigTitle}>Deduplication Collision</Text>
                <Switch value={multiApp} onValueChange={setMultiApp} trackColor={{ false: '#E0E2EA', true: '#FF7A45' }} />
              </View>
              <Text style={styles.sigDesc}>Simulates a claim arriving from a worker logged into multiple delivery platforms concurrently.</Text>
            </View>

            {/* Signature 3: Ghost Riding */}
            <View style={styles.signatureCard}>
              <View style={styles.sigHeader}>
                <Ionicons name="phone-portrait" size={20} color={theme.colors.primary} />
                <Text style={styles.sigTitle}>IMU Sensor Override</Text>
                <Switch value={ghostRiding} onValueChange={setGhostRiding} trackColor={{ false: '#E0E2EA', true: '#9B6DFF' }} />
              </View>
              <Text style={styles.sigDesc}>Simulates stationary device operating via automated script tapper. Mutes accelerometer variance.</Text>
            </View>

            {/* Signature 4: Activity Manipulation */}
            <View style={styles.signatureCard}>
              <View style={styles.sigHeader}>
                <Ionicons name="calendar" size={20} color={theme.colors.primary} />
                <Text style={styles.sigTitle}>Restrict Activity Graph</Text>
                <Switch value={lowActivity} onValueChange={setLowActivity} trackColor={{ false: '#E0E2EA', true: '#A06000' }} />
              </View>
              <Text style={styles.sigDesc}>Forces algorithmic activity tiering check to fail by mocking {"< 5"} active days in last month.</Text>
            </View>

            <TouchableOpacity style={styles.runEngineBtn} onPress={runEngine}>
              <Text style={styles.runEngineText}>Analyze Pipeline Telemetry</Text>
              <Ionicons name="analytics" size={18} color="#FFF" />
            </TouchableOpacity>
          </View>
        )}

        {(engineState !== 'idle') && (
          <Animated.View style={[{ opacity: fadeAnim, marginHorizontal: 20 }]}>
            <Text style={styles.sectionTitle}>AI PIPELINE EXECUTION</Text>

            <View style={styles.pipelineCard}>
              <View style={styles.pipelineStep}>
                <Ionicons name={engineState === 'ingesting' ? 'reload' : 'checkmark-circle'} size={24} color={engineState === 'ingesting' ? '#E0E2EA' : theme.colors.success} style={engineState === 'ingesting' && styles.spin} />
                <View style={styles.stepBody}>
                  <Text style={styles.stepTitle}>Ingesting Device Telemetry</Text>
                  {engineState === 'ingesting' ? <Text style={styles.stepSub}>Running sensor fusion baseline...</Text> : <Text style={styles.stepSub}>Payload captured 12.4kb</Text>}
                </View>
              </View>

              <View style={styles.pipelineConnector} />

              <View style={styles.pipelineStep}>
                <Ionicons name={engineState === 'ingesting' ? 'ellipse-outline' : (engineState === 'analyzing' ? 'reload' : 'checkmark-circle')} size={24} color={engineState === 'ingesting' ? '#E0E2EA' : (engineState === 'analyzing' ? '#FF7A45' : theme.colors.success)} />
                <View style={styles.stepBody}>
                  <Text style={[styles.stepTitle, engineState === 'ingesting' && { color: theme.colors.textMuted }]}>Isolation Forest Modeling</Text>
                  {engineState === 'analyzing' && <Text style={styles.stepSub}>Calculating kinematic anomalies...</Text>}
                  {engineState === 'complete' && <Text style={styles.stepSub}>Risk confidence scored</Text>}
                </View>
              </View>

              <View style={styles.pipelineConnector} />

              <View style={styles.pipelineStep}>
                <Ionicons name={engineState === 'complete' ? (detectedThreat === 'None' ? 'checkmark-circle' : 'warning') : 'ellipse-outline'} size={24} color={engineState === 'complete' ? (detectedThreat === 'None' ? theme.colors.success : '#E8472A') : '#E0E2EA'} />
                <View style={styles.stepBody}>
                  <Text style={[styles.stepTitle, engineState !== 'complete' && { color: theme.colors.textMuted }]}>Deduplication & Tiering</Text>
                  {engineState === 'complete' && <Text style={styles.stepSub}>Cross-referenced identity ledger</Text>}
                </View>
              </View>
            </View>

            {engineState === 'complete' && (
              <View style={[styles.resultCard, { borderColor: threatDetails[detectedThreat].color }]}>
                <View style={styles.resultHeader}>
                  <View style={[styles.resultIconBox, { backgroundColor: threatDetails[detectedThreat].color }]}>
                    <Ionicons name={threatDetails[detectedThreat].icon as any} size={28} color="#FFF" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.resultTitle, { color: threatDetails[detectedThreat].color }]}>{threatDetails[detectedThreat].title}</Text>
                    <Text style={styles.resultSub}>Confidence: 99.4% • Action: {detectedThreat === 'None' ? 'PROCEED' : 'HALT'}</Text>
                  </View>
                </View>
                <Text style={styles.resultDescText}>{threatDetails[detectedThreat].desc}</Text>

                <TouchableOpacity style={styles.resetBtn} onPress={resetEngine}>
                  <Text style={styles.resetBtnText}>Clear Pipeline & Reload</Text>
                </TouchableOpacity>
              </View>
            )}

          </Animated.View>
        )}

      <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F1F5' },
  topBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16, backgroundColor: '#F0F1F5'
  },
  headerTitle: { fontSize: 20, fontWeight: '900', color: theme.colors.primary },
  livePill: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E8F8F0', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, gap: 6 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: theme.colors.success },
  liveText: { fontSize: 10, fontWeight: '800', color: theme.colors.success },
  
  scroll: { paddingTop: 10 },
  sectionDesc: { marginHorizontal: 20, fontSize: 13, color: theme.colors.textSub, lineHeight: 20, marginBottom: 20 },
  sectionTitle: { fontSize: 11, fontWeight: '800', color: theme.colors.textMuted, letterSpacing: 1.5, marginBottom: 12 },

  signatureContainer: { marginHorizontal: 20 },
  signatureCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 1 },
  sigHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  sigTitle: { flex: 1, fontSize: 15, fontWeight: '800', color: theme.colors.primary },
  sigDesc: { fontSize: 12, color: theme.colors.textSub, lineHeight: 18 },

  runEngineBtn: { flexDirection: 'row', backgroundColor: theme.colors.primary, paddingVertical: 18, borderRadius: 16, alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 12 },
  runEngineText: { color: '#FFF', fontSize: 15, fontWeight: '800' },

  pipelineCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 24, marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  pipelineStep: { flexDirection: 'row', alignItems: 'flex-start', gap: 16 },
  stepBody: { flex: 1, marginTop: 2 },
  stepTitle: { fontSize: 15, fontWeight: '800', color: theme.colors.primary, marginBottom: 4 },
  stepSub: { fontSize: 12, color: theme.colors.textSub },
  pipelineConnector: { width: 2, height: 24, backgroundColor: '#E0E2EA', marginLeft: 11, marginVertical: 4 },
  spin: { transform: [{ rotate: '45deg' }] }, // simple mock rotation

  resultCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 20, borderWidth: 2, borderStyle: 'solid', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
  resultHeader: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 16 },
  resultIconBox: { width: 52, height: 52, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  resultTitle: { fontSize: 16, fontWeight: '900', marginBottom: 4 },
  resultSub: { fontSize: 11, fontWeight: '700', color: theme.colors.textMuted },
  resultDescText: { fontSize: 14, color: theme.colors.textSub, lineHeight: 22, marginBottom: 24 },

  resetBtn: { backgroundColor: 'rgba(26,27,75,0.05)', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  resetBtnText: { color: theme.colors.primary, fontSize: 13, fontWeight: '800' }
});
