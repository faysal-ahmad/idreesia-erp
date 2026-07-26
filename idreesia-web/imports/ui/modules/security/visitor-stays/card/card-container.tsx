// @ts-nocheck
import React, { Fragment, useRef } from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/client/react';
import ReactToPrint from 'react-to-print';
import { PrinterOutlined } from '@ant-design/icons';

import { Button } from 'antd';
import DutyCard from './duty-card';
import StayCard from './stay-card';

const StayCardContainer = ({
  cardType,
  visitorId,
  visitorStayId,
  onCloseCard,
}) => {
  const cardRef = useRef(null);
  const { data: visitorData = {}, loading: visitorLoading } = useQuery(
    formQueryVisitor,
    {
      variables: { _id: visitorId },
    }
  );
  const { data: visitorStayData = {}, loading: visitorStayLoading } = useQuery(
    formQueryVisitorStay,
    {
      variables: { _id: visitorStayId },
    }
  );
  const { securityVisitorById } = visitorData;
  const { visitorStayById } = visitorStayData;

  if (visitorLoading || visitorStayLoading) return null;

  const card =
    cardType === 'stay-card' ? (
      <StayCard
        ref={cardRef}
        visitor={securityVisitorById}
        visitorStay={visitorStayById}
      />
    ) : (
      <DutyCard
        ref={cardRef}
        visitor={securityVisitorById}
        visitorStay={visitorStayById}
      />
    );

  return (
    <Fragment>
      {card}
      <div style={{ paddingTop: '5px' }}>
        <ReactToPrint
          trigger={() => (
            <Button type="primary" size="large">
              <PrinterOutlined />
              Print
            </Button>
          )}
          content={() => cardRef.current}
        />
        &nbsp;
        <Button
          size="large"
          type="default"
          onClick={() => onCloseCard()}
        >
          Close
        </Button>
      </div>
    </Fragment>
  );
};

const formQueryVisitor = gql`
  query securityVisitorById($_id: String!) {
    securityVisitorById(_id: $_id) {
      _id
      name
      parentName
      cnicNumber
      referenceName
      contactNumber1
      city
      country
      criminalRecord
      image {
        _id
        data
      }
    }
  }
`;

const formQueryVisitorStay = gql`
  query visitorStayById($_id: String!) {
    visitorStayById(_id: $_id) {
      _id
      fromDate
      toDate
      stayReason
      stayAllowedBy
      dutyName
      shiftName
    }
  }
`;

StayCardContainer.propTypes = {
  cardType: PropTypes.string,
  visitorId: PropTypes.string,
  visitorStayId: PropTypes.string,
  onCloseCard: PropTypes.func,
};

export default StayCardContainer;
