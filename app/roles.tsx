import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Modal,
    ScrollView,
    Switch,
    TextInput
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Shield, X, Plus } from 'lucide-react-native';
import Button from '../components/Button';
import ErrorMessage from '../components/ErrorMessage';

type Permission = {
    id: string;
    name: string;
    description: string;
};

type Role = {
    id: number;
    name: string;
    description: string;
    permissions: string[];
};

const AVAILABLE_PERMISSIONS: Permission[] = [
    {
        id: 'manage_users',
        name: 'Gestion des utilisateurs',
        description: 'Créer, modifier et supprimer des utilisateurs'
    },
    {
        id: 'manage_roles',
        name: 'Gestion des rôles',
        description: 'Créer, modifier et supprimer des rôles'
    },
    {
        id: 'manage_members',
        name: 'Gestion des membres',
        description: 'Créer, modifier et supprimer des membres'
    },
    {
        id: 'manage_contributions',
        name: 'Gestion des cotisations',
        description: 'Créer, modifier et supprimer des cotisations'
    },
    {
        id: 'manage_payments',
        name: 'Gestion des paiements',
        description: 'Gérer les paiements des membres'
    },
    {
        id: 'view_reports',
        name: 'Voir les rapports',
        description: 'Accéder aux rapports et statistiques'
    },
    {
        id: 'reset_data',
        name: 'Réinitialiser les données',
        description: 'Réinitialiser toutes les données de l\'application'
    }
];

export default function RolesScreen() {
    const router = useRouter();
    const [modalVisible, setModalVisible] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [currentRole, setCurrentRole] = useState<Role | null>(null);

    // Form state
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

    // Mock data - À remplacer par les vraies données
    const [roles, setRoles] = useState<Role[]>([
        {
            id: 1,
            name: 'Administrateur',
            description: 'Accès complet à toutes les fonctionnalités',
            permissions: AVAILABLE_PERMISSIONS.map(p => p.id)
        },
        {
            id: 2,
            name: 'Utilisateur',
            description: 'Accès limité aux fonctionnalités de base',
            permissions: ['manage_members', 'manage_contributions', 'manage_payments', 'view_reports']
        }
    ]);

    const openAddModal = () => {
        setCurrentRole(null);
        setName('');
        setDescription('');
        setSelectedPermissions([]);
        setModalVisible(true);
    };

    const openEditModal = (role: Role) => {
        setCurrentRole(role);
        setName(role.name);
        setDescription(role.description);
        setSelectedPermissions(role.permissions);
        setModalVisible(true);
    };

    const handleSaveRole = async () => {
        if (!name.trim() || !description.trim()) {
            setErrorMsg('Le nom et la description sont obligatoires');
            return;
        }

        try {
            if (currentRole) {
                // TODO: Implémenter la mise à jour du rôle
                setRoles(roles.map(r =>
                    r.id === currentRole.id
                        ? { ...r, name, description, permissions: selectedPermissions }
                        : r
                ));
            } else {
                // TODO: Implémenter la création du rôle
                const newRole: Role = {
                    id: roles.length + 1,
                    name,
                    description,
                    permissions: selectedPermissions,
                };
                setRoles([...roles, newRole]);
            }
            setModalVisible(false);
            setErrorMsg(null);
        } catch (error: any) {
            setErrorMsg(error.message);
        }
    };

    const handleDeleteRole = async (id: number) => {
        try {
            // TODO: Implémenter la suppression du rôle
            setRoles(roles.filter(r => r.id !== id));
        } catch (error: any) {
            setErrorMsg(error.message);
        }
    };

    const togglePermission = (permissionId: string) => {
        setSelectedPermissions(prev =>
            prev.includes(permissionId)
                ? prev.filter(id => id !== permissionId)
                : [...prev, permissionId]
        );
    };

    const renderRoleItem = ({ item }: { item: Role }) => (
        <View style={styles.roleItem}>
            <View style={styles.roleInfo}>
                <Text style={styles.roleName}>{item.name}</Text>
                <Text style={styles.roleDescription}>{item.description}</Text>
                <View style={styles.permissionsList}>
                    {item.permissions.map(permissionId => {
                        const permission = AVAILABLE_PERMISSIONS.find(p => p.id === permissionId);
                        return permission ? (
                            <View key={permissionId} style={styles.permissionTag}>
                                <Text style={styles.permissionTagText}>{permission.name}</Text>
                            </View>
                        ) : null;
                    })}
                </View>
            </View>
            <View style={styles.roleActions}>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => openEditModal(item)}
                >
                    <Text style={styles.actionButtonText}>Modifier</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => handleDeleteRole(item.id)}
                >
                    <Text style={[styles.actionButtonText, styles.deleteButtonText]}>
                        Supprimer
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );

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
                    <Text style={styles.title}>Gestion des rôles</Text>
                    <Text style={styles.subtitle}>Configurez les permissions</Text>
                </View>
            </View>

            {/* Actions */}
            <View style={styles.actionsContainer}>
                <Button
                    title="Nouveau rôle"
                    icon={<Plus size={18} color="white" />}
                    onPress={openAddModal}
                    style={{ width: '100%' }}
                />
            </View>

            {/* Error Message */}
            <ErrorMessage
                message={errorMsg || ''}
                onDismiss={() => setErrorMsg(null)}
            />

            {/* Roles List */}
            <FlatList
                data={roles}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderRoleItem}
                contentContainerStyle={styles.listContent}
            />

            {/* Add/Edit Role Modal */}
            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={true}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                {currentRole ? 'Modifier un rôle' : 'Ajouter un rôle'}
                            </Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <X size={24} color="#64748B" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.formContainer}>
                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Nom du rôle*</Text>
                                <TextInput
                                    style={styles.input}
                                    value={name}
                                    onChangeText={setName}
                                    placeholder="Nom du rôle"
                                />
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Description*</Text>
                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    value={description}
                                    onChangeText={setDescription}
                                    placeholder="Description du rôle"
                                    multiline
                                    numberOfLines={3}
                                />
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Permissions</Text>
                                {AVAILABLE_PERMISSIONS.map(permission => (
                                    <View key={permission.id} style={styles.permissionItem}>
                                        <View style={styles.permissionInfo}>
                                            <Text style={styles.permissionName}>{permission.name}</Text>
                                            <Text style={styles.permissionDescription}>
                                                {permission.description}
                                            </Text>
                                        </View>
                                        <Switch
                                            value={selectedPermissions.includes(permission.id)}
                                            onValueChange={() => togglePermission(permission.id)}
                                            trackColor={{ false: '#E2E8F0', true: '#4F46E5' }}
                                            thumbColor="white"
                                        />
                                    </View>
                                ))}
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
                                    onPress={handleSaveRole}
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
    actionsContainer: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
        backgroundColor: 'white',
    },
    listContent: {
        padding: 16,
    },
    roleItem: {
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    roleInfo: {
        marginBottom: 12,
    },
    roleName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1E293B',
        marginBottom: 4,
    },
    roleDescription: {
        fontSize: 14,
        color: '#64748B',
        marginBottom: 8,
    },
    permissionsList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    permissionTag: {
        backgroundColor: '#EEF2FF',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    permissionTagText: {
        fontSize: 12,
        color: '#4F46E5',
    },
    roleActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    actionButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
        marginLeft: 8,
    },
    actionButtonText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#4F46E5',
    },
    deleteButton: {
        backgroundColor: '#FEE2E2',
    },
    deleteButtonText: {
        color: '#EF4444',
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
    textArea: {
        height: 80,
        textAlignVertical: 'top',
    },
    permissionItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    permissionInfo: {
        flex: 1,
        marginRight: 16,
    },
    permissionName: {
        fontSize: 14,
        fontWeight: '500',
        color: '#1E293B',
        marginBottom: 4,
    },
    permissionDescription: {
        fontSize: 12,
        color: '#64748B',
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 16,
        marginBottom: 24,
    },
}); 