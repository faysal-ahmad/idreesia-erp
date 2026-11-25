import dayjs, { type Dayjs } from 'dayjs';

import { Formats } from 'meteor/idreesia-common/constants';

type DateValue = string | number | null | undefined;

/** A quantity without trailing zeros: 2.5, 10. */
export const formatQuantity = (value: number | null | undefined) =>
  value == null
    ? ''
    : value.toLocaleString(undefined, { maximumFractionDigits: 3 });

/** The server sends dates as milliseconds since the epoch, as a string. */
export const toDayjs = (value: DateValue): Dayjs | null =>
  value == null || value === '' ? null : dayjs(Number(value));

export const formatDate = (value: DateValue) =>
  toDayjs(value)?.format(Formats.DATE_FORMAT) ?? '';

/** The string the server expects for a date picked in the UI. */
export const toDateInput = (value: Dayjs | null | undefined) =>
  value ? String(value.startOf('day').valueOf()) : undefined;
