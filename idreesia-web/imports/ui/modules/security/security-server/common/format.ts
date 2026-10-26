import dayjs from 'dayjs';

import { Formats } from 'meteor/idreesia-common/constants';

/** Formats a GraphQL Date-as-String (epoch millis) value. */
export const formatDateTime = (value?: string | null) =>
  value ? dayjs(Number(value)).format(Formats.DATE_TIME_FORMAT) : '';

export const formatScore = (score?: number | null) =>
  score == null ? '' : `${(score * 100).toFixed(1)}%`;
