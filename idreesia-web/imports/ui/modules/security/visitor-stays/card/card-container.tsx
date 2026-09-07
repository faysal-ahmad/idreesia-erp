import React, { Fragment, useRef } from 'react';
import ReactToPrint from 'react-to-print';
import { PrinterOutlined } from '@ant-design/icons';

import { Button } from 'antd';
import DutyCard from './duty-card';
import StayCard from './stay-card';

export interface CardVisitor {
  name?: string | null;
  parentName?: string | null;
  cnicNumber?: string | null;
  referenceName?: string | null;
  contactNumber1?: string | null;
  city?: string | null;
  country?: string | null;
  criminalRecord?: string | null;
  imageId?: string | null;
}

export interface CardVisitorStay {
  _id?: string | null;
  fromDate?: string | null;
  toDate?: string | null;
  stayReason?: string | null;
  stayAllowedBy?: string | null;
  dutyName?: string | null;
  shiftName?: string | null;
}

interface StayCardContainerProps {
  cardType: string;
  visitor: CardVisitor;
  visitorStay: CardVisitorStay;
  onCloseCard(): void;
}

const StayCardContainer = ({
  cardType,
  visitor,
  visitorStay,
  onCloseCard,
}: StayCardContainerProps) => {
  const cardRef = useRef<HTMLDivElement | null>(null);

  const card =
    cardType === 'stay-card' ? (
      <StayCard visitor={visitor} visitorStay={visitorStay} />
    ) : (
      <DutyCard visitor={visitor} visitorStay={visitorStay} />
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
