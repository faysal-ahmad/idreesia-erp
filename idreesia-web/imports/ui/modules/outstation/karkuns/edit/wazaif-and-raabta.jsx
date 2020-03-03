import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { message } from '/imports/ui/controls';
import { KarkunsWazaifAndRaabta } from '/imports/ui/modules/common';

import {
  OUTSTATION_KARKUN_BY_ID,
  SET_OUTSTATION_KARKUN_WAZAIF_AND_RAABTA,
} from '../gql';

class WazaifAndRaabta extends Component {
  static propTypes = {
    match: PropTypes.object,
    history: PropTypes.object,
    location: PropTypes.object,
    form: PropTypes.object,

    formDataLoading: PropTypes.bool,
    karkunId: PropTypes.string,
    outstationKarkunById: PropTypes.object,
    setOutstationKarkunWazaifAndRaabta: PropTypes.func,
  };

  handleCancel = () => {
    const { history } = this.props;
    history.goBack();
  };

  handleSubmit = ({ lastTarteebDate, mehfilRaabta, msRaabta }) => {
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
    const { formDataLoading, outstationKarkunById } = this.props;
    if (formDataLoading) return null;

    return (
      <KarkunsWazaifAndRaabta
        karkun={outstationKarkunById}
        handleSubmit={this.handleSubmit}
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
  graphql(OUTSTATION_KARKUN_BY_ID, {
    props: ({ data }) => ({ formDataLoading: data.loading, ...data }),
    options: ({ karkunId }) => ({ variables: { _id: karkunId } }),
  })
)(WazaifAndRaabta);
