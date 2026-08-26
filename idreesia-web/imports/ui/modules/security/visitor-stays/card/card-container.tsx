import React, { Fragment, useRef } from 'react';
import { useQuery } from '@apollo/client/react';
import ReactToPrint from 'react-to-print';
import { PrinterOutlined } from '@ant-design/icons';

import { Button } from 'antd';
import DutyCard from './duty-card';
import StayCard from './stay-card';

import {
  VISITOR_STAY_CARD_BY_ID,
  VISITOR_STAY_CARD_SECURITY_VISITOR_BY_ID,
} from '../gql';

interface StayCardContainerProps {
  cardType: string;
  visitorId: string;
  visitorStayId: string;
  onCloseCard(): void;
}

const StayCardContainer = ({
  cardType,
  visitorId,
  visitorStayId,
  onCloseCard,
}: StayCardContainerProps) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const { data: visitorData, loading: personLoading } = useQuery(
    VISITOR_STAY_CARD_SECURITY_VISITOR_BY_ID,
    {
      variables: { _id: visitorId },
    }
  );
  const { data: visitorStayData, loading: visitorStayLoading } = useQuery(
    VISITOR_STAY_CARD_BY_ID,
    {
      variables: { _id: visitorStayId },
    }
  );
  const securityVisitorById = visitorData?.securityVisitorById;
  const visitorStayById = visitorStayData?.visitorStayById;

  if (personLoading || visitorStayLoading) return null;
  if (!securityVisitorById || !visitorStayById) return null;

  const visitor = {
    name: securityVisitorById.sharedData?.name,
    parentName: securityVisitorById.sharedData?.parentName,
    cnicNumber: securityVisitorById.sharedData?.cnicNumber,
    referenceName: securityVisitorById.sharedData?.referenceName,
    contactNumber1: securityVisitorById.sharedData?.contactNumber1,
    image: securityVisitorById.sharedData?.image,
    city: securityVisitorById.visitorData?.city,
    country: securityVisitorById.visitorData?.country,
    criminalRecord: securityVisitorById.visitorData?.criminalRecord,
  };

  const card =
    cardType === 'stay-card' ? (
      <StayCard visitor={visitor} visitorStay={visitorStayById} />
    ) : (
      <DutyCard visitor={visitor} visitorStay={visitorStayById} />
    );

  return (
    <Fragment>
      <div ref={cardRef}>{card}</div>
      <div style={{ paddingTop: '5px' }}>
        <ReactToPrint
          trigger={() => (
            <Button type="primary" size="large">
              <PrinterOutlined />
              Print
            </Button>
          )}
          content={() => cardRef.current as HTMLElement}
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

export default StayCardContainer;
