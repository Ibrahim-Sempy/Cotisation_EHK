import React, { createContext, useContext, useState, useEffect } from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { supabase } from './supabase';
import { User as SupabaseUser } from '@supabase/supabase-js';

type User = {
    id: string;
    email: string;
    created_at: string;
    last_sign_in_at?: string;
};

type AuthContextType = {
    user: User | null;
    isAuthenticated: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string) => Promise<{ requiresEmailConfirmation: boolean }>;
    signOut: () => Promise<void>;
    updateProfile: (data: Partial<User>) => Promise<void>;
    resetData: () => Promise<void>;
    loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const mapSupabaseUser = (user: SupabaseUser | null): User | null => {
    if (!user) return null;
    return {
        id: user.id,
        email: user.email || '',
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at
    };
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Vérifier la session au démarrage
        checkUser();

        // Écouter les changements d'authentification
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(mapSupabaseUser(session?.user ?? null));
            setIsLoading(false);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const checkUser = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(mapSupabaseUser(session?.user ?? null));
        } catch (error) {
            console.error('Erreur lors de la vérification de la session:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const signIn = async (email: string, password: string) => {
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (error) throw error;
        } catch (error: any) {
            console.error('Erreur de connexion:', error.message);
            throw error;
        }
    };

    const signUp = async (email: string, password: string) => {
        try {
            console.log('Début de l\'inscription avec:', { email });

            // Procéder à l'inscription
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: 'exp://localhost:19000/--/login'
                }
            });

            if (error) {
                console.error('Erreur détaillée d\'inscription:', {
                    message: error.message,
                    status: error.status,
                    name: error.name
                });
                throw error;
            }

            console.log('Inscription réussie:', data);

            // Vérifier si l'email doit être confirmé
            if (data?.user?.identities?.length === 0) {
                console.log('Email nécessite une confirmation');
                return { requiresEmailConfirmation: true };
            }

            return { requiresEmailConfirmation: false };
        } catch (error: any) {
            console.error('Erreur d\'inscription complète:', error);
            throw error;
        }
    };

    const signOut = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            setUser(null);
        } catch (error: any) {
            console.error('Erreur de déconnexion:', error.message);
            throw error;
        }
    };

    const updateProfile = async (data: Partial<User>) => {
        try {
            const { error } = await supabase.auth.updateUser({
                email: data.email,
            });
            if (error) throw error;
            setUser(prev => prev ? { ...prev, ...data } : null);
        } catch (error: any) {
            console.error('Erreur de mise à jour du profil:', error.message);
            throw error;
        }
    };

    const resetData = async () => {
        try {
            await signOut();
        } catch (error: any) {
            console.error('Erreur lors de la réinitialisation:', error.message);
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated: !!user,
            signIn,
            signUp,
            signOut,
            updateProfile,
            resetData,
            loading: isLoading
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
    }
    return context;
};

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        backgroundColor: '#F8FAFC',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingContent: {
        alignItems: 'center',
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#64748B',
        fontWeight: '500',
    },
}); 