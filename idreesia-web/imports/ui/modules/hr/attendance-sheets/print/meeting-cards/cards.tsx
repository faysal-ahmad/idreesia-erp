import React, { Component, type CSSProperties } from 'react';
import Barcode from 'react-barcode';
import { addMonths, format, startOfMonth } from 'date-fns';

import { CardTypes } from 'meteor/idreesia-common/constants/hr';
import type { AttendanceByBarcodeIdsQuery } from 'meteor/idreesia-common/types/client-operations';
import { parseDate } from 'meteor/idreesia-common/utilities/date-fns';

const MeetingCardTypes = {
  ...CardTypes,
  RABI_UL_AWAL_LANGAR: 'rabi-ul-awal-langar',
  SPECIAL_SECURITY: 'special-security',
  ENTRY_GATE: 'entry-gate',
  HALL_SECURITY: 'hall-security',
  INTERCOM_DUTY: 'intercom-duty',
} as const;

type AttendanceRecord = NonNullable<
  NonNullable<AttendanceByBarcodeIdsQuery['attendanceByBarcodeIds']>[number]
>;

interface CardsProps {
  cardType?: string;
  cardHeading?: string;
  cardSubHeading?: string | null;
  showDutyInfo?: boolean;
  attendanceByBarcodeIds?: AttendanceRecord[];
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

  getSubHeading = (attendance: AttendanceRecord) => {
    const { cardType = '' } = this.props;
    let subHeading = '';
    let className = 'subheading_card_k';

    const month = startOfMonth(
      addMonths(parseDate(`01-${attendance.month}`, 'DD-MM-YYYY'), 1)
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

  getKarkunImage = (attendance: AttendanceRecord) => {
    const { cardType = '' } = this.props;
    const karkun = attendance.karkun;
    if (!karkun) return null;
    const sharedData = karkun.sharedData ?? ({} as NonNullable<typeof karkun.sharedData>);

    const percentageClass =
      (attendance.percentage ?? 0) > 0 ? 'info_box' : 'info_box hidden';
    const bloodGroupClass = sharedData.bloodGroup
      ? 'info_box'
      : 'info_box hidden';

    const karkunImage = sharedData.image ? (
      <img
        src={`data:image/jpeg;base64,${sharedData.image.data}`}
        style={{ maxHeight: '100%', width: 'auto' }}
        alt={sharedData.name ?? undefined}
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
          <div className={bloodGroupClass}>{sharedData.bloodGroup}</div>
        </div>
      </div>
    );
  };

  getDutyShiftInfo = (attendance: AttendanceRecord) => {
    const { cardType = '' } = this.props;
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

  getCardMarkup(attendance: AttendanceRecord) {
    if (!attendance.karkun?.sharedData?.name || !attendance.meetingCardBarcodeId) return null;
    const headingImage = this.getHeadingImage();
    const subHeading = this.getSubHeading(attendance);
    const karkunImage = this.getKarkunImage(attendance);
    const dutyShiftInfo = this.getDutyShiftInfo(attendance);

    return (
      <div key={attendance._id ?? attendance.meetingCardBarcodeId} className="card_karkon">
        {headingImage}
        {subHeading}
        {karkunImage}
        <h1 className="name_card_k">{attendance.karkun.sharedData.name}</h1>
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
    const cards = (attendanceByBarcodeIds ?? [])
      .map((attendance: AttendanceRecord) => this.getCardMarkup(attendance))
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
