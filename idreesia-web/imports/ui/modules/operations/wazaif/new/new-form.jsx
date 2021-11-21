import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { WithBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import { Form, message } from '/imports/ui/controls';
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
    form: PropTypes.object,
    createOperationsWazeefa: PropTypes.func,
  };

  handleCancel = () => {
    const { history } = this.props;
    history.goBack();
  };

  handleSubmit = e => {
    e.preventDefault();
    const { form, history, createOperationsWazeefa } = this.props;
    form.validateFields((err, { name, revisionNumber, revisionDate }) => {
      if (err) return;

      createOperationsWazeefa({
        variables: {
          name,
          revisionNumber,
          revisionDate,
        },
      })
        .then(({ data: { createOperationsWazeefa: newWazeefa } }) => {
          history.push(`${paths.wazaifEditFormPath(newWazeefa._id)}`);
        })
        .catch(error => {
          message.error(error.message, 5);
        });
    });
  };

  render() {
    const {
      form: { isFieldsTouched },
    } = this.props;

    return (
      <Form layout="horizontal" onSubmit={this.handleSubmit}>
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

        <FormButtonsSaveCancel
          handleCancel={this.handleCancel}
          isFieldsTouched={isFieldsTouched}
        />
      </Form>
    );
  }
}

export default flowRight(
  Form.create(),
  graphql(CREATE_OPERATIONS_WAZEEFA, {
    name: 'createOperationsWazeefa',
    options: {
      refetchQueries: ['pagedOperationsWazaif'],
    },
  }),
  WithBreadcrumbs(['Operations', 'Wazaif', 'New'])
)(NewForm);
