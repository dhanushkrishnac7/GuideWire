import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../theme';
import SwipeToAccept from '../components/SwipeToAccept';

interface Props {
    onBack: () => void;
}

export default function PolicySelectionScreen({ onBack }: Props) {
    const [selectedPlan, setSelectedPlan] = useState<'Mid' | 'Pro' | 'Premium'>('Pro');
    const [termsAccepted, setTermsAccepted] = useState(false);

    const plans = [
        {
            id: 'Mid',
            title: 'Mid Plan',
            price: '₹299/mo',
            coverage: 'Up to ₹2 Lakh',
            benefits: ['Rain & Heat coverage', 'Basic Health Support'],
            colors: ['#E6F4FF', '#FFF']
        },
        {
            id: 'Pro',
            title: 'Pro Plan',
            price: '₹599/mo',
            coverage: 'Up to ₹5 Lakh',
            benefits: ['All Mid Plan features', 'Strike & Riot coverage', 'Instant Payouts'],
            colors: ['#EAE6FF', '#FFF'],
            recommended: true
        },
        {
            id: 'Premium',
            title: 'Premium Plan',
            price: '₹999/mo',
            coverage: 'Up to ₹10 Lakh',
            benefits: ['All Pro Plan features', 'Family Health Cover', 'Zero Deductibles'],
            colors: ['#FFF1E6', '#FFF']
        }
    ];

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
                                <Text style={styles.planPrice}>{plan.price}</Text>
                                <Text style={styles.planCoverage}>Coverage: {plan.coverage}</Text>

                                <View style={styles.benefitsList}>
                                    {plan.benefits.map((benefit, idx) => (
                                        <View key={idx} style={styles.benefitRow}>
                                            <Ionicons name="checkmark-circle" size={16} color={theme.colors.primary} />
                                            <Text style={styles.benefitText}>{benefit}</Text>
                                        </View>
                                    ))}
                                </View>
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
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: theme.colors.background },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: theme.spacing.m, paddingVertical: theme.spacing.s },
    backButton: { padding: theme.spacing.s, marginLeft: -theme.spacing.s },
    headerTitle: { ...theme.typography.header, fontSize: 18 },
    scrollContent: { padding: theme.spacing.m, paddingBottom: 100 },
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
    planPrice: { fontSize: 24, fontWeight: '800', color: theme.colors.primary, marginBottom: 4 },
    planCoverage: { ...theme.typography.subtitle, color: theme.colors.textMain, marginBottom: 16 },
    benefitsList: { gap: 8 },
    benefitRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    benefitText: { ...theme.typography.body, color: theme.colors.textMain },
    termsContainer: { padding: theme.spacing.m, backgroundColor: 'rgba(0,0,0,0.03)', borderRadius: theme.borderRadius.s, marginBottom: theme.spacing.l },
    termsTitle: { ...theme.typography.subtitle, marginBottom: 8 },
    termsText: { ...theme.typography.body, color: theme.colors.textMuted, lineHeight: 18 },
    actionContainer: { alignItems: 'center', marginHorizontal: 0 },
    confirmBtn: { width: '100%', backgroundColor: theme.colors.primary, paddingVertical: 16, borderRadius: theme.borderRadius.m, alignItems: 'center', marginTop: theme.spacing.m },
    confirmBtnDisabled: { backgroundColor: theme.colors.textMuted },
    confirmBtnText: { color: '#FFF', ...theme.typography.title, fontSize: 16 },
});
