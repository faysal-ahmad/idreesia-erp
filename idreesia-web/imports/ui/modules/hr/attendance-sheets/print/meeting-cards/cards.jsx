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

const HeadingMapping = {
  [CardTypes.NAAM_I_MUBARIK_MEETING]: true,
  [CardTypes.RABI_UL_AWAL_LANGAR]: true,
  [CardTypes.SPECIAL_SECURITY]: false,
  [CardTypes.ENTRY_GATE]: false,
  [CardTypes.HALL_SECURITY]: false,
  [CardTypes.INTERCOM_DUTY]: false,
};

export default class Cards extends Component {
  static propTypes = {
    cardType: PropTypes.string,
    attendanceByBarcodeIds: PropTypes.array,
  };

  getHeadingImage = () => {
    const { cardType } = this.props;
    const headingImageUrl = '/images/heading.png';
    const headingImage = HeadingMapping[cardType] ? (
      <div className="heading_card_k">
        <img src={headingImageUrl} />
      </div>
    ) : null;

    return headingImage;
  };

  getSubHeading = attendance => {
    const { cardType } = this.props;
    let subHeading = '';
    let className = 'subheading_card_k';

    const month = moment(`01-${attendance.month}`, 'DD-MM-YYYY')
      .add(1, 'months')
      .startOf('month');

    if (cardType === CardTypes.NAAM_I_MUBARIK_MEETING) {
      subHeading = ` نام مبارک میٹنگ - یکم ${
        MonthTranslations[month.format('MMM')]
      }`;
    } else if (cardType === CardTypes.RABI_UL_AWAL_LANGAR) {
      subHeading = '١٢ ربیع الاول - لنگر شریف تقسیم';
    } else if (cardType === CardTypes.SPECIAL_SECURITY) {
      subHeading = 'اسپیشل سیکورٹی';
      className = 'subheading_card_extended_k';
    } else if (cardType === CardTypes.ENTRY_GATE) {
      subHeading = 'اینٹری گیٹ';
      className = 'subheading_card_extended_k';
    } else if (cardType === CardTypes.HALL_SECURITY) {
      subHeading = 'ہال سیکورٹی';
      className = 'subheading_card_extended_k';
    } else if (cardType === CardTypes.INTERCOM_DUTY) {
      subHeading = 'انٹرکام ڈیوٹی';
      className = 'subheading_card_extended_k';
    }

    return <div className={className}>{subHeading}</div>;
  };

  getKarkunImage = attendance => {
    const { cardType } = this.props;
    const subscribed =
      attendance.karkun.contactNumber1Subscribed ||
      attendance.karkun.contactNumber2Subscribed;
    const percentageClass =
      attendance.percentage > 0 ? 'info_box' : 'info_box hidden';
    const subscriptionClass = subscribed ? 'info_box hidden' : 'info_box';
    const bloodGroupClass = attendance.karkun.bloodGroup
      ? 'info_box'
      : 'info_box hidden';

    const karkunImage = attendance.karkun.image ? (
      <img
        src={`data:image/jpeg;base64,${attendance.karkun.image.data}`}
        style={{ maxHeight: '100%', width: 'auto' }}
      />
    ) : (
      <div style={{ height: '100%', width: 'auto' }} />
    );
    const className = HeadingMapping[cardType]
      ? 'pic_card_k'
      : 'pic_card_extended_k';

    return (
      <div className={className}>
        {karkunImage}
        <div className="info_container">
          <div className={percentageClass}>{attendance.percentage}%</div>
          <div className={bloodGroupClass}>{attendance.karkun.bloodGroup}</div>
          <div className={subscriptionClass}>NS</div>
        </div>
      </div>
    );
  };

  getDutyShiftInfo = attendance => {
    const { cardType } = this.props;
    const dutyShiftNode = HeadingMapping[cardType] ? (
      <p className="duty_shift_job">
        {attendance.duty ? attendance.duty.name : ''}
        {attendance.job ? attendance.job.name : ''}
        <br />
        {attendance.shift ? attendance.shift.name : ''}
      </p>
    ) : null;

    return dutyShiftNode;
  };

  getCardMarkup(attendance) {
    const headingImage = this.getHeadingImage();
    const subHeading = this.getSubHeading(attendance);
    const karkunImage = this.getKarkunImage(attendance);
    const dutyShiftInfo = this.getDutyShiftInfo(attendance);

    return (
      <div key={attendance._id} className="card_karkon">
        {headingImage}
        {subHeading}
        {karkunImage}
        <h1 className="name_card_k">{attendance.karkun.name}</h1>
        {dutyShiftInfo}
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
