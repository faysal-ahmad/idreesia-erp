import React, { Fragment } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { Row, Col, Icon, Spin } from "antd";
import gql from "graphql-tag";
import { graphql } from "react-apollo";
import { flowRight } from "lodash";

import { SecuritySubModulePaths as paths } from "/imports/ui/modules/security";
import { getDownloadUrl } from "/imports/ui/modules/helpers/misc";
import StayCard from "../card/stay-card";

const ErrorStatusStyle = {
  color: "red",
  fontSize: 36,
};

const SuccessStatusStyle = {
  color: "green",
  fontSize: 40,
};

const ColumnStyle = {
  display: "flex",
  flexFlow: "column nowrap",
  alignItems: "center",
};

const ScanStatus = ({ message, isError }) => {
  const statusStyle = isError ? ErrorStatusStyle : SuccessStatusStyle;
  return (
    <Row type="flex" justify="start" align="middle" gutter={16}>
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

  let statusRow;
  if (visitorStayById.cancelledDate) {
    statusRow = <ScanStatus isError message="Card Cancelled" />;
  } else if (visitorStayById.isValid) {
    statusRow = <ScanStatus isError={false} message="Card Valid" />;
  } else {
    statusRow = <ScanStatus isError message="Card Expired" />;
  }

  const visitor = visitorStayById.refVisitor;
  const url = getDownloadUrl(visitor.imageId);
  const imageNode = url ? <img src={url} style={{ width: "250px" }} /> : null;
  const registerationUrl = paths.visitorRegistrationEditFormPath(visitor._id);

  return (
    <Fragment>
      {statusRow}
      <Row type="flex" gutter={16}>
        <Col order={1}>
          <StayCard visitor={visitor} visitorStay={visitorStayById} />
        </Col>
        <Col order={2}>
          <div style={ColumnStyle}>
            <Link to={registerationUrl}>Open Registeration</Link>
            {imageNode}
          </div>
        </Col>
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
      stayReason
      dutyName
      shiftName
      notes
      cancelledDate
      isValid
      refVisitor {
        _id
        name
        parentName
        referenceName
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

export default flowRight(
  graphql(formQuery, {
    props: ({ data }) => ({ ...data }),
    options: ({ barcode }) => ({
      variables: { _id: barcode },
      fetchPolicy: "network-only",
    }),
  })
)(SearchResult);
