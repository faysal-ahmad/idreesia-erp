import React, { Component, type CSSProperties } from 'react';
import Barcode from 'react-barcode';

import type { AttendanceByBarcodeIdsQuery } from 'meteor/idreesia-common/types/client-operations';

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

export default class Cards extends Component<CardsProps> {
  getKarkunImage = (attendance: AttendanceRecord) => {
    const karkun = attendance.karkun;
    if (!karkun) {
      return (
        <div className="mehfil_card_picture">
          <div style={{ height: '100%', width: 'auto' }} />
        </div>
      );
    }

    const karkunImage = karkun.image ? (
      <img
        src={`data:image/jpeg;base64,${karkun.image.data}`}
        style={{ maxHeight: '100%', width: 'auto' }}
        alt={karkun.name ?? undefined}
      />
    ) : (
      <div style={{ height: '100%', width: 'auto' }} />
    );

    return <div className="mehfil_card_picture">{karkunImage}</div>;
  };

  getDutyShiftInfo = (attendance: AttendanceRecord) => {
    const { showDutyInfo } = this.props;
    if (!showDutyInfo) return null;

    return (
      <p className="mehfil_card_duty_shift_job">
        {attendance.duty ? attendance.duty.name : ''}
        {attendance.job ? attendance.job.name : ''}
        <br />
        {attendance.shift ? attendance.shift.name : ''}
      </p>
    );
  };

  getCardMarkup(attendance: AttendanceRecord) {
    const { cardHeading, cardSubHeading, showDutyInfo } = this.props;
    const karkun = attendance.karkun;
    if (!karkun?.name || !attendance.meetingCardBarcodeId) return null;

    const karkunImage = this.getKarkunImage(attendance);
    const dutyShiftInfo = this.getDutyShiftInfo(attendance);

    let cardHeight = 325;
    if (showDutyInfo) cardHeight += 30;

    return (
      <div
        key={attendance._id ?? attendance.meetingCardBarcodeId}
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
