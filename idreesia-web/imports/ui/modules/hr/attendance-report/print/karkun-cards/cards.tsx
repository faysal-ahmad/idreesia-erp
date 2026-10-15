import React, { Component, type CSSProperties } from 'react';
import Barcode from 'react-barcode';

import type { CardKarkun } from '../use-sheet-rows';

interface CardsProps {
  cardHeading?: string;
  cardSubHeading?: string | null;
  showDutyInfo?: boolean;
  karkuns?: CardKarkun[];
}

const barcodeOptions = {
  width: 1,
  height: 20,
  format: 'CODE128B' as const,
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

export default class Cards extends Component<CardsProps> {
  getKarkunImage = (karkun: CardKarkun) => {
    const karkunImage = karkun.imageData ? (
      <img
        src={`data:image/jpeg;base64,${karkun.imageData}`}
        style={{ maxHeight: '100%', width: 'auto' }}
        alt={karkun.name}
      />
    ) : (
      <div style={{ height: '100%', width: 'auto' }} />
    );

    return <div className="mehfil_card_picture">{karkunImage}</div>;
  };

  getDutyShiftInfo = (karkun: CardKarkun) => {
    const { showDutyInfo } = this.props;
    if (!showDutyInfo) return null;

    return (
      <p className="mehfil_card_duty_shift_job">
        {karkun.dutyName}
        <br />
        {karkun.shiftNames}
      </p>
    );
  };

  getCardMarkup(karkun: CardKarkun) {
    const { cardHeading, cardSubHeading, showDutyInfo } = this.props;
    if (!karkun.name || !karkun.barcodeId) return null;

    const karkunImage = this.getKarkunImage(karkun);
    const dutyShiftInfo = this.getDutyShiftInfo(karkun);

    let cardHeight = 325;
    if (showDutyInfo) cardHeight += 30;

    return (
      <div
        key={karkun.karkunId}
        className="mehfil_card"
        style={{ height: cardHeight }}
      >
        <div className="mehfil_card_heading">{cardHeading}</div>
        {cardSubHeading ? (
          <div className="mehfil_card_subheading">{cardSubHeading}</div>
        ) : null}
        {karkunImage}
        <h1 className="mehfil_card_name">{karkun.name}</h1>
        {dutyShiftInfo}
        <div className="mehfil_card_barcode">
          <Barcode
            value={karkun.barcodeId}
            {...barcodeOptions}
          />
        </div>
      </div>
    );
  }

  render() {
    const { karkuns } = this.props;
    const cards = (karkuns ?? [])
      .map(karkun => this.getCardMarkup(karkun))
      .filter(Boolean);

    let index = 0;
    const cardContainers = [];
    const cardsCopy = [...cards];
    while (cardsCopy.length > 0) {
      const cardsForPage = cardsCopy.splice(0, 9);
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
