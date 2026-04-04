import React, { useState } from 'react';
import {
    View, Text, StyleSheet, SafeAreaView, ScrollView,
    TouchableOpacity, Animated, Easing
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';

interface Props {
    onBack: () => void;
    zone: string;
    fleet: string;
    onPlanSelected: (plan: string) => void;
}

export default function PolicySelectionScreen({ onBack, zone, onPlanSelected }: Props) {
    const [selectedPlan, setSelectedPlan] = useState('Humsafar');

    return (
        <SafeAreaView style={styles.container}>
            {/* Top bar matching Figma Screen 1 */}
            <View style={styles.topBar}>
                <View style={styles.topLeft}>
                    <TouchableOpacity onPress={onBack}>
                        <View style={styles.avatarCircle}>
                            <Ionicons name="person" size={20} color="#FFF" />
                        </View>
                    </TouchableOpacity>
                    <View style={styles.locationWrap}>
                        <Text style={styles.locationCity}>BENGALURU{'\n'}SOUTH</Text>
                    </View>
                </View>
                <View style={styles.protectedPill}>
                    <View style={styles.activeDot} />
                    <Text style={styles.protectedText}>COVERAGE ACTIVE</Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

                {/* AI Risk Intelligence */}
                <View style={styles.riskSection}>
                    <View style={styles.riskHeader}>
                        <Text style={styles.riskIntelLabel}>AI RISK INTELLIGENCE</Text>
                        <View style={styles.liveStatusPill}>
                            <Text style={styles.liveStatusText}>LIVE STATUS</Text>
                        </View>
                    </View>
                    <Text style={styles.highExposureTitle}>High Exposure Zone</Text>

                    <View style={styles.riskCard}>
                        <View style={styles.riskCardRow}>
                            <View style={styles.riskCol}>
                                <Ionicons name="rainy" size={20} color="#FF7A45" style={{ marginBottom: 4 }} />
                                <Text style={styles.riskSubLabel}>FORECAST</Text>
                                <Text style={styles.riskValue}>Monsoon Peak</Text>
                            </View>
                            <View style={styles.riskDivider} />
                            <View style={styles.riskCol}>
                                <Ionicons name="location" size={20} color="#FFCC00" style={{ marginBottom: 4 }} />
                                <Text style={styles.riskSubLabel}>AREA</Text>
                                <Text style={styles.riskValue}>Bengaluru South</Text>
                            </View>
                        </View>
                        <View style={styles.riskBarContainer}>
                            <View style={styles.riskBarBg}>
                                <View style={[styles.riskBarFill, { width: '78%' }]} />
                            </View>
                            <Text style={styles.riskFactorText}>78% Risk Factor</Text>
                        </View>
                    </View>
                </View>

                {/* Protection Plans */}
                <View style={styles.sectionHeaderBox}>
                    <Text style={styles.sectionTitle}>Protection Plans</Text>
                    <View style={styles.infoRow}>
                        <Ionicons name="information-circle-outline" size={12} color={theme.colors.textMuted} />
                        <Text style={styles.sectionSubtitle}>Premiums adjusted based on historical weather & strikes data</Text>
                    </View>
                </View>

                {/* Humsafar Premium */}
                <TouchableOpacity
                    style={[styles.planCard, selectedPlan === 'Humsafar' && styles.planCardActive]}
                    onPress={() => setSelectedPlan('Humsafar')}
                    activeOpacity={0.8}
                >
                    <View style={styles.planHeader}>
                        <View>
                            <Text style={styles.planTitleWhite}>Humsafar Premium</Text>
                            <Text style={styles.planDescWhite}>Full Resilience Shield</Text>
                        </View>
                        <View style={styles.recommendedBadge}>
                            <Text style={styles.recommendedBadgeText}>RECOMMENDED</Text>
                            <Text style={styles.planPriceWhite}>₹45<Text style={styles.planPricePeriod}>/wk</Text></Text>
                        </View>
                    </View>
                    <View style={styles.planIconsRow}>
                        <View style={styles.iconPill}><Ionicons name="rainy" size={10} color="#FFF" /><Text style={styles.iconPillText}>RAIN</Text></View>
                        <View style={styles.iconPill}><Ionicons name="sunny" size={10} color="#FFF" /><Text style={styles.iconPillText}>HEAT</Text></View>
                        <View style={styles.iconPill}><Ionicons name="flash" size={10} color="#FFF" /><Text style={styles.iconPillText}>STRIKES</Text></View>
                        <View style={styles.iconPill}><Ionicons name="cloud" size={10} color="#FFF" /><Text style={styles.iconPillText}>POLLUTION</Text></View>
                    </View>
                </TouchableOpacity>

                {/* Standard Safety */}
                <TouchableOpacity
                    style={[styles.planCardLight, selectedPlan === 'Standard' && styles.planCardLightActive]}
                    onPress={() => setSelectedPlan('Standard')}
                    activeOpacity={0.8}
                >
                    <View style={styles.planHeader}>
                        <View>
                            <Text style={styles.planTitleDark}>Standard Safety</Text>
                            <Text style={styles.planDescDark}>Essential Rain Protection</Text>
                        </View>
                        <View style={styles.priceRowLight}>
                            <Text style={styles.planPriceDark}>₹25<Text style={styles.planPricePeriodDark}>/wk</Text></Text>
                            <View style={styles.arrowCircle}>
                                <Ionicons name="arrow-forward" size={16} color={theme.colors.textMuted} />
                            </View>
                        </View>
                    </View>
                    <View style={styles.planIconsRow}>
                        <View style={styles.iconPillDark}><Ionicons name="rainy" size={14} color={theme.colors.textMuted} /></View>
                        <View style={styles.iconPillDark}><Ionicons name="cloud" size={14} color={theme.colors.textMuted} /></View>
                    </View>
                </TouchableOpacity>

                {/* Coverage Analysis */}
                <View style={styles.coverageAnalysisSection}>
                    <Text style={styles.analysisTitle}>COVERAGE ANALYSIS</Text>
                    <View style={styles.analysisColumns}>
                        <View style={styles.analysisColLeft}>
                            <View style={styles.analysisColHeader}>
                                <Ionicons name="checkmark-circle" size={12} color="#E8472A" />
                                <Text style={styles.incExcLabel}>INCLUDED</Text>
                            </View>
                            <Text style={styles.analysisItemText}>•  Heavy Rain Loss</Text>
                            <Text style={styles.analysisItemText}>•  Heat Exhaustion</Text>
                            <Text style={styles.analysisItemText}>•  Strike Downtime</Text>
                        </View>
                        <View style={styles.analysisColRight}>
                            <View style={styles.analysisColHeader}>
                                <Ionicons name="close-circle" size={12} color={theme.colors.textMuted} />
                                <Text style={styles.incExcLabelGray}>EXCLUDED</Text>
                            </View>
                            <Text style={styles.analysisItemTextGray}>•  Vehicle Repair</Text>
                            <Text style={styles.analysisItemTextGray}>•  Regular Health</Text>
                        </View>
                    </View>
                </View>

                {/* Button */}
                <TouchableOpacity style={styles.activateBtn} onPress={() => onPlanSelected(selectedPlan)}>
                    <Text style={styles.activateBtnText}>ACTIVATE WEEKLY PROTECTION <Ionicons name="flash" size={14} color="#FFF" /></Text>
                </TouchableOpacity>
                <Text style={styles.autoRenewText}>Auto-renews every Monday at 00:00. Cancel anytime.</Text>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFF' },
    topBar: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#FFF'
    },
    topLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    avatarCircle: {
        width: 44, height: 44, borderRadius: 22,
        backgroundColor: theme.colors.primary, justifyContent: 'center', alignItems: 'center',
    },
    locationWrap: { justifyContent: 'center' },
    locationCity: { fontSize: 13, fontWeight: '900', color: theme.colors.primary, lineHeight: 15 },
    protectedPill: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        backgroundColor: '#E8EEFE', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
    },
    activeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#FF7A45' },
    protectedText: { fontSize: 10, fontWeight: '800', color: theme.colors.primary, letterSpacing: 0.5 },

    scroll: { paddingTop: 10, paddingBottom: 40, paddingHorizontal: 16 },

    // Risk Intelligence
    riskSection: { marginBottom: 32 },
    riskHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
    riskIntelLabel: { fontSize: 10, fontWeight: '800', color: theme.colors.textMuted, letterSpacing: 1.5 },
    liveStatusPill: { backgroundColor: '#FF7A45', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    liveStatusText: { fontSize: 9, fontWeight: '800', color: '#FFF' },
    highExposureTitle: { fontSize: 20, fontWeight: '900', color: theme.colors.primary, marginBottom: 16 },

    riskCard: {
        backgroundColor: '#F7F7F9', borderRadius: 16, padding: 16,
        borderWidth: 1, borderColor: theme.colors.border,
    },
    riskCardRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
    riskCol: { flex: 1, alignItems: 'flex-start' },
    riskDivider: { width: 1, height: 40, backgroundColor: theme.colors.border, marginHorizontal: 16 },
    riskSubLabel: { fontSize: 9, fontWeight: '800', color: theme.colors.textMuted, letterSpacing: 1 },
    riskValue: { fontSize: 16, fontWeight: '800', color: theme.colors.primary, marginTop: 2 },

    riskBarContainer: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    riskBarBg: { flex: 1, height: 6, backgroundColor: '#E0E2EA', borderRadius: 3 },
    riskBarFill: { height: '100%', backgroundColor: '#E8472A', borderRadius: 3 },
    riskFactorText: { fontSize: 11, fontWeight: '800', color: '#E8472A' },

    // Protection Plans
    sectionHeaderBox: { marginBottom: 16 },
    sectionTitle: { fontSize: 18, fontWeight: '800', color: theme.colors.primary, marginBottom: 4 },
    infoRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    sectionSubtitle: { fontSize: 11, color: theme.colors.textSub },

    planCard: {
        backgroundColor: theme.colors.primary, borderRadius: 16, padding: 20, marginBottom: 12,
        borderWidth: 2, borderColor: theme.colors.primary,
    },
    planCardActive: { borderColor: '#FF7A45' },
    planHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
    planTitleWhite: { fontSize: 18, fontWeight: '800', color: '#FFF', marginBottom: 2 },
    planDescWhite: { fontSize: 11, color: 'rgba(255,255,255,0.7)' },
    recommendedBadge: { backgroundColor: '#FF7A45', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, alignItems: 'center' },
    recommendedBadgeText: { fontSize: 9, fontWeight: '800', color: '#FFF', letterSpacing: 0.5, marginBottom: 2 },
    planPriceWhite: { fontSize: 20, fontWeight: '900', color: '#FFF' },
    planPricePeriod: { fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.7)' },

    planIconsRow: { flexDirection: 'row', gap: 8 },
    iconPill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    iconPillText: { fontSize: 9, fontWeight: '800', color: '#FFF', letterSpacing: 0.5 },

    planCardLight: {
        backgroundColor: '#FFF', borderRadius: 16, padding: 20, marginBottom: 24,
        borderWidth: 2, borderColor: theme.colors.border,
    },
    planCardLightActive: { borderColor: theme.colors.primary },
    planTitleDark: { fontSize: 16, fontWeight: '800', color: theme.colors.textMain, marginBottom: 2 },
    planDescDark: { fontSize: 11, color: theme.colors.textMuted },
    priceRowLight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    planPriceDark: { fontSize: 20, fontWeight: '900', color: theme.colors.textMain },
    planPricePeriodDark: { fontSize: 12, fontWeight: '700', color: theme.colors.textMuted },
    arrowCircle: { width: 28, height: 28, borderRadius: 14, borderWidth: 1, borderColor: theme.colors.border, justifyContent: 'center', alignItems: 'center' },
    iconPillDark: { justifyContent: 'center', alignItems: 'center', marginRight: 12 },

    // Coverage Analysis
    coverageAnalysisSection: { marginBottom: 32 },
    analysisTitle: { fontSize: 11, fontWeight: '800', color: theme.colors.textMuted, letterSpacing: 1.5, marginBottom: 16 },
    analysisColumns: { flexDirection: 'row' },
    analysisColLeft: { flex: 1, borderRightWidth: 1, borderRightColor: theme.colors.border, paddingRight: 16 },
    analysisColRight: { flex: 1, paddingLeft: 16 },
    analysisColHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
    incExcLabel: { fontSize: 10, fontWeight: '800', color: '#E8472A', letterSpacing: 0.5 },
    incExcLabelGray: { fontSize: 10, fontWeight: '800', color: theme.colors.textMuted, letterSpacing: 0.5 },
    analysisItemText: { fontSize: 12, fontWeight: '700', color: theme.colors.primary, marginBottom: 8 },
    analysisItemTextGray: { fontSize: 12, fontWeight: '600', color: theme.colors.textMuted, marginBottom: 8 },

    // Button
    activateBtn: { width: '100%', alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.primary, paddingVertical: 18, borderRadius: 12, marginBottom: 12 },
    activateBtnText: { fontSize: 13, fontWeight: '800', color: '#FFF', letterSpacing: 0.5 },
    autoRenewText: { fontSize: 11, color: theme.colors.textMuted, textAlign: 'center' },

});
