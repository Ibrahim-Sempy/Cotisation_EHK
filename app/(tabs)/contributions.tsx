import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  Alert
} from 'react-native';
import { useStore } from '../../store/useStore';
import ContributionItem from '../../components/ContributionItem';
import Button from '../../components/Button';
import ErrorMessage from '../../components/ErrorMessage';
import { CirclePlus as PlusCircle, X, Calendar as CalendarIcon } from 'lucide-react-native';
import { Contribution } from '../../types/schema';
import { useRouter } from 'expo-router';
import { useTheme } from '../../lib/theme';

export default function ContributionsScreen() {
  const {
    contributions,
    fetchContributions,
    addContribution,
    updateContribution,
    deleteContribution,
    error
  } = useStore();
  const router = useRouter();
  const { colors } = useTheme();

  const [modalVisible, setModalVisible] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [currentContribution, setCurrentContribution] = useState<Contribution | null>(null);

  // Form state
  const [type, setType] = useState('');
  const [description, setDescription] = useState('');
  const [montant, setMontant] = useState('');
  const [dateEcheance, setDateEcheance] = useState('');

  useEffect(() => {
    fetchContributions();
  }, []);

  useEffect(() => {
    if (error) {
      setErrorMsg(error);
    }
  }, [error]);

  const openAddModal = () => {
    setCurrentContribution(null);
    setType('');
    setDescription('');
    setMontant('');
    setDateEcheance('');
    setModalVisible(true);
  };

  const openEditModal = (contribution: Contribution) => {
    setCurrentContribution(contribution);
    setType(contribution.type);
    setDescription(contribution.description);
    setMontant(contribution.montant_unitaire.toString());
    setDateEcheance(contribution.date_echeance || '');
    setModalVisible(true);
  };

  const handleSaveContribution = async () => {
    if (!type.trim() || !description.trim() || !montant.trim()) {
      setErrorMsg('Le type, la description et le montant sont obligatoires');
      return;
    }

    const montantValue = parseFloat(montant);
    if (isNaN(montantValue) || montantValue <= 0) {
      setErrorMsg('Le montant doit être un nombre positif');
      return;
    }

    const contributionData = {
      type: type.trim(),
      description: description.trim(),
      montant_unitaire: montantValue,
      date_echeance: dateEcheance.trim() || null,
    };

    try {
      if (currentContribution) {
        await updateContribution(currentContribution.id, contributionData);
      } else {
        await addContribution(contributionData);
      }
      setModalVisible(false);
      setErrorMsg(null);
    } catch (error: any) {
      setErrorMsg(error.message);
    }
  };

  const handleDeleteContribution = async (id: number) => {
    try {
      // Trouver la cotisation à supprimer
      const contributionToDelete = contributions.find(c => c.id === id);
      if (!contributionToDelete) return;

      // Afficher la confirmation
      Alert.alert(
        'Supprimer la cotisation',
        `Êtes-vous sûr de vouloir supprimer la cotisation "${contributionToDelete.type}" ?`,
        [
          {
            text: 'Annuler',
            style: 'cancel'
          },
          {
            text: 'Supprimer',
            style: 'destructive',
            onPress: async () => {
              try {
                await deleteContribution(id);
              } catch (error: any) {
                setErrorMsg(error.message);
              }
            }
          }
        ]
      );
    } catch (error: any) {
      setErrorMsg(error.message);
    }
  };

  const handleManagePayments = (contribution: Contribution) => {
    router.push({
      pathname: '/payments',
      params: { contributionId: contribution.id }
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <Text style={styles.title}>Cotisations</Text>
        <Text style={styles.subtitle}>Gérez les différents types de cotisations</Text>
      </View>

      {/* Actions */}
      <View style={[styles.actionsContainer, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Button
          title="Nouvelle cotisation"
          icon={<PlusCircle size={18} color="white" />}
          onPress={openAddModal}
          style={{ width: '100%' }}
        />
      </View>

      {/* Error Message */}
      <ErrorMessage
        message={errorMsg || ''}
        onDismiss={() => setErrorMsg(null)}
      />

      {/* Contributions List */}
      {contributions.length === 0 ? (
        <View style={[styles.emptyState, { backgroundColor: colors.card }]}>
          <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
            Aucune cotisation disponible. Créez une nouvelle cotisation pour commencer.
          </Text>
        </View>
      ) : (
        <FlatList
          data={contributions}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <ContributionItem
              contribution={item}
              onEdit={openEditModal}
              onDelete={handleDeleteContribution}
              onManagePayments={handleManagePayments}
            />
          )}
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* Add/Edit Contribution Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {currentContribution ? 'Modifier une cotisation' : 'Ajouter une cotisation'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.formContainer}>
              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Type de cotisation*</Text>
                <TextInput
                  style={[styles.input, {
                    borderColor: colors.border,
                    color: colors.text,
                    backgroundColor: colors.background
                  }]}
                  value={type}
                  onChangeText={setType}
                  placeholder="Ex: Cotisation annuelle 2025"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Description*</Text>
                <TextInput
                  style={[styles.input, styles.textArea, {
                    borderColor: colors.border,
                    color: colors.text,
                    backgroundColor: colors.background
                  }]}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Description détaillée de la cotisation"
                  placeholderTextColor={colors.textSecondary}
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Montant unitaire (GNF)*</Text>
                <TextInput
                  style={[styles.input, {
                    borderColor: colors.border,
                    color: colors.text,
                    backgroundColor: colors.background
                  }]}
                  value={montant}
                  onChangeText={setMontant}
                  placeholder="Montant à payer par membre"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Date d'échéance (optionnel)</Text>
                <View style={styles.dateInput}>
                  <TextInput
                    style={[styles.input, {
                      flex: 1,
                      borderColor: colors.border,
                      color: colors.text,
                      backgroundColor: colors.background
                    }]}
                    value={dateEcheance}
                    onChangeText={setDateEcheance}
                    placeholder="AAAA-MM-JJ"
                    placeholderTextColor={colors.textSecondary}
                  />
                  <CalendarIcon size={20} color={colors.textSecondary} style={styles.dateIcon} />
                </View>
                <Text style={[styles.hint, { color: colors.textSecondary }]}>Format: AAAA-MM-JJ (ex: 2025-12-31)</Text>
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
                  onPress={handleSaveContribution}
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
    padding: 16,
    borderBottomWidth: 1,
  },
  listContent: {
    padding: 16,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    borderRadius: 8,
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
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
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
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
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateIcon: {
    marginLeft: -36,
    marginRight: 16,
  },
  hint: {
    fontSize: 12,
    marginTop: 4,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 24,
  },
});