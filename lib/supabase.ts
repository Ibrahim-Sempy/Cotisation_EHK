import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

// TODO: Remplacez ces valeurs par vos clés Supabase
// 1. Allez sur https://app.supabase.com
// 2. Sélectionnez votre projet
// 3. Allez dans Project Settings > API
// 4. Copiez l'URL du projet et la clé anon/public
const supabaseUrl = 'https://ptxsfgbxsiaifuwjjydo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0eHNmZ2J4c2lhaWZ1d2pqeWRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg5MDY4NTUsImV4cCI6MjA2NDQ4Mjg1NX0.ntXousiHvr6dm4BJdIcZLOiYNYxWVJZ6Z4kFoiISlIQ';

// SecureStore adapter for session persistence
const ExpoSecureStoreAdapter = {
  getItem: (key: string) => {
    return SecureStore.getItemAsync(key);
  },
  setItem: (key: string, value: string) => {
    return SecureStore.setItemAsync(key, value);
  },
  removeItem: (key: string) => {
    return SecureStore.deleteItemAsync(key);
  },
};

// Initialize the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    debug: true,
    flowType: 'implicit'
  },
  global: {
    headers: {
      'Content-Type': 'application/json',
    },
  },
  db: {
    schema: 'public',
  },
});