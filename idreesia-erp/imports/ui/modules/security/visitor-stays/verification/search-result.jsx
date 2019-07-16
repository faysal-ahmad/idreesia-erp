import React, { Fragment } from "react";
import PropTypes from "prop-types";
import { Row, Col, Icon, Spin } from "antd";
import gql from "graphql-tag";
import { compose, graphql } from "react-apollo";
import moment from "moment";

const ErrorStatusStyle = {
  color: "red",
  fontSize: 36,
};

const SuccessStatusStyle = {
  color: "green",
  fontSize: 40,
};

import StayCard from "../card/stay-card";

const ScanStatus = ({ message, isError }) => {
  const statusStyle = isError ? ErrorStatusStyle : SuccessStatusStyle;
  return (
    <Row type="flex" justify="left" align="middle" gutter={16}>
      <Col>
        <Icon
          style={statusStyle}
          type="close-circle"
          theme="twoTone"
          twoToneColor={statusStyle.color}
        />
      </Col>
      <Col>
        <div style={statusStyle}>{message}</div>
      </Col>
    </Row>
  );
};

ScanStatus.propTypes = {
  message: PropTypes.string,
  isError: PropTypes.bool,
};

const SearchResult = props => {
  const { barcode, loading, visitorStayById } = props;
  if (!barcode) return null;
  if (loading) return <Spin size="large" />;

  if (!visitorStayById) {
    return <ScanStatus isError message="Card Not Found" />;
  }

  const fromDate = moment(Number(visitorStayById.fromDate));
  const toDate = moment(Number(visitorStayById.toDate));
  const currentDate = moment();

  let statusRow;
  if (visitorStayById.cancelledDate) {
    statusRow = <ScanStatus isError message="Card Cancelled" />;
  } else if (currentDate.isBetween(fromDate, toDate)) {
    statusRow = <ScanStatus isError={false} message="Card Valid" />;
  } else {
    statusRow = <ScanStatus isError message="Card Expired" />;
  }

  const visitor = visitorStayById.refVisitor;
  const url = visitor.imageId
    ? Meteor.absoluteUrl(`download-file?attachmentId=${visitor.imageId}`)
    : null;

  const imageColumn = url ? (
    <Col order={2}>
      <img src={url} style={{ width: "250px" }} />
    </Col>
  ) : null;

  return (
    <Fragment>
      {statusRow}
      <Row type="flex" gutter={16}>
        <Col order={1}>
          <StayCard visitor={visitor} visitorStay={visitorStayById} />
        </Col>
        {imageColumn}
      </Row>
    </Fragment>
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
      cancelledDate
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
