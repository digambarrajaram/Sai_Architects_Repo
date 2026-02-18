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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { useAuth } from '../context/AuthContext';
import { projectService, ProjectServiceError } from '../services/projectService';

type ProjectStatus = 'active' | 'planning' | 'completed' | 'on_hold';

const STATUS_OPTIONS: { label: string; value: ProjectStatus }[] = [
  { label: 'Active', value: 'active' },
  { label: 'Planning', value: 'planning' },
  { label: 'Completed', value: 'completed' },
  { label: 'On Hold', value: 'on_hold' },
];

export default function AddProjectScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { user } = useAuth();

  const [name, setName] = useState('');
  const [budget, setBudget] = useState('');
  const [dueDate, setDueDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [status, setStatus] =
    useState<ProjectStatus>('planning');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a project name');
      return;
    }

    if (!budget.trim() || isNaN(parseFloat(budget))) {
      Alert.alert('Error', 'Please enter a valid budget amount');
      return;
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

      navigation.goBack();

      setTimeout(() => {
        Alert.alert(
          'Success',
          `Project "${createdProject.name}" created successfully`
        );
      }, 100);
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
        >
          <Text style={styles.cancelText}>Cancel</Text>
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
              style={styles.input}
              placeholder="Enter project name"
              placeholderTextColor="#94a3b8"
              value={name}
              onChangeText={setName}
            />
          </View>

          {/* Budget */}
          <View style={styles.field}>
            <Text style={styles.label}>
              Budget <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.amountBox}>
              <Text style={styles.currency}>$</Text>
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
            <View style={styles.dateBox}>
              <Text style={styles.dateText}>
                {formatDate(dueDate)}
              </Text>
              <Text style={styles.calendarIcon}>📅</Text>
            </View>
          </View>

          {/* Status */}
          <View style={styles.field}>
            <Text style={styles.label}>Status</Text>
            <View style={styles.statusOptions}>
              {STATUS_OPTIONS.map(option => (
                <Pressable
                  key={option.value}
                  style={[
                    styles.statusChip,
                    status === option.value &&
                      styles.statusChipActive,
                  ]}
                  onPress={() => setStatus(option.value)}
                >
                  <Text
                    style={[
                      styles.statusChipText,
                      status === option.value &&
                        styles.statusChipTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Pressable
          style={[
            styles.submitBtn,
            (!name.trim() || !budget.trim()) &&
              styles.submitBtnDisabled,
          ]}
          onPress={handleSubmit}
          disabled={!name.trim() || !budget.trim() || loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitText}>
              Create Project
            </Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f7f8',
  },

  scrollView: {
    flex: 1,
  },

  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  cancelBtn: {
    padding: 8,
  },
  cancelText: {
    color: '#136dec',
    fontSize: 16,
    fontWeight: '500',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
  },

  content: {
    padding: 16,
    paddingBottom: 100,
  },

  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#334155',
    marginBottom: 8,
  },
  required: {
    color: '#dc2626',
  },

  input: {
    height: 56,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#0f172a',
  },

  amountBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 16,
    height: 56,
  },
  currency: {
    fontSize: 18,
    color: '#94a3b8',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#136dec',
  },

  dateBox: {
    height: 56,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateText: {
    fontSize: 16,
    color: '#0f172a',
    fontWeight: '500',
  },
  calendarIcon: {
    fontSize: 18,
  },

  statusOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  statusChipActive: {
    backgroundColor: '#136dec',
    borderColor: '#136dec',
  },
  statusChipText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  statusChipTextActive: {
    color: '#fff',
    fontWeight: '600',
  },

  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderTopWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  submitBtn: {
    backgroundColor: '#136dec',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnDisabled: {
    backgroundColor: '#94a3b8',
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
