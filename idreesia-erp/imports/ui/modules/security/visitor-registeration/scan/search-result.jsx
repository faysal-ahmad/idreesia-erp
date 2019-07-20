import React from "react";
import PropTypes from "prop-types";
import { Row, Col, Spin, Icon } from "antd";
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

const WarningDataStyle = {
  fontSize: 22,
  color: "orange",
};

const ErrorDataStyle = {
  fontSize: 22,
  color: "red",
};

const NoRecordFoundStyle = {
  color: "orange",
  fontSize: 36,
};

const SearchResultRow = ({ label, text, dataStyle }) => (
  <Row type="flex" gutter={16}>
    <Col order={1}>
      <span style={LabelStyle}>{label}:</span>
    </Col>
    <Col order={2}>
      <span style={dataStyle}>{text}</span>
    </Col>
  </Row>
);

SearchResultRow.propTypes = {
  label: PropTypes.string,
  text: PropTypes.string,
  dataStyle: PropTypes.object,
};

const SearchResult = props => {
  const { cnicNumber, loading, visitorByCnic } = props;
  if (!cnicNumber) return null;
  if (loading) return <Spin size="large" />;

  if (!visitorByCnic) {
    return (
      <Row type="flex" justify="start" align="middle" gutter={16}>
        <Col>
          <Icon
            style={NoRecordFoundStyle}
            type="exclamation-circle"
            theme="twoTone"
            twoToneColor={NoRecordFoundStyle.color}
          />
        </Col>
        <Col>
          <div style={NoRecordFoundStyle}>
            {"No records found against scanned CNIC."}
          </div>
        </Col>
      </Row>
    );
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
    criminalRecord,
    otherNotes,
  } = visitorByCnic;

  const url = imageId
    ? Meteor.absoluteUrl(`download-file?attachmentId=${imageId}`)
    : null;

  const image = url ? <img src={url} style={{ width: "250px" }} /> : null;

  let dataStyle = DataStyle;
  if (otherNotes) dataStyle = WarningDataStyle;
  if (criminalRecord) dataStyle = ErrorDataStyle;

  return (
    <Row type="flex" justify="space-between" gutter={16}>
      <Col order={1}>
        {image}
        <SearchResultRow label="Name" text={name} dataStyle={dataStyle} />
        <SearchResultRow label="CNIC" text={cnicNumber} dataStyle={dataStyle} />
        <SearchResultRow label="S/O" text={parentName} dataStyle={dataStyle} />
        <SearchResultRow
          label="Ehad Date"
          text={moment(Number(ehadDate)).format("DD MMMM, YYYY")}
          dataStyle={dataStyle}
        />
        <SearchResultRow
          label="R/O"
          text={referenceName}
          dataStyle={dataStyle}
        />
        <SearchResultRow
          label="Phone"
          text={contactNumber1}
          dataStyle={dataStyle}
        />
        <SearchResultRow label="City" text={city} dataStyle={dataStyle} />
        <SearchResultRow label="Country" text={country} dataStyle={dataStyle} />
      </Col>
      <Col order={2}>
        <VisitorStaysList visitorId={_id} showDutyColumn showNewButton />
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
      criminalRecord
      otherNotes
    }
  }
`;

export default compose(
  graphql(formQuery, {
    props: ({ data }) => ({ ...data }),
    options: ({ cnicNumber }) => ({
      variables: { cnic: cnicNumber },
      fetchPolicy: "network-only",
    }),
  })
)(SearchResult);
