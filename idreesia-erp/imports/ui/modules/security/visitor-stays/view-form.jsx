import React from "react";
import PropTypes from "prop-types";
import { List } from "antd";
import gql from "graphql-tag";
import { compose, graphql } from "react-apollo";
import moment from "moment";
import { find } from "lodash";

import StayReasons from "../common/constants/stay-reasons";

const ViewForm = ({ formDataLoading, visitorStayById }) => {
  if (formDataLoading) return null;

  const fromDate = moment(Number(visitorStayById.fromDate));
  const toDate = moment(Number(visitorStayById.toDate));
  const days = moment.duration(toDate.diff(fromDate)).asDays() + 1;

  let detail;
  if (days === 1) {
    detail = `1 day - [${fromDate.format("DD MMM, YYYY")}]`;
  } else {
    detail = `${days} days - [${fromDate.format(
      "DD MMM, YYYY"
    )} - ${toDate.format("DD MMM, YYYY")}]`;
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
        <b>Stay Reason:</b> {stayReason}
      </List.Item>
      <List.Item>
        <b>Stay Allowed by:</b> {visitorStayById.stayAllowedBy}
      </List.Item>
      <List.Item>
        <b>Duty / Shift:</b> {visitorStayById.dutyShiftName}
      </List.Item>
      <List.Item>
        <b>Notes:</b> {visitorStayById.notes}
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
      notes
    }
  }
`;

export default compose(
  graphql(formQuery, {
    props: ({ data }) => ({ formDataLoading: data.loading, ...data }),
    options: ({ visitorStayId }) => ({ variables: { _id: visitorStayId } }),
  })
)(ViewForm);
