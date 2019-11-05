import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Barcode from 'react-barcode';
import moment from 'moment';

import { CardTypes } from 'meteor/idreesia-common/constants/hr';

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

const MonthTranslations = {
  Jan: 'جنوری',
  Feb: 'فروری',
  Mar: 'مارچ',
  Apr: 'اپریل',
  May: 'مئی',
  Jun: 'جون',
  Jul: 'جولائی',
  Aug: 'اگست',
  Sep: 'ستمبر',
  Oct: 'اکتوبر',
  Nov: 'نومبر',
  Dec: 'دسمبر',
};

export default class MeetingCards extends Component {
  static propTypes = {
    cardType: PropTypes.string,
    attendanceByBarcodeIds: PropTypes.array,
  };

  getSubHeading = attendance => {
    const { cardType } = this.props;
    let subHeading = '';
    const month = moment(`01-${attendance.month}`, 'DD-MM-YYYY')
      .add(1, 'months')
      .startOf('month');

    if (cardType === CardTypes.NAAM_I_MUBARIK_MEETING) {
      subHeading = ` نام مبارک میٹنگ - یکم ${
        MonthTranslations[month.format('MMM')]
      }`;
    } else if (cardType === CardTypes.RABI_UL_AWAL_LANGAR) {
      subHeading = `١٢ربیع الاول - لنگر شریف تقسیم`;
    }

    return subHeading;
  };

  getCardMarkup(attendance) {
    const headingImageUrl = '/images/heading.png';
    const subHeading = this.getSubHeading(attendance);
    const karkunImage = attendance.karkun.image ? (
      <img src={`data:image/jpeg;base64,${attendance.karkun.image.data}`} />
    ) : null;

    return (
      <div key={attendance._id} className="card_karkon">
        <div className="heading_card_k">
          <img src={headingImageUrl} />
        </div>
        <div className="subheading_card_k">{subHeading}</div>
        <div className="pic_card_k">{karkunImage}</div>
        <h1 className="name_card_k">{attendance.karkun.name}</h1>
        <p className="duty_shift_job">
          {attendance.duty ? attendance.duty.name : ''}
          {attendance.job ? attendance.job.name : ''}
          <br />
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
