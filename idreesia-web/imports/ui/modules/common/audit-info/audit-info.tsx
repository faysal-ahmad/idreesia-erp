import React from 'react';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/client/react';
import dayjs from 'dayjs';

import { Formats } from 'meteor/idreesia-common/constants';

interface AuditRecord {
  createdAt?: string | number | null;
  createdBy?: string | null;
  updatedAt?: string | number | null;
  updatedBy?: string | null;
  approvedOn?: string | number | null;
  approvedBy?: string | null;
  deletedAt?: string | number | null;
  deletedBy?: string | null;
}

interface Props {
  record: AuditRecord;
  className?: string;
}

interface QueryData {
  userNames?: string[] | null;
}

// Timestamps arrive either as epoch millis (number / numeric string) or as ISO date strings.
const formatDateTime = (value: string | number): string => {
  const numeric = Number(value);
  const parsed = Number.isNaN(numeric) ? dayjs(value) : dayjs(numeric);
  return parsed.format(Formats.DATE_TIME_FORMAT);
};

const AuditInfo = ({ record, className }: Props) => {
  const { data, loading } = useQuery<QueryData>(userNamesQuery, {
    variables: {
      ids: [record.createdBy, record.updatedBy, record.approvedBy, record.deletedBy],
    },
  });
  const userNames = data?.userNames;
  const userNamesLoading = loading;

  if (userNamesLoading || !userNames || userNames.length === 0) return null;
  const { createdAt, updatedAt, approvedOn, deletedAt } = record;

  const strCreatedAt = createdAt
    ? formatDateTime(createdAt)
    : null;
  const strUpdatedAt = updatedAt
    ? formatDateTime(updatedAt)
    : null;
  const strApprovedOn = approvedOn
    ? formatDateTime(approvedOn)
    : null;
  const strDeletedAt = deletedAt
    ? formatDateTime(deletedAt)
    : null;

  return (
    <div className={['audit-info', className].filter(Boolean).join(' ')}>
      {strDeletedAt ? (
        <div className="audit-info-line">
          <span className="audit-info-label">Deleted</span>
          <span className="audit-info-value">
            <strong>{userNames[3]}</strong>
            <span className="audit-info-sep">·</span>
            {strDeletedAt}
          </span>
        </div>
      ) : null}
      {strApprovedOn ? (
        <div className="audit-info-line">
          <span className="audit-info-label">Approved</span>
          <span className="audit-info-value">
            <strong>{userNames[2]}</strong>
            <span className="audit-info-sep">·</span>
            {strApprovedOn}
          </span>
        </div>
      ) : null}
      <div className="audit-info-line">
        <span className="audit-info-label">Last updated</span>
        <span className="audit-info-value">
          <strong>{userNames[1]}</strong>
          <span className="audit-info-sep">·</span>
          {strUpdatedAt}
        </span>
      </div>
      <div className="audit-info-line">
        <span className="audit-info-label">Created</span>
        <span className="audit-info-value">
          <strong>{userNames[0]}</strong>
          <span className="audit-info-sep">·</span>
          {strCreatedAt}
        </span>
      </div>
    </div>
  );
};

const userNamesQuery = gql`
  query userNames($ids: [String]) {
    userNames(ids: $ids)
  }
`;

export default AuditInfo;
