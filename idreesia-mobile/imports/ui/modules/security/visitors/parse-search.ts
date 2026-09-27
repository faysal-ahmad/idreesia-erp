export type VisitorSearch =
  | { kind: 'none' }
  | { kind: 'name'; name: string }
  | { kind: 'cnic'; cnicNumber: string }
  | { kind: 'phone'; phoneNumber: string }
  /** Digits that aren't yet a whole CNIC or phone number. */
  | { kind: 'partialNumber' };

/**
 * One search box for name, CNIC or phone. The server matches CNIC and phone
 * numbers exactly, in the stored formats `#####-#######-#` and
 * `####-#######`, so typed digits are normalised to those; anything else is a
 * (full-text) name search.
 */
export const parseVisitorSearch = (text: string): VisitorSearch => {
  const value = text.trim();
  if (!value) return { kind: 'none' };
  if (!/^[\d\s+-]+$/.test(value)) return { kind: 'name', name: value };

  const digits = value.replace(/\D/g, '');
  if (digits.length === 13) {
    return {
      kind: 'cnic',
      cnicNumber: `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12)}`,
    };
  }

  // Accept +92 / 92 prefixes for Pakistani mobile numbers.
  const phone = digits.length === 12 && digits.startsWith('92') ? `0${digits.slice(2)}` : digits;
  if (phone.length === 11) {
    return { kind: 'phone', phoneNumber: `${phone.slice(0, 4)}-${phone.slice(4)}` };
  }
  return { kind: 'partialNumber' };
};
