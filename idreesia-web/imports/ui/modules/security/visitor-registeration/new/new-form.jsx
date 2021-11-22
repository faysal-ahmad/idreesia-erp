import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { WithBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import { message } from 'antd';
import { VisitorsNewForm } from '/imports/ui/modules/common';
import { SecuritySubModulePaths as paths } from '/imports/ui/modules/security';

import { CREATE_SECURITY_VISITOR } from '../gql';

class NewForm extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    createSecurityVisitor: PropTypes.func,
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
    const { history, createSecurityVisitor } = this.props;

    createSecurityVisitor({
      variables: {
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
      .then(({ data: { createSecurityVisitor: newVisitor } }) => {
        history.push(
          `${paths.visitorRegistrationEditFormPath(newVisitor._id)}`
        );
      })
      .catch(error => {
        message.error(error.message, 5);
      });
  };

  render() {
    return (
      <VisitorsNewForm
        handleSubmit={this.handleSubmit}
        handleCancel={this.handleCancel}
      />
    );
  }
}

export default flowRight(
  graphql(CREATE_SECURITY_VISITOR, {
    name: 'createSecurityVisitor',
    options: {
      refetchQueries: ['pagedSecurityVisitors'],
    },
  }),
  WithBreadcrumbs(['Security', 'Visitor Registration', 'New'])
)(NewForm);
