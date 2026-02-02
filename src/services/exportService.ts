/**
 * CivManager - Export Service
 * Frontend-only export architecture for PDF/CSV/Excel
 * Filters: daily, weekly, monthly, yearly, custom
 */

import {
  ExportFormat,
  ExportConfig,
  ReportData,
  ReportFilter,
  DateRangeFilter,
  CategoryBreakdown,
  Expense,
  ExpenseCategory,
} from '../types';
import { expenseService } from './expenseService';
import { projectService } from './projectService';

// =====================================================
// DATE RANGE HELPERS
// =====================================================

function getDateRangeFromFilter(filter: DateRangeFilter): { startDate: string; endDate: string } {
  const now = new Date();
  const endDate = now.toISOString().split('T')[0];
  let startDate: string;

  switch (filter) {
    case 'daily':
      startDate = endDate;
      break;
    case 'weekly':
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);
      startDate = weekAgo.toISOString().split('T')[0];
      break;
    case 'monthly':
      const monthAgo = new Date(now);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      startDate = monthAgo.toISOString().split('T')[0];
      break;
    case 'yearly':
      const yearAgo = new Date(now);
      yearAgo.setFullYear(yearAgo.getFullYear() - 1);
      startDate = yearAgo.toISOString().split('T')[0];
      break;
    case 'custom':
    default:
      // For custom, caller should provide dates
      startDate = endDate;
      break;
  }

  return { startDate, endDate };
}

// =====================================================
// REPORT GENERATION
// =====================================================

async function generateReportData(filter: ReportFilter): Promise<ReportData> {
  const project = await projectService.getProjectById(filter.projectId);
  const totals = await projectService.getProjectTotals(filter.projectId);
  
  // Get date range
  const dateRange = filter.customRange || getDateRangeFromFilter(filter.dateRange);
  
  // Get expenses within range
  let expenses = await expenseService.getExpensesByDateRange(
    filter.projectId,
    dateRange.startDate,
    dateRange.endDate
  );

  // Filter by categories if specified
  if (filter.categories && filter.categories.length > 0) {
    expenses = expenses.filter(e => filter.categories!.includes(e.category));
  }

  // Calculate category breakdown
  const categoryBreakdown = calculateCategoryBreakdown(expenses);

  return {
    projectId: filter.projectId,
    projectName: project.name,
    generatedAt: new Date().toISOString(),
    filter,
    totals,
    expenses,
    categoryBreakdown,
  };
}

function calculateCategoryBreakdown(expenses: Expense[]): CategoryBreakdown[] {
  const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);
  
  const categoryMap = new Map<ExpenseCategory, { total: number; count: number }>();
  
  expenses.forEach(expense => {
    const existing = categoryMap.get(expense.category) || { total: 0, count: 0 };
    categoryMap.set(expense.category, {
      total: existing.total + expense.amount,
      count: existing.count + 1,
    });
  });

  return Array.from(categoryMap.entries()).map(([category, data]) => ({
    category,
    total: data.total,
    percentage: totalAmount > 0 ? (data.total / totalAmount) * 100 : 0,
    count: data.count,
  }));
}

// =====================================================
// EXPORT FORMATTERS
// =====================================================

/**
 * Generate CSV content from report data
 */
function generateCSVContent(reportData: ReportData): string {
  const lines: string[] = [];
  
  // Header
  lines.push('CivManager Expense Report');
  lines.push(`Project: ${reportData.projectName}`);
  lines.push(`Generated: ${new Date(reportData.generatedAt).toLocaleString()}`);
  lines.push(`Date Range: ${reportData.filter.dateRange}`);
  lines.push('');
  
  // Summary
  lines.push('SUMMARY');
  lines.push(`Total Budget,${reportData.totals.totalBudget}`);
  lines.push(`Total Expenses,${reportData.totals.totalExpenses}`);
  lines.push(`Remaining Budget,${reportData.totals.remainingBudget}`);
  lines.push(`Expense Count,${reportData.totals.expenseCount}`);
  lines.push('');
  
  // Category Breakdown
  lines.push('CATEGORY BREAKDOWN');
  lines.push('Category,Total,Percentage,Count');
  reportData.categoryBreakdown.forEach(cat => {
    lines.push(`${cat.category},${cat.total},${cat.percentage.toFixed(2)}%,${cat.count}`);
  });
  lines.push('');
  
  // Expense Details
  lines.push('EXPENSE DETAILS');
  lines.push('Date,Description,Category,Amount');
  reportData.expenses.forEach(expense => {
    lines.push(`${expense.date},"${expense.description}",${expense.category},${expense.amount}`);
  });

  return lines.join('\n');
}

/**
 * Generate PDF-ready data structure
 * Note: Actual PDF generation would require a library like react-native-pdf
 */
function generatePDFData(reportData: ReportData): object {
  return {
    title: 'CivManager Expense Report',
    project: {
      name: reportData.projectName,
      id: reportData.projectId,
    },
    metadata: {
      generatedAt: reportData.generatedAt,
      dateRange: reportData.filter.dateRange,
      customRange: reportData.filter.customRange,
    },
    summary: {
      totalBudget: reportData.totals.totalBudget,
      totalExpenses: reportData.totals.totalExpenses,
      remainingBudget: reportData.totals.remainingBudget,
      expenseCount: reportData.totals.expenseCount,
      profitLoss: reportData.totals.profitLoss,
    },
    categoryBreakdown: reportData.categoryBreakdown,
    expenses: reportData.expenses.map(e => ({
      date: e.date,
      description: e.description,
      category: e.category,
      amount: e.amount,
    })),
  };
}

/**
 * Generate Excel-ready data structure
 * Note: Actual Excel generation would require a library like xlsx
 */
function generateExcelData(reportData: ReportData): object {
  return {
    sheets: [
      {
        name: 'Summary',
        data: [
          ['CivManager Expense Report'],
          ['Project', reportData.projectName],
          ['Generated', new Date(reportData.generatedAt).toLocaleString()],
          ['Date Range', reportData.filter.dateRange],
          [],
          ['Metric', 'Value'],
          ['Total Budget', reportData.totals.totalBudget],
          ['Total Expenses', reportData.totals.totalExpenses],
          ['Remaining Budget', reportData.totals.remainingBudget],
          ['Expense Count', reportData.totals.expenseCount],
        ],
      },
      {
        name: 'Category Breakdown',
        data: [
          ['Category', 'Total', 'Percentage', 'Count'],
          ...reportData.categoryBreakdown.map(cat => [
            cat.category,
            cat.total,
            `${cat.percentage.toFixed(2)}%`,
            cat.count,
          ]),
        ],
      },
      {
        name: 'Expenses',
        data: [
          ['Date', 'Description', 'Category', 'Amount', 'Notes'],
          ...reportData.expenses.map(e => [
            e.date,
            e.description,
            e.category,
            e.amount,
            e.notes || '',
          ]),
        ],
      },
    ],
  };
}

// =====================================================
// EXPORT SERVICE
// =====================================================

export const exportService = {
  /**
   * Generate report data for a project
   */
  async generateReport(filter: ReportFilter): Promise<ReportData> {
    return generateReportData(filter);
  },

  /**
   * Export report in specified format
   * Returns the formatted data ready for download/sharing
   */
  async exportReport(config: ExportConfig): Promise<{
    format: ExportFormat;
    data: string | object;
    filename: string;
    mimeType: string;
  }> {
    const reportData = await generateReportData(config.filter);
    const timestamp = new Date().toISOString().split('T')[0];
    const projectName = reportData.projectName.replace(/\s+/g, '_');

    switch (config.format) {
      case 'CSV':
        return {
          format: 'CSV',
          data: generateCSVContent(reportData),
          filename: `${projectName}_Report_${timestamp}.csv`,
          mimeType: 'text/csv',
        };

      case 'PDF':
        return {
          format: 'PDF',
          data: generatePDFData(reportData),
          filename: `${projectName}_Report_${timestamp}.pdf`,
          mimeType: 'application/pdf',
        };

      case 'EXCEL':
        return {
          format: 'EXCEL',
          data: generateExcelData(reportData),
          filename: `${projectName}_Report_${timestamp}.xlsx`,
          mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        };

      default:
        throw new Error(`Unsupported export format: ${config.format}`);
    }
  },

  /**
   * Get available date range filters
   */
  getDateRangeFilters(): Array<{ value: DateRangeFilter; label: string }> {
    return [
      { value: 'daily', label: 'Today' },
      { value: 'weekly', label: 'Last 7 Days' },
      { value: 'monthly', label: 'Last 30 Days' },
      { value: 'yearly', label: 'Last Year' },
      { value: 'custom', label: 'Custom Range' },
    ];
  },

  /**
   * Get available export formats
   */
  getExportFormats(): Array<{ value: ExportFormat; label: string; icon: string }> {
    return [
      { value: 'PDF', label: 'PDF Document', icon: 'file-pdf' },
      { value: 'CSV', label: 'CSV Spreadsheet', icon: 'file-csv' },
      { value: 'EXCEL', label: 'Excel Workbook', icon: 'file-excel' },
    ];
  },

  /**
   * Validate export configuration
   */
  validateExportConfig(config: ExportConfig): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!config.filter.projectId) {
      errors.push('Project ID is required');
    }

    if (!config.format) {
      errors.push('Export format is required');
    }

    if (config.filter.dateRange === 'custom' && !config.filter.customRange) {
      errors.push('Custom date range is required when using custom filter');
    }

    if (config.filter.customRange) {
      const start = new Date(config.filter.customRange.startDate);
      const end = new Date(config.filter.customRange.endDate);
      if (start > end) {
        errors.push('Start date must be before end date');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  },
};

export default exportService;
