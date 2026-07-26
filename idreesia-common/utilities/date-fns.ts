// @ts-nocheck
import { format, parse } from 'date-fns';

export function toDateFnsFormat(formatString: string): string {
  return formatString
    .replace(/YYYY/g, 'yyyy')
    .replace(/YY/g, 'yy')
    .replace(/DD/g, 'dd')
    .replace(/D/g, 'd')
    .replace(/\ba\b/g, 'aaa');
}

export function formatDate(date: Date | number | string, formatString: string): string {
  return format(date, toDateFnsFormat(formatString));
}

export function parseDate(
  value: string,
  formatString: string,
  referenceDate: Date = new Date()
): Date {
  return parse(value, toDateFnsFormat(formatString), referenceDate);
}
