import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Barcode from 'react-barcode';
import { find } from 'lodash';
import moment from 'moment';
import { Avatar } from '/imports/ui/controls';

import { MehfilDuties } from 'meteor/idreesia-common/constants/security';

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
  const mehfilDuty = find(MehfilDuties, { _id: dutyName });

  const karkunImage = (
    <div style={ImageContainerStyle}>
      <Avatar size={128} icon="user" />
    </div>
  );

  return (
    <div className="mehfil_card">
      <div className="mehfil_card_heading">
        {mehfilDuty ? mehfilDuty.urduName : ''}
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
    dutyName: PropTypes.string,
  };

  render() {
    const { dutyName } = this.props;

    const cards = [];
    for (let i = 0; i < 9; i++) {
      cards.push(<Card key={i.toString()} dutyName={dutyName} />);
    }

    return <div style={ContainerStyle}>{cards}</div>;
  }
}
