import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList
} from 'react-native';
import { useStore } from '../../store/useStore';
import StatCard from '../../components/StatCard';
import ErrorMessage from '../../components/ErrorMessage';
import { ChartBar as BarChart3, Users, CreditCard, CircleCheck as CheckCircle, Circle as XCircle, ArrowRight } from 'lucide-react-native';
import { Contribution, Payment } from '../../types/schema';
import { useRouter } from 'expo-router';
import { formatAmount } from '../../utils/formatters';
import { useTheme } from '../../lib/theme';

export default function ReportsScreen() {
  const {
    members,
    contributions,
    payments,
    error,
    fetchMembers,
    fetchContributions,
    fetchPayments,
    getPaymentSummary
  } = useStore();

  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { colors } = useTheme();

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        fetchMembers(),
        fetchContributions(),
        fetchPayments()
      ]);
    };

    loadData();
  }, []);

  useEffect(() => {
    if (error) {
      setErrorMsg(error);
    }
  }, [error]);

  // Calculate global statistics
  const totalMembers = members.length;
  const totalContributions = contributions.length;

  // Calculate total collected amount across all contributions
  const calculateTotalCollected = () => {
    let total = 0;

    contributions.forEach(contribution => {
      const contributionPayments = payments.filter(
        p => p.cotisation_id === contribution.id && p.payer
      );

      total += contributionPayments.length * contribution.montant_unitaire;
    });

    return total;
  };

  const totalCollected = calculateTotalCollected();

  // Calculate payment status across all contributions
  const calculatePaymentRate = () => {
    if (contributions.length === 0 || members.length === 0) return 0;

    const totalPossiblePayments = contributions.length * members.length;
    const totalActualPayments = payments.filter(p => p.payer).length;

    return totalActualPayments / totalPossiblePayments * 100;
  };

  const paymentRate = calculatePaymentRate();

  // Get latest contribution for quick access
  const latestContribution = contributions.length > 0
    ? contributions.sort((a, b) => {
      if (!a.date_echeance) return 1;
      if (!b.date_echeance) return -1;
      return new Date(b.date_echeance).getTime() - new Date(a.date_echeance).getTime();
    })[0]
    : null;

  // Navigate to payments screen for a specific contribution
  const handleViewContribution = (contribution: Contribution) => {
    router.push({
      pathname: '/payments',
      params: { contributionId: contribution.id }
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <Text style={styles.title}>Rapports</Text>
        <Text style={styles.subtitle}>Vue d'ensemble des cotisations</Text>
      </View>

      <ScrollView>
        {/* Error Message */}
        <ErrorMessage
          message={errorMsg || ''}
          onDismiss={() => setErrorMsg(null)}
        />

        {/* Global Stats */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Statistiques globales</Text>

          <View style={styles.statsGrid}>
            <StatCard
              title="Total des membres"
              value={totalMembers}
              icon={<Users size={24} color={colors.primary} />}
              color={colors.primary}
              bgColor={colors.primaryLight}
            />

            <StatCard
              title="Types de cotisations"
              value={totalContributions}
              icon={<BarChart3 size={24} color={colors.primary} />}
              color={colors.primary}
              bgColor={colors.primaryLight}
            />

            <StatCard
              title="Total collecté"
              value={formatAmount(totalCollected)}
              icon={<CreditCard size={24} color={colors.success} />}
              color={colors.success}
              bgColor={colors.successLight}
            />

            <StatCard
              title="Taux de paiement"
              value={`${paymentRate.toFixed(0)}%`}
              icon={<CheckCircle size={24} color={colors.success} />}
              color={colors.success}
              bgColor={colors.successLight}
            />
          </View>
        </View>

        {/* Latest Contribution Summary */}
        {latestContribution && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Dernière cotisation</Text>

            <View style={[styles.contributionCard, { backgroundColor: colors.card }]}>
              <Text style={[styles.contributionTitle, { color: colors.text }]}>{latestContribution.type}</Text>
              <Text style={[styles.contributionDesc, { color: colors.textSecondary }]}>{latestContribution.description}</Text>

              {latestContribution.date_echeance && (
                <Text style={[styles.contributionDate, { color: colors.primary }]}>
                  Échéance: {new Date(latestContribution.date_echeance).toLocaleDateString()}
                </Text>
              )}

              <View style={styles.contributionStats}>
                {(() => {
                  const summary = getPaymentSummary(latestContribution.id);
                  return (
                    <>
                      <View style={styles.statItem}>
                        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Payés</Text>
                        <Text style={[styles.statValue, { color: colors.text }]}>{summary.total_paid}</Text>
                      </View>

                      <View style={styles.statItem}>
                        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Non payés</Text>
                        <Text style={[styles.statValue, { color: colors.text }]}>{summary.total_unpaid}</Text>
                      </View>

                      <View style={styles.statItem}>
                        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Collecté</Text>
                        <Text style={[styles.statValue, { color: colors.text }]}>
                          {formatAmount(summary.total_amount_collected)}
                        </Text>
                      </View>

                      <View style={styles.statItem}>
                        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Restant dû</Text>
                        <Text style={[styles.statValue, { color: colors.text }]}>
                          {formatAmount(summary.total_amount_due)}
                        </Text>
                      </View>
                    </>
                  );
                })()}
              </View>

              <TouchableOpacity
                style={[styles.viewButton, { borderTopColor: colors.border }]}
                onPress={() => handleViewContribution(latestContribution)}
              >
                <Text style={[styles.viewButtonText, { color: colors.primary }]}>Voir les détails</Text>
                <ArrowRight size={16} color={colors.primary} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* All Contributions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Toutes les cotisations</Text>

          {contributions.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: colors.card }]}>
              <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
                Aucune cotisation disponible.
              </Text>
            </View>
          ) : (
            contributions.map(contribution => {
              const summary = getPaymentSummary(contribution.id);

              return (
                <TouchableOpacity
                  key={contribution.id}
                  style={[styles.contributionItem, { backgroundColor: colors.card }]}
                  onPress={() => handleViewContribution(contribution)}
                >
                  <View style={styles.contributionHeader}>
                    <Text style={[styles.contributionItemTitle, { color: colors.text }]}>{contribution.type}</Text>
                    <ArrowRight size={16} color={colors.textSecondary} />
                  </View>

                  <View style={styles.contributionItemStats}>
                    <View style={styles.contributionItemStat}>
                      <CheckCircle size={16} color={colors.success} />
                      <Text style={[styles.contributionItemStatText, { color: colors.textSecondary }]}>
                        {summary.total_paid} payés ({formatAmount(summary.total_amount_collected)})
                      </Text>
                    </View>

                    <View style={styles.contributionItemStat}>
                      <XCircle size={16} color={colors.error} />
                      <Text style={[styles.contributionItemStatText, { color: colors.textSecondary }]}>
                        {summary.total_unpaid} non payés ({formatAmount(summary.total_amount_due)})
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
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
  section: {
    padding: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  contributionCard: {
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  contributionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  contributionDesc: {
    fontSize: 14,
    marginBottom: 8,
  },
  contributionDate: {
    fontSize: 14,
    marginBottom: 16,
  },
  contributionStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    width: '48%',
    marginBottom: 12,
    alignItems: 'center',
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 12,
    marginBottom: 2,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
  },
  viewButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },
  contributionItem: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  contributionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  contributionItemTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  contributionItemStats: {
    marginTop: 4,
  },
  contributionItemStat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  contributionItemStatText: {
    fontSize: 14,
    marginLeft: 6,
  },
  emptyState: {
    padding: 24,
    alignItems: 'center',
    borderRadius: 8,
  },
  emptyStateText: {
    fontSize: 14,
    textAlign: 'center',
  },
});