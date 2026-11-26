import React, { type CSSProperties } from 'react';
import Barcode, { type Options as BarcodeOptions } from 'react-barcode';
import type {
  SecurityEventKarkunByBarcodeIdQuery,
  SecurityEventKarkunsByIdsQuery,
} from 'meteor/idreesia-common/types/client-operations';

type SecurityEventKarkunByIds = NonNullable<
  NonNullable<SecurityEventKarkunsByIdsQuery['securityEventKarkunsByIds']>[number]
>;

type SecurityEventKarkunByBarcode = NonNullable<
  SecurityEventKarkunByBarcodeIdQuery['securityEventKarkunByBarcodeId']
>;

export type EventKarkunCardRecord = SecurityEventKarkunByIds | SecurityEventKarkunByBarcode;

interface CardProps {
  eventKarkun: EventKarkunCardRecord;
  showDutyNameInUrdu?: boolean;
}

interface NamedCardsProps {
  securityEventKarkunsByIds?: SecurityEventKarkunByIds[];
  showDutyNameInUrdu?: boolean;
}

const barcodeOptions: BarcodeOptions = {
  width: 1,
  height: 20,
  format: 'CODE128B',
  displayValue: false,
  background: '#ffffff',
  lineColor: '#000000',
  margin: 5,
};

const ContainerStyle: CSSProperties = {
  display: 'flex',
  flexFlow: 'row wrap',
  justifyContent: 'center',
  width: '800px',
  padding: '20px',
};

export const Card = ({ eventKarkun, showDutyNameInUrdu }: CardProps) => {
  const eventDuty = 'duty' in eventKarkun ? eventKarkun.duty : null;
  let cardHeading = '';
  if (eventDuty) {
    cardHeading = (showDutyNameInUrdu ? eventDuty.urduName : eventDuty.name) ?? '';
  }

  const karkunImage = eventKarkun.karkun?.sharedData?.imageUrl ? (
    <img
      src={eventKarkun.karkun.sharedData.imageUrl}
      style={{ maxHeight: '100%', width: 'auto' }}
      alt={eventKarkun.karkun.sharedData.name ?? 'Karkun'}
    />
  ) : (
    <div style={{ height: '100%', width: 'auto' }} />
  );

  return (
    <div key={eventKarkun._id ?? undefined} className="mehfil_card">
      <div className="mehfil_card_heading">
        {cardHeading}
      </div>
      {eventKarkun.dutyDetail ? (
        <div className="mehfil_card_subheading">{eventKarkun.dutyDetail}</div>
      ) : null}
      <div className="mehfil_card_picture">{karkunImage}</div>
      <h1 className="mehfil_card_name">{eventKarkun.karkun?.sharedData?.name}</h1>
      <div className="mehfil_card_barcode">
        <Barcode
          value={eventKarkun.dutyCardBarcodeId ?? eventKarkun._id ?? ''}
          {...barcodeOptions}
        />
      </div>
    </div>
  );
};

export const NamedCards = ({
  securityEventKarkunsByIds,
  showDutyNameInUrdu,
}: NamedCardsProps) => {
  if (!securityEventKarkunsByIds) return null;

  const cards = securityEventKarkunsByIds.map((eventKarkun, index) => (
    <Card key={index} eventKarkun={eventKarkun} showDutyNameInUrdu={showDutyNameInUrdu} />
  ));

  let index = 0;
  const cardContainers: React.ReactNode[] = [];
  while (cards.length > 0) {
    const cardsForPage = cards.splice(0, 9);
    cardContainers.push(
      <div key={`container_${index}`} style={ContainerStyle}>
        {cardsForPage}
      </div>
    );
    cardContainers.push(
      <div key={`pagebreak_${index}`} className="pagebreak" />
    );
    index++;
  }

  return <div>{cardContainers}</div>;
};
