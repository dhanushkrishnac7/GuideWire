import React, { useState, useRef } from 'react';
import {
    View, Text, StyleSheet, SafeAreaView, ScrollView,
    TouchableOpacity, Modal, TextInput, KeyboardAvoidingView,
    Platform, FlatList, Animated
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../theme';
import SwipeToAccept from '../components/SwipeToAccept';

interface Props {
    onBack: () => void;
}

interface Plan {
    id: string;
    title: string;
    price: string;
    coverage: string;
    benefits: string[];
    colors: [string, string];
    recommended?: boolean;
    details: {
        deductible: string;
        waitingPeriod: string;
        payoutTime: string;
        coveredEvents: string[];
        exclusions: string[];
        maxClaimsPerYear: number;
    };
}

interface ChatMessage {
    id: string;
    text: string;
    sender: 'user' | 'bot';
}

const PLAN_DETAILS_EXTRA: Record<string, Plan['details']> = {
    Mid: {
        deductible: '₹500 per claim',
        waitingPeriod: '48 hours',
        payoutTime: 'Within 3 business days',
        coveredEvents: ['Rainfall > 20mm in 24hrs', 'Heatwave > 42°C for 2+ days', 'Basic hospitalization'],
        exclusions: ['Pre-existing conditions', 'Self-inflicted damage', 'Vehicle accidents'],
        maxClaimsPerYear: 3,
    },
    Pro: {
        deductible: 'Nil',
        waitingPeriod: '24 hours',
        payoutTime: 'Within 1 business day',
        coveredEvents: ['All Mid Plan events', 'Cyclone & flood alerts', 'Declared strikes & civil unrest', 'Instant digital payouts'],
        exclusions: ['Fraudulent claims', 'War & nuclear risk'],
        maxClaimsPerYear: 6,
    },
    Premium: {
        deductible: 'Nil',
        waitingPeriod: 'None',
        payoutTime: 'Instant (within 4 hrs)',
        coveredEvents: ['All Pro Plan events', 'Family health hospitalization', 'OPD coverage up to ₹10k', 'Zero waiting period'],
        exclusions: ['Fraudulent claims'],
        maxClaimsPerYear: 12,
    }
};

const BOT_REPLIES: Record<string, string> = {
    default: "I'm your AI insurance assistant! You can ask me about coverage, payouts, exclusions, or which plan suits your gig work.",
    coverage: "Coverage varies by plan. Mid Plan covers up to ₹2 Lakh, Pro Plan up to ₹5 Lakh, and Premium Plan up to ₹10 Lakh.",
    payout: "Payouts are triggered automatically when weather or strike events are verified via our API partners. Premium plan offers instant payouts within 4 hours!",
    exclusion: "Common exclusions include pre-existing conditions and fraudulent claims. The Premium plan has the fewest exclusions.",
    deductible: "Pro and Premium plans have ZERO deductibles. Mid Plan has a ₹500 deductible per claim.",
    recommend: "For most gig workers, we recommend the Pro Plan — it balances cost and comprehensive coverage with instant payouts.",
    claim: "To file a claim, just open the Claims tab in the app. Our system auto-detects most eligible events, so you may not need to file manually!",
    waiting: "Mid Plan has a 48hr waiting period. Pro has 24hrs. Premium has NO waiting period — coverage starts immediately!",
};

function getBotReply(text: string): string {
    const lower = text.toLowerCase();
    if (lower.includes('coverage') || lower.includes('cover')) return BOT_REPLIES.coverage;
    if (lower.includes('payout') || lower.includes('pay')) return BOT_REPLIES.payout;
    if (lower.includes('exclusion') || lower.includes('exclude') || lower.includes('not cover')) return BOT_REPLIES.exclusion;
    if (lower.includes('deductible')) return BOT_REPLIES.deductible;
    if (lower.includes('recommend') || lower.includes('best plan') || lower.includes('which plan')) return BOT_REPLIES.recommend;
    if (lower.includes('claim') || lower.includes('file')) return BOT_REPLIES.claim;
    if (lower.includes('wait') || lower.includes('period')) return BOT_REPLIES.waiting;
    return BOT_REPLIES.default;
}

export default function PolicySelectionScreen({ onBack }: Props) {
    const [selectedPlan, setSelectedPlan] = useState<'Mid' | 'Pro' | 'Premium'>('Pro');
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [detailsVisible, setDetailsVisible] = useState(false);
    const [viewingPlan, setViewingPlan] = useState<Plan | null>(null);
    const [chatVisible, setChatVisible] = useState(false);
    const [chatInput, setChatInput] = useState('');
    const [messages, setMessages] = useState<ChatMessage[]>([
        { id: '0', text: "👋 Hi! I'm your AI policy assistant. Ask me anything about coverage, claims, or which plan suits you best!", sender: 'bot' }
    ]);
    const chatScrollRef = useRef<FlatList>(null);
    const fabScale = useRef(new Animated.Value(1)).current;

    const plans: Plan[] = [
        {
            id: 'Mid',
            title: 'Mid Plan',
            price: '₹299/mo',
            coverage: 'Up to ₹2 Lakh',
            benefits: ['Rain & Heat coverage', 'Basic Health Support'],
            colors: ['#E6F4FF', '#FFF'],
            details: PLAN_DETAILS_EXTRA.Mid,
        },
        {
            id: 'Pro',
            title: 'Pro Plan',
            price: '₹599/mo',
            coverage: 'Up to ₹5 Lakh',
            benefits: ['All Mid Plan features', 'Strike & Riot coverage', 'Instant Payouts'],
            colors: ['#EAE6FF', '#FFF'],
            recommended: true,
            details: PLAN_DETAILS_EXTRA.Pro,
        },
        {
            id: 'Premium',
            title: 'Premium Plan',
            price: '₹999/mo',
            coverage: 'Up to ₹10 Lakh',
            benefits: ['All Pro Plan features', 'Family Health Cover', 'Zero Deductibles'],
            colors: ['#FFF1E6', '#FFF'],
            details: PLAN_DETAILS_EXTRA.Premium,
        }
    ];

    function openDetails(plan: Plan) {
        setViewingPlan(plan);
        setDetailsVisible(true);
    }

    function sendMessage() {
        const trimmed = chatInput.trim();
        if (!trimmed) return;
        const userMsg: ChatMessage = { id: Date.now().toString(), text: trimmed, sender: 'user' };
        const botMsg: ChatMessage = { id: (Date.now() + 1).toString(), text: getBotReply(trimmed), sender: 'bot' };
        setMessages(prev => [...prev, userMsg, botMsg]);
        setChatInput('');
        setTimeout(() => chatScrollRef.current?.scrollToEnd({ animated: true }), 100);
    }

    function pulseFab() {
        Animated.sequence([
            Animated.spring(fabScale, { toValue: 0.88, useNativeDriver: true }),
            Animated.spring(fabScale, { toValue: 1, useNativeDriver: true }),
        ]).start();
    }

    const planAccentColor: Record<string, string> = {
        Mid: '#4DACFF',
        Pro: theme.colors.primary,
        Premium: '#FF7A45',
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={theme.colors.textMain} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Select Policy</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.sectionTitle}>Choose your protection</Text>
                <Text style={styles.sectionSub}>Select a tier that fits your gig lifestyle.</Text>

                <View style={styles.plansContainer}>
                    {plans.map(plan => (
                        <TouchableOpacity
                            key={plan.id}
                            activeOpacity={0.9}
                            onPress={() => setSelectedPlan(plan.id as any)}
                        >
                            <LinearGradient
                                colors={plan.colors as [string, string]}
                                style={[styles.planCard, selectedPlan === plan.id && styles.planCardSelected]}
                            >
                                {plan.recommended && (
                                    <View style={styles.recommendedBadge}>
                                        <Text style={styles.recommendedText}>RECOMMENDED</Text>
                                    </View>
                                )}
                                <View style={styles.planHeader}>
                                    <Text style={styles.planTitle}>{plan.title}</Text>
                                    <View style={[styles.radio, selectedPlan === plan.id && styles.radioSelected]}>
                                        {selectedPlan === plan.id && <View style={styles.radioInner} />}
                                    </View>
                                </View>
                                <Text style={[styles.planPrice, { color: planAccentColor[plan.id] }]}>{plan.price}</Text>
                                <Text style={styles.planCoverage}>Coverage: {plan.coverage}</Text>

                                <View style={styles.benefitsList}>
                                    {plan.benefits.map((benefit, idx) => (
                                        <View key={idx} style={styles.benefitRow}>
                                            <Ionicons name="checkmark-circle" size={16} color={planAccentColor[plan.id]} />
                                            <Text style={styles.benefitText}>{benefit}</Text>
                                        </View>
                                    ))}
                                </View>

                                {/* View Full Details Button */}
                                <TouchableOpacity
                                    style={[styles.detailsBtn, { borderColor: planAccentColor[plan.id] }]}
                                    onPress={(e) => { e.stopPropagation?.(); openDetails(plan); }}
                                    activeOpacity={0.7}
                                >
                                    <Ionicons name="document-text-outline" size={14} color={planAccentColor[plan.id]} />
                                    <Text style={[styles.detailsBtnText, { color: planAccentColor[plan.id] }]}>View Full Details</Text>
                                    <Ionicons name="chevron-forward" size={14} color={planAccentColor[plan.id]} />
                                </TouchableOpacity>
                            </LinearGradient>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.termsContainer}>
                    <Text style={styles.termsTitle}>Terms & Conditions</Text>
                    <Text style={styles.termsText}>
                        By accepting, you agree to the gig-worker-insurance policy terms. Coverage begins 24 hours after plan activation. Payouts are subject to verification of weather or strike events via our API partners. Active app activity required for payouts.
                    </Text>
                </View>

                <View style={styles.actionContainer}>
                    <SwipeToAccept onAccept={() => setTermsAccepted(true)} />
                    <TouchableOpacity
                        style={[styles.confirmBtn, !termsAccepted && styles.confirmBtnDisabled]}
                        disabled={!termsAccepted}
                        onPress={() => {
                            if (termsAccepted) {
                                alert(`Successfully enrolled in ${selectedPlan} Plan!`);
                                onBack();
                            }
                        }}
                    >
                        <Text style={styles.confirmBtnText}>Confirm Selection</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* AI Chat Bot FAB */}
            <Animated.View style={[styles.fabContainer, { transform: [{ scale: fabScale }] }]}>
                <TouchableOpacity
                    style={styles.fab}
                    onPress={() => { pulseFab(); setChatVisible(true); }}
                    activeOpacity={0.85}
                >
                    <LinearGradient colors={['#6C63FF', '#3B82F6']} style={styles.fabGradient}>
                        <Ionicons name="chatbubble-ellipses" size={22} color="#FFF" />
                    </LinearGradient>
                    <View style={styles.fabBadge}>
                        <Text style={styles.fabBadgeText}>AI</Text>
                    </View>
                </TouchableOpacity>
                <Text style={styles.fabLabel}>Help</Text>
            </Animated.View>

            {/* ── Policy Details Modal ── */}
            <Modal
                visible={detailsVisible}
                animationType="slide"
                transparent
                onRequestClose={() => setDetailsVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.detailsModal}>
                        {viewingPlan && (
                            <>
                                <LinearGradient
                                    colors={viewingPlan.colors}
                                    style={styles.detailsModalHeader}
                                >
                                    <View>
                                        <Text style={styles.detailsModalTitle}>{viewingPlan.title}</Text>
                                        <Text style={[styles.detailsModalPrice, { color: planAccentColor[viewingPlan.id] }]}>{viewingPlan.price}</Text>
                                        <Text style={styles.detailsModalCoverage}>Coverage: {viewingPlan.coverage}</Text>
                                    </View>
                                    <TouchableOpacity onPress={() => setDetailsVisible(false)} style={styles.modalCloseBtn}>
                                        <Ionicons name="close-circle" size={28} color={planAccentColor[viewingPlan.id]} />
                                    </TouchableOpacity>
                                </LinearGradient>

                                <ScrollView style={styles.detailsModalBody} showsVerticalScrollIndicator={false}>
                                    <DetailRow icon="flash" label="Deductible" value={viewingPlan.details.deductible} color={planAccentColor[viewingPlan.id]} />
                                    <DetailRow icon="time" label="Waiting Period" value={viewingPlan.details.waitingPeriod} color={planAccentColor[viewingPlan.id]} />
                                    <DetailRow icon="wallet" label="Payout Time" value={viewingPlan.details.payoutTime} color={planAccentColor[viewingPlan.id]} />
                                    <DetailRow icon="document-text" label="Max Claims / Year" value={`${viewingPlan.details.maxClaimsPerYear} claims`} color={planAccentColor[viewingPlan.id]} />

                                    <Text style={styles.detailSection}>✅ Covered Events</Text>
                                    {viewingPlan.details.coveredEvents.map((ev, i) => (
                                        <View key={i} style={styles.bulletRow}>
                                            <Ionicons name="checkmark-circle" size={16} color={planAccentColor[viewingPlan.id]} />
                                            <Text style={styles.bulletText}>{ev}</Text>
                                        </View>
                                    ))}

                                    <Text style={styles.detailSection}>🚫 Exclusions</Text>
                                    {viewingPlan.details.exclusions.map((ex, i) => (
                                        <View key={i} style={styles.bulletRow}>
                                            <Ionicons name="close-circle" size={16} color="#FF3B30" />
                                            <Text style={styles.bulletText}>{ex}</Text>
                                        </View>
                                    ))}

                                    <TouchableOpacity
                                        style={[styles.selectFromDetailBtn, { backgroundColor: planAccentColor[viewingPlan.id] }]}
                                        onPress={() => { setSelectedPlan(viewingPlan.id as any); setDetailsVisible(false); }}
                                    >
                                        <Text style={styles.selectFromDetailBtnText}>Select This Plan</Text>
                                        <Ionicons name="checkmark" size={18} color="#FFF" />
                                    </TouchableOpacity>

                                    <View style={{ height: 24 }} />
                                </ScrollView>
                            </>
                        )}
                    </View>
                </View>
            </Modal>

            {/* ── AI Chat Bot Modal ── */}
            <Modal
                visible={chatVisible}
                animationType="slide"
                transparent
                onRequestClose={() => setChatVisible(false)}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.modalOverlay}
                >
                    <View style={styles.chatModal}>
                        {/* Header */}
                        <LinearGradient colors={['#6C63FF', '#3B82F6']} style={styles.chatHeader}>
                            <View style={styles.chatHeaderLeft}>
                                <View style={styles.botAvatar}>
                                    <MaterialCommunityIcons name="robot-happy" size={22} color="#FFF" />
                                </View>
                                <View>
                                    <Text style={styles.chatHeaderTitle}>AI Policy Assistant</Text>
                                    <View style={styles.onlineRow}>
                                        <View style={styles.onlineDot} />
                                        <Text style={styles.onlineText}>Always here to help</Text>
                                    </View>
                                </View>
                            </View>
                            <TouchableOpacity onPress={() => setChatVisible(false)}>
                                <Ionicons name="close-circle" size={28} color="rgba(255,255,255,0.8)" />
                            </TouchableOpacity>
                        </LinearGradient>

                        {/* Suggestion Chips */}
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll} contentContainerStyle={styles.chipRow}>
                            {['Which plan is best?', 'How do payouts work?', 'What is the waiting period?', 'Any deductibles?'].map(chip => (
                                <TouchableOpacity key={chip} style={styles.chip} onPress={() => { setChatInput(chip); }}>
                                    <Text style={styles.chipText}>{chip}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        {/* Messages */}
                        <FlatList
                            ref={chatScrollRef}
                            data={messages}
                            keyExtractor={m => m.id}
                            style={styles.messageList}
                            contentContainerStyle={{ padding: 12, gap: 8 }}
                            renderItem={({ item }) => (
                                <View style={[styles.messageBubble, item.sender === 'user' ? styles.userBubble : styles.botBubble]}>
                                    {item.sender === 'bot' && (
                                        <MaterialCommunityIcons name="robot-happy-outline" size={16} color="#6C63FF" style={{ marginRight: 6, marginTop: 2 }} />
                                    )}
                                    <Text style={[styles.messageText, item.sender === 'user' && { color: '#FFF' }]}>{item.text}</Text>
                                </View>
                            )}
                        />

                        {/* Input */}
                        <View style={styles.chatInputRow}>
                            <TextInput
                                style={styles.chatInput}
                                value={chatInput}
                                onChangeText={setChatInput}
                                placeholder="Ask about your policy..."
                                placeholderTextColor="#9CA3AF"
                                returnKeyType="send"
                                onSubmitEditing={sendMessage}
                            />
                            <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
                                <LinearGradient colors={['#6C63FF', '#3B82F6']} style={styles.sendBtnGrad}>
                                    <Ionicons name="send" size={18} color="#FFF" />
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </SafeAreaView>
    );
}

function DetailRow({ icon, label, value, color }: { icon: string; label: string; value: string; color: string }) {
    return (
        <View style={styles.detailRow}>
            <View style={[styles.detailIcon, { backgroundColor: color + '20' }]}>
                <Ionicons name={icon as any} size={16} color={color} />
            </View>
            <View style={{ flex: 1 }}>
                <Text style={styles.detailLabel}>{label}</Text>
                <Text style={styles.detailValue}>{value}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: theme.colors.background },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: theme.spacing.m, paddingVertical: theme.spacing.s },
    backButton: { padding: theme.spacing.s, marginLeft: -theme.spacing.s },
    headerTitle: { ...theme.typography.header, fontSize: 18 },
    scrollContent: { padding: theme.spacing.m, paddingBottom: 120 },
    sectionTitle: { ...theme.typography.header, marginBottom: 4 },
    sectionSub: { ...theme.typography.body, color: theme.colors.textMuted, marginBottom: theme.spacing.l },
    plansContainer: { gap: theme.spacing.m, marginBottom: theme.spacing.xl },
    planCard: { padding: theme.spacing.l, borderRadius: theme.borderRadius.m, borderWidth: 2, borderColor: 'transparent' },
    planCardSelected: { borderColor: theme.colors.primary },
    recommendedBadge: { position: 'absolute', top: -12, alignSelf: 'center', backgroundColor: theme.colors.primary, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
    recommendedText: { color: '#FFF', fontSize: 10, fontWeight: 'bold', letterSpacing: 0.5 },
    planHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    planTitle: { ...theme.typography.title, fontSize: 18 },
    radio: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: theme.colors.textMuted, justifyContent: 'center', alignItems: 'center' },
    radioSelected: { borderColor: theme.colors.primary },
    radioInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: theme.colors.primary },
    planPrice: { fontSize: 24, fontWeight: '800', marginBottom: 4 },
    planCoverage: { ...theme.typography.subtitle, color: theme.colors.textMain, marginBottom: 16 },
    benefitsList: { gap: 8, marginBottom: 14 },
    benefitRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    benefitText: { ...theme.typography.body, color: theme.colors.textMain },

    // View Full Details button inside card
    detailsBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 8, borderRadius: 8, borderWidth: 1.5, marginTop: 4 },
    detailsBtnText: { fontSize: 13, fontWeight: '600' },

    termsContainer: { padding: theme.spacing.m, backgroundColor: 'rgba(0,0,0,0.03)', borderRadius: theme.borderRadius.s, marginBottom: theme.spacing.l },
    termsTitle: { ...theme.typography.subtitle, marginBottom: 8 },
    termsText: { ...theme.typography.body, color: theme.colors.textMuted, lineHeight: 18 },
    actionContainer: { alignItems: 'center' },
    confirmBtn: { width: '100%', backgroundColor: theme.colors.primary, paddingVertical: 16, borderRadius: theme.borderRadius.m, alignItems: 'center', marginTop: theme.spacing.m },
    confirmBtnDisabled: { backgroundColor: theme.colors.textMuted },
    confirmBtnText: { color: '#FFF', ...theme.typography.title, fontSize: 16 },

    // FAB
    fabContainer: { position: 'absolute', bottom: 24, right: 20, alignItems: 'center' },
    fab: { width: 58, height: 58, borderRadius: 29, elevation: 8, shadowColor: '#6C63FF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8 },
    fabGradient: { width: 58, height: 58, borderRadius: 29, justifyContent: 'center', alignItems: 'center' },
    fabBadge: { position: 'absolute', top: -4, right: -4, backgroundColor: '#FF2E93', paddingHorizontal: 5, paddingVertical: 2, borderRadius: 8 },
    fabBadgeText: { color: '#FFF', fontSize: 9, fontWeight: 'bold' },
    fabLabel: { color: theme.colors.textMuted, fontSize: 11, marginTop: 4, fontWeight: '600' },

    // Modal Overlay
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },

    // Details Modal
    detailsModal: { backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '90%', overflow: 'hidden' },
    detailsModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: 20, paddingTop: 24 },
    detailsModalTitle: { fontSize: 22, fontWeight: '800', color: theme.colors.textMain, marginBottom: 4 },
    detailsModalPrice: { fontSize: 20, fontWeight: '800', marginBottom: 2 },
    detailsModalCoverage: { ...theme.typography.body, color: theme.colors.textMuted },
    modalCloseBtn: { padding: 4 },
    detailsModalBody: { paddingHorizontal: 20, paddingTop: 8 },

    detailRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
    detailIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
    detailLabel: { fontSize: 11, color: theme.colors.textMuted, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.3 },
    detailValue: { fontSize: 15, fontWeight: '700', color: theme.colors.textMain, marginTop: 1 },

    detailSection: { fontSize: 15, fontWeight: '700', color: theme.colors.textMain, marginTop: 12, marginBottom: 8 },
    bulletRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 8 },
    bulletText: { flex: 1, ...theme.typography.body, color: theme.colors.textMain, lineHeight: 20 },

    selectFromDetailBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 14, marginTop: 20 },
    selectFromDetailBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },

    // Chat Modal
    chatModal: { backgroundColor: '#F8F9FF', borderTopLeftRadius: 24, borderTopRightRadius: 24, height: '80%', overflow: 'hidden' },
    chatHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
    chatHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    botAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.25)', justifyContent: 'center', alignItems: 'center' },
    chatHeaderTitle: { color: '#FFF', fontSize: 16, fontWeight: '700' },
    onlineRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
    onlineDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#4CD964' },
    onlineText: { color: 'rgba(255,255,255,0.8)', fontSize: 11 },

    // Suggestion chips
    chipScroll: { maxHeight: 44, flexGrow: 0 },
    chipRow: { paddingHorizontal: 12, paddingVertical: 8, gap: 8 },
    chip: { backgroundColor: '#EDE9FF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#C4B5FD' },
    chipText: { color: '#6C63FF', fontSize: 12, fontWeight: '600' },

    // Messages
    messageList: { flex: 1 },
    messageBubble: { flexDirection: 'row', padding: 12, borderRadius: 16, maxWidth: '85%' },
    botBubble: { backgroundColor: '#FFF', alignSelf: 'flex-start', borderWidth: 1, borderColor: '#E5E7EB' },
    userBubble: { backgroundColor: '#6C63FF', alignSelf: 'flex-end', borderRadius: 16 },
    messageText: { flex: 1, fontSize: 14, color: theme.colors.textMain, lineHeight: 20 },

    // Input
    chatInputRow: { flexDirection: 'row', padding: 12, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#E5E7EB', gap: 8, alignItems: 'center' },
    chatInput: { flex: 1, backgroundColor: '#F3F4F6', borderRadius: 24, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, color: theme.colors.textMain },
    sendBtn: { width: 42, height: 42, borderRadius: 21, overflow: 'hidden' },
    sendBtnGrad: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
