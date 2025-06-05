import React from 'react';
import { Stack } from 'expo-router';
import { AuthProvider, useAuth } from '../lib/auth';
import { ThemeProvider, useTheme } from '../lib/theme';

function RootLayoutNav() {
  const { isAuthenticated } = useAuth();
  const { colors } = useTheme();

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <Stack.Screen
          name="login"
          options={{
            headerShown: false,
            animation: 'fade'
          }}
        />
      ) : (
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
            animation: 'fade'
          }}
        />
      )}
      {isAuthenticated && (
        <>
          <Stack.Screen
            name="users"
            options={{
              headerShown: true,
              title: 'Gestion des utilisateurs',
              headerStyle: { backgroundColor: colors.primary },
              headerTintColor: 'white'
            }}
          />
          <Stack.Screen
            name="roles"
            options={{
              headerShown: true,
              title: 'Gestion des rôles',
              headerStyle: { backgroundColor: colors.primary },
              headerTintColor: 'white'
            }}
          />
        </>
      )}
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <RootLayoutNav />
      </AuthProvider>
    </ThemeProvider>
  );
}
