import React, { useState, useRef, useEffect } from 'react';
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

  // Terminal Logs
  const [logs, setLogs] = useState<string[]>([]);
  const scrollRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const metricsAnim = useRef(new Animated.Value(0)).current;

  const addLog = (log: string) => {
    setLogs(prev => [...prev, `[${new Date().toISOString().substr(11, 8)}] ${log}`]);
  };

  // Run the AI Pipeline
  const runEngine = () => {
    setEngineState('ingesting');
    setLogs([]);
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();

    let threat: ThreatType = 'None';
    if (spoofing) threat = 'Spoofing';
    else if (multiApp) threat = 'MultiApp';
    else if (ghostRiding) threat = 'GhostRiding';
    else if (lowActivity) threat = 'LowActivity';

    // Sequence Logs
    setTimeout(() => addLog('SYSTEM: Payload initialized via secure webhook.'), 200);
    setTimeout(() => addLog('INGEST: Packet received from WorkerID #WG-8842...'), 800);
    setTimeout(() => addLog(`TELEMETRY: { lat: 12.971, lon: 77.625, bssid_ctx: 12, imu_rate: 60Hz }`), 1500);

    // Stage 1: Data Ingestion Complete -> Transition to Analyze
    setTimeout(() => {
      setEngineState('analyzing');
      addLog('ANALYSIS: Routing payload to Isolation Forest model.');
    }, 2000);

    setTimeout(() => addLog('MODEL: Checking kinematic continuity graph...'), 2800);

    setTimeout(() => {
      if (threat === 'Spoofing') addLog('WARNING: Unnatural kinematic jump detected (>1200km/h velocity).');
      if (threat === 'MultiApp') addLog('VALIDATION: Querying UPI Deduplication Ledger...');
      if (threat === 'GhostRiding') addLog('SENSOR_FUSION: Extracting X/Y/Z accelerometer variance...');
      if (threat === 'LowActivity') addLog('TIERING: Evaluating 30-day continuous activity graph...');
    }, 3600);

    setTimeout(() => {
      if (threat === 'Spoofing') addLog('CRITICAL: Local BSSID RF fingerpint contradicts GPS payload. (Spoofing Flag=TRUE)');
      if (threat === 'MultiApp') addLog('CRITICAL: Match found. Secondary aggregator active claim via UPI vpa@okhdfcbank. (Collision=TRUE)');
      if (threat === 'GhostRiding') addLog('CRITICAL: Dead sensor metric. Hardware variance = 0.001. Device is completely stationary. (Automation=TRUE)');
      if (threat === 'LowActivity') addLog('CRITICAL: Activity days = 3. Fails underwriting baseline (min 5). (Tiering=FALSE)');
      if (threat === 'None') addLog('SUCCESS: All anti-fraud models output nominal signatures.');
    }, 4500);

    // Stage 2: Synthesis and Threat Classification
    setTimeout(() => {
      addLog(`ACTION: Execution ${threat === 'None' ? 'APPROVED' : 'HALTED'}. Outputting final report.`);
      setDetectedThreat(threat);
      setEngineState('complete');
      Animated.timing(metricsAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start();
    }, 5500);
  };

  const resetEngine = () => {
    setEngineState('idle');
    setSpoofing(false);
    setMultiApp(false);
    setGhostRiding(false);
    setLowActivity(false);
    setDetectedThreat('None');
    setLogs([]);
    fadeAnim.setValue(0);
    metricsAnim.setValue(0);
  };

  // Threat Card Data Mapping
  const threatDetails = {
    Spoofing: { title: 'Location Spoofing Detected', desc: 'Kinematic anomaly identified. Speed spikes violate street physics and local BSSID signatures contradict GPS telemetry.', icon: 'location', color: '#E8472A' },
    MultiApp: { title: 'Multi-App Harvesting Prevented', desc: 'Deduplication triggered. UPI VPA and e-Shram identity already registered an active claim under an overlapping rain event.', icon: 'copy', color: '#FF7A45' },
    GhostRiding: { title: 'Ghost Riding Identified', desc: 'Automated tapping suspected. Sensor Fusion analysis shows complete lack of correlated IMU (accelerometer) vibrations.', icon: 'phone-portrait', color: '#9B6DFF' },
    LowActivity: { title: 'Activity Manipulation Flagged', desc: 'Algorithmic tiering rejection. Worker has tracked fewer than 5 active delivery days in the rolling 30-day window.', icon: 'calendar', color: '#A06000' },
    None: { title: 'Pipeline Clear', desc: 'No adversarial signatures detected. Telemetry passes all risk thresholds.', icon: 'shield-checkmark', color: theme.colors.success }
  };

  // VISUALIZATIONS COMPONENTS
  const renderVisualizations = () => {
    switch (detectedThreat) {
      case 'Spoofing':
        return (
          <View style={styles.visContainer}>
            <View style={styles.visRadar}>
              <View style={[styles.radarCircle, { width: 140, height: 140, borderColor: theme.colors.primary }]} />
              <View style={[styles.radarCircle, { width: 80, height: 80, borderColor: theme.colors.primary, opacity: 0.5 }]} />
              <View style={[styles.radarCircle, { width: 40, height: 40, backgroundColor: theme.colors.primary, opacity: 0.2 }]} />
              
              <View style={[styles.visPoint, { top: 20, left: 30 }]}><Ionicons name="wifi" size={14} color={theme.colors.textSub} /></View>
              <View style={[styles.visPoint, { top: 110, left: 20 }]}><Ionicons name="wifi" size={14} color={theme.colors.textSub} /></View>

              <View style={[styles.visPoint, { top: '50%', left: '50%', transform: [{translateX:-10}, {translateY:-10}] }]}>
                <Ionicons name="person" size={20} color={theme.colors.primary} />
              </View>

              {/* Spoofed GPS Far Away */}
              <View style={styles.spoofedLine} />
              <View style={[styles.visPoint, { top: 10, right: 10, backgroundColor: '#FFF0ED', padding: 4, borderRadius: 12, borderWidth: 1, borderColor: '#E8472A' }]}>
                <Ionicons name="location" size={24} color="#E8472A" />
                <Text style={styles.visSpoofLabel}>GPS Payload</Text>
              </View>
            </View>
            <View style={styles.metricsRow}>
              <View style={styles.metricItem}><Text style={styles.metricValue}>0%</Text><Text style={styles.metricLabel}>BSSID MATCH</Text></View>
              <View style={styles.metricItem}><Text style={styles.metricValue}>12.4</Text><Text style={styles.metricLabel}>KM DISTANCE</Text></View>
            </View>
          </View>
        );
      
      case 'MultiApp':
        return (
          <View style={styles.visContainer}>
            <View style={styles.graphNetwork}>
              <View style={styles.graphRow}>
                 <View style={styles.nodeApp}><Text style={styles.nodeText}>SWIGGY</Text></View>
                 <View style={styles.nodeApp}><Text style={styles.nodeText}>ZOMATO</Text></View>
              </View>
              <View style={styles.graphLines}>
                 <View style={[styles.graphLine, { transform: [{rotate:'45deg'}], left: '30%' }]} />
                 <View style={[styles.graphLine, { transform: [{rotate:'-45deg'}], right: '30%' }]} />
              </View>
              <View style={styles.graphRow}>
                 <View style={styles.nodeUPI}><Text style={styles.nodeTextLight}>vpa@okhdfcbank</Text></View>
              </View>
              <View style={styles.collisionBox}>
                <Ionicons name="warning" size={16} color="#FFF" />
                <Text style={styles.collisionText}>LEDGER COLLISION</Text>
              </View>
            </View>
          </View>
        );

      case 'GhostRiding':
        return (
          <View style={styles.visContainer}>
            <View style={styles.chartArea}>
               <Text style={styles.chartTitle}>LIVE XYZ ACCELEROMETER</Text>
               <View style={styles.chartBox}>
                  {/* Flatline representing no movement */}
                  <View style={styles.chartLine} />
                  <View style={[styles.chartLine, { top: '51%', backgroundColor: 'rgba(155, 109, 255, 0.4)'}]} />
                  <View style={[styles.chartLine, { top: '49%', backgroundColor: 'rgba(155, 109, 255, 0.2)'}]} />
               </View>
               <View style={styles.metricsRow}>
                  <View style={styles.metricItem}><Text style={styles.metricValue}>0.001</Text><Text style={styles.metricLabel}>VARIANCE (G)</Text></View>
                  <View style={styles.metricItem}><Text style={styles.metricValue}>STATIONARY</Text><Text style={styles.metricLabel}>PLATFORM STATE</Text></View>
               </View>
            </View>
          </View>
        );

      case 'LowActivity':
        return (
          <View style={styles.visContainer}>
            <Text style={styles.chartTitle}>30-DAY UNDERWRITING GRAPH</Text>
            <View style={styles.calendarGraph}>
              {Array.from({length: 30}).map((_, i) => (
                <View key={i} style={[
                  styles.calendarBox, 
                  (i===5 || i===12 || i===25) ? styles.calendarBoxActive : styles.calendarBoxEmpty
                ]} />
              ))}
            </View>
            <View style={styles.metricsRow}>
              <View style={styles.metricItem}><Text style={[styles.metricValue, {color:'#E8472A'}]}>3</Text><Text style={styles.metricLabel}>ACTIVE DAYS</Text></View>
              <View style={styles.metricItem}><Text style={styles.metricValue}>5</Text><Text style={styles.metricLabel}>REQ. MINIMUM</Text></View>
            </View>
          </View>
        );
      case 'None':
        return (
          <View style={styles.visContainer}>
            <Ionicons name="shield-checkmark" size={64} color={theme.colors.success} style={{marginBottom: 10}} />
            <Text style={{fontWeight: '800', color: theme.colors.success, fontSize: 18}}>Verification Passed</Text>
          </View>
        );
      default: return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
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
            <Text style={styles.sectionTitle}>AI PIPELINE LIVE EXECUTION</Text>

            {/* Live Terminal Block */}
            <View style={styles.terminalBlock}>
              <View style={styles.terminalHeader}>
                <View style={styles.dotRed} />
                <View style={styles.dotYellow} />
                <View style={styles.dotGreen} />
                <Text style={styles.terminalHeaderText}>bash ~ dev/tty</Text>
              </View>
              <ScrollView 
                ref={scrollRef}
                style={styles.terminalBody} 
                showsVerticalScrollIndicator={false}
                onContentSizeChange={() => scrollRef.current?.scrollToEnd({animated: true})}
              >
                {logs.map((log, idx) => {
                  const isWarning = log.includes('WARNING');
                  const isCritical = log.includes('CRITICAL');
                  const isSuccess = log.includes('SUCCESS');
                  return (
                    <Text key={idx} style={[styles.terminalText, isWarning && {color:'#FFCC00'}, isCritical && {color:'#FF4444'}, isSuccess && {color:'#00FF00'}]}>
                      {log}
                    </Text>
                  );
                })}
                {engineState !== 'complete' && <Text style={styles.terminalCursor}>_</Text>}
              </ScrollView>
            </View>

            {engineState === 'complete' && (
              <Animated.View style={[styles.resultCard, { borderColor: threatDetails[detectedThreat].color, opacity: metricsAnim }]}>
                <View style={styles.resultHeader}>
                  <View style={[styles.resultIconBox, { backgroundColor: threatDetails[detectedThreat].color }]}>
                    <Ionicons name={threatDetails[detectedThreat].icon as any} size={28} color="#FFF" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.resultTitle, { color: threatDetails[detectedThreat].color }]}>{threatDetails[detectedThreat].title}</Text>
                    <Text style={styles.resultSub}>Confidence: 99.4% • Action: {detectedThreat === 'None' ? 'PROCEED' : 'HALT'}</Text>
                  </View>
                </View>

                {/* GRAPHICAL VISUALIZATION */}
                {renderVisualizations()}

                <Text style={styles.resultDescText}>{threatDetails[detectedThreat].desc}</Text>

                <TouchableOpacity style={styles.resetBtn} onPress={resetEngine}>
                  <Text style={styles.resetBtnText}>Clear Pipeline & Reload</Text>
                </TouchableOpacity>
              </Animated.View>
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
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16, backgroundColor: '#F0F1F5' },
  headerTitle: { fontSize: 20, fontWeight: '900', color: theme.colors.primary },
  livePill: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E8F8F0', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, gap: 6 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: theme.colors.success },
  liveText: { fontSize: 10, fontWeight: '800', color: theme.colors.success },
  scroll: { paddingTop: 10 },
  sectionDesc: { marginHorizontal: 20, fontSize: 13, color: theme.colors.textSub, lineHeight: 20, marginBottom: 20 },
  sectionTitle: { fontSize: 11, fontWeight: '800', color: theme.colors.textMuted, letterSpacing: 1.5, marginBottom: 12 },

  signatureContainer: { marginHorizontal: 20 },
  signatureCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 12 },
  sigHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  sigTitle: { flex: 1, fontSize: 15, fontWeight: '800', color: theme.colors.primary },
  sigDesc: { fontSize: 12, color: theme.colors.textSub, lineHeight: 18 },

  runEngineBtn: { flexDirection: 'row', backgroundColor: theme.colors.primary, paddingVertical: 18, borderRadius: 16, alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 12 },
  runEngineText: { color: '#FFF', fontSize: 15, fontWeight: '800' },

  // Terminal
  terminalBlock: { backgroundColor: '#1A1B2A', borderRadius: 12, overflow: 'hidden', marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 4 },
  terminalHeader: { backgroundColor: '#2C2D4A', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  dotRed: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#FF5F56' },
  dotYellow: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#FFBD2E' },
  dotGreen: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#27C93F' },
  terminalHeaderText: { color: 'rgba(255,255,255,0.4)', fontSize: 10, fontFamily: 'monospace', marginLeft: 10 },
  terminalBody: { height: 160, padding: 16 },
  terminalText: { color: '#A0A2D0', fontSize: 11, fontFamily: 'monospace', marginBottom: 6, lineHeight: 16 },
  terminalCursor: { color: '#A0A2D0', fontSize: 12, fontFamily: 'monospace', opacity: 0.8 },

  // Results & Vis
  resultCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 20, borderWidth: 2, borderStyle: 'solid', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
  resultHeader: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 20 },
  resultIconBox: { width: 52, height: 52, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  resultTitle: { fontSize: 16, fontWeight: '900', marginBottom: 4 },
  resultSub: { fontSize: 11, fontWeight: '700', color: theme.colors.textMuted },
  resultDescText: { fontSize: 14, color: theme.colors.textSub, lineHeight: 22, marginBottom: 24 },
  
  visContainer: { backgroundColor: '#F9F9FB', borderRadius: 12, padding: 16, marginBottom: 20, alignItems: 'center', borderColor: '#EAE6FF', borderWidth: 1 },
  metricsRow: { flexDirection: 'row', width: '100%', justifyContent: 'space-around', marginTop: 16, borderTopWidth: 1, borderTopColor: '#E0E2EA', paddingTop: 16 },
  metricItem: { alignItems: 'center' },
  metricValue: { fontSize: 20, fontWeight: '900', color: theme.colors.primary, marginBottom: 4 },
  metricLabel: { fontSize: 10, fontWeight: '700', color: theme.colors.textMuted },

  // Chart Graphics
  visRadar: { width: 140, height: 140, justifyContent: 'center', alignItems: 'center', position: 'relative' },
  radarCircle: { position: 'absolute', borderRadius: 999, borderWidth: 1 },
  visPoint: { position: 'absolute', zIndex: 10 },
  spoofedLine: { position: 'absolute', width: 60, height: 2, backgroundColor: '#E8472A', right: 5, top: 40, transform: [{rotate:'-45deg'}] },
  visSpoofLabel: { fontSize: 9, fontWeight: '800', color: '#E8472A', marginTop: 2 },

  graphNetwork: { width: '100%', alignItems: 'center' },
  graphRow: { flexDirection: 'row', width: '100%', justifyContent: 'space-around', zIndex: 10 },
  nodeApp: { backgroundColor: '#FFF', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: '#D0D2DA', elevation:1 },
  nodeText: { fontSize: 11, fontWeight: '800', color: theme.colors.primary },
  graphLines: { position: 'relative', width: '100%', height: 40 },
  graphLine: { position: 'absolute', width: 2, height: 50, backgroundColor: '#E8472A', top: -5 },
  nodeUPI: { backgroundColor: theme.colors.primary, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8, elevation: 1 },
  nodeTextLight: { fontSize: 12, fontWeight: '800', color: '#FFF' },
  collisionBox: { backgroundColor: '#E8472A', flexDirection: 'row', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, alignItems: 'center', gap: 4, marginTop: -12, zIndex: 20, borderWidth: 2, borderColor: '#FFF' },
  collisionText: { color: '#FFF', fontSize: 9, fontWeight: '800' },

  chartArea: { width: '100%' },
  chartTitle: { fontSize: 10, fontWeight: '800', color: theme.colors.textMuted, marginBottom: 12 },
  chartBox: { width: '100%', height: 80, backgroundColor: '#FFF', borderRadius: 8, borderWidth: 1, borderColor: '#E0E2EA', position: 'relative', overflow: 'hidden' },
  chartLine: { position: 'absolute', width: '100%', height: 2, backgroundColor: '#9B6DFF', top: '50%' },

  calendarGraph: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'center' },
  calendarBox: { width: 14, height: 14, borderRadius: 4 },
  calendarBoxEmpty: { backgroundColor: '#E0E2EA' },
  calendarBoxActive: { backgroundColor: theme.colors.success },

  resetBtn: { backgroundColor: 'rgba(26,27,75,0.05)', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  resetBtnText: { color: theme.colors.primary, fontSize: 13, fontWeight: '800' }
});
