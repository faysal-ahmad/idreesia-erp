import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { message } from 'antd';
import { KarkunsWazaifAndRaabta } from '/imports/ui/modules/common';

import {
  SET_PORTAL_KARKUN_WAZAIF_AND_RAABTA,
} from '../gql';

class WazaifAndRaabta extends Component {
  static propTypes = {
    match: PropTypes.object,
    history: PropTypes.object,
    location: PropTypes.object,

    portalId: PropTypes.string,
    karkunId: PropTypes.string,
    portalKarkunById: PropTypes.object,
    setPortalKarkunWazaifAndRaabta: PropTypes.func,
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
      portalId,
      karkunId,
      setPortalKarkunWazaifAndRaabta,
    } = this.props;
    setPortalKarkunWazaifAndRaabta({
      variables: {
        portalId,
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
    const { portalKarkunById } = this.props;

    return (
      <KarkunsWazaifAndRaabta
        karkun={portalKarkunById}
        handleFinish={this.handleFinish}
        handleCancel={this.handleCancel}
      />
    );
  }
}

export default flowRight(
  graphql(SET_PORTAL_KARKUN_WAZAIF_AND_RAABTA, {
    name: 'setPortalKarkunWazaifAndRaabta',
    options: {
      refetchQueries: ['pagedPortalKarkuns'],
    },
  })
)(WazaifAndRaabta);
