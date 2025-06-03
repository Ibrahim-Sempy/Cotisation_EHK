import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Image
} from 'react-native';
import { useAuth } from '../lib/auth';
import { useRouter } from 'expo-router';
import { Shield, Mail, Lock } from 'lucide-react-native';

export default function RegisterScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { signUp } = useAuth();
    const router = useRouter();

    const handleRegister = async () => {
        if (!email || !password || !confirmPassword) {
            Alert.alert('Erreur', 'Veuillez remplir tous les champs');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
            return;
        }

        if (password.length < 6) {
            Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 6 caractères');
            return;
        }

        // Validation de l'email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            Alert.alert('Erreur', 'Veuillez entrer une adresse email valide');
            return;
        }

        setIsLoading(true);
        try {
            const result = await signUp(email, password);

            if (result.requiresEmailConfirmation) {
                Alert.alert(
                    'Inscription réussie',
                    'Un email de confirmation a été envoyé à votre adresse email. Veuillez vérifier votre boîte de réception et cliquer sur le lien de confirmation.',
                    [
                        {
                            text: 'OK',
                            onPress: () => router.replace('/login')
                        }
                    ]
                );
            } else {
                Alert.alert(
                    'Inscription réussie',
                    'Votre compte a été créé avec succès. Vous pouvez maintenant vous connecter.',
                    [
                        {
                            text: 'OK',
                            onPress: () => router.replace('/login')
                        }
                    ]
                );
            }
        } catch (error: any) {
            console.error('Erreur d\'inscription:', error);
            let errorMessage = 'Une erreur est survenue lors de l\'inscription';

            if (error.message.includes('already registered') || error.message.includes('already used')) {
                errorMessage = 'Cette adresse email est déjà utilisée';
            } else if (error.message.includes('invalid email')) {
                errorMessage = 'L\'adresse email n\'est pas valide';
            } else if (error.message.includes('password')) {
                errorMessage = 'Le mot de passe ne respecte pas les critères de sécurité';
            } else if (error.message.includes('Invalid login credentials')) {
                errorMessage = 'Erreur lors de la création du compte. Veuillez réessayer.';
            } else if (error.message.includes('network')) {
                errorMessage = 'Erreur de connexion. Veuillez vérifier votre connexion internet.';
            }

            Alert.alert('Erreur d\'inscription', errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <View style={styles.logoContainer}>
                        <Shield size={40} color="white" />
                    </View>
                    <Text style={styles.title}>Créer un compte</Text>
                    <Text style={styles.subtitle}>
                        Rejoignez notre communauté et commencez à gérer vos cotisations
                    </Text>
                </View>

                <View style={styles.formContainer}>
                    <View style={styles.inputContainer}>
                        <Mail size={20} color="#64748B" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Email"
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                            placeholderTextColor="#64748B"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Lock size={20} color="#64748B" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Mot de passe"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            placeholderTextColor="#64748B"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Lock size={20} color="#64748B" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Confirmer le mot de passe"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry
                            placeholderTextColor="#64748B"
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.button, isLoading && styles.buttonDisabled]}
                        onPress={handleRegister}
                        disabled={isLoading}
                    >
                        <Text style={styles.buttonText}>
                            {isLoading ? 'Création en cours...' : 'Créer votre compte'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.linkButton}
                        onPress={() => router.replace('/login')}
                    >
                        <Text style={styles.linkText}>
                            Déjà un compte ? Se connecter
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    scrollContent: {
        flexGrow: 1,
    },
    header: {
        padding: 24,
        paddingTop: 60,
        backgroundColor: '#4F46E5',
        alignItems: 'center',
    },
    logoContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: 'white',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.8)',
        textAlign: 'center',
        marginBottom: 32,
    },
    formContainer: {
        padding: 24,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    inputIcon: {
        padding: 12,
    },
    input: {
        flex: 1,
        padding: 12,
        fontSize: 16,
        color: '#1E293B',
    },
    button: {
        backgroundColor: '#4F46E5',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 8,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    linkButton: {
        marginTop: 16,
        padding: 12,
        alignItems: 'center',
    },
    linkText: {
        color: '#4F46E5',
        fontSize: 16,
        fontWeight: '500',
    },
}); 