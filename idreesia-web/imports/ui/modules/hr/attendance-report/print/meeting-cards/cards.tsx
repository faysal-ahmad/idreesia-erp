import React, { Component, type CSSProperties } from 'react';
import Barcode from 'react-barcode';
import { addMonths, format, startOfMonth } from 'date-fns';

import { CardTypes } from 'meteor/idreesia-common/constants/hr';
import { parseDate } from 'meteor/idreesia-common/utilities/date-fns';

import type { CardKarkun } from '../use-sheet-rows';

const MeetingCardTypes = {
  ...CardTypes,
  RABI_UL_AWAL_LANGAR: 'rabi-ul-awal-langar',
  SPECIAL_SECURITY: 'special-security',
  ENTRY_GATE: 'entry-gate',
  HALL_SECURITY: 'hall-security',
  INTERCOM_DUTY: 'intercom-duty',
} as const;

interface CardsProps {
  cardType?: string;
  // Attendance month, 'MM-YYYY'. The meeting is on the 1st of the next month.
  month?: string;
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

const MonthTranslations: Record<string, string> = {
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

const HeadingMapping: Record<string, boolean> = {
  [MeetingCardTypes.NAAM_I_MUBARIK_MEETING]: true,
  [MeetingCardTypes.RABI_UL_AWAL_LANGAR]: true,
  [MeetingCardTypes.SPECIAL_SECURITY]: false,
  [MeetingCardTypes.ENTRY_GATE]: false,
  [MeetingCardTypes.HALL_SECURITY]: false,
  [MeetingCardTypes.INTERCOM_DUTY]: false,
};

export default class Cards extends Component<CardsProps> {
  getHeadingImage = () => {
    const { cardType = '' } = this.props;
    const headingImageUrl = '/images/heading.png';
    const headingImage = HeadingMapping[cardType] ? (
      <div className="heading_card_k">
        <img src={headingImageUrl} alt="heading" />
      </div>
    ) : null;

    return headingImage;
  };

  getSubHeading = () => {
    const { cardType = '', month: attendanceMonth } = this.props;
    let subHeading = '';
    let className = 'subheading_card_k';

    const month = startOfMonth(
      addMonths(parseDate(`01-${attendanceMonth}`, 'DD-MM-YYYY'), 1)
    );

    if (cardType === MeetingCardTypes.NAAM_I_MUBARIK_MEETING) {
      subHeading = ` نام مبارک میٹنگ - یکم ${
        MonthTranslations[format(month, 'MMM')]
      }`;
    } else if (cardType === MeetingCardTypes.RABI_UL_AWAL_LANGAR) {
      subHeading = '١٢ ربیع الاول - لنگر شریف تقسیم';
    } else if (cardType === MeetingCardTypes.SPECIAL_SECURITY) {
      subHeading = 'اسپیشل سیکورٹی';
      className = 'subheading_card_extended_k';
    } else if (cardType === MeetingCardTypes.ENTRY_GATE) {
      subHeading = 'اینٹری گیٹ';
      className = 'subheading_card_extended_k';
    } else if (cardType === MeetingCardTypes.HALL_SECURITY) {
      subHeading = 'ہال سیکورٹی';
      className = 'subheading_card_extended_k';
    } else if (cardType === MeetingCardTypes.INTERCOM_DUTY) {
      subHeading = 'انٹرکام ڈیوٹی';
      className = 'subheading_card_extended_k';
    }

    return <div className={className}>{subHeading}</div>;
  };

  getKarkunImage = (karkun: CardKarkun) => {
    const { cardType = '' } = this.props;

    const percentageClass =
      karkun.percentage > 0 ? 'info_box' : 'info_box hidden';
    const bloodGroupClass = karkun.bloodGroup
      ? 'info_box'
      : 'info_box hidden';

    const karkunImage = karkun.imageData ? (
      <img
        src={`data:image/jpeg;base64,${karkun.imageData}`}
        style={{ maxHeight: '100%', width: 'auto' }}
        alt={karkun.name}
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
          <div className={percentageClass}>{karkun.percentage}%</div>
          <div className={bloodGroupClass}>{karkun.bloodGroup}</div>
        </div>
      </div>
    );
  };

  getDutyShiftInfo = (karkun: CardKarkun) => {
    const { cardType = '' } = this.props;
    const dutyShiftNode = HeadingMapping[cardType] ? (
      <p className="duty_shift_job">
        {karkun.dutyName}
        <br />
        {karkun.shiftNames}
      </p>
    ) : null;

    return dutyShiftNode;
  };

  getCardMarkup(karkun: CardKarkun) {
    if (!karkun.name || !karkun.barcodeId) return null;
    const headingImage = this.getHeadingImage();
    const subHeading = this.getSubHeading();
    const karkunImage = this.getKarkunImage(karkun);
    const dutyShiftInfo = this.getDutyShiftInfo(karkun);

    return (
      <div key={karkun.karkunId} className="card_karkon">
        {headingImage}
        {subHeading}
        {karkunImage}
        <h1 className="name_card_k">{karkun.name}</h1>
        {dutyShiftInfo}
        <div className="barcode_card_k">
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
      const cardsForPage = cardsCopy.splice(0, 12);
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
