import React from "react";
import PropTypes from "prop-types";
import { Row, Col, Spin, message } from "antd";
import gql from "graphql-tag";
import { compose, graphql } from "react-apollo";
import moment from "moment";

import { VisitorStaysList } from "/imports/ui/modules/security/visitor-stays";

const LabelStyle = {
  fontWeight: "bold",
  fontSize: 22,
};

const DataStyle = {
  fontSize: 22,
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
  const { cnicNumber, loading, visitorByCnic } = props;
  if (!cnicNumber) return null;
  if (loading) return <Spin size="large" />;

  if (!visitorByCnic) {
    message.error(`No records found against scanned CNIC ${cnicNumber}`, 2);
    return null;
  }

  const {
    _id,
    name,
    parentName,
    ehadDate,
    referenceName,
    contactNumber1,
    city,
    country,
    imageId,
  } = visitorByCnic;

  const url = imageId
    ? Meteor.absoluteUrl(`download-file?attachmentId=${imageId}`)
    : null;

  const image = url ? <img src={url} style={{ width: "250px" }} /> : null;

  return (
    <Row type="flex" gutter={16}>
      <Col order={1}>
        {image}
        <SearchResultRow label="Name" text={name} />
        <SearchResultRow label="CNIC" text={cnicNumber} />
        <SearchResultRow label="S/O" text={parentName} />
        <SearchResultRow
          label="Ehad Date"
          text={moment(Number(ehadDate)).format("DD MMMM, YYYY")}
        />
        <SearchResultRow label="R/O" text={referenceName} />
        <SearchResultRow label="Phone" text={contactNumber1} />
        <SearchResultRow label="City" text={city} />
        <SearchResultRow label="Country" text={country} />
      </Col>
      <Col order={2}>
        <VisitorStaysList visitorId={_id} />
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
      parentName
      ehadDate
      referenceName
      contactNumber1
      city
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
