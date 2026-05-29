/**
 * Formats a numeric value as Indian Rupee (INR) currency.
 * Uses the Indian numbering system (e.g. ₹1,23,456.78).
 */
export const formatCurrency = (value) => {
  const num = Number(value);
  if (isNaN(num)) return '₹0.00';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
};

/**
 * Formats a phone number in Indian standard format.
 * Accepts 10-digit numbers and returns: +91 XXXXX XXXXX
 */
export const formatPhone = (phone) => {
  if (!phone) return '';
  // Strip all non-numeric characters
  const digits = phone.replace(/\D/g, '');
  // If already has country code (91...) and is 12 digits
  if (digits.length === 12 && digits.startsWith('91')) {
    return `+91 ${digits.slice(2, 7)} ${digits.slice(7)}`;
  }
  // Standard 10-digit Indian mobile number
  if (digits.length === 10) {
    return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
  }
  // Return as-is if it doesn't match expected patterns
  return phone;
};
