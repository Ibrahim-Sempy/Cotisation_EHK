import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { CreditCard as Edit, Trash2, Phone, Mail } from 'lucide-react-native';
import { Member } from '../types/schema';
import { useTheme } from '../lib/theme';

interface MemberItemProps {
  member: Member;
  onEdit: (member: Member) => void;
  onDelete: (id: number) => void;
}

export default function MemberItem({ member, onEdit, onDelete }: MemberItemProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <View style={styles.infoContainer}>
        <Text style={[styles.name, { color: colors.text }]}>{member.nom} {member.prenom}</Text>

        {member.telephone && (
          <View style={styles.contactContainer}>
            <Phone size={16} color={colors.textSecondary} />
            <Text style={[styles.contact, { color: colors.textSecondary }]}>{member.telephone}</Text>
          </View>
        )}

        {member.email && (
          <View style={styles.contactContainer}>
            <Mail size={16} color={colors.textSecondary} />
            <Text style={[styles.contact, { color: colors.textSecondary }]}>{member.email}</Text>
          </View>
        )}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton, { backgroundColor: colors.primaryLight }]}
          onPress={() => onEdit(member)}
        >
          <Edit size={18} color={colors.primary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton, { backgroundColor: colors.errorLight }]}
          onPress={() => onDelete(member.id)}
        >
          <Trash2 size={18} color={colors.error} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  infoContainer: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  contactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  contact: {
    fontSize: 14,
    marginLeft: 4,
  },
  actions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 10,
    borderRadius: 8,
    marginLeft: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  editButton: {
    backgroundColor: '#EEF2FF',
  },
  deleteButton: {
    backgroundColor: '#FEE2E2',
  },
});