import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { message } from '/imports/ui/controls';
import { VisitorsGeneralInfo } from '/imports/ui/modules/common';

import { UPDATE_OPERATIONS_VISITOR, OPERATIONS_VISITOR_BY_ID } from '../gql';

class GeneralInfo extends Component {
  static propTypes = {
    match: PropTypes.object,
    history: PropTypes.object,
    location: PropTypes.object,
    form: PropTypes.object,

    formDataLoading: PropTypes.bool,
    visitorId: PropTypes.string,
    operationsVisitorById: PropTypes.object,
    updateOperationsVisitor: PropTypes.func,
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
    city,
    country,
    currentAddress,
    permanentAddress,
    educationalQualification,
    meansOfEarning,
  }) => {
    const {
      history,
      operationsVisitorById,
      updateOperationsVisitor,
    } = this.props;
    updateOperationsVisitor({
      variables: {
        _id: operationsVisitorById._id,
        name,
        parentName,
        cnicNumber,
        ehadDate,
        birthDate,
        referenceName,
        contactNumber1,
        contactNumber2,
        city,
        country,
        currentAddress,
        permanentAddress,
        educationalQualification,
        meansOfEarning,
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
    const { formDataLoading, operationsVisitorById } = this.props;
    if (formDataLoading) return null;

    return (
      <VisitorsGeneralInfo
        visitor={operationsVisitorById}
        handleSubmit={this.handleSubmit}
        handleCancel={this.handleCancel}
      />
    );
  }
}

export default flowRight(
  graphql(UPDATE_OPERATIONS_VISITOR, {
    name: 'updateOperationsVisitor',
    options: {
      refetchQueries: ['pagedOperationsVisitors'],
    },
  }),
  graphql(OPERATIONS_VISITOR_BY_ID, {
    props: ({ data }) => ({ formDataLoading: data.loading, ...data }),
    options: ({ match }) => {
      const { visitorId } = match.params;
      return { variables: { _id: visitorId } };
    },
  })
)(GeneralInfo);
