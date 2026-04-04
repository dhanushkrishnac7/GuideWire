import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, Animated, Switch, Easing
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';

interface Props {
  onNavigate: (screen: string) => void;
}

type ThreatType = 'None' | 'Spoofing' | 'MultiApp' | 'GhostRiding' | 'LowActivity';
type SimulationMode = 'manual' | 'pipeline';

interface PipelineStage {
  id: string;
  label: string;
  sub: string;
  icon: string;
  riskKey?: string;
  critical?: boolean;
}

const PIPELINE_STAGES: PipelineStage[] = [
  { id: 'ingest', label: 'Data Ingestion', sub: 'Decryption & ID binding', icon: 'shield-outline' },
  { id: 'online', label: 'Online Status', sub: 'Active session verification', icon: 'wifi' },
  { id: 'geofence', label: 'Geofence Check', sub: 'Proximity (Radius < 5km)', icon: 'location-outline', riskKey: 'spoofing' },
  { id: 'dedup', label: 'UPI Deduplication', sub: 'Multi-app collision check', icon: 'copy-outline', riskKey: 'multiApp' },
  { id: 'sensor', label: 'Sensor Fusion', sub: 'IMU movement variance', icon: 'pulse-outline', riskKey: 'ghostRiding' },
  { id: 'tiering', label: 'Risk Underwriting', sub: 'Activity tier classification', icon: 'calendar-outline', riskKey: 'lowActivity' },
  { id: 'scorer', label: 'AI Risk Scorer', sub: 'Isolation Forest Anomaly', icon: 'analytics-outline' },
  { id: 'verdict', label: 'Final Verdict', sub: 'Authorization decision', icon: 'checkmark-circle-outline' },
];

export default function AIFraudEngineScreen({ onNavigate }: Props) {
  // Injectable Risk Signatures
  const [spoofing, setSpoofing] = useState(false);
  const [multiApp, setMultiApp] = useState(false);
  const [ghostRiding, setGhostRiding] = useState(false);
  const [lowActivity, setLowActivity] = useState(false);

  // Simulation Control
  const [simulationMode, setSimulationMode] = useState<SimulationMode>('manual');
  const [engineState, setEngineState] = useState<'idle' | 'ingesting' | 'analyzing' | 'complete'>('idle');
  const [detectedThreat, setDetectedThreat] = useState<ThreatType>('None');

  // Pipeline Specific State
  const [pipelineIndex, setPipelineIndex] = useState(-1);
  const [pipelineStatus, setPipelineStatus] = useState<Record<number, 'pass' | 'fail' | 'idle'>>({});
  const progressAnims = useRef(PIPELINE_STAGES.map(() => new Animated.Value(0))).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;

  // Terminal Logs
  const [logs, setLogs] = useState<string[]>([]);
  const scrollRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const metricsAnim = useRef(new Animated.Value(0)).current;

  const addLog = (log: string) => {
    setLogs(prev => [...prev, `[${new Date().toISOString().substr(11, 8)}] ${log}`]);
  };

  // Pulse effect for the active stage
  useEffect(() => {
    if (pipelineIndex >= 0) {
      pulseAnim.setValue(0);
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.stopAnimation();
    }
  }, [pipelineIndex]);

  const runManualEngine = () => {
    setEngineState('ingesting');
    setLogs([]);
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();

    let threat: ThreatType = 'None';
    if (spoofing) threat = 'Spoofing';
    else if (multiApp) threat = 'MultiApp';
    else if (ghostRiding) threat = 'GhostRiding';
    else if (lowActivity) threat = 'LowActivity';

    setTimeout(() => addLog('SYSTEM: Payload initialized via secure webhook.'), 200);
    setTimeout(() => addLog('INGEST: Packet received from WorkerID #WG-8842...'), 800);
    setTimeout(() => addLog(`TELEMETRY: { lat: 12.971, lon: 77.625, bssid_ctx: 12, imu_rate: 60Hz }`), 1500);

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

    setTimeout(() => {
      addLog(`ACTION: Execution ${threat === 'None' ? 'APPROVED' : 'HALTED'}. Outputting final report.`);
      setDetectedThreat(threat);
      setEngineState('complete');
      Animated.timing(metricsAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start();
    }, 5500);
  };

  const runPipelineSimulation = async () => {
    setEngineState('ingesting');
    setLogs([]);
    setPipelineIndex(0);
    setPipelineStatus({});
    progressAnims.forEach(anim => anim.setValue(0));
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();

    const stages = PIPELINE_STAGES;
    let threat: ThreatType = 'None';
    if (spoofing) threat = 'Spoofing';
    else if (multiApp) threat = 'MultiApp';
    else if (ghostRiding) threat = 'GhostRiding';
    else if (lowActivity) threat = 'LowActivity';

    for (let i = 0; i < stages.length; i++) {
        setPipelineIndex(i);
        addLog(`PIPELINE: Executing stage ${i + 1}/${stages.length}: ${stages[i].label}...`);

        // Fill progress bar animation
        Animated.timing(progressAnims[i], {
            toValue: 1,
            duration: 800,
            easing: Easing.linear,
            useNativeDriver: false
        }).start();

        await new Promise(r => setTimeout(r, 1000));

        let result: 'pass' | 'fail' = 'pass';
        
        // Determine failure based on risk signatures
        if (stages[i].id === 'geofence' && spoofing) result = 'fail';
        if (stages[i].id === 'dedup' && multiApp) result = 'fail';
        if (stages[i].id === 'sensor' && ghostRiding) result = 'fail';
        if (stages[i].id === 'tiering' && lowActivity) result = 'fail';
        if (stages[i].id === 'scorer' && (spoofing || ghostRiding)) result = 'fail'; 
        if (stages[i].id === 'verdict' && (spoofing || multiApp || ghostRiding || lowActivity)) result = 'fail';

        setPipelineStatus(prev => ({ ...prev, [i]: result }));
        
        if (result === 'fail') {
            addLog(`ALERT: ${stages[i].label} failed verification. Signature mismatch.`);
            // In a real pipeline we might stop, but for simulation we continue to show all red flags
        } else {
            addLog(`SUCCESS: ${stages[i].label} passed nominal tests.`);
        }

        await new Promise(r => setTimeout(r, 400));
    }

    setDetectedThreat(threat);
    setEngineState('complete');
    setPipelineIndex(-1);
    Animated.timing(metricsAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start();
    addLog(`FINAL: Claim processing complete. Verdict: ${threat === 'None' ? 'APPROVED' : 'REJECTED'}`);
  };

  const runEngine = () => {
    if (simulationMode === 'manual') runManualEngine();
    else runPipelineSimulation();
  };

  const resetEngine = () => {
    setEngineState('idle');
    setSpoofing(false);
    setMultiApp(false);
    setGhostRiding(false);
    setLowActivity(false);
    setDetectedThreat('None');
    setPipelineIndex(-1);
    setPipelineStatus({});
    progressAnims.forEach(anim => anim.setValue(0));
    setLogs([]);
    fadeAnim.setValue(0);
    metricsAnim.setValue(0);
  };

  const threatDetails = {
    Spoofing: { title: 'Location Spoofing Detected', desc: 'Kinematic anomaly identified. Speed spikes violate street physics and local BSSID signatures contradict GPS telemetry.', icon: 'location', color: '#E8472A' },
    MultiApp: { title: 'Multi-App Harvesting Prevented', desc: 'Deduplication triggered. UPI VPA and e-Shram identity already registered an active claim under an overlapping rain event.', icon: 'copy', color: '#FF7A45' },
    GhostRiding: { title: 'Ghost Riding Identified', desc: 'Automated tapping suspected. Sensor Fusion analysis shows complete lack of correlated IMU (accelerometer) vibrations.', icon: 'phone-portrait', color: '#9B6DFF' },
    LowActivity: { title: 'Activity Manipulation Flagged', desc: 'Algorithmic tiering rejection. Worker has tracked fewer than 5 active delivery days in the rolling 30-day window.', icon: 'calendar', color: '#A06000' },
    None: { title: 'Pipeline Clear', desc: 'No adversarial signatures detected. Telemetry passes all risk thresholds.', icon: 'shield-checkmark', color: theme.colors.success }
  };

  const renderVisualizations = () => {
    if (simulationMode === 'pipeline' && engineState === 'complete') {
        return (
          <View style={styles.visContainer}>
            <View style={styles.verdictSummary}>
                <Ionicons 
                  name={detectedThreat === 'None' ? 'checkmark-circle' : 'close-circle'} 
                  size={48} 
                  color={detectedThreat === 'None' ? theme.colors.success : '#E8472A'} 
                />
                <View style={{marginLeft: 12}}>
                    <Text style={[styles.verdictMain, {color: detectedThreat === 'None' ? theme.colors.success : '#E8472A'}]}>
                        {detectedThreat === 'None' ? 'CLAIM APPROVED' : 'CLAIM BLOCKED'}
                    </Text>
                    <Text style={styles.verdictSub}>
                        {detectedThreat === 'None' ? 'Zero-touch payout initiated via UPI' : 'Adversarial pattern detected in pipeline'}
                    </Text>
                </View>
            </View>
          </View>
        );
    }

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

  const renderPipelineNode = (stage: PipelineStage, index: number) => {
    const status = pipelineStatus[index] || 'idle';
    const isActive = pipelineIndex === index;
    
    return (
      <View key={stage.id} style={styles.pipelineNodeContainer}>
        {/* Connector Line */}
        {index < PIPELINE_STAGES.length - 1 && (
          <View style={styles.pipelineConnector}>
              <View style={styles.connectorBg} />
              <Animated.View 
                style={[
                    styles.connectorFill, 
                    { height: progressAnims[index].interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) },
                    status === 'fail' && { backgroundColor: '#E8472A' }
                ]} 
              />
          </View>
        )}

        <View style={[
            styles.pipelineNode, 
            isActive && styles.pipelineNodeActive,
            status === 'fail' && styles.pipelineNodeFail,
            status === 'pass' && styles.pipelineNodePass
        ]}>
          <Animated.View style={[
            styles.nodeIconBg,
            isActive && { opacity: pulseAnim, transform: [{ scale: pulseAnim.interpolate({inputRange:[0,1], outputRange:[0.8, 1.2]}) }] }
          ]} />
          <Ionicons 
            name={status === 'pass' ? 'checkmark' : status === 'fail' ? 'close' : stage.icon as any} 
            size={16} 
            color={status === 'pass' || status === 'fail' ? '#FFF' : isActive ? theme.colors.primary : theme.colors.textMuted} 
          />
        </View>
        
        <View style={styles.pipelineContent}>
          <Text style={[
            styles.pipelineLabel, 
            isActive && { color: theme.colors.primary },
            status === 'fail' && { color: '#E8472A' }
          ]}>
            {stage.label}
          </Text>
          <Text style={styles.pipelineSub}>{stage.sub}</Text>
        </View>

        {status !== 'idle' && (
            <View style={[styles.statusBadge, { backgroundColor: status === 'pass' ? '#E8F8F0' : '#FFF0ED' }]}>
                <Text style={[styles.statusBadgeText, { color: status === 'pass' ? theme.colors.success : '#E8472A' }]}>
                    {status.toUpperCase()}
                </Text>
            </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.headerTitle}>AI Security Engine</Text>
        <TouchableOpacity style={styles.closeBtn} onPress={() => onNavigate('Home')}>
            <Ionicons name="close" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.modeToggleContainer}>
            <TouchableOpacity 
                style={[styles.modeBtn, simulationMode === 'manual' && styles.modeBtnActive]} 
                onPress={() => { resetEngine(); setSimulationMode('manual'); }}
            >
                <Text style={[styles.modeBtnText, simulationMode === 'manual' && styles.modeBtnTextActive]}>Manual Sandbox</Text>
            </TouchableOpacity>
            <TouchableOpacity 
                style={[styles.modeBtn, simulationMode === 'pipeline' && styles.modeBtnActive]} 
                onPress={() => { resetEngine(); setSimulationMode('pipeline'); }}
            >
                <Text style={[styles.modeBtnText, simulationMode === 'pipeline' && styles.modeBtnTextActive]}>Full Pipeline</Text>
            </TouchableOpacity>
        </View>

        <Text style={styles.sectionDesc}>
          {simulationMode === 'manual' 
            ? 'Inject specific risk signatures to test individual detection models in isolation.' 
            : 'Simulate a live claim moving through all 8 layers of advanced biometric and behavioral verification.'}
        </Text>

        {engineState === 'idle' && (
          <View style={{paddingHorizontal: 20}}>
            <Text style={styles.sectionTitle}>INJECT RISK SIGNATURES</Text>
            <View style={styles.signatureCard}>
              <View style={styles.sigHeader}>
                <Ionicons name="location" size={20} color={theme.colors.primary} />
                <Text style={styles.sigTitle}>Kinematic & RF Anomaly</Text>
                <Switch value={spoofing} onValueChange={setSpoofing} trackColor={{ false: '#E0E2EA', true: '#E8472A' }} />
              </View>
              <Text style={styles.sigDesc}>Simulates fake GPS software via mismatched Wi-Fi BSSID and unnatural movement vectors.</Text>
            </View>
            <View style={styles.signatureCard}>
              <View style={styles.sigHeader}>
                <Ionicons name="copy" size={20} color={theme.colors.primary} />
                <Text style={styles.sigTitle}>Deduplication Collision</Text>
                <Switch value={multiApp} onValueChange={setMultiApp} trackColor={{ false: '#E0E2EA', true: '#FF7A45' }} />
              </View>
              <Text style={styles.sigDesc}>Simulates a claim arriving from a worker logged into multiple delivery platforms concurrently.</Text>
            </View>
            <View style={styles.signatureCard}>
              <View style={styles.sigHeader}>
                <Ionicons name="phone-portrait" size={20} color={theme.colors.primary} />
                <Text style={styles.sigTitle}>IMU Sensor Override</Text>
                <Switch value={ghostRiding} onValueChange={setGhostRiding} trackColor={{ false: '#E0E2EA', true: '#9B6DFF' }} />
              </View>
              <Text style={styles.sigDesc}>Simulates stationary device operating via automated script tapper. Mutes accelerometer variance.</Text>
            </View>
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

        {engineState !== 'idle' && (
          <Animated.View style={{ opacity: fadeAnim, paddingHorizontal: 20 }}>
            {simulationMode === 'pipeline' && (
                <View style={styles.pipelineContainer}>
                    <Text style={styles.sectionTitle}>VERIFICATION PIPELINE FLOW</Text>
                    {PIPELINE_STAGES.map((stage, idx) => renderPipelineNode(stage, idx))}
                </View>
            )}

            <View style={styles.terminalBlock}>
              <View style={styles.terminalHeader}>
                <View style={[styles.dot, {backgroundColor:'#FF5F56'}]} />
                <View style={[styles.dot, {backgroundColor:'#FFBD2E'}]} />
                <View style={[styles.dot, {backgroundColor:'#27C93F'}]} />
                <Text style={styles.terminalLabel}>gigshield_engine:/live_stream</Text>
              </View>
              <ScrollView 
                ref={scrollRef}
                style={styles.terminalBody} 
                onContentSizeChange={() => scrollRef.current?.scrollToEnd({animated: true})}
              >
                {logs.map((log, idx) => {
                  const isAlert = log.includes('ALERT') || log.includes('WARNING') || log.includes('CRITICAL');
                  const isSuccess = log.includes('SUCCESS') || log.includes('APPROVED');
                  return (
                    <Text key={idx} style={[
                        styles.terminalText, 
                        isAlert && {color: '#FFCC00'},
                        isSuccess && {color: '#27C93F'}
                    ]}>
                      {log}
                    </Text>
                  );
                })}
              </ScrollView>
            </View>

            {engineState === 'complete' && (
                <Animated.View style={[styles.resultCard, { borderColor: threatDetails[detectedThreat].color, opacity: metricsAnim }]}>
                    <View style={styles.resultHeader}>
                        <View style={[styles.iconBox, { backgroundColor: threatDetails[detectedThreat].color }]}>
                            <Ionicons name={threatDetails[detectedThreat].icon as any} size={28} color="#FFF" />
                        </View>
                        <View style={{flex: 1}}>
                            <Text style={[styles.resultTitle, { color: threatDetails[detectedThreat].color }]}>{threatDetails[detectedThreat].title}</Text>
                            <Text style={styles.resultMeta}>Confidence Score: 99.8% • Decided 12ms</Text>
                        </View>
                    </View>

                    {renderVisualizations()}

                    <Text style={styles.resultDesc}>{threatDetails[detectedThreat].desc}</Text>

                    <TouchableOpacity style={styles.reloadBtn} onPress={resetEngine}>
                        <Text style={styles.reloadBtnText}>Reset Pipeline & Telemetry</Text>
                    </TouchableOpacity>
                </Animated.View>
            )}
          </Animated.View>
        )}
        <View style={{height: 40}} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F1F5' },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#F0F1F5' },
  headerTitle: { fontSize: 20, fontWeight: '900', color: theme.colors.primary },
  closeBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', elevation: 2 },
  
  scroll: { paddingBottom: 60 },
  modeToggleContainer: { flexDirection: 'row', marginHorizontal: 20, backgroundColor: '#E2E4EB', borderRadius: 12, padding: 4, marginBottom: 16 },
  modeBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  modeBtnActive: { backgroundColor: '#FFF', elevation: 2 },
  modeBtnText: { fontSize: 13, fontWeight: '700', color: theme.colors.textMuted },
  modeBtnTextActive: { color: theme.colors.primary },

  sectionDesc: { marginHorizontal: 20, fontSize: 13, color: theme.colors.textSub, lineHeight: 20, marginBottom: 24 },
  sectionTitle: { fontSize: 11, fontWeight: '800', color: theme.colors.textMuted, letterSpacing: 1.5, marginBottom: 16 },

  signatureCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#EAE6FF' },
  sigHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  sigTitle: { flex: 1, fontSize: 15, fontWeight: '800', color: theme.colors.primary },
  sigDesc: { fontSize: 12, color: theme.colors.textSub, lineHeight: 18 },
  runEngineBtn: { flexDirection: 'row', backgroundColor: theme.colors.primary, paddingVertical: 18, borderRadius: 16, alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 12 },
  runEngineText: { color: '#FFF', fontSize: 15, fontWeight: '800' },

  // Pipeline Flow
  pipelineContainer: { marginBottom: 32 },
  pipelineNodeContainer: { flexDirection: 'row', alignItems: 'flex-start', minHeight: 64, position: 'relative' },
  pipelineConnector: { position: 'absolute', left: 16, top: 32, bottom: -4, width: 2, alignItems: 'center' },
  connectorBg: { position: 'absolute', height: '100%', width: 2, backgroundColor: '#E0E2EA' },
  connectorFill: { position: 'absolute', top: 0, width: 2, backgroundColor: theme.colors.primary },
  pipelineNode: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#FFF', borderWidth: 2, borderColor: '#E0E2EA', justifyContent: 'center', alignItems: 'center', zIndex: 10 },
  pipelineNodeActive: { borderColor: theme.colors.primary },
  pipelineNodePass: { borderColor: theme.colors.success, backgroundColor: theme.colors.success },
  pipelineNodeFail: { borderColor: '#E8472A', backgroundColor: '#E8472A' },
  nodeIconBg: { position: 'absolute', width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(26,27,75,0.05)', zIndex: -1 },
  pipelineContent: { marginLeft: 16, flex: 1, paddingTop: 4 },
  pipelineLabel: { fontSize: 14, fontWeight: '800', color: theme.colors.textMain },
  pipelineSub: { fontSize: 11, color: theme.colors.textMuted, marginTop: 2 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginTop: 4 },
  statusBadgeText: { fontSize: 9, fontWeight: '900' },

  // Terminal
  terminalBlock: { backgroundColor: '#1A1B2A', borderRadius: 12, overflow: 'hidden', marginBottom: 24 },
  terminalHeader: { backgroundColor: '#2C2D4A', flexDirection: 'row', alignItems: 'center', padding: 10, gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  terminalLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 10, fontFamily: 'monospace', marginLeft: 8 },
  terminalBody: { height: 140, padding: 12 },
  terminalText: { color: '#A0A2D0', fontSize: 10, fontFamily: 'monospace', marginBottom: 6 },

  // Results
  resultCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 24, borderWidth: 2, shadowColor: '#000', shadowOffset: {width:0, height:6}, shadowOpacity:0.1, shadowRadius:12, elevation: 5 },
  resultHeader: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 24 },
  iconBox: { width: 56, height: 56, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  resultTitle: { fontSize: 18, fontWeight: '900' },
  resultMeta: { fontSize: 12, color: theme.colors.textMuted, marginTop: 4 },
  resultDesc: { fontSize: 14, color: theme.colors.textSub, lineHeight: 22, marginBottom: 24 },
  reloadBtn: { backgroundColor: 'rgba(26,27,75,0.05)', paddingVertical: 16, borderRadius: 14, alignItems: 'center' },
  reloadBtnText: { color: theme.colors.primary, fontSize: 14, fontWeight: '800' },

  // Visualizations matching existing
  visContainer: { backgroundColor: '#F9F9FB', borderRadius: 16, padding: 20, marginBottom: 20, alignItems: 'center', borderWidth: 1, borderColor: '#EAE6FF' },
  verdictSummary: { flexDirection: 'row', alignItems: 'center', width: '100%' },
  verdictMain: { fontSize: 20, fontWeight: '900' },
  verdictSub: { fontSize: 13, color: theme.colors.textSub, marginTop: 4 },
  metricsRow: { flexDirection: 'row', width: '100%', justifyContent: 'space-around', marginTop: 20, borderTopWidth: 1, borderTopColor: '#E0E2EA', paddingTop: 20 },
  metricValue: { fontSize: 22, fontWeight: '900', color: theme.colors.primary },
  metricLabel: { fontSize: 10, fontWeight: '700', color: theme.colors.textMuted, marginTop: 4 },
  visRadar: { width: 140, height: 140, justifyContent: 'center', alignItems: 'center' },
  radarCircle: { position: 'absolute', borderRadius: 999, borderWidth: 1 },
  visPoint: { position: 'absolute' },
  spoofedLine: { position: 'absolute', width: 60, height: 2, backgroundColor: '#E8472A', right: 5, top: 40, transform: [{rotate:'-45deg'}] },
  visSpoofLabel: { fontSize: 9, fontWeight: '800', color: '#E8472A', marginTop: 2 },
  graphNetwork: { width: '100%', alignItems: 'center' },
  graphRow: { flexDirection: 'row', width: '100%', justifyContent: 'space-around' },
  nodeApp: { backgroundColor: '#FFF', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#D0D2DA' },
  nodeText: { fontSize: 11, fontWeight: '800', color: theme.colors.primary },
  graphLines: { width: '100%', height: 40 },
  graphLine: { position: 'absolute', width: 2, height: 50, backgroundColor: '#E8472A' },
  nodeUPI: { backgroundColor: theme.colors.primary, padding: 12, borderRadius: 8 },
  nodeTextLight: { fontSize: 12, fontWeight: '800', color: '#FFF' },
  collisionBox: { backgroundColor: '#E8472A', padding: 4, paddingHorizontal: 10, borderRadius: 20, marginTop: -12 },
  collisionText: { color: '#FFF', fontSize: 9, fontWeight: '800' },
  chartArea: { width: '100%' },
  chartTitle: { fontSize: 10, fontWeight: '800', color: theme.colors.textMuted, marginBottom: 12 },
  chartBox: { width: '100%', height: 60, backgroundColor: '#FFF', borderRadius: 8, borderWidth: 1, borderColor: '#E0E2EA' },
  chartLine: { position: 'absolute', width: '100%', height: 2, backgroundColor: '#9B6DFF' },
  calendarGraph: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'center' },
  calendarBox: { width: 14, height: 14, borderRadius: 4 },
  calendarBoxEmpty: { backgroundColor: '#E0E2EA' },
  calendarBoxActive: { backgroundColor: theme.colors.success },
});
