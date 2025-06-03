import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Edit, Trash2, CreditCard } from 'lucide-react-native';
import { Contribution } from '../types/schema';
import { formatAmount, formatDate } from '../utils/formatters';

interface ContributionItemProps {
  contribution: Contribution;
  onEdit: (contribution: Contribution) => void;
  onDelete: (id: number) => void;
  onManagePayments: (contribution: Contribution) => void;
}

export default function ContributionItem({
  contribution,
  onEdit,
  onDelete,
  onManagePayments,
}: ContributionItemProps) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.type}>{contribution.type}</Text>
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => onEdit(contribution)}
            >
              <Edit size={18} color="#64748B" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => onDelete(contribution.id)}
            >
              <Trash2 size={18} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.description}>{contribution.description}</Text>

        <View style={styles.details}>
          <View style={styles.detail}>
            <Text style={styles.label}>Montant unitaire</Text>
            <Text style={styles.value}>
              {formatAmount(contribution.montant_unitaire)}
            </Text>
          </View>
          <View style={styles.detail}>
            <Text style={styles.label}>Date d'échéance</Text>
            <Text style={styles.value}>
              {contribution.date_echeance ? formatDate(contribution.date_echeance) : 'Non définie'}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.paymentsButton}
          onPress={() => onManagePayments(contribution)}
        >
          <CreditCard size={18} color="#4F46E5" />
          <Text style={styles.paymentsButtonText}>Gérer les paiements</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  type: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 10,
    borderRadius: 8,
    marginLeft: 12,
    backgroundColor: '#F1F5F9',
  },
  deleteButton: {
    backgroundColor: '#FEE2E2',
  },
  description: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 16,
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  detail: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  paymentsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF2FF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  paymentsButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#4F46E5',
  },
});