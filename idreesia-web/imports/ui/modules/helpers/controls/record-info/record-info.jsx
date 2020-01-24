import React from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import moment from 'moment';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { Formats } from 'meteor/idreesia-common/constants';
import { List, Typography } from '/imports/ui/controls';

const ListStyle = {
  backgroundColor: '#F0F2F5',
};

const RecordInfo = ({ record, formDataLoading, userNames }) => {
  if (formDataLoading || !userNames || userNames.length === 0) return null;
  const { createdAt, updatedAt, approvedOn } = record;

  const strCreatedAt = createdAt
    ? moment(Number(createdAt)).format(Formats.DATE_TIME_FORMAT)
    : null;
  const strUpdatedAt = updatedAt
    ? moment(Number(updatedAt)).format(Formats.DATE_TIME_FORMAT)
    : null;
  const strApprovedOn = approvedOn
    ? moment(Number(approvedOn)).format(Formats.DATE_TIME_FORMAT)
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
          {`Updated by ${userNames[1]} on ${strUpdatedAt}`}
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

RecordInfo.propTypes = {
  record: PropTypes.shape({
    createdAt: PropTypes.string,
    createdBy: PropTypes.string,
    updatedAt: PropTypes.string,
    updatedBy: PropTypes.string,
    approvedOn: PropTypes.string,
    approvedBy: PropTypes.string,
  }),
  formDataLoading: PropTypes.bool,
  userNames: PropTypes.array,
};

const formQuery = gql`
  query userNames($ids: [String]) {
    userNames(ids: $ids)
  }
`;

export default flowRight(
  graphql(formQuery, {
    props: ({ data }) => ({ formDataLoading: data.loading, ...data }),
    options: ({ record }) => ({
      variables: {
        ids: [record.createdBy, record.updatedBy, record.approvedBy],
      },
    }),
  })
)(RecordInfo);
