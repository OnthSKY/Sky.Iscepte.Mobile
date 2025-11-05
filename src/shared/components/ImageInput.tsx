import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Image, Alert, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../../core/contexts/ThemeContext';
import spacing from '../../core/constants/spacing';
import Button from './Button';
import { useTranslation } from 'react-i18next';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface ImageInputProps {
  value?: string; // Base64 image string or URI
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

// Maximum file size: 5MB (in bytes)
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Dangerous file extensions that should be blocked
const DANGEROUS_EXTENSIONS = [
  'bash', 'sh', 'exe', 'bat', 'cmd', 'com', 'pif', 'scr', 'vbs', 'js', 'jar',
  'app', 'deb', 'rpm', 'dmg', 'pkg', 'msi', 'dll', 'so', 'dylib', 'py', 'php',
  'pl', 'rb', 'ps1', 'psm1', 'psd1', 'ps1xml', 'psc1', 'psc2', 'csh', 'ksh',
  'zsh', 'fish', 'swift', 'go', 'sql', 'db', 'sqlite', 'mdb', 'accdb'
];

// Allowed image MIME types
const ALLOWED_MIME_TYPES = [
  'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'
];

// Allowed image file extensions
const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'];

export default function ImageInput({ 
  value, 
  onChange, 
  placeholder = 'Fotoğraf eklemek için dokunun',
  disabled = false 
}: ImageInputProps) {
  const { colors } = useTheme();
  const { t } = useTranslation('common');
  const styles = getStyles(colors);
  const [imageUri, setImageUri] = useState<string | null>(value || null);

  React.useEffect(() => {
    if (value !== imageUri) {
      setImageUri(value || null);
    }
  }, [value]);

  const validateFile = (uri: string, fileName?: string, fileSize?: number): { valid: boolean; error?: string } => {
    const translate = (key: string, defaultValue: string) => t(key, { defaultValue });
    // Check file size
    if (fileSize && fileSize > MAX_FILE_SIZE) {
      return {
        valid: false,
        error: translate('file_too_large', `Dosya boyutu çok büyük. Maksimum boyut: ${MAX_FILE_SIZE / (1024 * 1024)}MB`)
      };
    }

    // Check file extension from URI or filename
    const lowerUri = uri.toLowerCase();
    const lowerFileName = fileName?.toLowerCase() || '';
    
    // Extract extension from filename or URI
    let extension = '';
    if (lowerFileName) {
      const match = lowerFileName.match(/\.([a-z0-9]+)$/);
      if (match) extension = match[1];
    } else if (lowerUri) {
      const match = lowerUri.match(/\.([a-z0-9]+)(\?|$)/);
      if (match) extension = match[1];
    }

    // Block dangerous extensions
    if (extension && DANGEROUS_EXTENSIONS.includes(extension)) {
      return {
        valid: false,
        error: translate('dangerous_file_type', 'Bu dosya türü güvenlik nedeniyle yüklenemez.')
      };
    }

    // Check if it's an allowed image extension
    if (extension && !ALLOWED_EXTENSIONS.includes(extension)) {
      return {
        valid: false,
        error: translate('invalid_image_type', 'Sadece resim dosyaları yüklenebilir (JPG, PNG, GIF, WEBP, BMP).')
      };
    }

    // Additional check: validate base64 data URI format
    if (uri.startsWith('data:image/')) {
      const mimeMatch = uri.match(/^data:([^;]+)/);
      if (mimeMatch) {
        const mimeType = mimeMatch[1].toLowerCase();
        if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
          return {
            valid: false,
            error: translate('invalid_image_type', 'Sadece resim dosyaları yüklenebilir (JPG, PNG, GIF, WEBP, BMP).')
          };
        }
      }
    }

    return { valid: true };
  };

  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      const { status: mediaLibraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (cameraStatus !== 'granted' || mediaLibraryStatus !== 'granted') {
        Alert.alert(
          t('permissions_required', { defaultValue: 'İzin Gerekli' }),
          t('camera_permission_message', { defaultValue: 'Kamera ve galeri erişimi için izin gerekli.' })
        );
        return false;
      }
    }
    return true;
  };

  const pickImageFromGallery = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        
        // Validate file
        const validation = validateFile(
          asset.uri, 
          asset.fileName || asset.uri.split('/').pop(),
          asset.fileSize || asset.width && asset.height ? undefined : undefined
        );

        if (!validation.valid) {
          Alert.alert(
            t('validation_error', { defaultValue: 'Dosya Doğrulama Hatası' }),
            validation.error || t('invalid_file', { defaultValue: 'Geçersiz dosya.' })
          );
          return;
        }

        const base64Image = asset.base64 
          ? `data:image/jpeg;base64,${asset.base64}`
          : asset.uri;
        
        // Additional validation for base64 size
        if (asset.base64) {
          const base64Size = (asset.base64.length * 3) / 4; // Approximate size in bytes
          if (base64Size > MAX_FILE_SIZE) {
            Alert.alert(
              t('file_too_large', { defaultValue: 'Dosya Çok Büyük' }),
              t('file_too_large_message', { 
                defaultValue: `Dosya boyutu çok büyük. Maksimum boyut: ${MAX_FILE_SIZE / (1024 * 1024)}MB` 
              })
            );
            return;
          }
        }
        
        setImageUri(base64Image);
        onChange?.(base64Image);
      }
    } catch (error) {
      Alert.alert(
        t('error', { defaultValue: 'Hata' }),
        t('image_picker_error', { defaultValue: 'Fotoğraf seçilirken bir hata oluştu.' })
      );
    }
  };

  const takePhoto = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        
        // Validate file (camera photos are always images, but we still check size)
        if (asset.fileSize && asset.fileSize > MAX_FILE_SIZE) {
          Alert.alert(
            t('file_too_large', { defaultValue: 'Dosya Çok Büyük' }),
            t('file_too_large_message', { 
              defaultValue: `Dosya boyutu çok büyük. Maksimum boyut: ${MAX_FILE_SIZE / (1024 * 1024)}MB` 
            })
          );
          return;
        }

        const base64Image = asset.base64 
          ? `data:image/jpeg;base64,${asset.base64}`
          : asset.uri;
        
        // Additional validation for base64 size
        if (asset.base64) {
          const base64Size = (asset.base64.length * 3) / 4; // Approximate size in bytes
          if (base64Size > MAX_FILE_SIZE) {
            Alert.alert(
              t('file_too_large', { defaultValue: 'Dosya Çok Büyük' }),
              t('file_too_large_message', { 
                defaultValue: `Dosya boyutu çok büyük. Maksimum boyut: ${MAX_FILE_SIZE / (1024 * 1024)}MB` 
              })
            );
            return;
          }
        }
        
        setImageUri(base64Image);
        onChange?.(base64Image);
      }
    } catch (error) {
      Alert.alert(
        t('error', { defaultValue: 'Hata' }),
        t('camera_error', { defaultValue: 'Kamera açılırken bir hata oluştu.' })
      );
    }
  };

  const showImagePickerOptions = () => {
    if (disabled) return;

    Alert.alert(
      t('select_image_source', { defaultValue: 'Fotoğraf Seç' }),
      t('select_image_source_message', { defaultValue: 'Fotoğraf kaynağını seçin' }),
      [
        {
          text: t('camera', { defaultValue: 'Kamera' }),
          onPress: takePhoto,
        },
        {
          text: t('gallery', { defaultValue: 'Galeri' }),
          onPress: pickImageFromGallery,
        },
        {
          text: t('cancel', { defaultValue: 'İptal' }),
          style: 'cancel',
        },
      ]
    );
  };

  const removeImage = () => {
    setImageUri(null);
    onChange?.('');
  };

  return (
    <View style={styles.container}>
      {imageUri ? (
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: imageUri }} 
            style={styles.image}
            resizeMode="cover"
          />
          <TouchableOpacity
            style={styles.removeButton}
            onPress={removeImage}
            disabled={disabled}
          >
            <Ionicons name="close-circle" size={24} color={colors.error || '#ff4444'} />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={[styles.placeholderContainer, disabled && styles.disabled]}
          onPress={showImagePickerOptions}
          disabled={disabled}
        >
          <Ionicons name="camera-outline" size={32} color={colors.muted || '#999'} />
          <Text style={[styles.placeholderText, { color: colors.muted || '#999' }]}>
            {placeholder}
          </Text>
        </TouchableOpacity>
      )}
      
      {imageUri && (
        <TouchableOpacity
          style={[styles.changeButton, disabled && styles.disabled]}
          onPress={showImagePickerOptions}
          disabled={disabled}
        >
          <Ionicons name="pencil-outline" size={16} color={colors.primary} />
          <Text style={[styles.changeButtonText, { color: colors.primary }]}>
            {t('change_photo', { defaultValue: 'Fotoğrafı Değiştir' })}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  container: {
    width: '100%',
  },
  placeholderContainer: {
    width: '100%',
    minHeight: 150,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.border || '#ddd',
    borderRadius: 8,
    backgroundColor: colors.background || '#f9f9f9',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.sm,
  },
  disabled: {
    opacity: 0.5,
  },
  placeholderText: {
    fontSize: 14,
    textAlign: 'center',
  },
  imageContainer: {
    width: '100%',
    position: 'relative',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border || '#ddd',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: colors.background || '#fff',
    borderRadius: 12,
    padding: 2,
  },
  changeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
    padding: spacing.sm,
    gap: spacing.xs,
  },
  changeButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

