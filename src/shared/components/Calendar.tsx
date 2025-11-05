import React, { useState, useMemo, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions, Platform, Modal, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../core/contexts/ThemeContext';
import Ionicons from 'react-native-vector-icons/Ionicons';
import spacing from '../../core/constants/spacing';
import { isSameDay } from '../../core/utils/dateUtils';

interface CalendarProps {
  selectedDate?: Date;
  onDateSelect: (date: Date) => void;
  markedDates?: Record<string, { marked?: boolean; dotColor?: string }>;
  minDate?: Date;
  maxDate?: Date;
}

export default function Calendar({
  selectedDate = new Date(),
  onDateSelect,
  markedDates = {},
  minDate,
  maxDate,
}: CalendarProps) {
  const { t, i18n } = useTranslation('common');
  const { colors, activeTheme } = useTheme();
  const isDark = activeTheme === 'dark';
  const { width } = useWindowDimensions();
  const isMobile = width < 600;
  
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempYear, setTempYear] = useState(selectedDate.getFullYear());
  const [tempMonth, setTempMonth] = useState(selectedDate.getMonth() + 1);
  const [tempDay, setTempDay] = useState(selectedDate.getDate());
  const yearScrollRef = useRef<ScrollView>(null);
  const monthScrollRef = useRef<ScrollView>(null);
  const dayScrollRef = useRef<ScrollView>(null);

  // Update currentMonth when selectedDate changes
  useEffect(() => {
    setCurrentMonth(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
    setTempYear(selectedDate.getFullYear());
    setTempMonth(selectedDate.getMonth() + 1);
    setTempDay(selectedDate.getDate());
  }, [selectedDate]);

  // Get locale for date formatting
  const locale = i18n.language === 'tr' ? 'tr-TR' : 'en-US';

  // Get month and year strings
  const monthYearString = useMemo(() => {
    return new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(currentMonth);
  }, [currentMonth, locale]);

  // Get day names (localized)
  const dayNames = useMemo(() => {
    const days = [];
    const firstDayOfWeek = i18n.language === 'tr' ? 1 : 0; // Monday for TR, Sunday for EN
    for (let i = 0; i < 7; i++) {
      const dayIndex = (firstDayOfWeek + i) % 7;
      const date = new Date(2024, 0, dayIndex + 1);
      const dayName = new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(date);
      days.push(dayName);
    }
    return days;
  }, [locale, i18n.language]);

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // First day of month
    const firstDay = new Date(year, month, 1);
    // Last day of month
    const lastDay = new Date(year, month + 1, 0);
    
    // Get first day of week (0 = Sunday, 1 = Monday)
    const startDayOfWeek = i18n.language === 'tr' ? (firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1) : firstDay.getDay();
    
    const days: Array<{ date: Date; isCurrentMonth: boolean; isToday: boolean; isSelected: boolean }> = [];
    
    // Add previous month's trailing days
    const daysBefore = startDayOfWeek;
    for (let i = daysBefore - 1; i >= 0; i--) {
      const date = new Date(year, month, -i);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: isSameDay(date, new Date()),
        isSelected: isSameDay(date, selectedDate),
      });
    }
    
    // Add current month's days
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day);
      days.push({
        date,
        isCurrentMonth: true,
        isToday: isSameDay(date, new Date()),
        isSelected: isSameDay(date, selectedDate),
      });
    }
    
    // Add next month's leading days to fill the grid
    const remainingDays = 42 - days.length; // 6 rows * 7 days
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: isSameDay(date, new Date()),
        isSelected: isSameDay(date, selectedDate),
      });
    }
    
    return days;
  }, [currentMonth, selectedDate, i18n.language]);

  const isDateDisabled = (date: Date): boolean => {
    if (minDate && date < new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate())) {
      return true;
    }
    if (maxDate && date > new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate())) {
      return true;
    }
    return false;
  };

  const handlePreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleDateSelect = (date: Date) => {
    if (!isDateDisabled(date)) {
      onDateSelect(date);
    }
  };

  const handleMonthYearPress = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth() + 1;
    const day = selectedDate.getDate();
    setTempYear(year);
    setTempMonth(month);
    setTempDay(day);
    setShowDatePicker(true);
    
    // Scroll to selected values after a short delay
    setTimeout(() => {
      const currentYear = new Date().getFullYear();
      const yearIndex = years.findIndex(y => y === year);
      const itemHeight = 50; // Approximate height of each picker item
      if (yearIndex >= 0 && yearScrollRef.current) {
        yearScrollRef.current.scrollTo({ y: yearIndex * itemHeight - 100, animated: true });
      }
      
      const monthIndex = month - 1;
      if (monthScrollRef.current) {
        monthScrollRef.current.scrollTo({ y: monthIndex * itemHeight - 100, animated: true });
      }
      
      if (dayScrollRef.current) {
        dayScrollRef.current.scrollTo({ y: (day - 1) * itemHeight - 100, animated: true });
      }
    }, 100);
  };

  const handleDatePickerConfirm = () => {
    const newDate = new Date(tempYear, tempMonth - 1, tempDay);
    if (!isDateDisabled(newDate)) {
      onDateSelect(newDate);
    }
    setShowDatePicker(false);
  };

  const handleDatePickerCancel = () => {
    setShowDatePicker(false);
    setTempYear(selectedDate.getFullYear());
    setTempMonth(selectedDate.getMonth() + 1);
    setTempDay(selectedDate.getDate());
  };

  // Generate year list (current year ± 10 years)
  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const yearList = [];
    for (let i = currentYear - 10; i <= currentYear + 10; i++) {
      yearList.push(i);
    }
    return yearList;
  }, []);

  // Generate month list (1-12)
  const months = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => i + 1);
  }, []);

  // Generate day list based on selected month and year
  const days = useMemo(() => {
    const daysInMonth = new Date(tempYear, tempMonth, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => i + 1);
  }, [tempYear, tempMonth]);

  // Update day if it's invalid for the selected month
  useEffect(() => {
    const daysInMonth = new Date(tempYear, tempMonth, 0).getDate();
    if (tempDay > daysInMonth) {
      setTempDay(daysInMonth);
    }
  }, [tempYear, tempMonth, tempDay]);

  const styles = getStyles(colors, isDark, isMobile);

  return (
    <View style={styles.container}>
      {/* Header with month/year and navigation */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handlePreviousMonth}
          style={styles.navButton}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back-outline" size={24} color={colors.text} />
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={handleMonthYearPress}
          style={styles.monthYearButton}
          activeOpacity={0.7}
        >
          <Text style={styles.monthYearText}>{monthYearString}</Text>
          <Ionicons name="chevron-down-outline" size={16} color={colors.muted} style={{ marginLeft: spacing.xs }} />
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={handleNextMonth}
          style={styles.navButton}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-forward-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Day names */}
      <View style={styles.dayNamesRow}>
        {dayNames.map((dayName, index) => (
          <View key={index} style={styles.dayNameCell}>
            <Text style={styles.dayNameText}>{dayName}</Text>
          </View>
        ))}
      </View>

      {/* Calendar grid */}
      <View style={styles.calendarGrid}>
        {calendarDays.map((day, index) => {
          const dateKey = `${day.date.getFullYear()}-${String(day.date.getMonth() + 1).padStart(2, '0')}-${String(day.date.getDate()).padStart(2, '0')}`;
          const marked = markedDates[dateKey];
          const disabled = isDateDisabled(day.date);
          
          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.dayCell,
                !day.isCurrentMonth && styles.dayCellOtherMonth,
                day.isToday && styles.dayCellToday,
                day.isSelected && styles.dayCellSelected,
                disabled && styles.dayCellDisabled,
              ]}
              onPress={() => handleDateSelect(day.date)}
              disabled={disabled}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.dayText,
                  !day.isCurrentMonth && styles.dayTextOtherMonth,
                  day.isToday && styles.dayTextToday,
                  day.isSelected && styles.dayTextSelected,
                  disabled && styles.dayTextDisabled,
                ]}
              >
                {day.date.getDate()}
              </Text>
              {marked?.marked && (
                <View
                  style={[
                    styles.markedDot,
                    { backgroundColor: marked.dotColor || colors.primary },
                  ]}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Date Picker Modal */}
      <Modal
        visible={showDatePicker}
        transparent={true}
        animationType="fade"
        onRequestClose={handleDatePickerCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {t('common:select_date', { defaultValue: 'Tarih Seçin' })}
            </Text>
            
            <View style={styles.pickerContainer}>
              {/* Year Picker */}
              <View style={styles.pickerColumn}>
                <Text style={[styles.pickerLabel, { color: colors.muted }]}>
                  {i18n.language === 'tr' ? 'Yıl' : 'Year'}
                </Text>
                <ScrollView
                  ref={yearScrollRef}
                  style={styles.pickerScroll}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.pickerScrollContent}
                >
                  {years.map((year) => (
                    <TouchableOpacity
                      key={year}
                      style={[
                        styles.pickerItem,
                        tempYear === year && { backgroundColor: colors.primary + '20' },
                      ]}
                      onPress={() => setTempYear(year)}
                    >
                      <Text
                        style={[
                          styles.pickerItemText,
                          { color: colors.text },
                          tempYear === year && { color: colors.primary, fontWeight: '700' },
                        ]}
                      >
                        {year}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Month Picker */}
              <View style={styles.pickerColumn}>
                <Text style={[styles.pickerLabel, { color: colors.muted }]}>
                  {i18n.language === 'tr' ? 'Ay' : 'Month'}
                </Text>
                <ScrollView
                  ref={monthScrollRef}
                  style={styles.pickerScroll}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.pickerScrollContent}
                >
                  {months.map((month) => {
                    const monthName = new Date(2000, month - 1, 1).toLocaleString(locale, { month: 'long' });
                    return (
                      <TouchableOpacity
                        key={month}
                        style={[
                          styles.pickerItem,
                          tempMonth === month && { backgroundColor: colors.primary + '20' },
                        ]}
                        onPress={() => setTempMonth(month)}
                      >
                        <Text
                          style={[
                            styles.pickerItemText,
                            { color: colors.text },
                            tempMonth === month && { color: colors.primary, fontWeight: '700' },
                          ]}
                        >
                          {monthName}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              {/* Day Picker */}
              <View style={styles.pickerColumn}>
                <Text style={[styles.pickerLabel, { color: colors.muted }]}>
                  {i18n.language === 'tr' ? 'Gün' : 'Day'}
                </Text>
                <ScrollView
                  ref={dayScrollRef}
                  style={styles.pickerScroll}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.pickerScrollContent}
                >
                  {days.map((day) => (
                    <TouchableOpacity
                      key={day}
                      style={[
                        styles.pickerItem,
                        tempDay === day && { backgroundColor: colors.primary + '20' },
                      ]}
                      onPress={() => setTempDay(day)}
                    >
                      <Text
                        style={[
                          styles.pickerItemText,
                          { color: colors.text },
                          tempDay === day && { color: colors.primary, fontWeight: '700' },
                        ]}
                      >
                        {day}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton, { borderColor: colors.border }]}
                onPress={handleDatePickerCancel}
              >
                <Text style={[styles.modalButtonText, { color: colors.text }]}>
                  {t('common:cancel', { defaultValue: 'İptal' })}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton, { backgroundColor: colors.primary }]}
                onPress={handleDatePickerConfirm}
              >
                <Text style={[styles.modalButtonText, { color: '#FFFFFF' }]}>
                  {t('common:confirm', { defaultValue: 'Tamamla' })}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const getStyles = (colors: any, isDark: boolean, isMobile: boolean) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      padding: isMobile ? spacing.md : spacing.lg,
      ...Platform.select({
        web: {
          boxShadow: isDark ? '0px 2px 8px rgba(0, 0, 0, 0.2)' : '0px 2px 8px rgba(0, 0, 0, 0.08)',
        },
        default: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isDark ? 0.2 : 0.08,
          shadowRadius: 8,
          elevation: 2,
        },
      }),
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.md,
    },
    navButton: {
      padding: spacing.xs,
      borderRadius: 8,
      minWidth: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
    monthYearButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: 8,
    },
    monthYearText: {
      fontSize: isMobile ? 16 : 18,
      fontWeight: '700',
      color: colors.text,
      textTransform: 'capitalize',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.lg,
    },
    modalContent: {
      width: '100%',
      maxWidth: 600,
      borderRadius: 16,
      borderWidth: 1,
      padding: spacing.lg,
      maxHeight: '80%',
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: '700',
      marginBottom: spacing.lg,
      textAlign: 'center',
    },
    pickerContainer: {
      flexDirection: 'row',
      gap: spacing.md,
      marginBottom: spacing.lg,
      height: 300,
    },
    pickerColumn: {
      flex: 1,
    },
    pickerLabel: {
      fontSize: 14,
      fontWeight: '600',
      marginBottom: spacing.sm,
      textAlign: 'center',
    },
    pickerScroll: {
      flex: 1,
    },
    pickerScrollContent: {
      paddingVertical: spacing.xs,
    },
    pickerItem: {
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.xs,
      borderRadius: 8,
      marginBottom: spacing.xs,
      alignItems: 'center',
    },
    pickerItemText: {
      fontSize: 16,
      fontWeight: '500',
    },
    modalActions: {
      flexDirection: 'row',
      gap: spacing.md,
      marginTop: spacing.md,
    },
    modalButton: {
      flex: 1,
      paddingVertical: spacing.md,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cancelButton: {
      borderWidth: 1,
      backgroundColor: 'transparent',
    },
    confirmButton: {
      // backgroundColor set inline
    },
    modalButtonText: {
      fontSize: 16,
      fontWeight: '600',
    },
    dayNamesRow: {
      flexDirection: 'row',
      marginBottom: spacing.xs,
    },
    dayNameCell: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: spacing.xs,
    },
    dayNameText: {
      fontSize: isMobile ? 11 : 12,
      fontWeight: '600',
      color: colors.muted,
      textTransform: 'capitalize',
    },
    calendarGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    dayCell: {
      width: '14.28%',
      aspectRatio: 1,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 8,
      position: 'relative',
    },
    dayCellOtherMonth: {
      opacity: 0.3,
    },
    dayCellToday: {
      backgroundColor: colors.primary + '20',
    },
    dayCellSelected: {
      backgroundColor: colors.primary,
    },
    dayCellDisabled: {
      opacity: 0.3,
    },
    dayText: {
      fontSize: isMobile ? 13 : 14,
      fontWeight: '500',
      color: colors.text,
    },
    dayTextOtherMonth: {
      color: colors.muted,
    },
    dayTextToday: {
      fontWeight: '700',
      color: colors.primary,
    },
    dayTextSelected: {
      fontWeight: '700',
      color: '#FFFFFF',
    },
    dayTextDisabled: {
      color: colors.muted,
    },
    markedDot: {
      position: 'absolute',
      bottom: 4,
      width: 4,
      height: 4,
      borderRadius: 2,
    },
  });

