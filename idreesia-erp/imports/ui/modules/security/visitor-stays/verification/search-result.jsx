import React from "react";
import PropTypes from "prop-types";
import { Row, Col, Spin, message } from "antd";
import gql from "graphql-tag";
import { compose, graphql } from "react-apollo";

import StayCard from "../card/stay-card";

const LabelStyle = {
  fontWeight: "bold",
  fontSize: 26,
};

const DataStyle = {
  fontSize: 26,
};

const SearchResultRow = ({ label, text }) => (
  <Row type="flex" gutter={16}>
    <Col order={1}>
      <span style={LabelStyle}>{label}:</span>
    </Col>
    <Col order={2}>
      <span style={DataStyle}>{text}</span>
    </Col>
  </Row>
);

SearchResultRow.propTypes = {
  label: PropTypes.string,
  text: PropTypes.string,
};

const SearchResult = props => {
  const { barcode, loading, visitorStayById } = props;
  if (!barcode) return null;
  if (loading) return <Spin size="large" />;

  if (!visitorStayById) {
    message.error(`No records found against scanned barcode ${barcode}`, 2);
    return null;
  }

  const visitor = visitorStayById.refVisitor;

  return (
    <Row type="flex" gutter={16}>
      <StayCard visitor={visitor} visitorStay={visitorStayById} />
    </Row>
  );
};

SearchResult.propTypes = {
  loading: PropTypes.bool,
  barcode: PropTypes.string,
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
      refVisitor {
        _id
        name
        parentName
        cnicNumber
        contactNumber1
        contactNumber2
        city
        country
        imageId
        criminalRecord
        otherNotes
      }
    }
  }
`;

export default compose(
  graphql(formQuery, {
    props: ({ data }) => ({ ...data }),
    options: ({ barcode }) => ({ variables: { _id: barcode } }),
  })
)(SearchResult);
