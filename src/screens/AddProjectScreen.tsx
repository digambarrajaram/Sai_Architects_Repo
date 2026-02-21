import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { projectService, ProjectServiceError } from '../services/projectService';
import { auditLogService } from '../services/auditLogService';
import { AuditAction, AuditEntityType } from '../types';
import { styles } from './styles/add-project.styles';
import { colors } from '../theme/colors';

type ProjectStatus = 'active' | 'planning' | 'completed' | 'on_hold';

const STATUS_OPTIONS: { label: string; value: ProjectStatus }[] = [
  { label: 'In Progress', value: 'active' },
  { label: 'Planning', value: 'planning' },
  { label: 'Completed', value: 'completed' },
  { label: 'On Hold', value: 'on_hold' },
];

export default function AddProjectScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [budget, setBudget] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [status, setStatus] =
    useState<ProjectStatus>('planning');
  const [loading, setLoading] = useState(false);
  const [nameError, setNameError] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    day: new Date().getDate(),
  });

  const handleSubmit = async () => {
    // Clear previous error
    setNameError('');
    
    if (!name.trim()) {
      setNameError('Please enter a project name');
      return;
    }

    if (!budget.trim() || isNaN(parseFloat(budget))) {
      Alert.alert('Error', 'Please enter a valid budget amount');
      return;
    }

    // Check for duplicate project name
    try {
      const existingProjects = await projectService.getProjects();
      const isDuplicate = existingProjects.some(
        (p) => p.name.toLowerCase() === name.trim().toLowerCase()
      );
      if (isDuplicate) {
        setNameError('A project with this name already exists.');
        return;
      }
    } catch (err) {
      // Continue if we can't check for duplicates
      console.warn('Could not check for duplicate projects:', err);
    }

    try {
      setLoading(true);

      const projectData = {
        name: name.trim(),
        budget: parseFloat(budget),
        due_date: dueDate,
        status,
        created_by: user?.id || 'unknown',
      };

      const createdProject =
        await projectService.createProject(projectData);

      // Log audit trail
      await auditLogService.logAction({
        projectId: createdProject.id,
        userId: user?.id || 'unknown',
        userName: user?.name || 'Unknown User',
        action: AuditAction.CREATE,
        entityType: AuditEntityType.PROJECT,
        entityId: createdProject.id,
        details: JSON.stringify({
          project_name: createdProject.name,
          project_budget: createdProject.budget,
          project_status: createdProject.status,
        }),
      });

      navigation.goBack();
      
      // Show success toast
      showToast(`Project "${createdProject.name}" created successfully!`, 'success');
    } catch (err) {
      const errorMessage =
        err instanceof ProjectServiceError
          ? err.message
          : 'Failed to create project. Please try again.';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={styles.cancelBtn}
          onPress={() => navigation.goBack()}
          testID="cancel-btn"
          accessibilityLabel="Go back"
        >
          <Text style={styles.cancelText}>← Back</Text>
        </Pressable>

        <Text style={styles.headerTitle}>New Project</Text>

        <View style={{ width: 64 }} />
      </View>

      {/* Scrollable Content */}
      <View style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{ paddingBottom: 20 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator
        >
          {/* Project Name */}
          <View style={styles.field}>
            <Text style={styles.label}>
              Project Name <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, nameError ? styles.inputError : null]}
              placeholder="Enter project name"
              placeholderTextColor="#94a3b8"
              value={name}
              onChangeText={(text) => {
                setName(text);
                setNameError(''); // Clear error when user types
              }}
            />
            {nameError ? (
              <Text style={styles.errorText}>{nameError}</Text>
            ) : null}
          </View>

          {/* Budget */}
          <View style={styles.field}>
            <Text style={styles.label}>
              Budget <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.amountBox}>
              <Text style={styles.currency}>₹</Text>
              <TextInput
                placeholder="0.00"
                placeholderTextColor="#cbd5e1"
                keyboardType="decimal-pad"
                style={styles.amountInput}
                value={budget}
                onChangeText={setBudget}
              />
            </View>
          </View>

          {/* Due Date */}
          <View style={styles.field}>
            <Text style={styles.label}>Due Date</Text>
            <Pressable 
              style={styles.dateBox}
              onPress={() => {
                const currentDate = new Date(dueDate);
                setTempDate({
                  year: currentDate.getFullYear(),
                  month: currentDate.getMonth() + 1,
                  day: currentDate.getDate(),
                });
                setShowDatePicker(true);
              }}
            >
              <Text style={styles.dateText}>
                {formatDate(dueDate)}
              </Text>
              <Text style={styles.calendarIcon}>📅</Text>
            </Pressable>
          </View>

          {/* Status */}
          <View style={styles.field}>
            <Text style={styles.label}>Status</Text>
            <View style={styles.statusOptions}>
              {STATUS_OPTIONS.map(option => {
                // Get status colors matching ProjectCard badges
                const getStatusColors = (value: string) => {
                  switch (value) {
                    case 'planning':
                      return { bg: '#DBEAFE', border: '#3B82F6', text: '#3B82F6' };
                    case 'active':
                      return { bg: '#DBEAFE', border: '#3B82F6', text: '#3B82F6' };
                    case 'on_hold':
                      return { bg: '#FEF3C7', border: '#F59E0B', text: '#F59E0B' };
                    case 'completed':
                      return { bg: '#D1FAE5', border: '#10B981', text: '#10B981' };
                    default:
                      return { bg: colors.primaryLight, border: colors.primary, text: colors.primary };
                  }
                };
                const statusColors = getStatusColors(option.value);
                const isActive = status === option.value;
                
                return (
                  <Pressable
                    key={option.value}
                    style={[
                      styles.statusChip,
                      isActive && {
                        backgroundColor: statusColors.bg,
                        borderColor: statusColors.border,
                      },
                    ]}
                    onPress={() => setStatus(option.value)}
                  >
                    <Text
                      style={[
                        styles.statusChipText,
                        isActive && {
                          color: statusColors.text,
                          fontWeight: '600',
                        },
                      ]}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Description */}
          <View style={styles.field}>
            <Text style={styles.label}>Description <Text style={styles.optional}>(Optional)</Text></Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Enter project description..."
              placeholderTextColor="#94a3b8"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={{ height: 20 }} />
        </ScrollView>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Pressable
          style={[
            styles.submitBtn,
            (!name.trim() || !budget.trim() || loading) &&
              styles.submitBtnDisabled,
          ]}
          onPress={handleSubmit}
          disabled={!name.trim() || !budget.trim() || loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={[
              styles.submitText,
              (!name.trim() || !budget.trim() || loading) &&
                styles.submitTextDisabled,
            ]}>
              Create Project
            </Text>
          )}
        </Pressable>
      </View>

      {/* Date Picker Modal */}
      <Modal
        visible={showDatePicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <Pressable 
          style={datePickerStyles.modalOverlay}
          onPress={() => setShowDatePicker(false)}
        >
          <Pressable 
            style={datePickerStyles.modalContent}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={datePickerStyles.modalHeader}>
              <Text style={datePickerStyles.modalTitle}>Select Due Date</Text>
              <Pressable onPress={() => setShowDatePicker(false)}>
                <Text style={datePickerStyles.closeBtn}>✕</Text>
              </Pressable>
            </View>
            
            <View style={datePickerStyles.dateRow}>
              {/* Month */}
              <View style={datePickerStyles.pickerColumn}>
                <Text style={datePickerStyles.pickerLabel}>Month</Text>
                <View style={datePickerStyles.pickerButtons}>
                  <Pressable 
                    style={datePickerStyles.pickerBtn}
                    onPress={() => setTempDate(prev => ({
                      ...prev,
                      month: prev.month > 1 ? prev.month - 1 : 12
                    }))}
                  >
                    <Text style={datePickerStyles.pickerBtnText}>−</Text>
                  </Pressable>
                  <Text style={datePickerStyles.pickerValue}>
                    {new Date(tempDate.year, tempDate.month - 1).toLocaleDateString('en-US', { month: 'long' })}
                  </Text>
                  <Pressable 
                    style={datePickerStyles.pickerBtn}
                    onPress={() => setTempDate(prev => ({
                      ...prev,
                      month: prev.month < 12 ? prev.month + 1 : 1
                    }))}
                  >
                    <Text style={datePickerStyles.pickerBtnText}>+</Text>
                  </Pressable>
                </View>
              </View>

              {/* Day */}
              <View style={datePickerStyles.pickerColumn}>
                <Text style={datePickerStyles.pickerLabel}>Day</Text>
                <View style={datePickerStyles.pickerButtons}>
                  <Pressable 
                    style={datePickerStyles.pickerBtn}
                    onPress={() => setTempDate(prev => ({
                      ...prev,
                      day: prev.day > 1 ? prev.day - 1 : 31
                    }))}
                  >
                    <Text style={datePickerStyles.pickerBtnText}>−</Text>
                  </Pressable>
                  <Text style={datePickerStyles.pickerValue}>{tempDate.day}</Text>
                  <Pressable 
                    style={datePickerStyles.pickerBtn}
                    onPress={() => setTempDate(prev => ({
                      ...prev,
                      day: prev.day < 31 ? prev.day + 1 : 1
                    }))}
                  >
                    <Text style={datePickerStyles.pickerBtnText}>+</Text>
                  </Pressable>
                </View>
              </View>

              {/* Year */}
              <View style={datePickerStyles.pickerColumn}>
                <Text style={datePickerStyles.pickerLabel}>Year</Text>
                <View style={datePickerStyles.pickerButtons}>
                  <Pressable 
                    style={datePickerStyles.pickerBtn}
                    onPress={() => setTempDate(prev => ({
                      ...prev,
                      year: prev.year - 1
                    }))}
                  >
                    <Text style={datePickerStyles.pickerBtnText}>−</Text>
                  </Pressable>
                  <Text style={datePickerStyles.pickerValue}>{tempDate.year}</Text>
                  <Pressable 
                    style={datePickerStyles.pickerBtn}
                    onPress={() => setTempDate(prev => ({
                      ...prev,
                      year: prev.year + 1
                    }))}
                  >
                    <Text style={datePickerStyles.pickerBtnText}>+</Text>
                  </Pressable>
                </View>
              </View>
            </View>

            <Pressable 
              style={datePickerStyles.confirmBtn}
              onPress={() => {
                const dateStr = `${tempDate.year}-${String(tempDate.month).padStart(2, '0')}-${String(tempDate.day).padStart(2, '0')}`;
                setDueDate(dateStr);
                setShowDatePicker(false);
              }}
            >
              <Text style={datePickerStyles.confirmBtnText}>Confirm</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

// Date Picker Styles
const datePickerStyles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  closeBtn: {
    fontSize: 24,
    color: '#64748b',
    paddingHorizontal: 8,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  pickerColumn: {
    alignItems: 'center',
  },
  pickerLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  pickerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pickerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerBtnText: {
    fontSize: 20,
    color: '#334155',
    fontWeight: '500',
  },
  pickerValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    minWidth: 60,
    textAlign: 'center',
  },
  confirmBtn: {
    backgroundColor: '#007bff',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  confirmBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});


