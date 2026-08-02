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
  getCardMarkup(attendance: AttendanceRecord) {
    const { cardHeading, cardSubHeading, showDutyInfo } = this.props;
    const karkun = attendance.karkun;
    if (!karkun?.name || !attendance.meetingCardBarcodeId) return null;

    const subscribed =
      karkun.contactNumber1Subscribed ||
      karkun.contactNumber2Subscribed;
    const percentageClass =
      (attendance.percentage ?? 0) > 0 ? 'info_box' : 'info_box hidden';
    const subscriptionClass = subscribed ? 'info_box hidden' : 'info_box';
    const bloodGroupClass = karkun.bloodGroup
      ? 'info_box'
      : 'info_box hidden';

    const karkunImage = karkun.image ? (
      <img
        src={`data:image/jpeg;base64,${karkun.image.data}`}
        style={{ maxHeight: '100%', width: 'auto' }}
        alt={karkun.name ?? undefined}
      />
    ) : (
      <div style={{ height: '100%', width: 'auto' }} />
    );

    const dutyShiftInfo = showDutyInfo ? (
      <p className="duty_shift_job">
        {attendance.duty ? attendance.duty.name : ''}
        {attendance.job ? attendance.job.name : ''}
        <br />
        {attendance.shift ? attendance.shift.name : ''}
      </p>
    ) : null;

    return (
      <div key={attendance._id ?? attendance.meetingCardBarcodeId} className="card_karkon">
        <div className="heading_card_k">
          <h1>{cardHeading}</h1>
        </div>
        {cardSubHeading ? (
          <div className="subheading_card_k">{cardSubHeading}</div>
        ) : null}
        <div className="pic_card_k">
          {karkunImage}
          <div className="info_container">
            <div className={percentageClass}>{attendance.percentage}%</div>
            <div className={bloodGroupClass}>{karkun.bloodGroup}</div>
            <div className={subscriptionClass}>NS</div>
          </div>
        </div>
        <h1 className="name_card_k">{karkun.name}</h1>
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
