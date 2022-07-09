import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Barcode from 'react-barcode';

const barcodeOptions = {
  width: 1,
  height: 20,
  format: 'CODE128B',
  displayValue: false,
  background: '#ffffff',
  lineColor: '#000000',
  margin: 5,
};

const ContainerStyle = {
  display: 'flex',
  flexFlow: 'row wrap',
  justifyContent: 'center',
  width: '800px',
  padding: '20px',
};

export const Card = ({ mehfilKarkun, showDutyNameInUrdu }) => {
  const mehfilDuty = mehfilKarkun.duty;
  let cardHeading = '';
  if (mehfilDuty) {
    cardHeading = showDutyNameInUrdu ? mehfilDuty.urduName : mehfilDuty.name;
  }

  const karkunImage = mehfilKarkun.karkun.sharedData.image ? (
    <img
      src={`data:image/jpeg;base64,${mehfilKarkun.karkun.sharedData.image.data}`}
      style={{ maxHeight: '100%', width: 'auto' }}
    />
  ) : (
    <div style={{ height: '100%', width: 'auto' }} />
  );

  return (
    <div key={mehfilKarkun._id} className="mehfil_card">
      <div className="mehfil_card_heading">
        {cardHeading}
      </div>
      {mehfilKarkun.dutyDetail ? (
        <div className="mehfil_card_subheading">{mehfilKarkun.dutyDetail}</div>
      ) : null}
      <div className="mehfil_card_picture">{karkunImage}</div>
      <h1 className="mehfil_card_name">{mehfilKarkun.karkun.sharedData.name}</h1>
      <div className="mehfil_card_barcode">
        <Barcode value={mehfilKarkun.dutyCardBarcodeId} {...barcodeOptions} />
      </div>
    </div>
  );
};

Card.propTypes = {
  mehfilKarkun: PropTypes.object,
  showDutyNameInUrdu: PropTypes.bool,
};

// eslint-disable-next-line react/prefer-stateless-function
export class NamedCards extends Component {
  static propTypes = {
    mehfilKarkunsByIds: PropTypes.array,
    showDutyNameInUrdu: PropTypes.bool,
  };

  render() {
    const { mehfilKarkunsByIds, showDutyNameInUrdu } = this.props;
    if (!mehfilKarkunsByIds) return null;

    const cards = mehfilKarkunsByIds.map((mehfilKarkun, index) => (
      <Card key={index} mehfilKarkun={mehfilKarkun} showDutyNameInUrdu={showDutyNameInUrdu} />
    ));

    let index = 0;
    const cardContainers = [];
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
