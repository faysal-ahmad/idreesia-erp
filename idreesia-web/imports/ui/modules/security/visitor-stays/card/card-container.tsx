import React, { Fragment, useRef } from 'react';
import { useQuery } from '@apollo/client/react';
import ReactToPrint from 'react-to-print';
import { PrinterOutlined } from '@ant-design/icons';

import { Button } from 'antd';
import DutyCard from './duty-card';
import StayCard from './stay-card';

import {
  VISITOR_STAY_CARD_BY_ID,
  VISITOR_STAY_CARD_SECURITY_PERSON_BY_ID,
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
  const { data: personData, loading: personLoading } = useQuery(
    VISITOR_STAY_CARD_SECURITY_PERSON_BY_ID,
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
  const securityPersonById = personData?.securityPersonById;
  const visitorStayById = visitorStayData?.visitorStayById;

  if (personLoading || visitorStayLoading) return null;
  if (!securityPersonById || !visitorStayById) return null;

  const visitor = {
    name: securityPersonById.sharedData?.name,
    parentName: securityPersonById.sharedData?.parentName,
    cnicNumber: securityPersonById.sharedData?.cnicNumber,
    referenceName: securityPersonById.sharedData?.referenceName,
    contactNumber1: securityPersonById.sharedData?.contactNumber1,
    image: securityPersonById.sharedData?.image,
    city: securityPersonById.visitorData?.city,
    country: securityPersonById.visitorData?.country,
    criminalRecord: securityPersonById.visitorData?.criminalRecord,
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
