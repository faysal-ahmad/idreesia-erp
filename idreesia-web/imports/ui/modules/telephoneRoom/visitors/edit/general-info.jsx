import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';
import { flowRight } from 'lodash';

import { message } from '/imports/ui/controls';
import { VisitorsGeneralInfo } from '/imports/ui/modules/common';
import { TelephoneRoomSubModulePaths as paths } from '/imports/ui/modules/telephoneRoom';

import {
  UPDATE_TELEPHONE_ROOM_VISITOR,
  TELEPHONE_ROOM_VISITOR_BY_ID,
} from '../gql';

class GeneralInfo extends Component {
  static propTypes = {
    match: PropTypes.object,
    history: PropTypes.object,
    location: PropTypes.object,
    form: PropTypes.object,

    formDataLoading: PropTypes.bool,
    visitorId: PropTypes.string,
    telephoneRoomVisitorById: PropTypes.object,
    updateTelephoneRoomVisitor: PropTypes.func,
  };

  handleCancel = () => {
    const { history } = this.props;
    history.push(`${paths.visitorRegistrationPath}`);
  };

  handleSubmit = ({
    name,
    parentName,
    cnicNumber,
    ehadDate,
    referenceName,
    contactNumber1,
    contactNumber2,
    address,
    city,
    country,
  }) => {
    const { telephoneRoomVisitorById, updateTelephoneRoomVisitor } = this.props;
    updateTelephoneRoomVisitor({
      variables: {
        _id: telephoneRoomVisitorById._id,
        name,
        parentName,
        cnicNumber,
        ehadDate,
        referenceName,
        contactNumber1,
        contactNumber2,
        address,
        city,
        country,
      },
    })
      .then(() => {
        history.push(`${paths.visitorsPath}`);
      })
      .catch(error => {
        message.error(error.message, 5);
      });
  };

  render() {
    const { formDataLoading, telephoneRoomVisitorById } = this.props;
    if (formDataLoading) return null;

    return (
      <VisitorsGeneralInfo
        visitor={telephoneRoomVisitorById}
        handleSubmit={this.handleSubmit}
        handleCancel={this.handleCancel}
      />
    );
  }
}

export default flowRight(
  graphql(UPDATE_TELEPHONE_ROOM_VISITOR, {
    name: 'updateTelephoneRoomVisitor',
    options: {
      refetchQueries: ['pagedTelephoneRoomVisitors'],
    },
  }),
  graphql(TELEPHONE_ROOM_VISITOR_BY_ID, {
    props: ({ data }) => ({ formDataLoading: data.loading, ...data }),
    options: ({ match }) => {
      const { visitorId } = match.params;
      return { variables: { _id: visitorId } };
    },
  })
)(GeneralInfo);
