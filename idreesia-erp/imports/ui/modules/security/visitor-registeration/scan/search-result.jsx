import React from "react";
import PropTypes from "prop-types";
import { Row, Col, Spin, message } from "antd";
import gql from "graphql-tag";
import { compose, graphql } from "react-apollo";

const LabelStyle = {
  fontWeight: "bold",
  fontSize: 26,
};

const DataStyle = {
  fontSize: 26,
};

const SearchResult = props => {
  const { cnicNumber, loading, visitorByCnic } = props;
  if (!cnicNumber) return null;
  if (loading) return <Spin size="large" />;

  if (!visitorByCnic) {
    message.error(`No records found against scanned CNIC ${cnicNumber}`, 2);
    return null;
  }

  const { name, imageId } = visitorByCnic;

  const url = imageId
    ? Meteor.absoluteUrl(`download-file?attachmentId=${imageId}`)
    : null;

  const imageColumn = url ? (
    <Col order={1}>
      <img src={url} style={{ width: "250px" }} />
    </Col>
  ) : null;

  return (
    <Row type="flex" gutter={16}>
      {imageColumn}
      <Col order={2}>
        <Row type="flex" gutter={16}>
          <Col order={1}>
            <span style={LabelStyle}>Name:</span>
          </Col>
          <Col order={2}>
            <span style={DataStyle}>{name}</span>
          </Col>
        </Row>
        <Row type="flex" gutter={16}>
          <Col order={1}>
            <span style={LabelStyle}>CNIC:</span>
          </Col>
          <Col order={2}>
            <span style={DataStyle}>{cnicNumber}</span>
          </Col>
        </Row>
      </Col>
    </Row>
  );
};

SearchResult.propTypes = {
  loading: PropTypes.bool,
  cnicNumber: PropTypes.string,
  visitorByCnic: PropTypes.object,
};

const formQuery = gql`
  query visitorByCnic($cnic: String!) {
    visitorByCnic(cnic: $cnic) {
      _id
      name
      cnicNumber
      imageId
    }
  }
`;

export default compose(
  graphql(formQuery, {
    props: ({ data }) => ({ ...data }),
    options: ({ cnicNumber }) => ({ variables: { cnic: cnicNumber } }),
  })
)(SearchResult);
