import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Barcode from 'react-barcode';
import { find } from 'lodash';

import { MehfilDuties } from 'meteor/idreesia-common/constants/security';

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

export default class Cards extends Component {
  static propTypes = {
    loading: PropTypes.bool,
    cardSubHeading: PropTypes.string,
    mehfilKarkunsByIds: PropTypes.array,
  };

  getKarkunImage = mehfilKarkun => {
    const karkunImage = mehfilKarkun.karkun.image ? (
      <img
        src={`data:image/jpeg;base64,${mehfilKarkun.karkun.image.data}`}
        style={{ maxHeight: '100%', width: 'auto' }}
      />
    ) : (
      <div style={{ height: '100%', width: 'auto' }} />
    );

    return <div className="mehfil_card_picture">{karkunImage}</div>;
  };

  getCardMarkup(mehfilKarkun) {
    const { cardSubHeading } = this.props;
    const karkunImage = this.getKarkunImage(mehfilKarkun);
    const mehfilDuty = find(MehfilDuties, { _id: mehfilKarkun.dutyName });

    return (
      <div key={mehfilKarkun._id} className="mehfil_card">
        <div className="mehfil_card_heading">
          {mehfilDuty ? mehfilDuty.urduName : ''}
        </div>
        {cardSubHeading ? (
          <div className="mehfil_card_subheading">{cardSubHeading}</div>
        ) : null}
        {karkunImage}
        <h1 className="mehfil_card_name">{mehfilKarkun.karkun.name}</h1>
        <div className="mehfil_card_barcode">
          <Barcode value={mehfilKarkun.dutyCardBarcodeId} {...barcodeOptions} />
        </div>
      </div>
    );
  }

  render() {
    const { mehfilKarkunsByIds } = this.props;
    if (!mehfilKarkunsByIds) return null;

    const cards = mehfilKarkunsByIds.map(mehfilKarkun =>
      this.getCardMarkup(mehfilKarkun)
    );

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
