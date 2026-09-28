import { Platform } from 'react-native';

// Set EXPO_PUBLIC_API_URL to your machine's LAN IP when testing on a physical phone,
// e.g. EXPO_PUBLIC_API_URL=http://192.168.1.10:4000
export const API_URL =
  process.env.EXPO_PUBLIC_API_URL || (Platform.OS === 'android' ? 'http://10.0.2.2:4000' : 'http://localhost:4000');
