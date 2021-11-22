import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { message } from 'antd';
import { VisitorsGeneralInfo } from '/imports/ui/modules/common';
import { SecuritySubModulePaths as paths } from '/imports/ui/modules/security';

import { UPDATE_SECURITY_VISITOR, SECURITY_VISITOR_BY_ID } from '../gql';

class GeneralInfo extends Component {
  static propTypes = {
    match: PropTypes.object,
    history: PropTypes.object,
    location: PropTypes.object,
    form: PropTypes.object,

    formDataLoading: PropTypes.bool,
    visitorId: PropTypes.string,
    securityVisitorById: PropTypes.object,
    updateSecurityVisitor: PropTypes.func,
  };

  handleCancel = () => {
    const { history } = this.props;
    history.push(`${paths.visitorRegistrationListPath}`);
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
    const { history, securityVisitorById, updateSecurityVisitor } = this.props;
    updateSecurityVisitor({
      variables: {
        _id: securityVisitorById._id,
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
        history.push(`${paths.visitorRegistrationListPath}`);
      })
      .catch(error => {
        message.error(error.message, 5);
      });
  };

  render() {
    const { formDataLoading, securityVisitorById } = this.props;
    if (formDataLoading) return null;

    return (
      <VisitorsGeneralInfo
        visitor={securityVisitorById}
        handleSubmit={this.handleSubmit}
        handleCancel={this.handleCancel}
      />
    );
  }
}

export default flowRight(
  graphql(UPDATE_SECURITY_VISITOR, {
    name: 'updateSecurityVisitor',
    options: {
      refetchQueries: ['pagedSecurityVisitors'],
    },
  }),
  graphql(SECURITY_VISITOR_BY_ID, {
    props: ({ data }) => ({ formDataLoading: data.loading, ...data }),
    options: ({ match }) => {
      const { visitorId } = match.params;
      return { variables: { _id: visitorId } };
    },
  })
)(GeneralInfo);
