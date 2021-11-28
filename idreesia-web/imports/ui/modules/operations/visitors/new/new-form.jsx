import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { WithBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import { message } from 'antd';
import { VisitorsNewForm } from '/imports/ui/modules/common';
import { OperationsSubModulePaths as paths } from '/imports/ui/modules/operations';

import { CREATE_OPERATIONS_VISITOR } from '../gql';

class NewForm extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    createOperationsVisitor: PropTypes.func,
  };

  handleCancel = () => {
    const { history } = this.props;
    history.goBack();
  };

  handleFinish = ({
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
    const { history, createOperationsVisitor } = this.props;

    createOperationsVisitor({
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
      .then(({ data: { createOperationsVisitor: newVisitor } }) => {
        history.push(`${paths.visitorsEditFormPath(newVisitor._id)}`);
      })
      .catch(error => {
        message.error(error.message, 5);
      });
  };

  render() {
    return (
      <VisitorsNewForm
        handleFinish={this.handleFinish}
        handleCancel={this.handleCancel}
      />
    );
  }
}

export default flowRight(
  graphql(CREATE_OPERATIONS_VISITOR, {
    name: 'createOperationsVisitor',
    options: {
      refetchQueries: ['pagedOperationsVisitors'],
    },
  }),
  WithBreadcrumbs(['Operations', 'Visitors', 'New'])
)(NewForm);
