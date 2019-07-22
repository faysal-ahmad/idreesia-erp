import React from "react";
import PropTypes from "prop-types";
import { Row, Col, Spin, message } from "antd";
import gql from "graphql-tag";
import { compose, graphql } from "react-apollo";
import moment from "moment";

import { getDownloadUrl } from "/imports/ui/modules/helpers/misc";

const LabelStyle = {
  fontWeight: "bold",
  fontSize: 26,
};

const DataStyle = {
  fontSize: 26,
};

const SearchResult = props => {
  const { barcode, loading, attendanceByBarcodeId } = props;
  if (!barcode) return null;
  if (loading) return <Spin size="large" />;

  if (!attendanceByBarcodeId) {
    message.error(`No records found against scanned barcode ${barcode}`, 2);
    return null;
  }

  const {
    month,
    percentage,
    karkun,
    duty,
    shift,
    location,
  } = attendanceByBarcodeId;

  const url = getDownloadUrl(karkun.imageId);
  const imageColumn = url ? (
    <Col order={1}>
      <img src={url} style={{ width: "250px" }} />
    </Col>
  ) : null;

  const displayMonth = moment(`01-${month}`, "DD-MM-YYYY")
    .add(1, "months")
    .startOf("month");

  return (
    <Row type="flex" gutter={16}>
      {imageColumn}
      <Col order={2}>
        <Row type="flex" gutter={16}>
          <Col order={1}>
            <span style={LabelStyle}>Name:</span>
          </Col>
          <Col order={2}>
            <span style={DataStyle}>{karkun.name}</span>
          </Col>
        </Row>
        <Row type="flex" gutter={16}>
          <Col order={1}>
            <span style={LabelStyle}>CNIC:</span>
          </Col>
          <Col order={2}>
            <span style={DataStyle}>{karkun.cnicNumber}</span>
          </Col>
        </Row>
        <Row type="flex" gutter={16}>
          <Col order={1}>
            <span style={LabelStyle}>Duty:</span>
          </Col>
          <Col order={2}>
            <span style={DataStyle}>{duty.name}</span>
          </Col>
        </Row>
        <Row type="flex" gutter={16}>
          <Col order={1}>
            <span style={LabelStyle}>Shift:</span>
          </Col>
          <Col order={2}>
            <span style={DataStyle}>{shift.name}</span>
          </Col>
        </Row>
        {location ? (
          <Row type="flex" gutter={16}>
            <Col order={1}>
              <span style={LabelStyle}>Location:</span>
            </Col>
            <Col order={2}>
              <span style={DataStyle}>{location.name}</span>
            </Col>
          </Row>
        ) : null}
        <Row type="flex" gutter={16}>
          <Col order={1}>
            <span style={LabelStyle}>Month:</span>
          </Col>
          <Col order={2}>
            <span style={DataStyle}>{displayMonth.format("D MMM YYYY")}</span>
          </Col>
        </Row>
        <Row type="flex" gutter={16}>
          <Col order={1}>
            <span style={LabelStyle}>Attendance:</span>
          </Col>
          <Col order={2}>
            <span style={DataStyle}>{percentage}%</span>
          </Col>
        </Row>
      </Col>
    </Row>
  );
};

SearchResult.propTypes = {
  loading: PropTypes.bool,
  barcode: PropTypes.string,
  attendanceByBarcodeId: PropTypes.object,
};

const formQuery = gql`
  query attendanceByBarcodeId($barcodeId: String!) {
    attendanceByBarcodeId(barcodeId: $barcodeId) {
      _id
      karkunId
      dutyId
      shiftId
      month
      absentCount
      presentCount
      percentage
      karkun {
        _id
        name
        cnicNumber
        imageId
      }
      duty {
        _id
        name
      }
      shift {
        _id
        name
      }
      location {
        _id
        name
      }
    }
  }
`;

export default compose(
  graphql(formQuery, {
    props: ({ data }) => ({ ...data }),
    options: ({ barcode }) => ({ variables: { barcodeId: barcode } }),
  })
)(SearchResult);
