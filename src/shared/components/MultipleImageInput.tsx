import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Image, Alert, Platform, ScrollView, Modal } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../../core/contexts/ThemeContext';
import spacing from '../../core/constants/spacing';
import Button from './Button';
import { useTranslation } from 'react-i18next';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface MultipleImageInputProps {
  value?: string[]; // Array of base64 image strings or URIs
  onChange?: (value: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  maxImages?: number; // Maximum number of images allowed
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

export default function MultipleImageInput({ 
  value = [], 
  onChange, 
  placeholder = 'Fotoğraf eklemek için dokunun',
  disabled = false,
  maxImages = 10
}: MultipleImageInputProps) {
  const { colors } = useTheme();
  const { t } = useTranslation('common');
  const styles = getStyles(colors);
  const [images, setImages] = useState<string[]>(value || []);
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [previewImageIndex, setPreviewImageIndex] = useState(0);

  useEffect(() => {
    const valueArray = Array.isArray(value) ? value : (value ? [value] : []);
    if (JSON.stringify(valueArray) !== JSON.stringify(images)) {
      setImages(valueArray);
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

  const pickImagesFromGallery = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    if (images.length >= maxImages) {
      Alert.alert(
        t('max_images_reached', { defaultValue: 'Maksimum Resim Sayısı' }),
        t('max_images_reached_message', { 
          max: maxImages,
          defaultValue: `Maksimum ${maxImages} resim ekleyebilirsiniz.` 
        })
      );
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        allowsEditing: false,
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const newImages: string[] = [];
        
        for (const asset of result.assets) {
          // Check if we've reached max images
          if (images.length + newImages.length >= maxImages) {
            Alert.alert(
              t('max_images_reached', { defaultValue: 'Maksimum Resim Sayısı' }),
              t('max_images_reached_message', { 
                defaultValue: `Maksimum ${maxImages} resim ekleyebilirsiniz.` 
              })
            );
            break;
          }

          // Validate file
          const validation = validateFile(
            asset.uri, 
            asset.fileName || asset.uri.split('/').pop(),
            asset.fileSize
          );

          if (!validation.valid) {
            Alert.alert(
              t('validation_error', { defaultValue: 'Dosya Doğrulama Hatası' }),
              validation.error || t('invalid_file', { defaultValue: 'Geçersiz dosya.' })
            );
            continue;
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
              continue;
            }
          }
          
          newImages.push(base64Image);
        }

        if (newImages.length > 0) {
          const updatedImages = [...images, ...newImages];
          setImages(updatedImages);
          onChange?.(updatedImages);
        }
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

    if (images.length >= maxImages) {
      Alert.alert(
        t('max_images_reached', { defaultValue: 'Maksimum Resim Sayısı' }),
        t('max_images_reached_message', { 
          max: maxImages,
          defaultValue: `Maksimum ${maxImages} resim ekleyebilirsiniz.` 
        })
      );
      return;
    }

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
        
        const updatedImages = [...images, base64Image];
        setImages(updatedImages);
        onChange?.(updatedImages);
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
          onPress: pickImagesFromGallery,
        },
        {
          text: t('cancel', { defaultValue: 'İptal' }),
          style: 'cancel',
        },
      ]
    );
  };

  const removeImage = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index);
    setImages(updatedImages);
    onChange?.(updatedImages);
  };

  const openPreview = (index: number) => {
    setPreviewImageIndex(index);
    setPreviewModalVisible(true);
  };

  const closePreview = () => {
    setPreviewModalVisible(false);
  };

  const navigatePreview = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && previewImageIndex > 0) {
      setPreviewImageIndex(previewImageIndex - 1);
    } else if (direction === 'next' && previewImageIndex < images.length - 1) {
      setPreviewImageIndex(previewImageIndex + 1);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollView}>
        <View style={styles.imagesContainer}>
          {images.map((imageUri, index) => (
            <View key={index} style={styles.imageWrapper}>
              <TouchableOpacity
                onPress={() => openPreview(index)}
                style={styles.imageContainer}
                disabled={disabled}
              >
                <Image 
                  source={{ uri: imageUri }} 
                  style={styles.image}
                  resizeMode="cover"
                />
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeImage(index)}
                  disabled={disabled}
                >
                  <Ionicons name="close-circle" size={24} color={colors.error || '#ff4444'} />
                </TouchableOpacity>
              </TouchableOpacity>
            </View>
          ))}
          
          {images.length < maxImages && (
            <TouchableOpacity
              style={[styles.addButton, disabled && styles.disabled]}
              onPress={showImagePickerOptions}
              disabled={disabled}
            >
              <Ionicons name="add-outline" size={32} color={colors.muted || '#999'} />
              <Text style={[styles.addButtonText, { color: colors.muted || '#999' }]}>
                {t('add_photo', { defaultValue: 'Fotoğraf Ekle' })}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {images.length > 0 && (
        <View style={styles.infoContainer}>
          <Text style={[styles.infoText, { color: colors.muted }]}>
            {t('images_count', { 
              count: images.length,
              max: maxImages,
              defaultValue: `${images.length} / ${maxImages} fotoğraf eklendi` 
            })}
          </Text>
        </View>
      )}

      {/* Preview Modal */}
      <Modal
        visible={previewModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closePreview}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalCloseButton}
            onPress={closePreview}
          >
            <Ionicons name="close" size={32} color="#fff" />
          </TouchableOpacity>
          
          <View style={styles.modalContent}>
            <Image 
              source={{ uri: images[previewImageIndex] }} 
              style={styles.previewImage}
              resizeMode="contain"
            />
            
            {images.length > 1 && (
              <View style={styles.previewNavigation}>
                <TouchableOpacity
                  style={[styles.navButton, previewImageIndex === 0 && styles.navButtonDisabled]}
                  onPress={() => navigatePreview('prev')}
                  disabled={previewImageIndex === 0}
                >
                  <Ionicons 
                    name="chevron-back" 
                    size={32} 
                    color={previewImageIndex === 0 ? colors.muted : '#fff'} 
                  />
                </TouchableOpacity>
                
                <Text style={styles.previewCounter}>
                  {previewImageIndex + 1} / {images.length}
                </Text>
                
                <TouchableOpacity
                  style={[styles.navButton, previewImageIndex === images.length - 1 && styles.navButtonDisabled]}
                  onPress={() => navigatePreview('next')}
                  disabled={previewImageIndex === images.length - 1}
                >
                  <Ionicons 
                    name="chevron-forward" 
                    size={32} 
                    color={previewImageIndex === images.length - 1 ? colors.muted : '#fff'} 
                  />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  container: {
    width: '100%',
  },
  scrollView: {
    marginHorizontal: -spacing.md,
    paddingHorizontal: spacing.md,
  },
  imagesContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  imageWrapper: {
    position: 'relative',
  },
  imageContainer: {
    width: 120,
    height: 120,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border || '#ddd',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  removeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: colors.background || '#fff',
    borderRadius: 12,
    padding: 2,
  },
  addButton: {
    width: 120,
    height: 120,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.border || '#ddd',
    borderRadius: 8,
    backgroundColor: colors.background || '#f9f9f9',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.xs,
  },
  disabled: {
    opacity: 0.5,
  },
  addButtonText: {
    fontSize: 12,
    textAlign: 'center',
  },
  infoContainer: {
    marginTop: spacing.sm,
    alignItems: 'center',
  },
  infoText: {
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1,
    padding: spacing.sm,
  },
  modalContent: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImage: {
    width: '90%',
    height: '70%',
  },
  previewNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    marginTop: spacing.lg,
  },
  navButton: {
    padding: spacing.sm,
  },
  navButtonDisabled: {
    opacity: 0.3,
  },
  previewCounter: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

