import React, { useRef, useState, useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Platform, Modal, Dimensions, StatusBar } from 'react-native';
import { PanResponder, GestureResponderEvent } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../../core/contexts/ThemeContext';
import spacing from '../../core/constants/spacing';
import Button from './Button';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SignatureInputProps {
  value?: string; // SVG path data veya base64 image
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

interface Point {
  x: number;
  y: number;
}

const STORAGE_KEY_SIGNATURE_MODAL_VISIBLE = 'signature_modal_visible_preference';

export default function SignatureInput({ 
  value, 
  onChange, 
  placeholder = 'İmza alanına dokunarak imzanızı çizin',
  disabled = false 
}: SignatureInputProps) {
  const { colors } = useTheme();
  const { t } = useTranslation('common');
  const styles = getStyles(colors);
  const [paths, setPaths] = useState<Array<{ path: string }>>([]);
  const [currentPath, setCurrentPath] = useState<string>('');
  const [currentPoints, setCurrentPoints] = useState<Point[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const pathRef = useRef<string>('');
  const previousValueRef = useRef<string | undefined>(value);
  const lastPointRef = useRef<Point | null>(null);
  const isDrawingRef = useRef(false);
  const isExpandedRef = useRef(false);
  const currentPointsRef = useRef<Point[]>([]);
  const pathsRef = useRef<Array<{ path: string }>>([]);
  const isCompletedRef = useRef(false);
  const modalVisibleRef = useRef(false);
  const disabledRef = useRef(false);
  const signatureAreaRef = useRef<View>(null);
  const screenDimensions = Dimensions.get('window');
  const [signatureAreaDimensions, setSignatureAreaDimensions] = useState({ width: screenDimensions.width, height: screenDimensions.height - 200 });

  // Load modal visibility preference from localStorage on mount
  React.useEffect(() => {
    const loadModalPreference = async () => {
      try {
        const savedPreference = await AsyncStorage.getItem(STORAGE_KEY_SIGNATURE_MODAL_VISIBLE);
        if (savedPreference === 'true') {
          // If user previously left modal open, restore it
          setIsExpanded(true);
          isExpandedRef.current = true;
          setModalVisible(true);
        }
      } catch (error) {
        // Failed to load preference, use default
      }
    };
    loadModalPreference();
  }, []);

  // Save modal visibility preference to localStorage when it changes
  React.useEffect(() => {
    const saveModalPreference = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY_SIGNATURE_MODAL_VISIBLE, String(modalVisible));
      } catch (error) {
        // Failed to save preference, continue
      }
    };
    saveModalPreference();
  }, [modalVisible]);

  // Initialize paths from value if provided (only when value changes externally)
  React.useEffect(() => {
    // Only update if value actually changed from external source
    if (previousValueRef.current !== value) {
      previousValueRef.current = value;
      
      if (value && value !== '') {
        // If value exists, mark as completed but don't auto-expand
        setIsCompleted(true);
        isCompletedRef.current = true;
        // If value is SVG path data, parse it
        try {
          const pathArray = value.split('|').filter(p => p);
          if (pathArray.length > 0) {
            const parsedPaths = pathArray.map(p => ({ path: p }));
            setPaths(parsedPaths);
            pathsRef.current = parsedPaths;
          }
        } catch (e) {
          // If parsing fails, treat as empty
          setPaths([]);
          pathsRef.current = [];
        }
      } else {
        // If value is cleared externally, clear paths
        setPaths([]);
        setCurrentPath('');
        setCurrentPoints([]);
        pathRef.current = '';
        pathsRef.current = [];
        currentPointsRef.current = [];
        setIsCompleted(false);
        isCompletedRef.current = false;
      }
    }
  }, [value]);

  // Keep refs in sync with state
  React.useEffect(() => {
    isExpandedRef.current = isExpanded;
  }, [isExpanded]);

  React.useEffect(() => {
    modalVisibleRef.current = modalVisible;
  }, [modalVisible]);

  React.useEffect(() => {
    disabledRef.current = disabled;
  }, [disabled]);

  React.useEffect(() => {
    pathsRef.current = paths;
  }, [paths]);

  React.useEffect(() => {
    currentPointsRef.current = currentPoints;
  }, [currentPoints]);

  React.useEffect(() => {
    isCompletedRef.current = isCompleted;
  }, [isCompleted]);

  // Helper function to create smooth path from points
  const createPathFromPoints = (points: Point[]): string => {
    if (points.length === 0) return '';
    if (points.length === 1) {
      return `M${points[0].x},${points[0].y}`;
    }
    
    let path = `M${points[0].x},${points[0].y}`;
    
    // Use quadratic bezier curves for smoother lines
    for (let i = 1; i < points.length - 1; i++) {
      const current = points[i];
      const next = points[i + 1];
      const midX = (current.x + next.x) / 2;
      const midY = (current.y + next.y) / 2;
      
      if (i === 1) {
        path += ` Q${current.x},${current.y} ${midX},${midY}`;
      } else {
        path += ` T${midX},${midY}`;
      }
    }
    
    // Add the last point
    if (points.length > 1) {
      const last = points[points.length - 1];
      path += ` L${last.x},${last.y}`;
    }
    
    return path;
  };

  const panResponder = useMemo(
    () => PanResponder.create({
      onStartShouldSetPanResponder: () => {
        const shouldRespond = !disabledRef.current && modalVisibleRef.current && !isCompletedRef.current;
        return shouldRespond;
      },
      onStartShouldSetPanResponderCapture: () => false,
      onMoveShouldSetPanResponder: () => {
        // Always accept move if we're in drawing mode or modal is visible
        return !disabledRef.current && modalVisibleRef.current && !isCompletedRef.current;
      },
      onMoveShouldSetPanResponderCapture: () => false,
      onPanResponderGrant: (event: GestureResponderEvent) => {
        if (disabledRef.current || !modalVisibleRef.current || isCompletedRef.current) return;
        const { locationX, locationY } = event.nativeEvent;
        const point = { x: locationX, y: locationY };
        lastPointRef.current = point;
        isDrawingRef.current = true;
        setCurrentPoints([point]);
        setCurrentPath(`M${locationX},${locationY}`);
      },
      onPanResponderReject: () => {
        // Reset if rejected
        isDrawingRef.current = false;
      },
      onPanResponderMove: (event: GestureResponderEvent) => {
        if (disabledRef.current || !modalVisibleRef.current || !isDrawingRef.current || isCompletedRef.current) return;
        const { locationX, locationY } = event.nativeEvent;
        const point = { x: locationX, y: locationY };
        
        // More sensitive: add point if it's at least 1 pixel away from last point for smoother drawing
        if (lastPointRef.current) {
          const dx = Math.abs(point.x - lastPointRef.current.x);
          const dy = Math.abs(point.y - lastPointRef.current.y);
          if (dx < 1 && dy < 1) return;
        }
        
        setCurrentPoints(prev => {
          const newPoints = [...prev, point];
          lastPointRef.current = point;
          const path = createPathFromPoints(newPoints);
          setCurrentPath(path);
          return newPoints;
        });
      },
      onPanResponderRelease: () => {
        if (disabledRef.current || !modalVisibleRef.current || !isDrawingRef.current || isCompletedRef.current) return;
        isDrawingRef.current = false;
        
        // Only save the path temporarily, don't complete automatically
        const points = currentPointsRef.current;
        if (points.length > 0) {
          const finalPath = createPathFromPoints(points);
          const newPaths = [...pathsRef.current, { path: finalPath }];
          setPaths(newPaths);
          pathsRef.current = newPaths;
          pathRef.current = '';
          setCurrentPath('');
          setCurrentPoints([]);
          currentPointsRef.current = [];
          lastPointRef.current = null;
          // Don't call onChange yet - wait for "Tamamla" button
        }
      },
      onPanResponderTerminate: () => {
        isDrawingRef.current = false;
        setCurrentPath('');
        setCurrentPoints([]);
        lastPointRef.current = null;
      },
    }),
    [] // Empty dependency array - we use refs for all dynamic values
  );

  const handleClear = () => {
    setPaths([]);
    setCurrentPath('');
    setCurrentPoints([]);
    pathRef.current = '';
    lastPointRef.current = null;
    pathsRef.current = [];
    currentPointsRef.current = [];
    setIsCompleted(false);
    isCompletedRef.current = false;
    onChange?.('');
  };

  const handleComplete = () => {
    if (hasSignature) {
      setIsCompleted(true);
      isCompletedRef.current = true;
      // Combine all paths and call onChange when completing
      const combinedPath = pathsRef.current.map(p => p.path).join('|');
      onChange?.(combinedPath);
      // Close modal after completing
      setModalVisible(false);
      setIsExpanded(false);
      isExpandedRef.current = false;
    }
  };

  const handleEdit = () => {
    setIsCompleted(false);
    isCompletedRef.current = false;
  };

  const handleExpand = () => {
    setIsExpanded(true);
    isExpandedRef.current = true;
    setModalVisible(true);
    // If editing existing signature, ensure it's loaded and editable
    if (value && value !== '') {
      // Load existing paths if not already loaded
      if (paths.length === 0 && pathsRef.current.length === 0) {
        try {
          const pathArray = value.split('|').filter(p => p);
          if (pathArray.length > 0) {
            const parsedPaths = pathArray.map(p => ({ path: p }));
            setPaths(parsedPaths);
            pathsRef.current = parsedPaths;
          }
        } catch (e) {
          // If parsing fails, treat as empty
          setPaths([]);
          pathsRef.current = [];
        }
      }
      setIsCompleted(false);
      isCompletedRef.current = false;
    } else {
      // Reset signature state when opening modal for new signature
      setPaths([]);
      setCurrentPath('');
      setCurrentPoints([]);
      pathsRef.current = [];
      currentPointsRef.current = [];
      setIsCompleted(false);
      isCompletedRef.current = false;
    }
  };

  const handleCloseModal = () => {
    // Only close if no signature has been drawn or if completed
    if ((paths.length === 0 && !currentPath && !isCompleted) || isCompleted) {
      setModalVisible(false);
      setIsExpanded(false);
      isExpandedRef.current = false;
    }
  };

  const handleCancel = () => {
    // Clear signature if not completed
    if (!isCompleted) {
      setPaths([]);
      setCurrentPath('');
      setCurrentPoints([]);
      pathsRef.current = [];
      currentPointsRef.current = [];
      pathRef.current = '';
      lastPointRef.current = null;
    }
    setModalVisible(false);
    setIsExpanded(false);
    isExpandedRef.current = false;
  };

  const hasSignature = paths.length > 0 || currentPath !== '';

  const hasExistingSignature = value && value !== '';

  return (
    <>
      <View style={styles.container}>
        {!isExpanded || isCompleted ? (
          <TouchableOpacity 
            onPress={handleExpand}
            style={[styles.addButton, disabled && styles.disabled]}
            disabled={disabled}
          >
            <Text style={styles.addButtonText}>
              {hasExistingSignature 
                ? t('edit_signature', { defaultValue: 'İmza Düzenle' })
                : t('add_signature', { defaultValue: 'İmza Ekle' })
              }
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Fullscreen Signature Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={handleCancel}
        statusBarTranslucent
      >
        <StatusBar barStyle="dark-content" />
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={handleCancel} style={styles.modalCancelButton}>
              <Text style={[styles.modalCancelButtonText, { color: colors.error }]}>
                {t('cancel', { defaultValue: 'İptal' })}
              </Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {t('signature', { defaultValue: 'İmza' })}
            </Text>
            <View style={styles.modalHeaderRight} />
          </View>

          {/* Fullscreen Signature Area */}
          <View 
            ref={signatureAreaRef}
            style={styles.modalSignatureArea}
            onLayout={(event) => {
              // Update SVG dimensions when layout changes
              const { width, height } = event.nativeEvent.layout;
              setSignatureAreaDimensions({ width, height });
            }}
          >
            <View 
              style={StyleSheet.absoluteFill}
              {...(!isCompleted && !disabled ? panResponder.panHandlers : {})}
              collapsable={false}
            >
              <Svg 
                width={signatureAreaDimensions.width}
                height={signatureAreaDimensions.height}
                style={styles.modalSvg}
                pointerEvents="none"
              >
                {paths.map((pathData, index) => (
                  <Path
                    key={index}
                    d={pathData.path}
                    stroke={colors.text}
                    strokeWidth={4}
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                ))}
                {currentPath && (
                  <Path
                    d={currentPath}
                    stroke={colors.text}
                    strokeWidth={4}
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}
              </Svg>
              {!hasSignature && (
                <Text style={styles.modalPlaceholder} pointerEvents="none">{placeholder}</Text>
              )}
            </View>
          </View>

          {/* Action Buttons */}
          {hasSignature && !disabled && (
            <View style={styles.modalActionButtons}>
              {!isCompleted ? (
                <>
                  <TouchableOpacity onPress={handleClear} style={styles.modalClearButton}>
                    <Text style={styles.modalClearButtonText}>
                      {t('clear', { defaultValue: 'Temizle' })}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={handleComplete} 
                    style={[styles.modalCompleteButton, { backgroundColor: colors.primary }]}
                  >
                    <Text style={styles.modalCompleteButtonText}>
                      {t('complete', { defaultValue: 'Tamamla' })}
                    </Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <TouchableOpacity onPress={handleClear} style={styles.modalClearButton}>
                    <Text style={styles.modalClearButtonText}>
                      {t('clear', { defaultValue: 'Temizle' })}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={handleEdit} 
                    style={[styles.modalEditButton, { borderColor: colors.primary }]}
                  >
                    <Text style={[styles.modalEditButtonText, { color: colors.primary }]}>
                      {t('edit', { defaultValue: 'Düzenle' })}
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          )}
        </View>
      </Modal>
    </>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  container: {
    width: '100%',
  },
  addButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '500',
  },
  signatureHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  signatureLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  collapseButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  collapseButtonText: {
    fontSize: 14,
  },
  signatureArea: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.surface,
    minHeight: 150,
    position: 'relative',
    overflow: 'hidden',
    ...(Platform.OS === 'web' ? {
      cursor: 'crosshair' as any,
      userSelect: 'none' as any,
    } : {}),
  },
  disabled: {
    opacity: 0.5,
  },
  completed: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  svg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  placeholder: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -100 }, { translateY: -10 }],
    color: colors.muted,
    fontSize: 14,
    textAlign: 'center',
    width: 200,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  clearButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  clearButtonText: {
    color: colors.error,
    fontSize: 14,
    fontWeight: '500',
  },
  completeButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  completeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  editButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  cancelButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  cancelButtonText: {
    fontSize: 14,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalCancelButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  modalCancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  modalHeaderRight: {
    width: 60, // Balance the header layout
  },
  modalSignatureArea: {
    flex: 1,
    backgroundColor: colors.surface,
    position: 'relative',
    overflow: 'hidden',
    ...(Platform.OS === 'web' ? {
      cursor: 'crosshair' as any,
      userSelect: 'none' as any,
    } : {}),
  },
  modalSvg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  modalPlaceholder: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -150 }, { translateY: -10 }],
    color: colors.muted,
    fontSize: 16,
    textAlign: 'center',
    width: 300,
  },
  modalActionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  modalClearButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 8,
  },
  modalClearButtonText: {
    color: colors.error,
    fontSize: 16,
    fontWeight: '600',
  },
  modalCompleteButton: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  modalCompleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  modalEditButton: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 8,
    borderWidth: 2,
    minWidth: 120,
    alignItems: 'center',
  },
  modalEditButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

