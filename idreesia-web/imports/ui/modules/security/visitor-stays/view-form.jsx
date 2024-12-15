import React from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import dayjs from 'dayjs';

import { find, flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { StayReasons } from 'meteor/idreesia-common/constants/security';
import { List } from 'antd';

const ViewForm = ({ formDataLoading, visitorStayById }) => {
  if (formDataLoading) return null;

  const fromDate = dayjs(Number(visitorStayById.fromDate)).format('DD MMM, YYYY');
  const toDate = dayjs(Number(visitorStayById.toDate)).format('DD MMM, YYYY');
  const days = visitorStayById.numOfDays;

  let detail;
  if (days === 1) {
    detail = `1 day - [${fromDate}]`;
  } else {
    detail = `${days} days - [${fromDate} - ${toDate}]`;
  }

  let stayReason;
  if (visitorStayById.stayReason) {
    const reason = find(
      StayReasons,
      ({ _id }) => _id === visitorStayById.stayReason
    );
    stayReason = reason.name;
  }

  return (
    <List>
      <List.Item>
        <b>Stay Detail:</b> {detail}
      </List.Item>
      <List.Item>
        <b>Stay Allowed By:</b> {visitorStayById.stayAllowedBy}
      </List.Item>
      <List.Item>
        <b>Stay Reason:</b> {stayReason}
      </List.Item>
      <List.Item>
        <b>Duty / Shift:</b> {visitorStayById.dutyShiftName}
      </List.Item>
      <List.Item>
        <b>Team Name:</b> {visitorStayById.teamName}
      </List.Item>
    </List>
  );
};

ViewForm.propTypes = {
  visitorStayId: PropTypes.string,
  formDataLoading: PropTypes.bool,
  visitorStayById: PropTypes.object,
};

const formQuery = gql`
  query visitorStayById($_id: String!) {
    visitorStayById(_id: $_id) {
      _id
      visitorId
      fromDate
      toDate
      numOfDays
      stayReason
      stayAllowedBy
      dutyShiftName
      teamName
    }
  }
`;

export default flowRight(
  graphql(formQuery, {
    props: ({ data }) => ({ formDataLoading: data.loading, ...data }),
    options: ({ visitorStayId }) => ({ variables: { _id: visitorStayId } }),
  })
)(ViewForm);
