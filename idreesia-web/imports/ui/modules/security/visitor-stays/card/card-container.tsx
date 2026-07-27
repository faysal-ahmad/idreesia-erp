import React, { Fragment, useRef } from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/client/react';
import ReactToPrint from 'react-to-print';
import { PrinterOutlined } from '@ant-design/icons';

import { Button } from 'antd';
import DutyCard from './duty-card';
import StayCard from './stay-card';

const ReactFragment = Fragment as any;
const AntButton = Button as any;
const AntPrinterOutlined = PrinterOutlined as any;
const PrintControl = ReactToPrint as any;
const DutyCardComponent = DutyCard as any;
const StayCardComponent = StayCard as any;
interface StayCardContainerProps {
  cardType: string;
  visitorId: string;
  visitorStayId: string;
  onCloseCard(): void;
}
interface VisitorData { securityVisitorById?: Record<string, unknown>; }
interface VisitorStayData { visitorStayById?: Record<string, unknown>; }

const StayCardContainer = ({
  cardType,
  visitorId,
  visitorStayId,
  onCloseCard,
}: StayCardContainerProps) => {
  const cardRef = useRef<HTMLElement | null>(null);
  const { data: visitorData = {}, loading: visitorLoading } = useQuery(
    formQueryVisitor as any,
    {
      variables: { _id: visitorId },
    }
  );
  const { data: visitorStayData = {}, loading: visitorStayLoading } = useQuery(
    formQueryVisitorStay as any,
    {
      variables: { _id: visitorStayId },
    }
  );
  const { securityVisitorById } = visitorData as VisitorData;
  const { visitorStayById } = visitorStayData as VisitorStayData;

  if (visitorLoading || visitorStayLoading) return null;

  const card =
    cardType === 'stay-card' ? (
      <StayCardComponent
        ref={cardRef}
        visitor={securityVisitorById}
        visitorStay={visitorStayById}
      />
    ) : (
      <DutyCardComponent
        ref={cardRef}
        visitor={securityVisitorById}
        visitorStay={visitorStayById}
      />
    );

  return (
    <ReactFragment>
      {card}
      <div style={{ paddingTop: '5px' }}>
        <PrintControl
          trigger={() => (
            <AntButton type="primary" size="large">
              <AntPrinterOutlined />
              Print
            </AntButton>
          )}
          content={() => cardRef.current}
        />
        &nbsp;
        <AntButton
          size="large"
          type="default"
          onClick={() => onCloseCard()}
        >
          Close
        </AntButton>
      </div>
    </ReactFragment>
  );
};

const formQueryVisitor = gql`
  query visitorStayCardSecurityVisitorById($_id: String!) {
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
  query visitorStayCardById($_id: String!) {
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
