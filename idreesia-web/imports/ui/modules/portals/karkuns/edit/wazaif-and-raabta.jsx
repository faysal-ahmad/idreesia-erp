import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { message } from '/imports/ui/controls';
import { KarkunsWazaifAndRaabta } from '/imports/ui/modules/common';

import {
  PORTAL_KARKUN_BY_ID,
  SET_PORTAL_KARKUN_WAZAIF_AND_RAABTA,
} from '../gql';

class WazaifAndRaabta extends Component {
  static propTypes = {
    match: PropTypes.object,
    history: PropTypes.object,
    location: PropTypes.object,
    form: PropTypes.object,

    portalId: PropTypes.string,
    karkunId: PropTypes.string,
    formDataLoading: PropTypes.bool,
    portalKarkunById: PropTypes.object,
    setPortalKarkunWazaifAndRaabta: PropTypes.func,
  };

  handleCancel = () => {
    const { history } = this.props;
    history.goBack();
  };

  handleSubmit = ({
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
    const { formDataLoading, portalKarkunById } = this.props;
    if (formDataLoading) return null;

    return (
      <KarkunsWazaifAndRaabta
        karkun={portalKarkunById}
        handleSubmit={this.handleSubmit}
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
  }),
  graphql(PORTAL_KARKUN_BY_ID, {
    props: ({ data }) => ({ formDataLoading: data.loading, ...data }),
    options: ({ portalId, karkunId }) => ({
      variables: { portalId, _id: karkunId },
    }),
  })
)(WazaifAndRaabta);
