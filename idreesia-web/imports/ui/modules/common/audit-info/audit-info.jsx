import React from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/client/react';
import dayjs from 'dayjs';

import { Formats } from 'meteor/idreesia-common/constants';
import { List, Typography } from 'antd';

const ListStyle = {
  backgroundColor: '#F0F2F5',
};

const AuditInfo = ({ record }) => {
  const { data, loading } = useQuery(userNamesQuery, {
    variables: {
      ids: [record.createdBy, record.updatedBy, record.approvedBy],
    },
  });
  const userNames = data ? data.userNames : null;
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
