import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

import { Card } from 'antd';
import { filter, memoize } from 'meteor/idreesia-common/utilities/lodash';

const HeadStyle = {
  color: 'black',
  fontSize: '22px',
  fontWeight: 'bold',
  textAlign: 'center',
};

const BodyStyle = {
  paddingTop: '0px',
};

const FooterStyle = {
  color: 'black',
  fontSize: '12px',
  textAlign: 'center',
  paddingTop: '4px',
};

const getFilteredMulakaatHistory = memoize(
  (visitorMulakaatHistory, visitorMulakaatId) =>
    filter(visitorMulakaatHistory, history => history._id !== visitorMulakaatId)
);

// eslint-disable-next-line react/prefer-stateless-function
export default class MulakaatCard extends Component {
  static propTypes = {
    visitorMulakaat: PropTypes.object,
    visitorMulakaatHistory: PropTypes.array,
  };

  render() {
    const { visitorMulakaat, visitorMulakaatHistory } = this.props;
    const { visitor } = visitorMulakaat;
    const mulakaatDate = moment(Number(visitorMulakaat.mulakaatDate)).format(
      'DD MMM, YYYY'
    );

    const filteredMulakaatHistory = getFilteredMulakaatHistory(
      visitorMulakaatHistory,
      visitorMulakaat._id
    );

    const historyNodes = filteredMulakaatHistory.map(history => {
      const historyDate = moment(Number(history.mulakaatDate)).format(
        'DD MMM, YYYY'
      );
      return (
        <li key={history._id}>
          {historyDate}
          {history.cancelledDate ? ' - Cancelled' : ''}
        </li>
      );
    });

    return (
      <Card
        size="small"
        title={`Mulakaat - ${mulakaatDate}`}
        headStyle={HeadStyle}
        bodyStyle={BodyStyle}
      >
        <h2 className="stay_card_section">Personal Information</h2>
        <div className="stay_card_item">
          <b>Name:</b> {visitor.name}
        </div>
        <div className="stay_card_item">
          <b>S/O:</b> {visitor.parentName}
        </div>
        <div className="stay_card_item">
          <b>City:</b> {visitor.city}
        </div>
        <div className="stay_card_item">
          <b>CNIC:</b> {visitor.cnicNumber}
        </div>
        <h2 className="stay_card_section">Mulakaat History</h2>
        <div className="stay_card_item">
          <ul>{historyNodes}</ul>
        </div>
        <div style={FooterStyle}>
          381 A-Block, Shah Rukn-e-Alam Colony, Multan
          <br />
          Ph: 061-111-111-381
        </div>
      </Card>
    );
  }
}
