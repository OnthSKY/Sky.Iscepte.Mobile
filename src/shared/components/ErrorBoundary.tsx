/**
 * Error Boundary Component
 * 
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI instead of crashing
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../../core/contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import monitoringService from '../../core/services/monitoringService';
import Button from './Button';
import spacing from '../../core/constants/spacing';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface Props {
  children: ReactNode;
  fallback?: (error: Error, resetError: () => void) => ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundaryClass extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to monitoring service
    monitoringService.captureException(error, {
      context: 'error_boundary',
      componentStack: errorInfo.componentStack,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Store error info for display
    this.setState({
      errorInfo,
    });

    // Log to console in development
    if (__DEV__) {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
  }

  resetError = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.resetError);
      }

      // Default fallback UI
      return <DefaultErrorFallback error={this.state.error} onReset={this.resetError} />;
    }

    return this.props.children;
  }
}

/**
 * Default error fallback component
 */
function DefaultErrorFallback({ error, onReset }: { error: Error; onReset: () => void }) {
  const { colors } = useTheme();
  const { t } = useTranslation('common');
  const styles = getStyles(colors);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.iconContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.error} />
        </View>

        <Text style={styles.title}>
          {t('common:error_boundary_title', { defaultValue: 'Something went wrong' })}
        </Text>

        <Text style={styles.message}>
          {t('common:error_boundary_message', {
            defaultValue: 'An unexpected error occurred. Please try again or contact support if the problem persists.',
          })}
        </Text>

        {__DEV__ && error && (
          <View style={styles.errorDetails}>
            <Text style={styles.errorTitle}>Error Details (Development Only):</Text>
            <Text style={styles.errorText}>{error.toString()}</Text>
            {error.stack && (
              <Text style={styles.stackTrace}>{error.stack}</Text>
            )}
          </View>
        )}

        <View style={styles.buttonContainer}>
          <Button
            title={t('common:try_again', { defaultValue: 'Try Again' })}
            onPress={onReset}
            icon="refresh-outline"
          />
        </View>
      </ScrollView>
    </View>
  );
}

const getStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.xl,
    },
    iconContainer: {
      marginBottom: spacing.xl,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
      textAlign: 'center',
      marginBottom: spacing.md,
    },
    message: {
      fontSize: 16,
      color: colors.muted,
      textAlign: 'center',
      marginBottom: spacing.xl,
      lineHeight: 24,
    },
    errorDetails: {
      width: '100%',
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: spacing.md,
      marginBottom: spacing.xl,
      borderWidth: 1,
      borderColor: colors.border,
    },
    errorTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.error,
      marginBottom: spacing.xs,
    },
    errorText: {
      fontSize: 12,
      color: colors.text,
      fontFamily: 'monospace',
      marginBottom: spacing.xs,
    },
    stackTrace: {
      fontSize: 10,
      color: colors.muted,
      fontFamily: 'monospace',
      marginTop: spacing.xs,
    },
    buttonContainer: {
      width: '100%',
      maxWidth: 300,
    },
  });

/**
 * Error Boundary Component (with hooks support)
 */
export default function ErrorBoundary(props: Props) {
  return <ErrorBoundaryClass {...props} />;
}

