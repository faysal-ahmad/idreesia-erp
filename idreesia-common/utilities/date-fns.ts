// @ts-nocheck
import { format, parse } from 'date-fns';

export function toDateFnsFormat(formatString) {
  return formatString
    .replace(/YYYY/g, 'yyyy')
    .replace(/YY/g, 'yy')
    .replace(/DD/g, 'dd')
    .replace(/D/g, 'd')
    .replace(/\ba\b/g, 'aaa');
}

export function formatDate(date, formatString) {
  return format(date, toDateFnsFormat(formatString));
}

export function parseDate(value, formatString, referenceDate = new Date()) {
  return parse(value, toDateFnsFormat(formatString), referenceDate);
}
