import React from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/client/react';
import dayjs from 'dayjs';

import { Formats } from 'meteor/idreesia-common/constants';
import { List, Typography } from 'antd';

const AntList = List as any;
const AntTypography = Typography as any;
interface AuditRecord { createdAt?: string | number | null; createdBy?: string | null; updatedAt?: string | number | null; updatedBy?: string | null; approvedOn?: string | number | null; approvedBy?: string | null; }
interface Props { record: AuditRecord; }
interface QueryData { userNames?: string[] | null; }

const ListStyle = {
  backgroundColor: '#F0F2F5',
};

const AuditInfo = ({ record }: Props) => {
  const { data, loading } = useQuery(userNamesQuery as any, {
    variables: {
      ids: [record.createdBy, record.updatedBy, record.approvedBy],
    },
  });
  const userNames = data ? (data as QueryData).userNames : null;
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
      <AntList.Item>
        <AntTypography.Text type="secondary">
          {`Approved by ${userNames[2]} on ${strApprovedOn}`}
        </AntTypography.Text>
      </AntList.Item>
    );
  }

  return (
    <AntList size="small" bordered style={ListStyle as any}>
      {approvalNode}
      <AntList.Item>
        <AntTypography.Text type="secondary">
          {`Last Updated by ${userNames[1]} on ${strUpdatedAt}`}
        </AntTypography.Text>
      </AntList.Item>
      <AntList.Item>
        <AntTypography.Text type="secondary">
          {`Created by ${userNames[0]} on ${strCreatedAt}`}
        </AntTypography.Text>
      </AntList.Item>
    </AntList>
  );
};

AuditInfo.propTypes = {
  record: PropTypes.shape({
    createdAt: PropTypes.string,
    createdBy: PropTypes.string,
    updatedAt: PropTypes.string,
    updatedBy: PropTypes.string,
    approvedOn: PropTypes.string,
    approvedBy: PropTypes.string,
  }),
};

const userNamesQuery = gql`
  query userNames($ids: [String]) {
    userNames(ids: $ids)
  }
`;

export default AuditInfo;
