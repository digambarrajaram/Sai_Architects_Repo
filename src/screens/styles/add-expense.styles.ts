// src/screens/styles/add-expense.styles.ts
import { StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  cancelBtn: {
    padding: spacing.sm,
  },
  cancelText: {
    color: colors.primary,
    fontSize: typography.sizes.md,
    fontWeight: '500',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: typography.sizes.lg,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: 140,
    flexGrow: 1,
  },
  section: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
  },
  sectionLabel: {
    fontSize: typography.sizes.md,
    fontWeight: '500',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  input: {
    height: 56,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    fontSize: typography.sizes.md,
    color: colors.textPrimary,
  },
  readOnlyField: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.border,
    borderRadius: 12,
    padding: spacing.md,
  },
  readOnlyText: {
    flex: 1,
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  lock: {
    fontSize: typography.sizes.md,
    marginLeft: spacing.xs,
  },
  amountBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    height: 56,
  },
  currency: {
    fontSize: 18,
    color: colors.textSecondary,
    marginRight: 2,
  },
  amountInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.lg,
    marginHorizontal: spacing.md,
  },
  field: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: typography.sizes.md,
    fontWeight: '500',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  required: {
    color: colors.error,
  },
  optional: {
    fontWeight: '400',
    color: colors.textSecondary,
  },
  selectBox: {
    height: 56,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectPlaceholder: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
  },
  selectValue: {
    fontSize: typography.sizes.md,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  expand: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
  },
  selectBoxError: {
    borderColor: colors.error,
    borderWidth: 2,
  },
  errorText: {
    fontSize: typography.sizes.sm,
    color: colors.error,
    marginTop: spacing.xs,
  },
  textArea: {
    minHeight: 100,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    padding: spacing.md,
    fontSize: typography.sizes.md,
    color: colors.textPrimary,
    textAlignVertical: 'top',
  },
  uploadBox: {
    height: 96,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.textSecondary,
    backgroundColor: colors.backgroundLight,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  uploadIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadIconText: {
    fontSize: typography.sizes.lg,
  },
  uploadText: {
    fontSize: typography.sizes.sm,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  footer: {
    padding: spacing.md,
    borderTopWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  submitButton: {
    height: 56,
    borderRadius: 16,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  submitButtonDisabled: {
    backgroundColor: colors.textSecondary,
  },
  submitButtonText: {
    color: colors.white,
    fontSize: typography.sizes.lg,
    fontWeight: '700',
  },
  submitButtonIcon: {
    color: colors.white,
    fontSize: typography.sizes.lg,
    fontWeight: '700',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  modalClose: {
    fontSize: typography.sizes.xl,
    color: colors.textSecondary,
    padding: spacing.xs,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.backgroundLight,
  },
  modalOptionSelected: {
    backgroundColor: colors.primaryLight,
  },
  modalOptionText: {
    fontSize: typography.sizes.md,
    color: colors.textPrimary,
  },
  modalOptionTextSelected: {
    fontWeight: '600',
    color: colors.primary,
  },
  checkmark: {
    fontSize: typography.sizes.md,
    color: colors.primary,
    fontWeight: '700',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundLight,
    borderRadius: 12,
    paddingHorizontal: spacing.sm,
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
    height: 44,
  },
  searchIcon: {
    fontSize: typography.sizes.md,
    marginRight: spacing.xs,
    color: colors.textSecondary,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.sizes.md,
    color: colors.textPrimary,
    padding: 0,
  },
  clearIcon: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    padding: spacing.xs,
  },
  // Date picker styles
  dateDisplay: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  currentDate: {
    fontSize: typography.sizes.lg,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  dateButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
  },
  dateButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateButtonToday: {
    backgroundColor: colors.primary,
  },
  dateButtonYesterday: {
    backgroundColor: colors.backgroundLight,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dateButtonText: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    color: colors.white,
  },
});