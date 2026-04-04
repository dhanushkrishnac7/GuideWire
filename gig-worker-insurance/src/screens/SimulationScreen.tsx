import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, Animated, Switch
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';
import { usePayouts, SimulatedTrigger } from '../contexts/PayoutContext';

interface Props {
  zone: string;
  onNavigate: (screen: string) => void;
}

export default function SimulationScreen({ zone, onNavigate }: Props) {
  // Environmental Inputs
  const [rain, setRain] = useState(10); // mm/hr
  const [temp, setTemp] = useState(30); // C
  const [aqi, setAqi] = useState(80); // index
  const [floodAlert, setFloodAlert] = useState<'None' | 'Alert' | 'Critical'>('None');
  const [strike, setStrike] = useState<'Low' | 'High'>('Low');

  // Fraud / Device Telemetry
  const [gpsSpoofed, setGpsSpoofed] = useState(false);

  // Flow State
  const [simState, setSimState] = useState<'form' | 'detecting' | 'verifying' | 'authenticating' | 'success' | 'blocked' | 'no_trigger'>('form');
  const [fadeAnim] = useState(new Animated.Value(0));
  const [logs, setLogs] = useState<string[]>([]);
  const [showUnderTheHood, setShowUnderTheHood] = useState(false);

  const { addPayout, setActiveTriggers, clearSimulation } = usePayouts();
  const [pendingTriggers, setPendingTriggers] = useState<SimulatedTrigger[]>([]);

  const runSimulation = () => {
    // Determine which triggers are active based on values
    const newTriggers: SimulatedTrigger[] = [];

    if (rain >= 50) {
      newTriggers.push({ id: 'rain', type: 'rain', label: 'Rain Alert', sub: `${rain}mm/hr intensity detected in ${zone}.`, payout: 350, color: '#1A1B4B', icon: 'rainy' });
    }
    if (temp >= 45) {
      newTriggers.push({ id: 'heat', type: 'heat', label: 'Heat Warning', sub: `${temp}°C extreme heat reported.`, payout: 200, color: '#FF7A45', icon: 'sunny' });
    }
    if (aqi >= 300) {
      newTriggers.push({ id: 'aqi', type: 'aqi', label: 'Severe AQI', sub: `Air Quality Index hit ${aqi}. Hazardous.`, payout: 150, color: '#A06000', icon: 'cloud' });
    }
    if (floodAlert === 'Critical') {
      newTriggers.push({ id: 'flood', type: 'flood', label: 'IMD Red Alert Flood', sub: 'Severe waterlogging and flood warnings active.', payout: 500, color: '#E8472A', icon: 'water' });
    }
    if (strike === 'High') {
      newTriggers.push({ id: 'strike', type: 'strike', label: 'Local Strike Downtime', sub: 'Disruptive strike activity affecting zones.', payout: 250, color: '#9B6DFF', icon: 'warning' });
    }

    if (newTriggers.length === 0) {
      setSimState('no_trigger');
      setActiveTriggers([]);
      return;
    }

    setPendingTriggers(newTriggers);
    setSimState('detecting');
    setLogs([
      '[SYS] Init Parametric Oracle Engine...', 
      '[API] Fetching real-time IMD data grid...'
    ]);
    Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start();

    // Stage 1: Detecting
    setTimeout(() => {
      setSimState('verifying'); // Validating Environmental Data
      setLogs(prev => [...prev, 
        '[ML] Passing input grid to Random Forest model...', 
        '[ML] Threshold exceeded. Output score: 98.4%'
      ]);
    }, 1500);

    // Stage 2: Authentication / Anti-Fraud
    setTimeout(() => {
      setSimState('authenticating');
      setLogs(prev => [...prev, 
        '[API] Fetching Device Telemetry & Biometrics...', 
        '[ML] Running Isolation Forest for GPS anomalies...'
      ]);
    }, 3000);

    // Stage 3: Success or Blocked
    setTimeout(() => {
      if (gpsSpoofed) {
        setSimState('blocked');
        setLogs(prev => [...prev, 
          '[WARN] Anomaly Detected! Isolation score: -0.85.', 
          '[SEC] Spoofing matched known mock-location patterns.',
          '[SEC] Transaction pipeline permanently HALTED.'
        ]);
      } else {
        setSimState('success');
        setLogs(prev => [...prev, 
          '[OK] Telemetry clean. Zero anomalies found.', 
          '[SYS] Handing off to Zero-Touch Settlement contract...'
        ]);
        setActiveTriggers(newTriggers);
        // Process payouts
        newTriggers.forEach(t => {
          addPayout(t.payout, t.type, t.label);
        });
      }
    }, 5000);
  };

  const resetForm = () => {
    setSimState('form');
    setRain(10);
    setTemp(30);
    setAqi(80);
    setFloodAlert('None');
    setStrike('Low');
    setGpsSpoofed(false);
    setLogs([]);
    setShowUnderTheHood(false);
    fadeAnim.setValue(0);
  };

  if (simState === 'form' || simState === 'no_trigger') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.topBar}>
          <Text style={styles.formTitle}>Mock Environment Data</Text>
          <TouchableOpacity onPress={() => clearSimulation()}>
            <Text style={{ color: theme.colors.primary, fontWeight: '700', fontSize: 13 }}>Reset State</Text>
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={styles.scroll}>

          <Text style={styles.inputExplain}>Adjust environmental values to simulate real-time AI API integrations. Payouts trigger if thresholds are met.</Text>

          {simState === 'no_trigger' && (
            <View style={styles.noTriggerBanner}>
              <Ionicons name="alert-circle" size={18} color="#FF7A45" />
              <Text style={styles.noTriggerTxt}>No thresholds were met by the current values. Try increasing the values to see a payout sequence.</Text>
            </View>
          )}

          {/* Rain */}
          <View style={styles.inputCard}>
            <View style={styles.inputHeader}>
              <Ionicons name="rainy" size={20} color="#1A1B4B" />
              <Text style={styles.inputLabel}>Rainfall Intensity (mm/hr)</Text>
              <Text style={styles.reqBadge}>Trigger: {'>'}50</Text>
            </View>
            <View style={styles.sliderRow}>
              <Text style={styles.valText}>{rain}</Text>
              <View style={styles.mockSlider}>
                <TouchableOpacity style={styles.mockBtn} onPress={() => setRain(Math.max(0, rain - 10))}><Ionicons name="remove" size={20} color={theme.colors.textSub} /></TouchableOpacity>
                <View style={styles.sliderTrack}><View style={[styles.sliderFill, { width: `${Math.min(100, (rain / 150) * 100)}%`, backgroundColor: '#1A1B4B' }]} /></View>
                <TouchableOpacity style={styles.mockBtn} onPress={() => setRain(Math.min(150, rain + 10))}><Ionicons name="add" size={20} color={theme.colors.textSub} /></TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Heat */}
          <View style={styles.inputCard}>
            <View style={styles.inputHeader}>
              <Ionicons name="sunny" size={20} color="#FF7A45" />
              <Text style={styles.inputLabel}>Temperature (°C)</Text>
              <Text style={styles.reqBadge}>Trigger: {'>'}45</Text>
            </View>
            <View style={styles.sliderRow}>
              <Text style={styles.valText}>{temp}</Text>
              <View style={styles.mockSlider}>
                <TouchableOpacity style={styles.mockBtn} onPress={() => setTemp(Math.max(10, temp - 2))}><Ionicons name="remove" size={20} color={theme.colors.textSub} /></TouchableOpacity>
                <View style={styles.sliderTrack}><View style={[styles.sliderFill, { width: `${Math.min(100, ((temp - 10) / 45) * 100)}%`, backgroundColor: '#FF7A45' }]} /></View>
                <TouchableOpacity style={styles.mockBtn} onPress={() => setTemp(Math.min(60, temp + 2))}><Ionicons name="add" size={20} color={theme.colors.textSub} /></TouchableOpacity>
              </View>
            </View>
          </View>

          {/* AQI */}
          <View style={styles.inputCard}>
            <View style={styles.inputHeader}>
              <Ionicons name="cloud" size={20} color="#A06000" />
              <Text style={styles.inputLabel}>AQI Level</Text>
              <Text style={styles.reqBadge}>Trigger: {'>'}300</Text>
            </View>
            <View style={styles.sliderRow}>
              <Text style={styles.valText}>{aqi}</Text>
              <View style={styles.mockSlider}>
                <TouchableOpacity style={styles.mockBtn} onPress={() => setAqi(Math.max(0, aqi - 20))}><Ionicons name="remove" size={20} color={theme.colors.textSub} /></TouchableOpacity>
                <View style={styles.sliderTrack}><View style={[styles.sliderFill, { width: `${Math.min(100, (aqi / 500) * 100)}%`, backgroundColor: '#A06000' }]} /></View>
                <TouchableOpacity style={styles.mockBtn} onPress={() => setAqi(Math.min(500, aqi + 20))}><Ionicons name="add" size={20} color={theme.colors.textSub} /></TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Flood */}
          <View style={styles.inputCard}>
            <View style={styles.inputHeader}>
              <Ionicons name="water" size={20} color="#E8472A" />
              <Text style={styles.inputLabel}>Flood Alert Level</Text>
              <Text style={styles.reqBadge}>Trigger: Critical</Text>
            </View>
            <View style={styles.segmentedControl}>
              {['None', 'Alert', 'Critical'].map(opt => (
                <TouchableOpacity key={opt} style={[styles.segmentBtn, floodAlert === opt && styles.segmentBtnActive]} onPress={() => setFloodAlert(opt as any)}>
                  <Text style={[styles.segmentTxt, floodAlert === opt && styles.segmentTxtActive]}>{opt}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Strike */}
          <View style={styles.inputCard}>
            <View style={styles.inputHeader}>
              <Ionicons name="warning" size={20} color="#9B6DFF" />
              <Text style={styles.inputLabel}>Local Strike Status</Text>
              <Text style={styles.reqBadge}>Trigger: High</Text>
            </View>
            <View style={styles.segmentedControl}>
              {['Low', 'High'].map(opt => (
                <TouchableOpacity key={opt} style={[styles.segmentBtn, strike === opt && styles.segmentBtnActive]} onPress={() => setStrike(opt as any)}>
                  <Text style={[styles.segmentTxt, strike === opt && styles.segmentTxtActive]}>{opt}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <Text style={[styles.inputExplain, { marginTop: 10 }]}>Adversarial Defense: Device Telemetry Simulation</Text>

          <TouchableOpacity style={[styles.inputCard, { flexDirection: 'row', alignItems: 'center' }]} onPress={() => setGpsSpoofed(!gpsSpoofed)} activeOpacity={0.8}>
            <View style={[styles.checkbox, gpsSpoofed && styles.checkboxActive]}>
              {gpsSpoofed && <Ionicons name="checkmark" size={14} color="#FFF" />}
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[styles.inputLabel, { color: gpsSpoofed ? '#E8472A' : theme.colors.textMain }]}>Simulate GPS Spoofing</Text>
              <Text style={styles.segmentTxt}>Fails transaction in the verification pipeline using Isolation Forest Anomaly Detection.</Text>
            </View>
            <Ionicons name="location" size={24} color={gpsSpoofed ? '#E8472A' : theme.colors.border} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.runSimBtn} onPress={runSimulation}>
            <Text style={styles.runSimText}>Execute Zero-Touch Flow</Text>
            <Ionicons name="play" size={16} color="#FFF" />
          </TouchableOpacity>
          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Verification & Success Flow
  const totalSimPayout = pendingTriggers.reduce((sum, t) => sum + t.payout, 0);

  return (
    <SafeAreaView style={styles.container}>
      {/* Top bar matching Figma Screen 4 */}
      <View style={styles.topBarVerify}>
        <View style={styles.topLeft}>
          <TouchableOpacity onPress={() => onNavigate('Profile')}>
            <View style={styles.avatarCircle}>
              <Ionicons name="person" size={20} color="#FFF" />
            </View>
          </TouchableOpacity>
          <View style={styles.locationWrap}>
            <Text style={styles.locationZoneLabel}>ZONE</Text>
            <Text style={styles.locationCity}>BENGALURU SOUTH</Text>
          </View>
        </View>
        <View style={styles.protectedPill}>
          <View style={styles.activeDot} />
          <Text style={styles.protectedText}>COVERAGE ACTIVE</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollVerify} showsVerticalScrollIndicator={false}>

        {/* Detection Cards */}
        <Animated.View style={[{ opacity: fadeAnim }]}>
          {pendingTriggers.map(t => (
            <View key={t.id} style={styles.detectionCard}>
              <View style={[styles.detectionIconBox, { backgroundColor: t.color }]}>
                <Ionicons name={t.icon as any} size={24} color="#FFF" />
              </View>
              <View style={styles.detectionBody}>
                <Text style={styles.detectionTitle}>{t.label} Detected</Text>
                <Text style={styles.detectionSub}>{t.sub}</Text>
              </View>
            </View>
          ))}
        </Animated.View>

        {/* Verification Title */}
        <Text style={styles.sectionTitle}>PARAMETRIC VERIFICATION PIPELINE</Text>

        {/* Verification Steps */}
        <View style={styles.verificationList}>
          {/* Step 1 */}
          <View style={styles.verifyStep}>
            <Ionicons name={simState === 'detecting' ? "ellipse-outline" : "checkmark-circle"} size={22} color={simState === 'detecting' ? "#E0E2EA" : theme.colors.primary} />
            <Text style={[styles.verifyText, simState === 'detecting' && { color: theme.colors.textMuted }]}>Environmental Data Validated (Random Forest)</Text>
            {simState !== 'detecting' && <Text style={styles.verifyTime}>0.012s</Text>}
          </View>

          {/* Step 2 - Anti Fraud */}
          <View style={styles.verifyStep}>
            <Ionicons name={(simState === 'detecting' || simState === 'verifying') ? "ellipse-outline" : (simState === 'blocked' ? "close-circle" : "checkmark-circle")} size={22} color={(simState === 'detecting' || simState === 'verifying') ? "#E0E2EA" : (simState === 'blocked' ? '#E8472A' : theme.colors.primary)} />
            <Text style={[styles.verifyText, (simState === 'detecting' || simState === 'verifying') && { color: theme.colors.textMuted }, simState === 'blocked' && { color: '#E8472A' }]}>Device GPS Authenticated (Isolation Forest)</Text>
            {(simState === 'success' || simState === 'blocked') && <Text style={[styles.verifyTime, simState === 'blocked' && { color: '#E8472A' }]}>0.048s</Text>}
          </View>

          {/* Step 3 */}
          {simState !== 'blocked' ? (
            <View style={styles.verifyStepActive}>
              <Ionicons name={simState === 'success' ? "checkmark-circle" : "swap-horizontal"} size={22} color={simState === 'success' ? theme.colors.primary : "#FF7A45"} />
              <Text style={[styles.verifyTextActive, simState === 'success' && { color: theme.colors.primary }]}>Payout Sequence Initiated</Text>
              {simState === 'success' ? (
                <Text style={styles.verifyTime}>0.120s</Text>
              ) : (
                <View style={styles.loadingDots}>
                  <View style={styles.dot} />
                  <View style={styles.dot} />
                  <View style={styles.dot} />
                </View>
              )}
            </View>
          ) : (
            <View style={styles.verifyStepActive}>
              <Ionicons name="shield-half" size={22} color="#E8472A" />
              <Text style={[styles.verifyTextActive, { color: '#E8472A' }]}>Transaction Blocked by AI</Text>
              <Text style={[styles.verifyTime, { color: '#E8472A' }]}>HALTED</Text>
            </View>
          )}
        </View>

        {/* Live Logs Array - For Hackathon Demo */}
        {logs.length > 0 && (
          <Animated.View style={[styles.logContainer, { opacity: fadeAnim }]}>
            <View style={styles.logHeader}>
              <Ionicons name="terminal" size={16} color="#A0A5B5" />
              <Text style={styles.logTitle}>Algorithm Inspector Logs</Text>
              {(simState === 'success' || simState === 'blocked') && (
                 <View style={styles.statusPill}>
                   <Text style={[styles.statusText, simState === 'blocked' && { color: '#E8472A' }]}>
                     {simState === 'blocked' ? 'HALTED' : 'COMPLETE'}
                   </Text>
                 </View>
              )}
            </View>
            <View style={styles.logWindow}>
              {logs.map((log, index) => {
                let color = '#E0E2EA'; // Default off-white text
                if (log.startsWith('[ML]')) color = '#FFCC00';
                if (log.startsWith('[WARN]') || log.startsWith('[SEC]')) color = '#FF7A45';
                if (log.startsWith('[OK]')) color = '#00E676';
                return (
                  <Text key={index} style={[styles.logLine, { color }]}>
                    <Text style={{color: '#8A8F9E'}}>{`> `}</Text>{log}
                  </Text>
                );
              })}
            </View>
          </Animated.View>
        )}

        {/* Blocked Failure Card */}
        {simState === 'blocked' && (
          <Animated.View style={[styles.payoutCardOuter, { backgroundColor: '#FFEDDF', opacity: fadeAnim }]}>
            <View style={[styles.payoutCardInner, { borderColor: '#E8472A', borderWidth: 2 }]}>
              <View style={[styles.successIconCircle, { backgroundColor: '#E8472A' }]}>
                <Ionicons name="warning" size={32} color="#FFF" />
              </View>
              <Text style={[styles.payoutAmountText, { color: '#E8472A' }]}>Spoofing Detected</Text>
              <Text style={styles.payoutSubtext}>Your device location signature matches known mock-location applications. Transaction immediately halted.</Text>
            </View>

            <TouchableOpacity style={styles.underTheHoodToggle} onPress={() => setShowUnderTheHood(!showUnderTheHood)}>
              <Text style={styles.underTheHoodText}>Under the Hood</Text>
              <Ionicons name={showUnderTheHood ? "chevron-up" : "chevron-down"} size={16} color={theme.colors.primary} />
            </TouchableOpacity>

            {showUnderTheHood && (
              <View style={styles.underTheHoodCard}>
                <Text style={styles.hoodTitle}>Adversarial Defense Blocked This (GPS Spoofing)</Text>
                <Text style={styles.hoodDesc}>
                  We extracted device telemetry and compared it to established baseline location signatures using an <Text style={{fontWeight: '800', color: theme.colors.primary}}>Isolation Forest</Text> anomaly detection model. The mock location API usage resulted in a high negative anomaly score (-0.85), automatically halting the Zero-Touch settlement pipeline.
                </Text>
              </View>
            )}

            <TouchableOpacity style={[styles.backDashboardBtn, { backgroundColor: 'rgba(232, 71, 42, 0.1)' }]} onPress={resetForm}>
              <Text style={[styles.backDashboardText, { color: '#E8472A' }]}>Acknowledge & Reset</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Payout Success Card */}
        {simState === 'success' && (
          <Animated.View style={[styles.payoutCardOuter, { opacity: fadeAnim }]}>
            <View style={styles.payoutCardInner}>
              <View style={styles.successIconCircle}>
                <Ionicons name="checkmark" size={32} color="#FFF" />
              </View>
              <Text style={styles.payoutAmountText}>₹{totalSimPayout} Sent to UPI</Text>
              <Text style={styles.payoutSubtext}>Instant Parametric Settlement{'\n'}Complete</Text>

              <View style={styles.payoutMetricsRow}>
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>INCOME SAVED</Text>
                  <Text style={styles.metricValue}>₹{totalSimPayout}.00</Text>
                </View>
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>STATUS</Text>
                  <View style={styles.statusSuccessRow}>
                    <Ionicons name="flash" size={12} color="#E8472A" />
                    <Text style={styles.statusSuccessText}>SUCCESS</Text>
                  </View>
                </View>
              </View>
            </View>

            <Text style={styles.payoutExplanationText}>
              Automatic payouts triggered via parametric execution. <Text style={styles.linkText}>Learn how it's calculated.</Text>
            </Text>

            <TouchableOpacity style={styles.underTheHoodToggle} onPress={() => setShowUnderTheHood(!showUnderTheHood)}>
              <Text style={styles.underTheHoodText}>Under the Hood</Text>
              <Ionicons name={showUnderTheHood ? "chevron-up" : "chevron-down"} size={16} color={theme.colors.primary} />
            </TouchableOpacity>

            {showUnderTheHood && (
              <View style={[styles.underTheHoodCard, { marginBottom: 16 }]}>
                <Text style={styles.hoodTitle}>How Did We Make This Decision?</Text>
                <Text style={styles.hoodDesc}>
                  <Text style={{fontWeight: '800', color: theme.colors.primary}}>1. Parametric Evaluation (Random Forest):</Text>{'\n'}
                  The app queried our Oracle for IMD grid conditions. A lightweight Random Forest classifier determined that grid attributes (rain intensity {'>'} 50mm) crossed confidence thresholds.{'\n\n'}
                  <Text style={{fontWeight: '800', color: theme.colors.primary}}>2. Adversarial Defense (Isolation Forest):</Text>{'\n'}
                  Prior to payout, device biometric & GPS signals were fed into an Anomaly Detection model. It found no indicators of deviation (Score: 0.92), verifying user identity. Proceeds were issued via IPFS smart contract handoff.
                </Text>
              </View>
            )}

            <TouchableOpacity style={styles.viewTransactionBtn} onPress={() => onNavigate('Home')}>
              <Text style={styles.viewTransactionText}>View on Dashboard</Text>
              <Ionicons name="arrow-forward" size={16} color="#FFF" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.backDashboardBtn} onPress={resetForm}>
              <Text style={styles.backDashboardText}>Run New Simulation</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F7' },

  // Form State Top Bar
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10, backgroundColor: '#F5F5F7' },
  formTitle: { fontSize: 20, fontWeight: '900', color: theme.colors.primary },
  inputExplain: { marginHorizontal: 20, fontSize: 13, color: theme.colors.textSub, lineHeight: 20, marginBottom: 20 },

  noTriggerBanner: { marginHorizontal: 20, backgroundColor: '#FFF0ED', padding: 16, borderRadius: 12, flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 20, borderWidth: 1, borderColor: '#FFD9D1' },
  noTriggerTxt: { fontSize: 12, color: '#A73200', flex: 1, lineHeight: 18 },

  scroll: { paddingBottom: 40 },

  checkbox: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: theme.colors.border, justifyContent: 'center', alignItems: 'center' },
  checkboxActive: { backgroundColor: '#E8472A', borderColor: '#E8472A' },

  inputCard: { marginHorizontal: 20, backgroundColor: '#FFF', borderRadius: 16, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 1 },
  inputHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  inputLabel: { flex: 1, fontSize: 13, fontWeight: '800', color: theme.colors.textMain },
  reqBadge: { fontSize: 10, fontWeight: '700', color: theme.colors.textMuted, backgroundColor: '#F0F1F5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },

  sliderRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  valText: { fontSize: 24, fontWeight: '900', color: theme.colors.primary, width: 45, textAlign: 'right' },
  mockSlider: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  mockBtn: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#F0F1F5', justifyContent: 'center', alignItems: 'center' },
  sliderTrack: { flex: 1, height: 8, backgroundColor: '#E0E2EA', borderRadius: 4 },
  sliderFill: { height: '100%', borderRadius: 4 },

  segmentedControl: { flexDirection: 'row', backgroundColor: '#F0F1F5', borderRadius: 10, padding: 4 },
  segmentBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  segmentBtnActive: { backgroundColor: '#FFF', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  segmentTxt: { fontSize: 12, fontWeight: '700', color: theme.colors.textSub },
  segmentTxtActive: { color: theme.colors.primary },

  runSimBtn: { marginHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: theme.colors.primary, paddingVertical: 18, borderRadius: 16, marginTop: 12 },
  runSimText: { color: '#FFF', fontSize: 15, fontWeight: '800' },

  // Verification Top Bar
  topBarVerify: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#F5F5F7'
  },
  topLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatarCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FF7A45', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#FFF' },
  locationWrap: { justifyContent: 'center' },
  locationZoneLabel: { fontSize: 10, fontWeight: '700', color: theme.colors.textMuted, letterSpacing: 0.5 },
  locationCity: { fontSize: 16, fontWeight: '900', color: theme.colors.primary, marginTop: 2 },
  protectedPill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#E8EEFE', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  activeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#FF7A45' },
  protectedText: { fontSize: 10, fontWeight: '800', color: theme.colors.primary, letterSpacing: 0.5 },

  scrollVerify: { paddingTop: 10, paddingBottom: 40 },

  // Detection Card
  detectionCard: {
    marginHorizontal: 16, backgroundColor: '#FFF', borderRadius: 16,
    flexDirection: 'row', padding: 18, marginBottom: 12,
    borderLeftWidth: 4, borderLeftColor: '#E8472A',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3
  },
  detectionIconBox: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#FFCC00', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  detectionBody: { flex: 1, justifyContent: 'center' },
  detectionTitle: { fontSize: 15, fontWeight: '800', color: theme.colors.primary, marginBottom: 4 },
  detectionSub: { fontSize: 12, color: theme.colors.textSub, lineHeight: 18 },

  sectionTitle: { fontSize: 11, fontWeight: '700', color: theme.colors.textMuted, letterSpacing: 1.5, marginHorizontal: 16, marginBottom: 16, marginTop: 12 },

  // Verification List
  verificationList: { marginHorizontal: 16, marginBottom: 32 },
  verifyStep: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  verifyText: { flex: 1, fontSize: 15, fontWeight: '600', color: theme.colors.primary },
  verifyTime: { fontSize: 12, color: theme.colors.textMuted, fontFamily: 'monospace' },

  verifyStepActive: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  verifyTextActive: { flex: 1, fontSize: 15, fontWeight: '700', color: '#FF7A45' },
  loadingDots: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#FF7A45' },

  // Payout Success Card
  payoutCardOuter: { marginHorizontal: 16, backgroundColor: '#FFF0ED', borderRadius: 24, padding: 16, alignItems: 'center' },
  payoutCardInner: { backgroundColor: '#FFF', borderRadius: 20, width: '100%', padding: 24, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 4, marginBottom: 20 },
  successIconCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#FF7A45', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  payoutAmountText: { fontSize: 24, fontWeight: '900', color: theme.colors.primary, marginBottom: 8 },
  payoutSubtext: { fontSize: 13, color: theme.colors.textMuted, textAlign: 'center', lineHeight: 20, marginBottom: 24 },

  payoutMetricsRow: { flexDirection: 'row', width: '100%', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: theme.colors.border, paddingTop: 16 },
  metricItem: { flex: 1 },
  metricLabel: { fontSize: 10, fontWeight: '700', color: theme.colors.textMuted, letterSpacing: 0.5, marginBottom: 4 },
  metricValue: { fontSize: 18, fontWeight: '900', color: theme.colors.primary },
  statusSuccessRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  statusSuccessText: { fontSize: 12, fontWeight: '800', color: '#E8472A' },

  payoutExplanationText: { fontSize: 11, color: theme.colors.textMuted, textAlign: 'center', lineHeight: 18, paddingHorizontal: 10, marginBottom: 20 },
  linkText: { color: theme.colors.primary, fontWeight: '700', textDecorationLine: 'underline' },

  viewTransactionBtn: { width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.primary, paddingVertical: 16, borderRadius: 14, gap: 8, marginBottom: 12 },
  viewTransactionText: { color: '#FFF', fontSize: 14, fontWeight: '700' },

  backDashboardBtn: { width: '100%', alignItems: 'center', paddingVertical: 16, borderRadius: 14, backgroundColor: 'rgba(26,27,75,0.05)' },
  backDashboardText: { color: theme.colors.primary, fontSize: 14, fontWeight: '700' },

  // Logs & Algorithm Inspector
  logContainer: { marginHorizontal: 16, backgroundColor: '#1C1D21', borderRadius: 12, padding: 16, marginBottom: 24 },
  logHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#2C2D31', paddingBottom: 10 },
  logTitle: { fontSize: 12, fontWeight: '700', color: '#A0A5B5', flex: 1, letterSpacing: 0.5 },
  statusPill: { backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontSize: 9, fontWeight: '800', color: '#00E676', letterSpacing: 1 },
  logWindow: { gap: 6 },
  logLine: { fontSize: 11, fontFamily: 'monospace', color: '#E0E2EA', lineHeight: 16 },

  // Under the Hood Card
  underTheHoodToggle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginVertical: 12, paddingVertical: 8 },
  underTheHoodText: { fontSize: 13, fontWeight: '800', color: theme.colors.primary },
  underTheHoodCard: { backgroundColor: '#F0F2FA', padding: 16, borderRadius: 12, marginBottom: 20, borderWidth: 1, borderColor: '#D0D5E5' },
  hoodTitle: { fontSize: 13, fontWeight: '900', color: theme.colors.primary, marginBottom: 8 },
  hoodDesc: { fontSize: 12, color: theme.colors.textSub, lineHeight: 18 },
});
