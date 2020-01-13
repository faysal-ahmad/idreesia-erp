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

export default class Cards extends Component {
  static propTypes = {
    cardHeading: PropTypes.string,
    cardSubHeading: PropTypes.string,
    attendanceByBarcodeIds: PropTypes.array,
  };

  getKarkunImage = attendance => {
    const karkunImage = attendance.karkun.image ? (
      <img
        src={`data:image/jpeg;base64,${attendance.karkun.image.data}`}
        style={{ maxHeight: '100%', width: 'auto' }}
      />
    ) : (
      <div style={{ height: '100%', width: 'auto' }} />
    );

    return <div className="mehfil_card_picture">{karkunImage}</div>;
  };

  getCardMarkup(attendance) {
    const { cardHeading, cardSubHeading } = this.props;
    const karkunImage = this.getKarkunImage(attendance);

    return (
      <div key={attendance._id} className="mehfil_card">
        <div className="mehfil_card_heading">{cardHeading}</div>
        {cardSubHeading ? (
          <div className="mehfil_card_subheading">{cardSubHeading}</div>
        ) : null}
        {karkunImage}
        <h1 className="mehfil_card_name">{attendance.karkun.name}</h1>
        <div className="barcode_card_k">
          <Barcode
            value={attendance.meetingCardBarcodeId}
            {...barcodeOptions}
          />
        </div>
      </div>
    );
  }

  render() {
    const { attendanceByBarcodeIds } = this.props;
    const cards = attendanceByBarcodeIds.map(attendance =>
      this.getCardMarkup(attendance)
    );

    let index = 0;
    const cardContainers = [];
    while (cards.length > 0) {
      const cardsForPage = cards.splice(0, 12);
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
