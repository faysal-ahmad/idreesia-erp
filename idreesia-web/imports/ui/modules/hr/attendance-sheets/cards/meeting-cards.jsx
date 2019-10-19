import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Barcode from 'react-barcode';
import moment from 'moment';

import { getDownloadUrl } from '/imports/ui/modules/helpers/misc';

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
  width: '700px',
  padding: '20px',
};

export default class MeetingCards extends Component {
  static propTypes = {
    attendanceByBarcodeIds: PropTypes.array,
  };

  getCardMarkup(attendance) {
    const month = moment(`01-${attendance.month}`, 'DD-MM-YYYY')
      .add(1, 'months')
      .startOf('month');

    const headingImageUrl = '/images/heading.png';
    const karkunImageUrl = getDownloadUrl(attendance.karkun.imageId);

    return (
      <div key={attendance._id} className="card_karkon">
        <div className="heading_card_k">
          <img src={headingImageUrl} />
        </div>
        <div className="date_card_k">{month.format('D MMM YYYY')}</div>
        <div className="pic_card_k">
          <img src={karkunImageUrl} />
        </div>
        <h1 className="name_card_k">{attendance.karkun.name}</h1>
        <p className="k_location">
          {attendance.duty.name} <br />
          {attendance.shift ? attendance.shift.name : ''}
        </p>
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

    const cardContainers = [];
    while (cards.length > 0) {
      const cardsForPage = cards.splice(0, 9);
      cardContainers.push(<div style={ContainerStyle}>{cardsForPage}</div>);
      cardContainers.push(<div className="pagebreak" />);
    }

    return <div>{cardContainers}</div>;
  }
}
