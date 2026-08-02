import React, { Component, type CSSProperties } from 'react';
import Barcode from 'react-barcode';
import { formatDate } from 'meteor/idreesia-common/utilities/date-fns';
import { UserOutlined } from '@ant-design/icons';

import { Avatar } from 'antd';
import type { SecurityMehfilDuty } from '/imports/ui/modules/security/common/hooks';

const BarcodeControl = Barcode as any;

interface CardProps {
  dutyName?: string;
}

interface AnonymousCardsProps {
  mehfilDuty?: SecurityMehfilDuty | null;
  showDutyNameInUrdu?: boolean;
}

const barcodeOptions = {
  width: 1,
  height: 20,
  format: 'CODE128B',
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

const ImageContainerStyle: CSSProperties = {
  display: 'flex',
  flexFlow: 'row wrap',
  justifyContent: 'center',
  alignItems: 'center',
  width: 'auto',
  height: '100%',
};

export const Card = ({ dutyName }: CardProps) => {
  const karkunImage = (
    <div style={ImageContainerStyle}>
      <Avatar size={128} icon={<UserOutlined />} />
    </div>
  );

  return (
    <div className="mehfil_card">
      <div className="mehfil_card_heading">
        {dutyName}
      </div>
      <div className="mehfil_card_picture">{karkunImage}</div>
      <h1 className="mehfil_card_name">381 Karkun</h1>
      <div className="mehfil_card_barcode">
        <BarcodeControl value={formatDate(new Date(), 'DDMMYYYY')} {...barcodeOptions} />
      </div>
    </div>
  );
};

export class AnonymousCards extends Component<AnonymousCardsProps> {
  render() {
    const { mehfilDuty, showDutyNameInUrdu } = this.props;
    const dutyName = showDutyNameInUrdu ? mehfilDuty?.urduName : mehfilDuty?.name;

    const cards: React.ReactNode[] = [];
    for (let i = 0; i < 9; i++) {
      cards.push(<Card key={i.toString()} dutyName={dutyName ?? undefined} />);
    }

    return <div style={ContainerStyle}>{cards}</div>;
  }
}
