import React, { createContext, useState, useEffect, useMemo, useContext } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightColors, darkColors } from '../constants/colors';

export type AppTheme = 'light' | 'dark' | 'system';

type ThemeContextType = {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  colors: typeof lightColors;
  activeTheme: 'light' | 'dark';
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemScheme = useColorScheme();
  const [theme, setThemeState] = useState<AppTheme>('system');
  
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('app-theme') as AppTheme | null;
        if (savedTheme) {
          setThemeState(savedTheme);
        }
      } catch (error) {
        // Failed to load theme - use default
      }
    };
    loadTheme();
  }, []);

  const setTheme = async (newTheme: AppTheme) => {
    try {
      setThemeState(newTheme);
      await AsyncStorage.setItem('app-theme', newTheme);
    } catch (error) {
      // Failed to save theme - continue with in-memory state
    }
  };
  
  const activeTheme = useMemo(() => {
    if (theme === 'system') {
      return systemScheme || 'light';
    }
    return theme;
  }, [theme, systemScheme]);

  const colors = useMemo(() => (activeTheme === 'dark' ? darkColors : lightColors), [activeTheme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, colors, activeTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
