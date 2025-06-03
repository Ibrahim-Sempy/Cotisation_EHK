import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CheckCircle, XCircle } from 'lucide-react-native';
import { MemberPaymentStatus } from '../types/schema';
import { formatDateTime } from '../utils/formatters';

interface PaymentStatusItemProps {
  item: MemberPaymentStatus;
  onUpdateStatus: (memberId: number, paid: boolean) => void;
}

export default function PaymentStatusItem({ item, onUpdateStatus }: PaymentStatusItemProps) {
  const { member, paid, payment_date } = item;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name}>{`${member.nom} ${member.prenom}`}</Text>
          <TouchableOpacity
            style={[styles.statusButton, paid ? styles.paidButton : styles.unpaidButton]}
            onPress={() => onUpdateStatus(member.id, !paid)}
          >
            {paid ? (
              <CheckCircle size={20} color="#10B981" />
            ) : (
              <XCircle size={20} color="#EF4444" />
            )}
            <Text style={[styles.statusText, paid ? styles.paidText : styles.unpaidText]}>
              {paid ? 'Payé' : 'Non payé'}
            </Text>
          </TouchableOpacity>
        </View>

        {member.telephone && (
          <Text style={styles.phone}>{member.telephone}</Text>
        )}

        {paid && payment_date && (
          <Text style={styles.paymentDate}>
            Payé le {formatDateTime(payment_date)}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 12,
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
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  statusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  paidButton: {
    backgroundColor: '#DCFCE7',
  },
  unpaidButton: {
    backgroundColor: '#FEE2E2',
  },
  statusText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '600',
  },
  paidText: {
    color: '#10B981',
  },
  unpaidText: {
    color: '#EF4444',
  },
  phone: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },
  paymentDate: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
  },
});