import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';
import { message } from 'antd';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { KarkunsWazaifAndRaabta } from '/imports/ui/modules/common';

import {
  SET_OUTSTATION_KARKUN_WAZAIF_AND_RAABTA,
} from '../gql';

class WazaifAndRaabta extends Component {
  static propTypes = {
    match: PropTypes.object,
    history: PropTypes.object,
    location: PropTypes.object,

    karkunId: PropTypes.string,
    outstationKarkunById: PropTypes.object,
    setOutstationKarkunWazaifAndRaabta: PropTypes.func,
  };

  handleCancel = () => {
    const { history } = this.props;
    history.goBack();
  };

  handleFinish = ({
    lastTarteebDate,
    mehfilRaabta,
    msRaabta,
    msLastVisitDate,
  }) => {
    const {
      history,
      karkunId,
      setOutstationKarkunWazaifAndRaabta,
    } = this.props;
    setOutstationKarkunWazaifAndRaabta({
      variables: {
        _id: karkunId,
        lastTarteebDate: lastTarteebDate
          ? lastTarteebDate.startOf('day')
          : null,
        mehfilRaabta,
        msRaabta,
        msLastVisitDate: msLastVisitDate
          ? msLastVisitDate.startOf('day')
          : null,
      },
    })
      .then(() => {
        history.goBack();
      })
      .catch(error => {
        message.error(error.message, 5);
      });
  };

  render() {
    const { outstationKarkunById } = this.props;

    return (
      <KarkunsWazaifAndRaabta
        karkun={outstationKarkunById}
        handleFinish={this.handleFinish}
        handleCancel={this.handleCancel}
      />
    );
  }
}

export default flowRight(
  graphql(SET_OUTSTATION_KARKUN_WAZAIF_AND_RAABTA, {
    name: 'setOutstationKarkunWazaifAndRaabta',
    options: {
      refetchQueries: ['pagedOutstationKarkuns'],
    },
  }),
)(WazaifAndRaabta);
