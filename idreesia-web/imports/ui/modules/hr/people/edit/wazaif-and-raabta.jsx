import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { message } from 'antd';
import { KarkunsWazaifAndRaabta } from '/imports/ui/modules/common';

import { HR_KARKUN_BY_ID, SET_HR_KARKUN_WAZAIF_AND_RAABTA } from '../gql';

class WazaifAndRaabta extends Component {
  static propTypes = {
    match: PropTypes.object,
    history: PropTypes.object,
    location: PropTypes.object,

    formDataLoading: PropTypes.bool,
    karkunId: PropTypes.string,
    hrKarkunById: PropTypes.object,
    setHrKarkunWazaifAndRaabta: PropTypes.func,
  };

  handleCancel = () => {
    const { history } = this.props;
    history.goBack();
  };

  handleFinish = ({ lastTarteebDate, mehfilRaabta, msRaabta }) => {
    const { history, karkunId, setHrKarkunWazaifAndRaabta } = this.props;
    setHrKarkunWazaifAndRaabta({
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
    const { formDataLoading, hrKarkunById } = this.props;
    if (formDataLoading) return null;

    return (
      <KarkunsWazaifAndRaabta
        karkun={hrKarkunById}
        handleFinish={this.handleFinish}
        handleCancel={this.handleCancel}
      />
    );
  }
}

export default flowRight(
  graphql(SET_HR_KARKUN_WAZAIF_AND_RAABTA, {
    name: 'setHrKarkunWazaifAndRaabta',
    options: {
      refetchQueries: ['pagedHrKarkuns'],
    },
  }),
  graphql(HR_KARKUN_BY_ID, {
    props: ({ data }) => ({ formDataLoading: data.loading, ...data }),
    options: ({ karkunId }) => ({ variables: { _id: karkunId } }),
  })
)(WazaifAndRaabta);
