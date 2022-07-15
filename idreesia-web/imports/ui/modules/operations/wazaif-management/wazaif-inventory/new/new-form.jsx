import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';
import { Form, message } from 'antd';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { WithBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import { OperationsSubModulePaths as paths } from '/imports/ui/modules/operations';
import {
  InputTextField,
  InputNumberField,
  DateField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';

import { CREATE_OPERATIONS_WAZEEFA } from '../gql';

class NewForm extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    createOperationsWazeefa: PropTypes.func,
  };
  
  state = {
    isFieldsTouched: false,
  };

  handleCancel = () => {
    const { history } = this.props;
    history.goBack();
  };

  handleFieldsChange = () => {
    this.setState({ isFieldsTouched: true });
  }

  handleFinish = ({ name, revisionNumber, revisionDate, currentStockLevel }) => {
    const { history, createOperationsWazeefa } = this.props;
    createOperationsWazeefa({
      variables: {
        name,
        revisionNumber,
        revisionDate,
        currentStockLevel,
      },
    })
      .then(({ data: { createOperationsWazeefa: newWazeefa } }) => {
        history.push(`${paths.wazaifInventoryEditFormPath(newWazeefa._id)}`);
      })
      .catch(error => {
        message.error(error.message, 5);
      });
  };

  render() {
    const isFieldsTouched = this.state.isFieldsTouched;

    return (
      <Form layout="horizontal" onFinish={this.handleFinish} onFieldsChange={this.handleFieldsChange}>
        <InputTextField
          fieldName="name"
          fieldLabel="Name"
          required
          requiredMessage="Please input the name for the wazeefa."
        />

        <InputNumberField
          fieldName="revisionNumber"
          fieldLabel="Revision Number"
        />

        <DateField
          fieldName="revisionDate"
          fieldLabel="Revision Date"
          initialValue={null}
        />

        <InputNumberField
          fieldName="currentStockLevel"
          fieldLabel="Current Stock Level"
          initialValue={null}
        />

        <FormButtonsSaveCancel
          handleCancel={this.handleCancel}
          isFieldsTouched={isFieldsTouched}
        />
      </Form>
    );
  }
}

export default flowRight(
  graphql(CREATE_OPERATIONS_WAZEEFA, {
    name: 'createOperationsWazeefa',
    options: {
      refetchQueries: ['pagedOperationsWazaif'],
    },
  }),
  WithBreadcrumbs(['Operations', 'Wazaif Management', 'Wazaif Inventory', 'New'])
)(NewForm);
