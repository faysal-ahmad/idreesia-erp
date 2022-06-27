import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Barcode from 'react-barcode';
import moment from 'moment';
import { UserOutlined } from '@ant-design/icons';

import { Avatar } from 'antd';

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

const ImageContainerStyle = {
  display: 'flex',
  flexFlow: 'row wrap',
  justifyContent: 'center',
  alignItems: 'center',
  width: 'auto',
  height: '100%',
};

export const Card = ({ dutyName }) => {
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
        <Barcode value={moment().format('DDMMYYYY')} {...barcodeOptions} />
      </div>
    </div>
  );
};

Card.propTypes = {
  dutyName: PropTypes.string,
};

// eslint-disable-next-line react/prefer-stateless-function
export default class Cards extends Component {
  static propTypes = {
    mehfilDuty: PropTypes.object,
    showDutyNameInUrdu: PropTypes.bool,
  };

  render() {
    const { mehfilDuty, showDutyNameInUrdu } = this.props;
    const dutyName = showDutyNameInUrdu ? mehfilDuty.urduName : mehfilDuty.name;

    const cards = [];
    for (let i = 0; i < 9; i++) {
      cards.push(<Card key={i.toString()} dutyName={dutyName} />);
    }

    return <div style={ContainerStyle}>{cards}</div>;
  }
}
