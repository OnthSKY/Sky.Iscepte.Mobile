/**
 * useAuth Hook
 * 
 * Single Responsibility: Handles authentication form state, validation, and submission
 * Dependency Inversion: Depends on useAppStore interface, not concrete implementation
 */

import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../../store/useAppStore';
import { required, minLength, isEmail } from '../utils/validators';

export interface LoginFormData {
  username: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterFormData {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export interface AuthErrors {
  [key: string]: string | undefined;
}

/**
 * Hook for login functionality
 */
export function useLogin() {
  const { t } = useTranslation('login');
  const login = useAppStore((s) => s.login);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [usernameError, setUsernameError] = useState<string | undefined>();
  const [passwordError, setPasswordError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  const validateLogin = useCallback((): boolean => {
    setError('');
    setUsernameError(undefined);
    setPasswordError(undefined);

    const uReq = required(username);
    const uMin = minLength(3)(username);
    const pReq = required(password);
    const pMin = minLength(4)(password);
    
    const finalUError = uReq || uMin;
    const finalPError = pReq || pMin;
    
    if (finalUError || finalPError) {
      setUsernameError(finalUError);
      setPasswordError(finalPError);
      return false;
    }
    
    return true;
  }, [username, password]);

  const handleLogin = useCallback(async (): Promise<boolean> => {
    if (!validateLogin()) {
      return false;
    }

    setLoading(true);
    setError('');
    
    try {
      const success = await login(username, password);
      if (!success) {
        setError(t('invalid_credentials'));
        return false;
      }
      return true;
    } catch (err) {
      setError(t('invalid_credentials'));
      return false;
    } finally {
      setLoading(false);
    }
  }, [username, password, login, validateLogin, t]);

  return {
    // Form state
    username,
    setUsername,
    password,
    setPassword,
    passwordVisible,
    setPasswordVisible,
    rememberMe,
    setRememberMe,
    
    // Validation & errors
    error,
    usernameError,
    passwordError,
    
    // Loading
    loading,
    
    // Handlers
    handleLogin,
    validateLogin,
  };
}

/**
 * Hook for register functionality
 */
export function useRegister() {
  const { t } = useTranslation('register');

  const [formData, setFormData] = useState<RegisterFormData>({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<AuthErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const validate = useCallback((): boolean => {
    const next: AuthErrors = {};
    
    next.name = required(formData.name) || (minLength(2)(formData.name) ?? undefined);
    
    if (!formData.email) {
      next.email = t('errors.email_required');
    } else {
      next.email = isEmail(formData.email);
    }
    
    next.phone = required(formData.phone);
    
    const pwdMin = minLength(6)(formData.password);
    next.password = required(formData.password) || pwdMin;
    
    next.confirmPassword = required(formData.confirmPassword) ||
      (formData.password !== formData.confirmPassword ? t('errors.passwords_mismatch') : undefined);
    
    setErrors(next);
    return Object.values(next).every((e) => !e);
  }, [formData, t]);

  const updateField = useCallback((field: keyof RegisterFormData, value: string) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value };
      
      // Live validation for password confirmation
      if (field === 'password' && next.confirmPassword) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          confirmPassword:
            next.password !== next.confirmPassword ? t('errors.passwords_mismatch') : undefined,
        }));
      }
      
      if (field === 'confirmPassword') {
        setErrors((prevErrors) => ({
          ...prevErrors,
          confirmPassword:
            next.password !== next.confirmPassword ? t('errors.passwords_mismatch') : undefined,
        }));
      }
      
      return next;
    });
  }, [t]);

  const handleRegister = useCallback(async (): Promise<boolean> => {
    if (!validate()) {
      return false;
    }

    setSubmitting(true);
    try {
      // TODO: Replace with actual API call
      // Simulate success
      await new Promise((resolve) => setTimeout(resolve, 500));
      return true;
    } catch (err) {
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [validate]);

  return {
    // Form state
    formData,
    updateField,
    
    // Validation & errors
    errors,
    validate,
    
    // Loading
    submitting,
    
    // Handlers
    handleRegister,
  };
}

