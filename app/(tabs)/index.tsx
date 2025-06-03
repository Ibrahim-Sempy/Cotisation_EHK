import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useStore } from '../../store/useStore';
import { Users, CreditCard, CircleCheck as CheckCircle, Circle as XCircle } from 'lucide-react-native';
import StatCard from '../../components/StatCard';
import { formatAmount } from '../../utils/formatters';
import ContributionTypeSelector from '../../components/ContributionTypeSelector';
import { useTheme } from '../../lib/theme';

export default function HomeScreen() {
  const {
    members,
    contributions,
    payments,
    selectedContribution,
    fetchMembers,
    fetchContributions,
    fetchPayments,
    setSelectedContribution
  } = useStore();
  const { colors } = useTheme();

  useEffect(() => {
    fetchMembers();
    fetchContributions();
    fetchPayments();
  }, []);

  // Calculate dashboard statistics
  const totalMembers = members.length;

  // Get latest contribution if none selected
  const latestContribution = selectedContribution || (contributions.length > 0
    ? contributions.sort((a, b) => {
      if (!a.date_echeance) return 1;
      if (!b.date_echeance) return -1;
      return new Date(b.date_echeance).getTime() - new Date(a.date_echeance).getTime();
    })[0]
    : null);

  // Calculate payment statistics for selected/latest contribution
  const contributionPayments = latestContribution
    ? payments.filter(p => p.cotisation_id === latestContribution.id)
    : [];

  const totalPaid = contributionPayments.filter(p => p.payer).length;
  const totalUnpaid = totalMembers - totalPaid;
  const totalCollected = latestContribution
    ? totalPaid * latestContribution.montant_unitaire
    : 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <Text style={styles.title}>Tableau de bord</Text>
        <Text style={styles.subtitle}>Aperçu des cotisations et membres</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.statsContainer}>
          <ContributionTypeSelector
            contributions={contributions}
            selectedContribution={selectedContribution}
            onSelect={setSelectedContribution}
          />

          <View style={styles.statsGrid}>
            <StatCard
              title="Total des membres"
              value={totalMembers}
              icon={<Users size={24} color="#4F46E5" />}
              color="#4F46E5"
              bgColor="#EEF2FF"
            />

            <StatCard
              title="Cotisations collectées"
              value={formatAmount(totalCollected)}
              icon={<CreditCard size={24} color="#10B981" />}
              color="#10B981"
              bgColor="#DCFCE7"
            />

            <StatCard
              title="Membres ayant payé"
              value={totalPaid}
              icon={<CheckCircle size={24} color="#10B981" />}
              color="#10B981"
              bgColor="#DCFCE7"
            />

            <StatCard
              title="Membres n'ayant pas payé"
              value={totalUnpaid}
              icon={<XCircle size={24} color="#EF4444" />}
              color="#EF4444"
              bgColor="#FEE2E2"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {selectedContribution ? 'Cotisation sélectionnée' : 'Cotisation actuelle'}
          </Text>
          {latestContribution ? (
            <View style={styles.contributionCard}>
              <Text style={styles.contributionType}>{latestContribution.type}</Text>
              <Text style={styles.contributionDescription}>{latestContribution.description}</Text>
              <View style={styles.contributionDetails}>
                <Text style={styles.contributionAmount}>
                  Montant: {formatAmount(latestContribution.montant_unitaire)}
                </Text>
                {latestContribution.date_echeance && (
                  <Text style={styles.contributionDate}>
                    Échéance: {new Date(latestContribution.date_echeance).toLocaleDateString()}
                  </Text>
                )}
              </View>

              <View style={styles.progressContainer}>
                <View style={styles.progressLabels}>
                  <Text style={styles.progressLabel}>Progression des paiements</Text>
                  <Text style={styles.progressPercentage}>
                    {totalMembers > 0 ? Math.round((totalPaid / totalMembers) * 100) : 0}%
                  </Text>
                </View>

                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${totalMembers > 0 ? (totalPaid / totalMembers) * 100 : 0}%` }
                    ]}
                  />
                </View>

                <View style={styles.progressStats}>
                  <Text style={styles.progressStat}>
                    {totalPaid} / {totalMembers} membres ont payé
                  </Text>
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                Aucune cotisation disponible. Créez une nouvelle cotisation pour commencer.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    paddingTop: 60,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  statsContainer: {
    padding: 16,
    marginTop: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  section: {
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 12,
  },
  contributionCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  contributionType: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  contributionDescription: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 12,
  },
  contributionDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  contributionAmount: {
    fontSize: 14,
    color: '#4F46E5',
    fontWeight: '500',
  },
  contributionDate: {
    fontSize: 14,
    color: '#64748B',
  },
  progressContainer: {
    marginTop: 8,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  progressLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4F46E5',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4F46E5',
    borderRadius: 4,
  },
  progressStats: {
    marginTop: 4,
  },
  progressStat: {
    fontSize: 12,
    color: '#64748B',
  },
  emptyState: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
});