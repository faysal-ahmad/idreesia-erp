import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { message } from '/imports/ui/controls';
import { VisitorsGeneralInfo } from '/imports/ui/modules/common';

import { UPDATE_OUTSTATION_MEMBER, OUTSTATION_MEMBER_BY_ID } from '../gql';

class GeneralInfo extends Component {
  static propTypes = {
    match: PropTypes.object,
    history: PropTypes.object,
    location: PropTypes.object,
    form: PropTypes.object,

    formDataLoading: PropTypes.bool,
    memberId: PropTypes.string,
    outstationMemberById: PropTypes.object,
    updateOutstationMember: PropTypes.func,
  };

  handleCancel = () => {
    const { history } = this.props;
    history.goBack();
  };

  handleSubmit = ({
    name,
    parentName,
    cnicNumber,
    ehadDate,
    birthDate,
    referenceName,
    contactNumber1,
    contactNumber2,
    address,
    city,
    country,
  }) => {
    const {
      history,
      outstationMemberById,
      updateOutstationMember,
    } = this.props;
    updateOutstationMember({
      variables: {
        _id: outstationMemberById._id,
        name,
        parentName,
        cnicNumber,
        ehadDate,
        birthDate,
        referenceName,
        contactNumber1,
        contactNumber2,
        address,
        city,
        country,
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
    const { formDataLoading, outstationMemberById } = this.props;
    if (formDataLoading) return null;

    return (
      <VisitorsGeneralInfo
        visitor={outstationMemberById}
        handleSubmit={this.handleSubmit}
        handleCancel={this.handleCancel}
      />
    );
  }
}

export default flowRight(
  graphql(UPDATE_OUTSTATION_MEMBER, {
    name: 'updateOutstationMember',
    options: {
      refetchQueries: ['pagedTelephoneRoomVisitors'],
    },
  }),
  graphql(OUTSTATION_MEMBER_BY_ID, {
    props: ({ data }) => ({ formDataLoading: data.loading, ...data }),
    options: ({ match }) => {
      const { memberId } = match.params;
      return { variables: { _id: memberId } };
    },
  })
)(GeneralInfo);
