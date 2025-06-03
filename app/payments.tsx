import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator
} from 'react-native';
import { useStore } from '../store/useStore';
import { useLocalSearchParams, useRouter } from 'expo-router';
import PaymentStatusItem from '../components/PaymentStatusItem';
import ErrorMessage from '../components/ErrorMessage';
import { ArrowLeft, Search, X, Users, CircleCheck as CheckCircle, Circle as XCircle } from 'lucide-react-native';
import { MemberPaymentStatus } from '../types/schema';
import StatCard from '../components/StatCard';

export default function PaymentsScreen() {
  const {
    members,
    contributions,
    payments,
    error,
    fetchMembers,
    fetchContributions,
    fetchPayments,
    updatePaymentStatus,
    getPaymentSummary,
    loading
  } = useStore();

  const router = useRouter();
  const { contributionId } = useLocalSearchParams<{ contributionId: string }>();
  const contributionIdNum = parseInt(contributionId || '0');

  const [searchQuery, setSearchQuery] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [memberPaymentStatus, setMemberPaymentStatus] = useState<MemberPaymentStatus[]>([]);

  useEffect(() => {
    // Load all required data
    const loadData = async () => {
      try {
        await Promise.all([
          fetchMembers(),
          fetchContributions(),
          fetchPayments()
        ]);
        console.log('Données chargées avec succès');
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        setErrorMsg('Erreur lors du chargement des données');
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (error) {
      setErrorMsg(error);
    }
  }, [error]);

  // Calculate member payment status when data changes
  useEffect(() => {
    if (members.length > 0 && payments.length > 0 && contributionIdNum) {
      console.log('Nombre de membres:', members.length);
      console.log('Nombre de paiements:', payments.length);
      console.log('ID de la cotisation:', contributionIdNum);

      const statuses: MemberPaymentStatus[] = members.map(member => {
        const payment = payments.find(
          p => p.membre_id === member.id && p.cotisation_id === contributionIdNum
        );

        console.log('Membre:', member.nom, member.prenom, 'Payment:', payment?.id);

        return {
          member,
          paid: payment?.payer || false,
          payment_id: payment?.id,
          payment_date: payment?.date_paiement
        };
      });

      setMemberPaymentStatus(statuses);
    } else {
      console.log('Données manquantes:', {
        membersLength: members.length,
        paymentsLength: payments.length,
        contributionIdNum
      });
    }
  }, [members, payments, contributionIdNum]);

  const handleUpdateStatus = async (memberId: number, paid: boolean) => {
    const status = memberPaymentStatus.find(s => s.member.id === memberId);

    if (status) {
      try {
        await updatePaymentStatus(
          status.payment_id || null,
          memberId,
          contributionIdNum,
          paid
        );
      } catch (error: any) {
        setErrorMsg(error.message);
      }
    }
  };

  // Get current contribution
  const contribution = contributions.find(c => c.id === contributionIdNum);

  // Get payment summary
  const summary = contributionIdNum ? getPaymentSummary(contributionIdNum) : null;

  // Filter members based on search query
  const filteredStatuses = memberPaymentStatus.filter(status => {
    const fullName = `${status.member.nom} ${status.member.prenom}`.toLowerCase();
    const phone = status.member.telephone?.toLowerCase() || '';
    const query = searchQuery.toLowerCase();
    return fullName.includes(query) || phone.includes(query);
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="white" />
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>Gestion des paiements</Text>
          <Text style={styles.subtitle}>
            {contribution ? contribution.type : 'Chargement...'}
          </Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Search size={20} color="#64748B" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher un membre..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <X size={20} color="#64748B" />
          </TouchableOpacity>
        )}
      </View>

      {/* Error Message */}
      <ErrorMessage
        message={errorMsg || ''}
        onDismiss={() => setErrorMsg(null)}
      />

      {/* Summary Stats */}
      {summary && (
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <StatCard
              title="Membres ayant payé"
              value={summary.total_paid}
              icon={<CheckCircle size={20} color="#10B981" />}
              color="#10B981"
              bgColor="#DCFCE7"
            />

            <StatCard
              title="Membres n'ayant pas payé"
              value={summary.total_unpaid}
              icon={<XCircle size={20} color="#EF4444" />}
              color="#EF4444"
              bgColor="#FEE2E2"
            />
          </View>

          <View style={styles.statsRow}>
            <StatCard
              title="Montant collecté"
              value={summary.total_amount_collected}
              icon={<CheckCircle size={20} color="#10B981" />}
              color="#10B981"
              bgColor="#DCFCE7"
              isAmount={true}
            />

            <StatCard
              title="Montant dû"
              value={summary.total_amount_due}
              icon={<XCircle size={20} color="#EF4444" />}
              color="#EF4444"
              bgColor="#FEE2E2"
              isAmount={true}
            />
          </View>
        </View>
      )}

      {/* Loading State */}
      {(loading.members || loading.payments) ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={styles.loadingText}>Chargement des données...</Text>
        </View>
      ) : !contributionIdNum ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>
            ID de cotisation manquant.
          </Text>
        </View>
      ) : members.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>
            Aucun membre enregistré. Veuillez d'abord ajouter des membres.
          </Text>
        </View>
      ) : filteredStatuses.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>
            Aucun résultat trouvé pour "{searchQuery}".
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredStatuses}
          keyExtractor={(item) => `${item.member.id}-${contributionIdNum}`}
          renderItem={({ item }) => (
            <PaymentStatusItem
              item={item}
              onUpdateStatus={handleUpdateStatus}
            />
          )}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 60,
    backgroundColor: '#4F46E5',
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: '#1E293B',
  },
  statsContainer: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  listContent: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748B',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
  },
});