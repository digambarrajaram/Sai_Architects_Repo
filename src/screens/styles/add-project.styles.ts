// src/screens/styles/add-project.styles.ts
import { StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
    color: colors.textSecondary,
    fontWeight: '400',
    fontSize: typography.sizes.sm,
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
  inputError: {
    borderColor: colors.error,
  },
  errorText: {
    color: colors.error,
    fontSize: typography.sizes.sm,
    marginTop: spacing.xs,
  },
  textArea: {
    height: 100,
    paddingTop: spacing.md,
    textAlignVertical: 'top',
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
    marginRight: spacing.xs,
  },
  amountInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  dateBox: {
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
  dateText: {
    fontSize: typography.sizes.md,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  calendarIcon: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
  },
  statusOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  statusChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 12,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: 80,
    alignItems: 'center',
  },
  statusChipText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  footer: {
    padding: spacing.md,
    borderTopWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  submitBtn: {
    height: 56,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnDisabled: {
    backgroundColor: '#E5E7EB',
    opacity: 1,
  },
  submitText: {
    color: colors.white,
    fontSize: typography.sizes.lg,
    fontWeight: '700',
  },
  submitTextDisabled: {
    color: '#6B7280',
  },
});