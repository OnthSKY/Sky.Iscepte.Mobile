/**
 * DateTimePicker - Native Date and Time Picker Component
 * Uses native pickers for better UX
 * Web: datetime-local input
 * Mobile: Native date/time pickers
 */

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Platform, StyleSheet } from 'react-native';
import { useTheme } from '../../core/contexts/ThemeContext';
import Modal from './Modal';
import Input from './Input';
import spacing from '../../core/constants/spacing';
import { formatDate } from '../../core/utils/dateUtils';
import RNDateTimePicker from '@react-native-community/datetimepicker';

interface DateTimePickerProps {
  visible: boolean;
  onClose: () => void;
  value: string; // Format: "YYYY-MM-DD HH:mm" or "YYYY-MM-DD"
  onConfirm: (dateTime: string) => void;
  label?: string;
  showTime?: boolean; // Whether to show time picker (default: true)
}

export default function DateTimePicker({
  visible,
  onClose,
  value,
  onConfirm,
  label,
  showTime = true,
}: DateTimePickerProps) {
  const { colors } = useTheme();
  const [tempDateTime, setTempDateTime] = useState('');
  const [includeTime, setIncludeTime] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [tempDate, setTempDate] = useState<Date>(new Date());

  useEffect(() => {
    if (visible) {
      // Parse value: "YYYY-MM-DD HH:mm" or "YYYY-MM-DD"
      const parts = (value || formatDate(new Date())).split(' ');
      const datePart = parts[0] || formatDate(new Date());
      const timePart = parts[1] || '';
      
      // Parse date string to Date object
      const [year, month, day] = datePart.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      
      // Ensure date is not before today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (date < today) {
        date.setTime(today.getTime());
      }
      
      if (showTime && timePart) {
        const [hours, minutes] = timePart.split(':').map(Number);
        date.setHours(hours, minutes, 0, 0);
        setTempDate(date);
        setTempDateTime(`${datePart} ${timePart}`);
        setIncludeTime(true);
        // Open date picker first
        setShowDatePicker(true);
        // For iOS, also show time picker immediately
        if (Platform.OS === 'ios') {
          setShowTimePicker(true);
        }
      } else if (showTime) {
        // showTime is true but no time part - default to current time
        date.setHours(new Date().getHours(), new Date().getMinutes(), 0, 0);
        setTempDate(date);
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        setTempDateTime(`${datePart} ${hours}:${minutes}`);
        setIncludeTime(true);
        setShowDatePicker(true);
        // For iOS, also show time picker immediately
        if (Platform.OS === 'ios') {
          setShowTimePicker(true);
        }
      } else {
        date.setHours(12, 0, 0, 0);
        setTempDate(date);
        setTempDateTime(datePart);
        setIncludeTime(false);
        // Open date picker directly
        setShowDatePicker(true);
      }
    } else {
      // Reset when closed
      setShowDatePicker(false);
      setShowTimePicker(false);
    }
  }, [visible, value, showTime]);

  const handleConfirm = () => {
    if (Platform.OS === 'web') {
      // Web: datetime-local format is "YYYY-MM-DDTHH:mm"
      if (includeTime && tempDateTime.includes('T')) {
        const [date, time] = tempDateTime.split('T');
        onConfirm(`${date} ${time}`);
      } else {
        onConfirm(tempDateTime);
      }
    } else {
      // Mobile: format from Date object
      const year = tempDate.getFullYear();
      const month = String(tempDate.getMonth() + 1).padStart(2, '0');
      const day = String(tempDate.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      
      if (includeTime) {
        const hours = String(tempDate.getHours()).padStart(2, '0');
        const minutes = String(tempDate.getMinutes()).padStart(2, '0');
        onConfirm(`${dateStr} ${hours}:${minutes}`);
      } else {
        onConfirm(dateStr);
      }
    }
    onClose();
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
      if (event.type === 'set' && selectedDate) {
        // Preserve time if it was set
        if (showTime && includeTime) {
          const hours = tempDate.getHours();
          const minutes = tempDate.getMinutes();
          selectedDate.setHours(hours, minutes, 0, 0);
          setTempDate(selectedDate);
          // Open time picker after date is selected
          setShowTimePicker(true);
        } else {
          selectedDate.setHours(12, 0, 0, 0);
          setTempDate(selectedDate);
          const year = selectedDate.getFullYear();
          const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
          const day = String(selectedDate.getDate()).padStart(2, '0');
          const dateStr = `${year}-${month}-${day}`;
          setTempDateTime(dateStr);
          // If no time picker needed, confirm immediately
          if (!showTime) {
            onConfirm(dateStr);
            onClose();
          }
        }
      } else if (event.type === 'dismissed') {
        onClose();
      }
    } else {
      // iOS - just update the date, time picker is already shown
      if (selectedDate) {
        // Preserve time if it was set
        if (showTime && includeTime) {
          const hours = tempDate.getHours();
          const minutes = tempDate.getMinutes();
          selectedDate.setHours(hours, minutes, 0, 0);
        } else {
          selectedDate.setHours(12, 0, 0, 0);
        }
        setTempDate(selectedDate);
        const year = selectedDate.getFullYear();
        const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
        const day = String(selectedDate.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;
        
        if (showTime && includeTime) {
          const hours = String(selectedDate.getHours()).padStart(2, '0');
          const minutes = String(selectedDate.getMinutes()).padStart(2, '0');
          setTempDateTime(`${dateStr} ${hours}:${minutes}`);
        } else {
          setTempDateTime(dateStr);
        }
      }
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
      if (event.type === 'set' && selectedTime) {
        // Preserve date
        const year = tempDate.getFullYear();
        const month = tempDate.getMonth();
        const day = tempDate.getDate();
        selectedTime.setFullYear(year, month, day);
        setTempDate(selectedTime);
        
        const hours = String(selectedTime.getHours()).padStart(2, '0');
        const minutes = String(selectedTime.getMinutes()).padStart(2, '0');
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dateTimeStr = `${dateStr} ${hours}:${minutes}`;
        setTempDateTime(dateTimeStr);
        // Confirm immediately on Android
        onConfirm(dateTimeStr);
        onClose();
      } else if (event.type === 'dismissed') {
        onClose();
      }
    } else {
      // iOS
      if (selectedTime) {
        // Preserve date
        const year = tempDate.getFullYear();
        const month = tempDate.getMonth();
        const day = tempDate.getDate();
        selectedTime.setFullYear(year, month, day);
        setTempDate(selectedTime);
        
        const hours = String(selectedTime.getHours()).padStart(2, '0');
        const minutes = String(selectedTime.getMinutes()).padStart(2, '0');
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        setTempDateTime(`${dateStr} ${hours}:${minutes}`);
      }
    }
  };

  const styles = getStyles(colors);

  if (Platform.OS === 'web') {
    return (
      <Modal visible={visible} onRequestClose={onClose}>
        <View style={styles.container}>
          <Text style={[styles.title, { color: colors.text }]}>
            {label || 'Tarih ve Saat Seç'}
          </Text>

          {/* DateTime Input for Web */}
          <View style={styles.section}>
            {showTime && (
              <View style={styles.timeHeader}>
                <Text style={[styles.label, { color: colors.text }]}>Saat Ekle</Text>
                <TouchableOpacity
                  onPress={() => {
                    setIncludeTime(!includeTime);
                    if (!includeTime) {
                      const currentDate = tempDateTime.split('T')[0] || formatDate(new Date());
                      setTempDateTime(`${currentDate}T12:00`);
                    } else {
                      setTempDateTime(tempDateTime.split('T')[0] || formatDate(new Date()));
                    }
                  }}
                  style={[
                    styles.toggle,
                    { backgroundColor: includeTime ? colors.primary : colors.border },
                  ]}
                >
                  <Text style={{ color: includeTime ? '#fff' : colors.text, fontSize: 12 }}>
                    {includeTime ? 'Açık' : 'Kapalı'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
            <input
              type={includeTime ? 'datetime-local' : 'date'}
              value={tempDateTime}
              onChange={(e) => setTempDateTime(e.target.value)}
              style={{
                width: '100%',
                padding: spacing.md,
                fontSize: 16,
                border: `1px solid ${colors.border}`,
                borderRadius: 12,
                backgroundColor: colors.surface,
                color: colors.text,
              }}
            />
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.button, styles.cancelButton, { backgroundColor: colors.border }]}
            >
              <Text style={{ color: colors.text }}>İptal</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleConfirm}
              style={[styles.button, styles.confirmButton, { backgroundColor: colors.primary }]}
            >
              <Text style={{ color: '#fff' }}>Tamam</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }


  // Mobile: Show native picker directly without modal
  if (!visible) {
    return null;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // For iOS, show picker in a modal
  if (Platform.OS === 'ios') {
    return (
      <Modal visible={visible} onRequestClose={onClose}>
        <View style={styles.container}>
          <Text style={[styles.title, { color: colors.text }]}>
            {label || 'Tarih ve Saat Seç'}
          </Text>
          
          {showDatePicker && (
            <RNDateTimePicker
              value={tempDate}
              mode="date"
              display="spinner"
              onChange={handleDateChange}
              minimumDate={today}
            />
          )}
          
          {showTimePicker && (
            <RNDateTimePicker
              value={tempDate}
              mode="time"
              display="spinner"
              onChange={handleTimeChange}
            />
          )}

          {/* Actions for iOS */}
          <View style={styles.actions}>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.button, styles.cancelButton, { backgroundColor: colors.border }]}
            >
              <Text style={{ color: colors.text }}>İptal</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleConfirm}
              style={[styles.button, styles.confirmButton, { backgroundColor: colors.primary }]}
            >
              <Text style={{ color: '#fff' }}>Tamam</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  // Android: Show native picker directly (no modal)
  return (
    <>
      {showDatePicker && (
        <RNDateTimePicker
          value={tempDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
          minimumDate={today}
        />
      )}
      {showTimePicker && (
        <RNDateTimePicker
          value={tempDate}
          mode="time"
          display="default"
          onChange={handleTimeChange}
        />
      )}
    </>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  container: {
    gap: spacing.md,
    minWidth: 300,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  section: {
    gap: spacing.sm,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  timeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggle: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 8,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'flex-end',
    marginTop: spacing.sm,
  },
  button: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  cancelButton: {},
  confirmButton: {},
});

