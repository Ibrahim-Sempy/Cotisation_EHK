import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Linking,
  Modal,
  Alert,
  TextInput,
  Platform,
  PermissionsAndroid
} from 'react-native';
import { Settings as SettingsIcon, User, Bell, Lock, CircleHelp as HelpCircle, Info, LogOut, ChevronRight, Users, Shield, RefreshCw, AlertTriangle, Mail, Phone, Globe, MessageSquare, FileDown, FileUp } from 'lucide-react-native';
import { useAuth } from '../../lib/auth';
import { useTheme } from '../../lib/theme';
import { useRouter } from 'expo-router';
import Button from '../../components/Button';
import ErrorMessage from '../../components/ErrorMessage';
import { useStore } from '../../store/useStore';
import * as FileSystem from 'expo-file-system';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { formatAmount } from '../../utils/formatters';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SettingsScreen() {
  const { user, signIn, signOut, updateProfile, resetData } = useAuth();
  const { theme, setTheme, colors } = useTheme();
  const router = useRouter();
  const { contributions, payments, members } = useStore();
  const [progress, setProgress] = useState(0);
  const [isExporting, setIsExporting] = useState(false);

  // Toggle states
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [helpModalVisible, setHelpModalVisible] = useState(false);
  const [aboutModalVisible, setAboutModalVisible] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/login');
    } catch (error: any) {
      setErrorMsg(error.message);
    }
  };

  const handleResetData = async () => {
    try {
      // Sauvegarder les données avant la suppression
      const backupData = {
        members,
        contributions,
        payments,
        timestamp: new Date().toISOString()
      };

      const backupFileName = `backup_${new Date().toISOString().split('T')[0]}.json`;
      const backupPath = `${FileSystem.documentDirectory}${backupFileName}`;

      await FileSystem.writeAsStringAsync(backupPath, JSON.stringify(backupData, null, 2));

      Alert.alert(
        'Réinitialiser les données',
        'Êtes-vous sûr de vouloir réinitialiser toutes les données ? Cette action est irréversible. Une sauvegarde a été créée.',
        [
          {
            text: 'Annuler',
            style: 'cancel'
          },
          {
            text: 'Réinitialiser',
            style: 'destructive',
            onPress: async () => {
              try {
                await resetData();
                router.replace('/login');
              } catch (error: any) {
                setErrorMsg(error.message);
              }
            }
          }
        ]
      );
    } catch (error: any) {
      setErrorMsg('Erreur lors de la sauvegarde des données: ' + error.message);
    }
  };

  const handleUpdateProfile = async () => {
    if (!email) {
      setErrorMsg('L\'email est requis');
      return;
    }

    setIsLoading(true);
    try {
      // Vérifier si l'email a changé
      const emailChanged = email !== user?.email;

      // Vérifier si un nouveau mot de passe est fourni
      const passwordChanged = newPassword && confirmPassword;

      if (passwordChanged) {
        if (newPassword !== confirmPassword) {
          setErrorMsg('Les mots de passe ne correspondent pas');
          return;
        }
        if (newPassword.length < 6) {
          setErrorMsg('Le mot de passe doit contenir au moins 6 caractères');
          return;
        }
      }

      // Mettre à jour le profil
      await updateProfile({
        email,
        password: passwordChanged ? newPassword : undefined,
        currentPassword: passwordChanged ? currentPassword : undefined
      });

      Alert.alert(
        'Succès',
        'Profil mis à jour avec succès. Vous devrez vous reconnecter avec vos nouveaux identifiants.',
        [
          {
            text: 'OK',
            onPress: async () => {
              setProfileModalVisible(false);
              await signOut();
            }
          }
        ]
      );
    } catch (error: any) {
      console.error('Erreur de mise à jour du profil:', error);
      setErrorMsg(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
  };

  const handleContactSupport = () => {
    Linking.openURL('mailto:sempy@gmail.com');
  };

  const handleCallSupport = () => {
    Linking.openURL('tel:+224628000000');
  };

  const handleVisitWebsite = () => {
    Linking.openURL('https://sempy.dev');
  };

  const handleSendMessage = () => {
    Linking.openURL('https://wa.me/224628000000');
  };

  const handleOpenHelp = () => {
    setHelpModalVisible(true);
  };

  const handleOpenAbout = () => {
    setAboutModalVisible(true);
  };

  const requestStoragePermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: "Permission de stockage",
            message: "L'application a besoin d'accéder au stockage pour sauvegarder les fichiers PDF.",
            buttonNeutral: "Demander plus tard",
            buttonNegative: "Annuler",
            buttonPositive: "OK"
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  const generatePDFContent = (contributionId?: number) => {
    const selectedContribution = contributionId
      ? contributions.find(c => c.id === contributionId)
      : null;

    const filteredPayments = selectedContribution
      ? payments.filter(p => p.cotisation_id === contributionId)
      : payments;

    const filteredMembers = selectedContribution
      ? members.filter(m => filteredPayments.some(p => p.membre_id === m.id))
      : members;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Rapport de cotisations</title>
          <style>
            body { font-family: Arial, sans-serif; }
            .header { text-align: center; margin-bottom: 20px; }
            .section { margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; }
            .total { font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Rapport de cotisations</h1>
            <p>Date d'export: ${new Date().toLocaleDateString()}</p>
          </div>

          <div class="section">
            <h2>Résumé</h2>
            <p>Nombre total de membres: ${members.length}</p>
            <p>Nombre total de cotisations: ${contributions.length}</p>
            <p>Montant total collecté: ${formatAmount(filteredPayments.reduce((sum, p) => sum + (p.payer ? (contributions.find(c => c.id === p.cotisation_id)?.montant_unitaire || 0) : 0), 0))}</p>
          </div>

          <div class="section">
            <h2>Détails des membres</h2>
            <table>
              <tr>
                <th>Nom</th>
                <th>Téléphone</th>
                <th>Email</th>
                <th>Statut</th>
              </tr>
              ${filteredMembers.map(member => `
                <tr>
                  <td>${member.nom} ${member.prenom}</td>
                  <td>${member.telephone || '-'}</td>
                  <td>${member.email || '-'}</td>
                  <td>${filteredPayments.some(p => p.membre_id === member.id && p.payer) ? 'Payé' : 'Non payé'}</td>
                </tr>
              `).join('')}
            </table>
          </div>

          <div class="section">
            <h2>Détails des cotisations</h2>
            <table>
              <tr>
                <th>Type</th>
                <th>Description</th>
                <th>Montant</th>
                <th>Date d'échéance</th>
              </tr>
              ${(selectedContribution ? [selectedContribution] : contributions).map(contribution => `
                <tr>
                  <td>${contribution.type}</td>
                  <td>${contribution.description}</td>
                  <td>${formatAmount(contribution.montant_unitaire)}</td>
                  <td>${contribution.date_echeance ? new Date(contribution.date_echeance).toLocaleDateString() : '-'}</td>
                </tr>
              `).join('')}
            </table>
          </div>
        </body>
      </html>
    `;

    return htmlContent;
  };

  const handleExportAll = async () => {
    try {
      setIsExporting(true);
      setProgress(0);

      // Afficher l'indicateur de chargement avec progression
      Alert.alert(
        'Génération du rapport',
        'Veuillez patienter pendant la génération du rapport complet...',
        [{ text: 'OK' }],
        { cancelable: false }
      );

      setProgress(20); // Préparation des données

      // Calculer les statistiques globales
      const totalMembers = members.length;
      const totalContributions = contributions.length;
      const totalPayments = payments.length;
      const totalCollected = payments.reduce((sum, p) =>
        sum + (p.payer ? (contributions.find(c => c.id === p.cotisation_id)?.montant_unitaire || 0) : 0), 0
      );
      const paymentRate = (payments.filter(p => p.payer).length / payments.length) * 100;

      setProgress(40); // Génération du contenu HTML

      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Rapport complet des cotisations</title>
            <style>
              body { font-family: Arial, sans-serif; }
              .header { text-align: center; margin-bottom: 20px; }
              .section { margin-bottom: 20px; }
              table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f5f5f5; }
              .total { font-weight: bold; }
              .paid { color: #22C55E; }
              .unpaid { color: #EF4444; }
              .stats { display: flex; justify-content: space-between; margin-bottom: 20px; }
              .stat-box { 
                background-color: #f8f9fa;
                padding: 15px;
                border-radius: 8px;
                width: 48%;
                text-align: center;
              }
              .stat-value { font-size: 24px; font-weight: bold; color: #4F46E5; }
              .stat-label { color: #64748B; margin-top: 5px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Rapport complet des cotisations</h1>
              <p>Date d'export: ${new Date().toLocaleDateString()}</p>
            </div>

            <div class="section">
              <h2>Statistiques globales</h2>
              <div class="stats">
                <div class="stat-box">
                  <div class="stat-value">${totalMembers}</div>
                  <div class="stat-label">Total des membres</div>
                </div>
                <div class="stat-box">
                  <div class="stat-value">${totalContributions}</div>
                  <div class="stat-label">Types de cotisations</div>
                </div>
              </div>
              <div class="stats">
                <div class="stat-box">
                  <div class="stat-value">${formatAmount(totalCollected)}</div>
                  <div class="stat-label">Total collecté</div>
                </div>
                <div class="stat-box">
                  <div class="stat-value">${paymentRate.toFixed(0)}%</div>
                  <div class="stat-label">Taux de paiement</div>
                </div>
              </div>
            </div>

            <div class="section">
              <h2>Liste des membres</h2>
              <table>
                <tr>
                  <th>Nom</th>
                  <th>Prénom</th>
                  <th>Téléphone</th>
                  <th>Email</th>
                  <th>Date d'inscription</th>
                </tr>
                ${members.map(member => `
                  <tr>
                    <td>${member.nom}</td>
                    <td>${member.prenom}</td>
                    <td>${member.telephone || '-'}</td>
                    <td>${member.email || '-'}</td>
                    <td>${member.created_at ? new Date(member.created_at).toLocaleDateString() : '-'}</td>
                  </tr>
                `).join('')}
              </table>
            </div>

            <div class="section">
              <h2>Détails des cotisations</h2>
              <table>
                <tr>
                  <th>Type</th>
                  <th>Description</th>
                  <th>Montant unitaire</th>
                  <th>Date d'échéance</th>
                  <th>Nombre de paiements</th>
                  <th>Montant collecté</th>
                </tr>
                ${contributions.map(contribution => {
        const contributionPayments = payments.filter(p => p.cotisation_id === contribution.id);
        const paidCount = contributionPayments.filter(p => p.payer).length;
        const collectedAmount = paidCount * contribution.montant_unitaire;
        return `
                    <tr>
                      <td>${contribution.type}</td>
                      <td>${contribution.description}</td>
                      <td>${formatAmount(contribution.montant_unitaire)}</td>
                      <td>${contribution.date_echeance ? new Date(contribution.date_echeance).toLocaleDateString() : '-'}</td>
                      <td>${paidCount}/${contributionPayments.length}</td>
                      <td>${formatAmount(collectedAmount)}</td>
                    </tr>
                  `;
      }).join('')}
              </table>
            </div>

            <div class="section">
              <h2>Détails des paiements</h2>
              <table>
                <tr>
                  <th>Membre</th>
                  <th>Type de cotisation</th>
                  <th>Montant</th>
                  <th>Statut</th>
                  <th>Date de paiement</th>
                </tr>
                ${payments.map(payment => {
        const member = members.find(m => m.id === payment.membre_id);
        const contribution = contributions.find(c => c.id === payment.cotisation_id);
        return `
                    <tr>
                      <td>${member ? `${member.nom} ${member.prenom}` : '-'}</td>
                      <td>${contribution ? contribution.type : '-'}</td>
                      <td>${contribution ? formatAmount(contribution.montant_unitaire) : '-'}</td>
                      <td class="${payment.payer ? 'paid' : 'unpaid'}">
                        ${payment.payer ? 'Payé' : 'Non payé'}
                      </td>
                      <td>${payment.date_paiement ? new Date(payment.date_paiement).toLocaleDateString() : '-'}</td>
                    </tr>
                  `;
      }).join('')}
              </table>
            </div>
          </body>
        </html>
      `;

      setProgress(60); // Génération du PDF

      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        width: 612, // Letter size width in points
        height: 792, // Letter size height in points
      });

      setProgress(80); // Préparation du partage

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Partager le rapport',
          UTI: 'com.adobe.pdf'
        });
      } else {
        Alert.alert(
          'Export réussi',
          'Le rapport a été généré mais le partage n\'est pas disponible sur votre appareil.',
          [{ text: 'OK' }]
        );
      }

      setProgress(100); // Terminé

    } catch (error: any) {
      setErrorMsg('Erreur lors de l\'exportation: ' + error.message);
    } finally {
      setIsExporting(false);
      setProgress(0);
    }
  };

  const handleExportByType = async (contributionId: number) => {
    try {
      setIsExporting(true);
      setProgress(0);

      // Afficher l'indicateur de chargement avec progression
      Alert.alert(
        'Génération du rapport',
        'Veuillez patienter pendant la génération du rapport...',
        [{ text: 'OK' }],
        { cancelable: false }
      );

      setProgress(30); // Préparation des données

      const contribution = contributions.find(c => c.id === contributionId);
      if (!contribution) {
        setErrorMsg('Cotisation non trouvée');
        return;
      }

      // Filtrer les paiements pour cette cotisation
      const contributionPayments = payments.filter(p => p.cotisation_id === contributionId);
      const membersWithPayments = members.filter(m =>
        contributionPayments.some(p => p.membre_id === m.id)
      );

      // Générer le contenu HTML
      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Rapport de cotisation - ${contribution.type}</title>
            <style>
              body { font-family: Arial, sans-serif; }
              .header { text-align: center; margin-bottom: 20px; }
              .section { margin-bottom: 20px; }
              table { width: 100%; border-collapse: collapse; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f5f5f5; }
              .total { font-weight: bold; }
              .paid { color: #22C55E; }
              .unpaid { color: #EF4444; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Rapport de cotisation - ${contribution.type}</h1>
              <p>Date d'export: ${new Date().toLocaleDateString()}</p>
            </div>

            <div class="section">
              <h2>Détails de la cotisation</h2>
              <table>
                <tr>
                  <th>Type</th>
                  <th>Description</th>
                  <th>Montant unitaire</th>
                  <th>Date d'échéance</th>
                </tr>
                <tr>
                  <td>${contribution.type}</td>
                  <td>${contribution.description}</td>
                  <td>${formatAmount(contribution.montant_unitaire)}</td>
                  <td>${contribution.date_echeance ? new Date(contribution.date_echeance).toLocaleDateString() : '-'}</td>
                </tr>
              </table>
            </div>

            <div class="section">
              <h2>État des paiements</h2>
              <table>
                <tr>
                  <th>Membre</th>
                  <th>Téléphone</th>
                  <th>Statut</th>
                  <th>Date de paiement</th>
                </tr>
                ${membersWithPayments.map(member => {
        const payment = contributionPayments.find(p => p.membre_id === member.id);
        return `
                    <tr>
                      <td>${member.nom} ${member.prenom}</td>
                      <td>${member.telephone || '-'}</td>
                      <td class="${payment?.payer ? 'paid' : 'unpaid'}">
                        ${payment?.payer ? 'Payé' : 'Non payé'}
                      </td>
                      <td>${payment?.date_paiement ? new Date(payment.date_paiement).toLocaleDateString() : '-'}</td>
                    </tr>
                  `;
      }).join('')}
              </table>
            </div>

            <div class="section">
              <h2>Résumé</h2>
              <p>Nombre total de membres: ${membersWithPayments.length}</p>
              <p>Nombre de paiements effectués: ${contributionPayments.filter(p => p.payer).length}</p>
              <p>Montant total collecté: ${formatAmount(contributionPayments.filter(p => p.payer).length * contribution.montant_unitaire)}</p>
              <p>Montant restant à collecter: ${formatAmount((membersWithPayments.length - contributionPayments.filter(p => p.payer).length) * contribution.montant_unitaire)}</p>
            </div>
          </body>
        </html>
      `;

      // Générer le nom du fichier
      const fileName = `rapport_${contribution.type.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}`;

      setProgress(60); // Génération du PDF

      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        width: 612,
        height: 792,
      });

      setProgress(80); // Préparation du partage

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Partager le rapport',
          UTI: 'com.adobe.pdf'
        });
      } else {
        Alert.alert(
          'Export réussi',
          'Le rapport a été généré mais le partage n\'est pas disponible sur votre appareil.',
          [{ text: 'OK' }]
        );
      }

      setProgress(100); // Terminé

    } catch (error: any) {
      setErrorMsg('Erreur lors de l\'exportation: ' + error.message);
    } finally {
      setIsExporting(false);
      setProgress(0);
    }
  };

  const handleImport = async () => {
    try {
      // TODO: Implémenter l'import des données
      Alert.alert(
        'Import réussi',
        'Les données ont été importées avec succès.',
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      setErrorMsg(error.message);
    }
  };

  const handleRestoreBackup = async () => {
    try {
      // Lister tous les fichiers de sauvegarde
      const documentDir = FileSystem.documentDirectory;
      if (!documentDir) {
        throw new Error('Répertoire de documents non disponible');
      }

      const files = await FileSystem.readDirectoryAsync(documentDir);
      const backups = files.filter(file => file.startsWith('backup_') && file.endsWith('.json'));

      if (backups.length === 0) {
        Alert.alert('Aucune sauvegarde', 'Aucune sauvegarde trouvée.');
        return;
      }

      // Créer la liste des options de restauration
      const backupOptions = backups.map(backup => ({
        text: `Sauvegarde du ${backup.replace('backup_', '').replace('.json', '')}`,
        onPress: async () => {
          try {
            const content = await FileSystem.readAsStringAsync(`${documentDir}${backup}`);
            const backupData = JSON.parse(content);

            Alert.alert(
              'Restaurer la sauvegarde',
              'Que souhaitez-vous faire avec cette sauvegarde ?',
              [
                {
                  text: 'Voir le contenu',
                  onPress: () => {
                    Alert.alert(
                      'Contenu de la sauvegarde',
                      `Membres: ${backupData.members.length}\n` +
                      `Cotisations: ${backupData.contributions.length}\n` +
                      `Paiements: ${backupData.payments.length}\n` +
                      `Date: ${new Date(backupData.timestamp).toLocaleString()}`,
                      [{ text: 'OK' }]
                    );
                  }
                },
                {
                  text: 'Supprimer',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      await FileSystem.deleteAsync(`${documentDir}${backup}`);
                      Alert.alert('Succès', 'La sauvegarde a été supprimée.');
                    } catch (error: any) {
                      setErrorMsg('Erreur lors de la suppression: ' + error.message);
                    }
                  }
                },
                {
                  text: 'Restaurer',
                  onPress: async () => {
                    try {
                      // Restaurer les données
                      await AsyncStorage.setItem('members', JSON.stringify(backupData.members));
                      await AsyncStorage.setItem('contributions', JSON.stringify(backupData.contributions));
                      await AsyncStorage.setItem('payments', JSON.stringify(backupData.payments));

                      Alert.alert(
                        'Restauration réussie',
                        'Les données ont été restaurées avec succès. L\'application va redémarrer.',
                        [
                          {
                            text: 'OK',
                            onPress: () => {
                              router.replace('/login');
                            }
                          }
                        ]
                      );
                    } catch (error: any) {
                      setErrorMsg('Erreur lors de la restauration: ' + error.message);
                    }
                  }
                },
                {
                  text: 'Annuler',
                  style: 'cancel'
                }
              ]
            );
          } catch (error: any) {
            setErrorMsg('Erreur lors de la lecture de la sauvegarde: ' + error.message);
          }
        }
      }));

      Alert.alert(
        'Choisir une sauvegarde',
        'Sélectionnez la sauvegarde à gérer',
        [
          ...backupOptions,
          {
            text: 'Nettoyer les anciennes sauvegardes',
            onPress: async () => {
              try {
                // Garder uniquement les 5 dernières sauvegardes
                const sortedBackups = backups.sort().reverse();
                const backupsToDelete = sortedBackups.slice(5);

                for (const backup of backupsToDelete) {
                  await FileSystem.deleteAsync(`${documentDir}${backup}`);
                }

                Alert.alert(
                  'Nettoyage terminé',
                  `${backupsToDelete.length} ancienne(s) sauvegarde(s) supprimée(s).`
                );
              } catch (error: any) {
                setErrorMsg('Erreur lors du nettoyage: ' + error.message);
              }
            }
          },
          {
            text: 'Annuler',
            style: 'cancel'
          }
        ]
      );
    } catch (error: any) {
      setErrorMsg('Erreur lors de la recherche des sauvegardes: ' + error.message);
    }
  };

  const renderSettingItem = (
    icon: React.ReactNode,
    title: string,
    subtitle: string,
    onPress: () => void,
    color: string = colors.primary
  ) => (
    <TouchableOpacity
      style={[styles.settingItem, { backgroundColor: colors.card }]}
      onPress={onPress}
    >
      <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
        {icon}
      </View>
      <View style={styles.settingInfo}>
        <Text style={[styles.settingTitle, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <Text style={styles.title}>Paramètres</Text>
        <Text style={styles.subtitle}>Gérez votre compte et l'application</Text>
      </View>

      <ErrorMessage
        message={errorMsg || ''}
        onDismiss={() => setErrorMsg(null)}
      />

      {isExporting && (
        <View style={[styles.progressContainer, { backgroundColor: colors.card }]}>
          <Text style={[styles.progressText, { color: colors.text }]}>
            Génération en cours... {progress}%
          </Text>
          <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${progress}%`,
                  backgroundColor: colors.primary
                }
              ]}
            />
          </View>
        </View>
      )}

      <ScrollView style={styles.content}>
        {/* User Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Profil</Text>

          {renderSettingItem(
            <User size={24} color={colors.primary} />,
            'Modifier le profil',
            'Gérer vos informations personnelles',
            () => setProfileModalVisible(true)
          )}
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Préférences</Text>

          <View style={[styles.settingsCard, { backgroundColor: colors.card }]}>
            <TouchableOpacity style={styles.settingsRow}>
              <View style={styles.settingsRowLeft}>
                <View style={[styles.settingsIcon, { backgroundColor: colors.primaryLight }]}>
                  <Bell size={18} color={colors.primary} />
                </View>
                <Text style={[styles.settingsLabel, { color: colors.text }]}>Notifications</Text>
              </View>

              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: colors.border, true: colors.primaryLight }}
                thumbColor={notificationsEnabled ? colors.primary : colors.textSecondary}
              />
            </TouchableOpacity>

            <View style={[styles.separator, { backgroundColor: colors.border }]} />

            <TouchableOpacity style={styles.settingsRow}>
              <View style={styles.settingsRowLeft}>
                <View style={[styles.settingsIcon, { backgroundColor: colors.primaryLight }]}>
                  <Lock size={18} color={colors.primary} />
                </View>
                <Text style={[styles.settingsLabel, { color: colors.text }]}>Mode sombre</Text>
              </View>

              <TouchableOpacity
                style={[styles.themeButton, { backgroundColor: colors.primaryLight }]}
                onPress={() => {
                  Alert.alert(
                    'Choisir un thème',
                    'Sélectionnez votre thème préféré',
                    [
                      {
                        text: 'Clair',
                        onPress: () => handleThemeChange('light'),
                        style: theme === 'light' ? 'default' : 'cancel'
                      },
                      {
                        text: 'Sombre',
                        onPress: () => handleThemeChange('dark'),
                        style: theme === 'dark' ? 'default' : 'cancel'
                      },
                      {
                        text: 'Système',
                        onPress: () => handleThemeChange('system'),
                        style: theme === 'system' ? 'default' : 'cancel'
                      }
                    ]
                  );
                }}
              >
                <Text style={[styles.themeButtonText, { color: colors.primary }]}>
                  {theme === 'light' ? 'Clair' : theme === 'dark' ? 'Sombre' : 'Système'}
                </Text>
              </TouchableOpacity>
            </TouchableOpacity>
          </View>
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Aide et Support</Text>

          <View style={[styles.settingsCard, { backgroundColor: colors.card }]}>
            <TouchableOpacity
              style={styles.settingsRow}
              onPress={handleOpenHelp}
            >
              <View style={styles.settingsRowLeft}>
                <View style={[styles.settingsIcon, { backgroundColor: colors.successLight }]}>
                  <HelpCircle size={18} color={colors.success} />
                </View>
                <Text style={[styles.settingsLabel, { color: colors.text }]}>Centre d'aide</Text>
              </View>

              <ChevronRight size={18} color={colors.textSecondary} />
            </TouchableOpacity>

            <View style={[styles.separator, { backgroundColor: colors.border }]} />

            <TouchableOpacity
              style={styles.settingsRow}
              onPress={handleOpenAbout}
            >
              <View style={styles.settingsRowLeft}>
                <View style={[styles.settingsIcon, { backgroundColor: colors.successLight }]}>
                  <Info size={18} color={colors.success} />
                </View>
                <Text style={[styles.settingsLabel, { color: colors.text }]}>À propos</Text>
              </View>

              <ChevronRight size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Administration Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Administration</Text>
          {renderSettingItem(
            <Users size={24} color={colors.primary} />,
            'Gestion des utilisateurs',
            'Gérer les utilisateurs de l\'application',
            () => router.push('/users')
          )}
          {renderSettingItem(
            <Shield size={24} color={colors.primary} />,
            'Gestion des rôles',
            'Configurer les permissions des rôles',
            () => router.push('/roles')
          )}
        </View>

        {/* Data Management Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Gestion des données</Text>

          <View style={[styles.settingsCard, { backgroundColor: colors.card }]}>
            <TouchableOpacity
              style={styles.settingsRow}
              onPress={handleExportAll}
            >
              <View style={styles.settingsRowLeft}>
                <View style={[styles.settingsIcon, { backgroundColor: colors.primaryLight }]}>
                  <FileDown size={18} color={colors.primary} />
                </View>
                <Text style={[styles.settingsLabel, { color: colors.text }]}>Exporter toutes les données</Text>
              </View>

              <ChevronRight size={18} color={colors.textSecondary} />
            </TouchableOpacity>

            <View style={[styles.separator, { backgroundColor: colors.border }]} />

            <TouchableOpacity
              style={styles.settingsRow}
              onPress={() => {
                Alert.alert(
                  'Exporter par type',
                  'Sélectionnez le type de cotisation à exporter',
                  [
                    ...contributions.map(contribution => ({
                      text: contribution.type,
                      onPress: () => handleExportByType(contribution.id)
                    })),
                    {
                      text: 'Annuler',
                      style: 'cancel'
                    }
                  ]
                );
              }}
            >
              <View style={styles.settingsRowLeft}>
                <View style={[styles.settingsIcon, { backgroundColor: colors.primaryLight }]}>
                  <FileDown size={18} color={colors.primary} />
                </View>
                <Text style={[styles.settingsLabel, { color: colors.text }]}>Exporter par type</Text>
              </View>

              <ChevronRight size={18} color={colors.textSecondary} />
            </TouchableOpacity>

            <View style={[styles.separator, { backgroundColor: colors.border }]} />

            <TouchableOpacity
              style={styles.settingsRow}
              onPress={handleRestoreBackup}
            >
              <View style={styles.settingsRowLeft}>
                <View style={[styles.settingsIcon, { backgroundColor: colors.primaryLight }]}>
                  <FileUp size={18} color={colors.primary} />
                </View>
                <Text style={[styles.settingsLabel, { color: colors.text }]}>Restaurer une sauvegarde</Text>
              </View>

              <ChevronRight size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Maintenance Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Maintenance</Text>
          {renderSettingItem(
            <AlertTriangle size={24} color={colors.error} />,
            'Réinitialiser les données',
            'Supprimer toutes les données de l\'application',
            handleResetData,
            colors.error
          )}
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Compte</Text>
          <TouchableOpacity
            style={[styles.logoutButton, { backgroundColor: colors.errorLight }]}
            onPress={handleSignOut}
          >
            <LogOut size={20} color={colors.error} />
            <Text style={[styles.logoutText, { color: colors.error }]}>Déconnexion</Text>
          </TouchableOpacity>
        </View>

        {/* App Version */}
        <Text style={[styles.versionText, { color: colors.textSecondary }]}>Version 1.0.0</Text>
      </ScrollView>

      {/* Profile Edit Modal */}
      <Modal
        visible={profileModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setProfileModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContentProfile, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeaderProfile}>
              <Text style={[styles.modalTitleProfile, { color: colors.text }]}>Modifier le profil</Text>
              <TouchableOpacity
                onPress={() => setProfileModalVisible(false)}
                style={styles.closeButtonProfile}
              >
                <Text style={{ color: colors.primary }}>Fermer</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBodyProfile}>
              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Email</Text>
                <View style={styles.inputContainer}>
                  <Mail size={20} color="#64748B" style={styles.inputIcon} />
                  <TextInput
                    style={[styles.inputProfile, { color: colors.text }]}
                    placeholder="Email"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    placeholderTextColor="#64748B"
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Mot de passe actuel</Text>
                <View style={styles.inputContainer}>
                  <Lock size={20} color="#64748B" style={styles.inputIcon} />
                  <TextInput
                    style={[styles.inputProfile, { color: colors.text }]}
                    placeholder="Mot de passe actuel"
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                    secureTextEntry
                    placeholderTextColor="#64748B"
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Nouveau mot de passe</Text>
                <View style={styles.inputContainer}>
                  <Lock size={20} color="#64748B" style={styles.inputIcon} />
                  <TextInput
                    style={[styles.inputProfile, { color: colors.text }]}
                    placeholder="Nouveau mot de passe"
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry
                    placeholderTextColor="#64748B"
                  />
                </View>
              </View>

              <Button
                title={isLoading ? 'Mise à jour...' : 'Mettre à jour le profil'}
                onPress={handleUpdateProfile}
                style={styles.submitButton}
                disabled={isLoading}
                loading={isLoading}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Help Modal */}
      <Modal
        visible={helpModalVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Centre d'aide</Text>
              <TouchableOpacity onPress={() => setHelpModalVisible(false)}>
                <Text style={[styles.closeButton, { color: colors.textSecondary }]}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScrollContent}>
              <View style={styles.helpSection}>
                <Text style={[styles.helpTitle, { color: colors.text }]}>Guide d'utilisation</Text>
                <Text style={[styles.helpText, { color: colors.textSecondary }]}>
                  1. Gestion des membres{'\n'}
                  • Ajouter un nouveau membre{'\n'}
                  • Modifier les informations d'un membre{'\n'}
                  • Supprimer un membre{'\n\n'}

                  2. Gestion des cotisations{'\n'}
                  • Créer une nouvelle cotisation{'\n'}
                  • Suivre les paiements{'\n'}
                  • Voir les statistiques{'\n\n'}

                  3. Rapports{'\n'}
                  • Consulter les rapports de paiement{'\n'}
                  • Exporter les données{'\n'}
                  • Voir les statistiques globales
                </Text>
              </View>

              <View style={styles.helpSection}>
                <Text style={[styles.helpTitle, { color: colors.text }]}>FAQ</Text>
                <Text style={[styles.helpText, { color: colors.textSecondary }]}>
                  Q: Comment ajouter un nouveau membre ?{'\n'}
                  R: Allez dans l'onglet "Membres" et cliquez sur le bouton "Ajouter".{'\n\n'}

                  Q: Comment créer une cotisation ?{'\n'}
                  R: Allez dans l'onglet "Cotisations" et cliquez sur "Nouvelle cotisation".{'\n\n'}

                  Q: Comment suivre les paiements ?{'\n'}
                  R: Consultez l'onglet "Rapports" pour voir les statistiques détaillées.
                </Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* About Modal */}
      <Modal
        visible={aboutModalVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>À propos</Text>
              <TouchableOpacity onPress={() => setAboutModalVisible(false)}>
                <Text style={[styles.closeButton, { color: colors.textSecondary }]}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScrollContent}>
              <View style={styles.aboutSection}>
                <Text style={[styles.aboutTitle, { color: colors.text }]}>Notre mission</Text>
                <Text style={[styles.aboutText, { color: colors.textSecondary }]}>
                  Notre application est conçue pour simplifier la gestion des cotisations et des membres de votre communauté. Nous nous engageons à fournir des outils efficaces et faciles à utiliser pour une meilleure organisation.
                </Text>
              </View>

              <View style={styles.aboutSection}>
                <Text style={[styles.aboutTitle, { color: colors.text }]}>Fonctionnalités principales</Text>
                <Text style={[styles.aboutText, { color: colors.textSecondary }]}>
                  • Gestion complète des membres{'\n'}
                  • Suivi des cotisations{'\n'}
                  • Rapports détaillés{'\n'}
                  • Interface intuitive{'\n'}
                  • Support multilingue
                </Text>
              </View>

              <View style={styles.aboutSection}>
                <Text style={[styles.aboutTitle, { color: colors.text }]}>Contact</Text>
                <Text style={[styles.aboutText, { color: colors.textSecondary }]}>
                  Email: sempy@gmail.com{'\n'}
                  Téléphone: +224 628 000 000{'\n'}
                  WhatsApp: Support en direct
                </Text>
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
  content: {
    flex: 1,
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
  settingsCard: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  settingsRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingsLabel: {
    fontSize: 16,
  },
  separator: {
    height: 1,
    marginHorizontal: 16,
  },
  themeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  themeButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    minWidth: 120,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  versionText: {
    textAlign: 'center',
    fontSize: 14,
    marginBottom: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
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
  closeButton: {
    fontSize: 20,
    padding: 4,
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
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  settingSubtitle: {
    fontSize: 14,
  },
  card: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  menuItemSubtitle: {
    fontSize: 14,
  },
  modalScrollContent: {
    padding: 16,
  },
  helpSection: {
    marginBottom: 24,
  },
  helpTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  helpText: {
    fontSize: 14,
    lineHeight: 20,
  },
  aboutSection: {
    marginBottom: 24,
  },
  aboutTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  aboutText: {
    fontSize: 14,
    lineHeight: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContentProfile: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 12,
    padding: 20,
  },
  modalHeaderProfile: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitleProfile: {
    fontSize: 20,
    fontWeight: '600',
  },
  closeButtonProfile: {
    padding: 8,
  },
  modalBodyProfile: {
    maxHeight: '80%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  inputIcon: {
    padding: 12,
  },
  inputProfile: {
    flex: 1,
    padding: 12,
    fontSize: 16,
  },
  submitButton: {
    marginTop: 24,
  },
  progressContainer: {
    padding: 16,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  progressText: {
    fontSize: 14,
    marginBottom: 8,
    textAlign: 'center',
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
});