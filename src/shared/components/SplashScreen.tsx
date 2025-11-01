import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../core/contexts/ThemeContext';

const { width, height } = Dimensions.get('window');

interface SplashScreenProps {
  onFinish: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const { colors, activeTheme } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const useNativeDriver = Platform.OS !== 'web';
    const animations = Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver,
      }),
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1500,
        easing: Easing.linear,
        useNativeDriver,
      }),
    ]);

    animations.start(() => {
      setTimeout(() => {
        onFinish();
      }, 1000);
    });
  }, []);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const isDark = activeTheme === 'dark';

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={isDark ? ['#0D1117', '#1E242C'] : ['#F8FAFC', '#E2E8F0']}
        style={styles.gradient}
      >
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Rotating ring */}
          <Animated.View
            style={[
              styles.ring,
              {
                borderColor: colors.primary,
                transform: [{ rotate }],
              },
            ]}
          />
          
          {/* Center circle with logo area */}
          <View
            style={[
              styles.centerCircle,
              {
                backgroundColor: colors.primary,
                borderColor: colors.primary,
                ...(Platform.OS === 'web' ? {
                  boxShadow: '0px 4px 4.65px rgba(0, 0, 0, 0.3)',
                } : {
                  shadowColor: '#000',
                  shadowOffset: {
                    width: 0,
                    height: 4,
                  },
                  shadowOpacity: 0.3,
                  shadowRadius: 4.65,
                  elevation: 8,
                }),
              },
            ]}
          >
            <View style={styles.logoInner}>
              {/* You can replace this with your actual logo when available */}
              <View style={[styles.logoPlaceholder, { borderColor: 'white' }]}>
                <View style={styles.logoDot} />
              </View>
            </View>
          </View>
        </Animated.View>

        {/* App name or tagline */}
        <Animated.View
          style={[
            styles.textContainer,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          {/* You can add your app name here */}
        </Animated.View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ring: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
  },
  centerCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoInner: {
    width: 70,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'white',
  },
  textContainer: {
    marginTop: 40,
    alignItems: 'center',
  },
});

export default SplashScreen;

