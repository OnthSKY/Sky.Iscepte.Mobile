import AsyncStorage from '@react-native-async-storage/async-storage';

export const storageService = {
  get: async <T>(key: string): Promise<T | null> => {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  },
  set: async (key: string, value: unknown) => AsyncStorage.setItem(key, JSON.stringify(value)),
  remove: async (key: string) => AsyncStorage.removeItem(key),
  clear: async () => AsyncStorage.clear(),
};

export default storageService;


