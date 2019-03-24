import React, { Fragment } from "react";
import PropTypes from "prop-types";
import { Row, Col, message } from "antd";
import gql from "graphql-tag";
import { compose, graphql } from "react-apollo";

const SearchResult = props => {
  const { barcode, loading, karkunByBarcode } = props;
  if (!barcode || loading) return null;

  if (!karkunByBarcode) {
    message.error(`No karkun found against scanned barcode ${barcode}`, 2);
    return null;
  }

  return (
    <Fragment>
      <Row>
        <Col>First Name</Col>
        <Col>{karkunByBarcode.firstName}</Col>
      </Row>
      <Row>
        <Col>Last Name</Col>
        <Col>{karkunByBarcode.lastName}</Col>
      </Row>
      <Row>
        <Col>CNIC Number</Col>
        <Col>{karkunByBarcode.cnicNumber}</Col>
      </Row>
    </Fragment>
  );
};

SearchResult.propTypes = {
  loading: PropTypes.bool,
  barcode: PropTypes.string,
  karkunByBarcode: PropTypes.object,
};

const formQuery = gql`
  query karkunByBarcode($barcode: String!) {
    karkunByBarcode(barcode: $barcode) {
      _id
      firstName
      lastName
      cnicNumber
      barcode
    }
  }
`;

export default compose(
  graphql(formQuery, {
    props: ({ data }) => ({ ...data }),
    options: ({ barcode }) => ({ variables: { barcode } }),
  })
)(SearchResult);
