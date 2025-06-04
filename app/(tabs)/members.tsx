import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView
} from 'react-native';
import { useStore } from '../../store/useStore';
import MemberItem from '../../components/MemberItem';
import Button from '../../components/Button';
import ErrorMessage from '../../components/ErrorMessage';
import { UserPlus, Search, X } from 'lucide-react-native';
import { Member } from '../../types/schema';
import { useTheme } from '../../lib/theme';

export default function MembersScreen() {
  const { members, fetchMembers, addMember, updateMember, deleteMember, error } = useStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [currentMember, setCurrentMember] = useState<Member | null>(null);
  const { colors } = useTheme();

  // Form state
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [telephone, setTelephone] = useState('');

  useEffect(() => {
    fetchMembers();
  }, []);

  useEffect(() => {
    if (error) {
      setErrorMsg(error);
    }
  }, [error]);

  const openAddModal = () => {
    setCurrentMember(null);
    setNom('');
    setPrenom('');
    setTelephone('');
    setModalVisible(true);
  };

  const openEditModal = (member: Member) => {
    setCurrentMember(member);
    setNom(member.nom);
    setPrenom(member.prenom);
    setTelephone(member.telephone || '');
    setModalVisible(true);
  };

  const handleSaveMember = async () => {
    if (!nom.trim() || !prenom.trim()) {
      setErrorMsg('Le nom et le prénom sont obligatoires');
      return;
    }

    const memberData = {
      nom: nom.trim(),
      prenom: prenom.trim(),
      telephone: telephone.trim() || undefined,
    };

    try {
      if (currentMember) {
        await updateMember(currentMember.id, memberData);
      } else {
        await addMember(memberData);
      }
      setModalVisible(false);
      setErrorMsg(null);
    } catch (error: any) {
      setErrorMsg(error.message);
    }
  };

  const handleDeleteMember = async (id: number) => {
    try {
      await deleteMember(id);
    } catch (error: any) {
      setErrorMsg(error.message);
    }
  };

  // Filter members based on search query
  const filteredMembers = members.filter(member => {
    const fullName = `${member.nom} ${member.prenom}`.toLowerCase();
    const phone = member.telephone?.toLowerCase() || '';
    const query = searchQuery.toLowerCase();
    return fullName.includes(query) || phone.includes(query);
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <Text style={[styles.title, { color: 'white' }]}>Membres</Text>
        <Text style={[styles.subtitle, { color: 'rgba(255, 255, 255, 0.8)' }]}>Gérez les membres de la communauté</Text>
      </View>

      {/* Search and Add */}
      <View style={[styles.actionsContainer, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={[styles.searchContainer, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <Search size={20} color={colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Rechercher un membre..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.addButtonContainer}>
          <Button
            title="Ajouter"
            icon={<UserPlus size={18} color="white" />}
            onPress={openAddModal}
            style={styles.addButton}
          />
        </View>
      </View>

      {/* Error Message */}
      <ErrorMessage
        message={errorMsg || ''}
        onDismiss={() => setErrorMsg(null)}
      />

      {/* Members List */}
      {filteredMembers.length === 0 ? (
        <View style={[styles.emptyState, { backgroundColor: colors.card }]}>
          <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
            {searchQuery
              ? `Aucun résultat trouvé pour "${searchQuery}"`
              : 'Aucun membre enregistré. Ajoutez un nouveau membre pour commencer.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredMembers}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <MemberItem
              member={item}
              onEdit={openEditModal}
              onDelete={handleDeleteMember}
            />
          )}
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* Add/Edit Member Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {currentMember ? 'Modifier un membre' : 'Ajouter un membre'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.formContainer}>
              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Nom*</Text>
                <TextInput
                  style={[styles.input, {
                    borderColor: colors.border,
                    color: colors.text,
                    backgroundColor: colors.background
                  }]}
                  value={nom}
                  onChangeText={setNom}
                  placeholder="Nom de famille"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Prénom*</Text>
                <TextInput
                  style={[styles.input, {
                    borderColor: colors.border,
                    color: colors.text,
                    backgroundColor: colors.background
                  }]}
                  value={prenom}
                  onChangeText={setPrenom}
                  placeholder="Prénom"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Téléphone</Text>
                <TextInput
                  style={[styles.input, {
                    borderColor: colors.border,
                    color: colors.text,
                    backgroundColor: colors.background
                  }]}
                  value={telephone}
                  onChangeText={setTelephone}
                  placeholder="Numéro de téléphone"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="phone-pad"
                />
              </View>

              <ErrorMessage
                message={errorMsg || ''}
                onDismiss={() => setErrorMsg(null)}
              />

              <View style={styles.modalActions}>
                <Button
                  title="Annuler"
                  variant="outline"
                  onPress={() => setModalVisible(false)}
                  style={{ flex: 1, marginRight: 8 }}
                />
                <Button
                  title="Enregistrer"
                  onPress={handleSaveMember}
                  style={{ flex: 1, marginLeft: 8 }}
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: '#1E293B',
  },
  listContent: {
    padding: 16,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    width: '90%',
    maxHeight: '80%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  formContainer: {
    padding: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1E293B',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 24,
  },
  addButtonContainer: {
    marginLeft: 16,
    justifyContent: 'center',
  },
  addButton: {
    width: 120,
  },
});