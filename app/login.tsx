import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../lib/auth';
import { useTheme } from '../lib/theme';
import Button from '../components/Button';
import ErrorMessage from '../components/ErrorMessage';
import { Shield } from 'lucide-react-native';

export default function LoginScreen() {
    const router = useRouter();
    const { signIn, signUp } = useAuth();
    const { colors } = useTheme();
    const [isLogin, setIsLogin] = useState(true);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async () => {
        if (!email || !password) {
            Alert.alert('Erreur', 'Veuillez remplir tous les champs');
            return;
        }

        setIsLoading(true);
        try {
            if (isLogin) {
                await signIn(email, password);
                router.replace('/(tabs)');
            } else {
                const result = await signUp(email, password);
                Alert.alert(
                    'Inscription réussie',
                    'Un email de confirmation a été envoyé à votre adresse email. Veuillez vérifier votre boîte de réception et cliquer sur le lien de confirmation avant de vous connecter.',
                    [
                        {
                            text: 'OK',
                            onPress: () => setIsLogin(true)
                        }
                    ]
                );
            }
        } catch (error: any) {
            let errorMessage = error.message;
            if (error.message.includes('Email not confirmed')) {
                errorMessage = 'Veuillez confirmer votre email avant de vous connecter. Un email de confirmation a été envoyé à votre adresse.';
            }
            Alert.alert('Erreur', errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={[styles.container, { backgroundColor: colors.background }]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <View style={styles.logoContainer}>
                        <Shield size={48} color="white" />
                    </View>
                    <Text style={[styles.title, { color: colors.text }]}>
                        {isLogin ? 'Connexion' : 'Inscription'}
                    </Text>
                    <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                        {isLogin
                            ? 'Connectez-vous à votre compte'
                            : 'Créez un nouveau compte administrateur'}
                    </Text>
                </View>

                <View style={styles.formContainer}>
                    <ErrorMessage
                        message={errorMsg || ''}
                        onDismiss={() => setErrorMsg(null)}
                    />

                    <View style={styles.formGroup}>
                        <Text style={[styles.label, { color: colors.text }]}>Email*</Text>
                        <TextInput
                            style={[styles.input, {
                                backgroundColor: colors.card,
                                borderColor: colors.border,
                                color: colors.text
                            }]}
                            value={email}
                            onChangeText={setEmail}
                            placeholder="Votre email"
                            placeholderTextColor={colors.textSecondary}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={[styles.label, { color: colors.text }]}>Mot de passe*</Text>
                        <TextInput
                            style={[styles.input, {
                                backgroundColor: colors.card,
                                borderColor: colors.border,
                                color: colors.text
                            }]}
                            value={password}
                            onChangeText={setPassword}
                            placeholder="Votre mot de passe"
                            placeholderTextColor={colors.textSecondary}
                            secureTextEntry
                        />
                    </View>

                    <Button
                        title={isLoading
                            ? (isLogin ? 'Connexion...' : 'Création en cours...')
                            : (isLogin ? 'Se connecter' : 'Créer votre compte')}
                        onPress={handleSubmit}
                        style={styles.submitButton}
                        disabled={isLoading}
                        loading={isLoading}
                    />

                    <TouchableOpacity
                        style={styles.switchMode}
                        onPress={() => setIsLogin(!isLogin)}
                    >
                        <Text style={[styles.switchModeText, { color: colors.primary }]}>
                            {isLogin
                                ? 'Pas encore de compte ? S\'inscrire'
                                : 'Déjà un compte ? Se connecter'}
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
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        marginBottom: 32,
        textAlign: 'center',
    },
    formContainer: {
        padding: 24,
    },
    formGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
    },
    input: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
    },
    submitButton: {
        marginTop: 8,
    },
    submitButtonDisabled: {
        opacity: 0.7,
    },
    switchMode: {
        marginTop: 16,
        alignItems: 'center',
    },
    switchModeText: {
        fontSize: 14,
        fontWeight: '500',
    },
}); 