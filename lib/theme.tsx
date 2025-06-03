import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme, StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeType = 'light' | 'dark' | 'system';

type ThemeContextType = {
    theme: ThemeType;
    isDark: boolean;
    setTheme: (theme: ThemeType) => Promise<void>;
    colors: typeof lightColors;
};

const lightColors = {
    primary: '#4F46E5',
    background: '#F8FAFC',
    card: '#FFFFFF',
    text: '#1E293B',
    textSecondary: '#64748B',
    border: '#E2E8F0',
    error: '#EF4444',
    success: '#10B981',
    warning: '#F59E0B',
    info: '#3B82F6',
    primaryLight: '#EEF2FF',
    successLight: '#DCFCE7',
    errorLight: '#FEE2E2',
    warningLight: '#FEF3C7',
    infoLight: '#DBEAFE',
};

const darkColors = {
    primary: '#6366F1',
    background: '#0F172A',
    card: '#1E293B',
    text: '#F8FAFC',
    textSecondary: '#94A3B8',
    border: '#334155',
    error: '#F87171',
    success: '#34D399',
    warning: '#FBBF24',
    info: '#60A5FA',
    primaryLight: '#312E81',
    successLight: '#065F46',
    errorLight: '#991B1B',
    warningLight: '#92400E',
    infoLight: '#1E40AF',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    const systemColorScheme = useColorScheme();
    const [theme, setThemeState] = useState<ThemeType>('system');
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        loadTheme();
    }, []);

    useEffect(() => {
        const newIsDark = theme === 'system'
            ? systemColorScheme === 'dark'
            : theme === 'dark';
        setIsDark(newIsDark);
    }, [theme, systemColorScheme]);

    const loadTheme = async () => {
        try {
            const savedTheme = await AsyncStorage.getItem('theme');
            if (savedTheme) {
                setThemeState(savedTheme as ThemeType);
            }
        } catch (error) {
            console.error('Erreur lors du chargement du thème:', error);
        }
    };

    const setTheme = async (newTheme: ThemeType) => {
        try {
            await AsyncStorage.setItem('theme', newTheme);
            setThemeState(newTheme);
        } catch (error) {
            console.error('Erreur lors de la sauvegarde du thème:', error);
        }
    };

    const colors = isDark ? darkColors : lightColors;

    return (
        <ThemeContext.Provider value={{ theme, isDark, setTheme, colors }}>
            <StatusBar
                barStyle={isDark ? 'light-content' : 'dark-content'}
                backgroundColor={colors.background}
            />
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme doit être utilisé à l\'intérieur d\'un ThemeProvider');
    }
    return context;
}; 