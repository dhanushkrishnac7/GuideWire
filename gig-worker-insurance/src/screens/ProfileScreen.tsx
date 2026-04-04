import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';

interface Props {
    zone: string;
    fleet: string;
    plan: string;
    onNavigate: (screen: string) => void;
}

export default function ProfileScreen({ zone, fleet, plan, onNavigate }: Props) {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => onNavigate('Home')}>
                    <Ionicons name="arrow-back" size={24} color={theme.colors.textMain} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Profile</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scroll}>
                <View style={styles.profileHeader}>
                    <View style={styles.avatarCircle}>
                        <Ionicons name="person" size={48} color="#FFF" />
                    </View>
                    <Text style={styles.userName}>Raju S.</Text>
                    <Text style={styles.userPhone}>+91 98765 43210</Text>
                    <View style={styles.verifiedBadge}>
                        <Ionicons name="checkmark-circle" size={14} color={theme.colors.success} />
                        <Text style={styles.verifiedText}>KYC Verified</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>WORK DETAILS</Text>
                    <View style={styles.card}>
                        <View style={styles.detailRow}>
                            <View style={styles.detailIconBox}>
                                <Ionicons name="location" size={20} color={theme.colors.primary} />
                            </View>
                            <View>
                                <Text style={styles.detailLabel}>Active Working Zone</Text>
                                <Text style={styles.detailValue}>{zone}</Text>
                            </View>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.detailRow}>
                            <View style={styles.detailIconBox}>
                                <Ionicons name="bicycle" size={20} color={theme.colors.primary} />
                            </View>
                            <View>
                                <Text style={styles.detailLabel}>Fleet Type</Text>
                                <Text style={styles.detailValue}>{fleet} Partner</Text>
                            </View>
                        </View>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>ACTIVE COVERAGE</Text>
                    <View style={styles.card}>
                        <View style={styles.detailRow}>
                            <View style={styles.detailIconBox}>
                                <Ionicons name="shield-checkmark" size={20} color={theme.colors.success} />
                            </View>
                            <View>
                                <Text style={styles.detailLabel}>Humsafar Plan</Text>
                                <Text style={styles.detailValue}>{plan} Plan (Weekly)</Text>
                            </View>
                        </View>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>SETTINGS</Text>
                    <View style={styles.card}>
                        <TouchableOpacity style={styles.actionRow}>
                            <Ionicons name="wallet-outline" size={20} color={theme.colors.textSub} />
                            <Text style={styles.actionText}>Payment Methods & UPI</Text>
                            <Ionicons name="chevron-forward" size={16} color={theme.colors.textMuted} style={styles.chevron} />
                        </TouchableOpacity>
                        <View style={styles.divider} />
                        <TouchableOpacity style={styles.actionRow} onPress={() => onNavigate('Terms')}>
                            <Ionicons name="document-text-outline" size={20} color={theme.colors.textSub} />
                            <Text style={styles.actionText}>Terms & Conditions</Text>
                            <Ionicons name="chevron-forward" size={16} color={theme.colors.textMuted} style={styles.chevron} />
                        </TouchableOpacity>
                        <View style={styles.divider} />
                        <TouchableOpacity style={styles.actionRow}>
                            <Ionicons name="headset-outline" size={20} color={theme.colors.textSub} />
                            <Text style={styles.actionText}>Help & Support</Text>
                            <Ionicons name="chevron-forward" size={16} color={theme.colors.textMuted} style={styles.chevron} />
                        </TouchableOpacity>
                    </View>
                </View>

                <TouchableOpacity style={styles.logoutButton}>
                    <Text style={styles.logoutText}>Sign Out</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: theme.colors.border },
    backButton: { width: 40, height: 40, justifyContent: 'center' },
    headerTitle: { fontSize: 18, fontWeight: '700', color: theme.colors.textMain },
    scroll: { paddingBottom: 100 },

    profileHeader: { alignItems: 'center', paddingVertical: 32, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: theme.colors.border },
    avatarCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: theme.colors.primary, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
    userName: { fontSize: 24, fontWeight: '800', color: theme.colors.primary, marginBottom: 4 },
    userPhone: { fontSize: 15, color: theme.colors.textSub, marginBottom: 12 },
    verifiedBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: theme.colors.successBg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    verifiedText: { fontSize: 12, fontWeight: '700', color: theme.colors.success },

    section: { marginHorizontal: 16, marginTop: 24 },
    sectionTitle: { fontSize: 11, fontWeight: '700', color: theme.colors.textMuted, letterSpacing: 1.5, marginBottom: 8, marginLeft: 4 },
    card: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: theme.colors.border },

    detailRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 8 },
    detailIconBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(26,27,75,0.05)', justifyContent: 'center', alignItems: 'center' },
    detailLabel: { fontSize: 12, color: theme.colors.textMuted, marginBottom: 2 },
    detailValue: { fontSize: 16, fontWeight: '700', color: theme.colors.textMain },

    actionRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 12 },
    actionText: { flex: 1, fontSize: 15, fontWeight: '600', color: theme.colors.textMain },
    chevron: { marginLeft: 'auto' },

    divider: { height: 1, backgroundColor: theme.colors.border, marginVertical: 8 },

    logoutButton: { marginHorizontal: 16, marginTop: 32, paddingVertical: 16, borderRadius: 14, backgroundColor: theme.colors.dangerBg, alignItems: 'center' },
    logoutText: { fontSize: 16, fontWeight: '700', color: '#E74C3C' },
});
