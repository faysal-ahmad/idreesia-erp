import React, { type CSSProperties } from 'react';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/client/react';
import dayjs from 'dayjs';

import { Formats } from 'meteor/idreesia-common/constants';
import { List, Typography } from 'antd';

interface AuditRecord { createdAt?: string | number | null; createdBy?: string | null; updatedAt?: string | number | null; updatedBy?: string | null; approvedOn?: string | number | null; approvedBy?: string | null; }
interface Props { record: AuditRecord; }
interface QueryData { userNames?: string[] | null; }

const ListStyle: CSSProperties = {
  backgroundColor: '#F0F2F5',
};

const AuditInfo = ({ record }: Props) => {
  const { data, loading } = useQuery<QueryData>(userNamesQuery, {
    variables: {
      ids: [record.createdBy, record.updatedBy, record.approvedBy],
    },
  });
  const userNames = data?.userNames;
  const userNamesLoading = loading;

  if (userNamesLoading || !userNames || userNames.length === 0) return null;
  const { createdAt, updatedAt, approvedOn } = record;

  const strCreatedAt = createdAt
    ? dayjs(Number(createdAt)).format(Formats.DATE_TIME_FORMAT)
    : null;
  const strUpdatedAt = updatedAt
    ? dayjs(Number(updatedAt)).format(Formats.DATE_TIME_FORMAT)
    : null;
  const strApprovedOn = approvedOn
    ? dayjs(Number(approvedOn)).format(Formats.DATE_TIME_FORMAT)
    : null;

  let approvalNode = null;
  if (strApprovedOn) {
    approvalNode = (
      <List.Item>
        <Typography.Text type="secondary">
          {`Approved by ${userNames[2]} on ${strApprovedOn}`}
        </Typography.Text>
      </List.Item>
    );
  }

  return (
    <List size="small" bordered style={ListStyle}>
      {approvalNode}
      <List.Item>
        <Typography.Text type="secondary">
          {`Last Updated by ${userNames[1]} on ${strUpdatedAt}`}
        </Typography.Text>
      </List.Item>
      <List.Item>
        <Typography.Text type="secondary">
          {`Created by ${userNames[0]} on ${strCreatedAt}`}
        </Typography.Text>
      </List.Item>
    </List>
  );
};

const userNamesQuery = gql`
  query userNames($ids: [String]) {
    userNames(ids: $ids)
  }
`;

export default AuditInfo;
