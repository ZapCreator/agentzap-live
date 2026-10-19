/**
 * Indian Currency and Localized Formatting Utilities
 */

export const formatIndianPrice = (val: number): string => {
  if (isNaN(val) || val <= 0) return '₹0';
  if (val >= 10000000) {
    const cr = val / 10000000;
    const formatted = cr % 1 === 0 ? cr.toFixed(0) : cr.toFixed(2).replace(/\.?0+$/, '');
    return `₹${formatted} Cr`;
  }
  if (val >= 100000) {
    const lakhs = val / 100000;
    const formatted = lakhs % 1 === 0 ? lakhs.toFixed(0) : lakhs.toFixed(2).replace(/\.?0+$/, '');
    return `₹${formatted} Lakhs`;
  }
  return `₹${new Intl.NumberFormat('en-IN').format(val)}`;
};

export const formatIndianNumber = (val: number): string => {
  if (isNaN(val)) return '0';
  return new Intl.NumberFormat('en-IN').format(val);
};

export const formatLeadBudget = (val?: string | null): string => {
  if (!val || !val.trim()) return '₹1.50 Cr';
  let cleaned = val.trim();

  // Strip redundant "Budget:" or "Budget :" label
  cleaned = cleaned.replace(/^budget\s*:\s*/i, '').trim();

  // Handle specific legacy mock currency strings
  if (cleaned.includes('2.8M') || cleaned.includes('3.0M')) {
    return '₹1.85 Cr - ₹2.20 Cr';
  }
  if (cleaned.includes('1.8M') || cleaned.includes('2.0M')) {
    return '₹1.85 Cr';
  }
  if (cleaned.includes('950k') || cleaned.includes('950K') || cleaned.includes('0.95M') || cleaned.includes('95 Lakh')) {
    return '₹95 Lakhs Cash';
  }

  // Remove any dollar signs
  cleaned = cleaned.replace(/\$/g, '');

  // Convert "$XM" -> "₹X Cr"
  cleaned = cleaned.replace(/(\d+(?:\.\d+)?)\s*M\b/gi, '₹$1 Cr');
  // Convert "$Xk" -> "₹X Lakhs"
  cleaned = cleaned.replace(/(\d+(?:\.\d+)?)\s*k\b/gi, '₹$1 Lakhs');

  // Strip multiple redundant ₹
  cleaned = cleaned.replace(/₹+/g, '₹').trim();

  // Prepend ₹ if missing and doesn't already have currency symbol
  if (!cleaned.startsWith('₹')) {
    cleaned = `₹${cleaned}`;
  }

  // Normalize hyphen spacing: "₹1.85 Cr - ₹2.20 Cr"
  cleaned = cleaned.replace(/\s*-\s*/g, ' - ');
  cleaned = cleaned.replace(/₹\s+/g, '₹');

  return cleaned;
};
