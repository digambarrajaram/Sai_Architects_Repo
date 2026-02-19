// src/utils/currencyHelpers.ts
export const currencyHelpers = {
  format: (amount: number, options?: Intl.NumberFormatOptions): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      ...options,
    }).format(amount);
  },

  formatCompact: (amount: number): string => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)}Cr`;
    }
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(2)}L`;
    }
    if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(1)}K`;
    }
    return `₹${amount.toFixed(0)}`;
  },

  formatWithSign: (amount: number): string => {
    const formatted = currencyHelpers.format(Math.abs(amount));
    return amount >= 0 ? formatted : `-${formatted}`;
  },

  parseAmount: (value: string): number => {
    // Remove currency symbols and commas
    const cleaned = value.replace(/[₹,]/g, '').trim();
    return parseFloat(cleaned) || 0;
  },

  isValidAmount: (value: any): boolean => {
    if (typeof value === 'number') return !isNaN(value) && value >= 0;
    if (typeof value === 'string') {
      const num = parseFloat(value);
      return !isNaN(num) && num >= 0;
    }
    return false;
  },

  calculatePercentage: (part: number, total: number): number => {
    if (total === 0) return 0;
    return (part / total) * 100;
  },

  calculateVariance: (actual: number, budget: number): { amount: number; percentage: number } => {
    const variance = actual - budget;
    const percentage = budget !== 0 ? (variance / budget) * 100 : 0;
    return { amount: variance, percentage };
  },
};

export default currencyHelpers;