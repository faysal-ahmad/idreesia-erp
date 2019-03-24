import React from "react";
import PropTypes from "prop-types";
import { Card, Row, Col, message } from "antd";
import gql from "graphql-tag";
import { compose, graphql } from "react-apollo";

const SearchResult = props => {
  const { barcode, loading, karkunByBarcode } = props;
  if (!barcode || loading) return null;

  if (!karkunByBarcode) {
    message.error(`No karkun found against scanned barcode ${barcode}`, 2);
    return null;
  }

  const url = karkunByBarcode.imageId
    ? Meteor.absoluteUrl(
        `download-file?attachmentId=${karkunByBarcode.imageId}`
      )
    : null;

  const imageColumn = url ? (
    <Col span={3}>
      <img src={url} />
    </Col>
  ) : null;

  return (
    <Card>
      {imageColumn}
      <Row type="flex">
        <Col offset={3} span={8}>
          <Row type="flex" align="left" gutter={16}>
            <Col order={1}>
              <span style={{ fontWeight: "bold" }}>Name:</span>
            </Col>
            <Col order={2}>{karkunByBarcode.name}</Col>
          </Row>
          <Row type="flex" align="left" gutter={16}>
            <Col order={1}>
              <span style={{ fontWeight: "bold" }}>CNIC Number:</span>
            </Col>
            <Col order={2}>{karkunByBarcode.cnicNumber}</Col>
          </Row>
        </Col>
      </Row>
    </Card>
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
      name
      cnicNumber
      imageId
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
