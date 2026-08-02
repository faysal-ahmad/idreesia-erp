import React, { Component, type CSSProperties } from 'react';
import Barcode from 'react-barcode';
import type {
  MehfilKarkunByBarcodeIdQuery,
  MehfilKarkunsByIdsQuery,
} from 'meteor/idreesia-common/types/client-operations';

const BarcodeControl = Barcode as any;

type MehfilKarkunByIds = NonNullable<
  NonNullable<MehfilKarkunsByIdsQuery['mehfilKarkunsByIds']>[number]
>;

type MehfilKarkunByBarcode = NonNullable<
  MehfilKarkunByBarcodeIdQuery['mehfilKarkunByBarcodeId']
>;

export type MehfilKarkunCardRecord = MehfilKarkunByIds | MehfilKarkunByBarcode;

interface CardProps {
  mehfilKarkun: MehfilKarkunCardRecord;
  showDutyNameInUrdu?: boolean;
}

interface NamedCardsProps {
  mehfilKarkunsByIds?: MehfilKarkunByIds[];
  showDutyNameInUrdu?: boolean;
}

const barcodeOptions = {
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

export const Card = ({ mehfilKarkun, showDutyNameInUrdu }: CardProps) => {
  const mehfilDuty = 'duty' in mehfilKarkun ? mehfilKarkun.duty : null;
  let cardHeading = '';
  if (mehfilDuty) {
    cardHeading = (showDutyNameInUrdu ? mehfilDuty.urduName : mehfilDuty.name) ?? '';
  }

  const karkunImage = mehfilKarkun.karkun?.sharedData?.image ? (
    <img
      src={`data:image/jpeg;base64,${mehfilKarkun.karkun.sharedData.image.data}`}
      style={{ maxHeight: '100%', width: 'auto' }}
      alt={mehfilKarkun.karkun.sharedData.name ?? 'Karkun'}
    />
  ) : (
    <div style={{ height: '100%', width: 'auto' }} />
  );

  return (
    <div key={mehfilKarkun._id ?? undefined} className="mehfil_card">
      <div className="mehfil_card_heading">
        {cardHeading}
      </div>
      {mehfilKarkun.dutyDetail ? (
        <div className="mehfil_card_subheading">{mehfilKarkun.dutyDetail}</div>
      ) : null}
      <div className="mehfil_card_picture">{karkunImage}</div>
      <h1 className="mehfil_card_name">{mehfilKarkun.karkun?.sharedData?.name}</h1>
      <div className="mehfil_card_barcode">
        <BarcodeControl
          value={mehfilKarkun.dutyCardBarcodeId ?? mehfilKarkun._id ?? ''}
          {...barcodeOptions}
        />
      </div>
    </div>
  );
};

export class NamedCards extends Component<NamedCardsProps> {
  render() {
    const { mehfilKarkunsByIds, showDutyNameInUrdu } = this.props;
    if (!mehfilKarkunsByIds) return null;

    const cards = mehfilKarkunsByIds.map((mehfilKarkun, index) => (
      <Card key={index} mehfilKarkun={mehfilKarkun} showDutyNameInUrdu={showDutyNameInUrdu} />
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
  }
}
