import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Modal,
    TextInput,
    ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, UserPlus, X, Shield } from 'lucide-react-native';
import Button from '../components/Button';
import ErrorMessage from '../components/ErrorMessage';

type User = {
    id: number;
    username: string;
    role: string;
    email: string;
};

export default function UsersScreen() {
    const router = useRouter();
    const [modalVisible, setModalVisible] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [currentUser, setCurrentUser] = useState<User | null>(null);

    // Form state
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('user');

    // Mock data - À remplacer par les vraies données
    const [users, setUsers] = useState<User[]>([
        { id: 1, username: 'admin', role: 'admin', email: 'admin@example.com' },
        { id: 2, username: 'user1', role: 'user', email: 'user1@example.com' },
    ]);

    const openAddModal = () => {
        setCurrentUser(null);
        setUsername('');
        setEmail('');
        setPassword('');
        setRole('user');
        setModalVisible(true);
    };

    const openEditModal = (user: User) => {
        setCurrentUser(user);
        setUsername(user.username);
        setEmail(user.email);
        setPassword('');
        setRole(user.role);
        setModalVisible(true);
    };

    const handleSaveUser = async () => {
        if (!username.trim() || !email.trim() || (!currentUser && !password.trim())) {
            setErrorMsg('Tous les champs sont obligatoires');
            return;
        }

        try {
            if (currentUser) {
                // TODO: Implémenter la mise à jour de l'utilisateur
                setUsers(users.map(u =>
                    u.id === currentUser.id
                        ? { ...u, username, email, role }
                        : u
                ));
            } else {
                // TODO: Implémenter la création de l'utilisateur
                const newUser: User = {
                    id: users.length + 1,
                    username,
                    email,
                    role,
                };
                setUsers([...users, newUser]);
            }
            setModalVisible(false);
            setErrorMsg(null);
        } catch (error: any) {
            setErrorMsg(error.message);
        }
    };

    const handleDeleteUser = async (id: number) => {
        try {
            // TODO: Implémenter la suppression de l'utilisateur
            setUsers(users.filter(u => u.id !== id));
        } catch (error: any) {
            setErrorMsg(error.message);
        }
    };

    const renderUserItem = ({ item }: { item: User }) => (
        <View style={styles.userItem}>
            <View style={styles.userInfo}>
                <Text style={styles.username}>{item.username}</Text>
                <Text style={styles.email}>{item.email}</Text>
                <View style={styles.roleContainer}>
                    <Shield size={14} color="#4F46E5" />
                    <Text style={styles.role}>{item.role}</Text>
                </View>
            </View>
            <View style={styles.userActions}>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => openEditModal(item)}
                >
                    <Text style={styles.actionButtonText}>Modifier</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => handleDeleteUser(item.id)}
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
                    <Text style={styles.title}>Gestion des utilisateurs</Text>
                    <Text style={styles.subtitle}>Gérez les accès à l'application</Text>
                </View>
            </View>

            {/* Actions */}
            <View style={styles.actionsContainer}>
                <Button
                    title="Nouvel utilisateur"
                    icon={<UserPlus size={18} color="white" />}
                    onPress={openAddModal}
                    style={{ width: '100%' }}
                />
            </View>

            {/* Error Message */}
            <ErrorMessage
                message={errorMsg || ''}
                onDismiss={() => setErrorMsg(null)}
            />

            {/* Users List */}
            <FlatList
                data={users}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderUserItem}
                contentContainerStyle={styles.listContent}
            />

            {/* Add/Edit User Modal */}
            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={true}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                {currentUser ? 'Modifier un utilisateur' : 'Ajouter un utilisateur'}
                            </Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <X size={24} color="#64748B" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.formContainer}>
                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Nom d'utilisateur*</Text>
                                <TextInput
                                    style={styles.input}
                                    value={username}
                                    onChangeText={setUsername}
                                    placeholder="Nom d'utilisateur"
                                />
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Email*</Text>
                                <TextInput
                                    style={styles.input}
                                    value={email}
                                    onChangeText={setEmail}
                                    placeholder="Email"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.label}>
                                    {currentUser ? 'Nouveau mot de passe' : 'Mot de passe*'}
                                </Text>
                                <TextInput
                                    style={styles.input}
                                    value={password}
                                    onChangeText={setPassword}
                                    placeholder="Mot de passe"
                                    secureTextEntry
                                />
                                {currentUser && (
                                    <Text style={styles.hint}>
                                        Laissez vide pour conserver le mot de passe actuel
                                    </Text>
                                )}
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Rôle*</Text>
                                <View style={styles.roleSelector}>
                                    <TouchableOpacity
                                        style={[
                                            styles.roleOption,
                                            role === 'admin' && styles.roleOptionSelected
                                        ]}
                                        onPress={() => setRole('admin')}
                                    >
                                        <Text style={[
                                            styles.roleOptionText,
                                            role === 'admin' && styles.roleOptionTextSelected
                                        ]}>
                                            Administrateur
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[
                                            styles.roleOption,
                                            role === 'user' && styles.roleOptionSelected
                                        ]}
                                        onPress={() => setRole('user')}
                                    >
                                        <Text style={[
                                            styles.roleOptionText,
                                            role === 'user' && styles.roleOptionTextSelected
                                        ]}>
                                            Utilisateur
                                        </Text>
                                    </TouchableOpacity>
                                </View>
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
                                    onPress={handleSaveUser}
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
    userItem: {
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
    userInfo: {
        marginBottom: 12,
    },
    username: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1E293B',
        marginBottom: 4,
    },
    email: {
        fontSize: 14,
        color: '#64748B',
        marginBottom: 8,
    },
    roleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    role: {
        fontSize: 12,
        color: '#4F46E5',
        marginLeft: 4,
        textTransform: 'uppercase',
    },
    userActions: {
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
    hint: {
        fontSize: 12,
        color: '#64748B',
        marginTop: 4,
    },
    roleSelector: {
        flexDirection: 'row',
        gap: 8,
    },
    roleOption: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#CBD5E1',
        alignItems: 'center',
    },
    roleOptionSelected: {
        backgroundColor: '#EEF2FF',
        borderColor: '#4F46E5',
    },
    roleOptionText: {
        fontSize: 14,
        color: '#64748B',
    },
    roleOptionTextSelected: {
        color: '#4F46E5',
        fontWeight: '500',
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 16,
        marginBottom: 24,
    },
}); 