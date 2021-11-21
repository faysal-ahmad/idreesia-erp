import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { WithBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import { Form, message } from '/imports/ui/controls';
import {
  InputTextField,
  InputTextAreaField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';

import { CREATE_OUTSTATION_MEHFIL_DUTY } from './gql';

class NewForm extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    form: PropTypes.object,
    createOutstationMehfilDuty: PropTypes.func,
  };

  handleCancel = () => {
    const { history } = this.props;
    history.goBack();
  };

  handleSubmit = e => {
    e.preventDefault();
    const { form, createOutstationMehfilDuty, history } = this.props;
    form.validateFields((err, { name, description }) => {
      if (err) return;

      createOutstationMehfilDuty({
        variables: {
          name,
          description,
        },
      })
        .then(() => {
          history.goBack();
        })
        .catch(error => {
          message.error(error.message, 5);
        });
    });
  };

  render() {
    const { isFieldsTouched } = this.props.form;

    return (
      <Form layout="horizontal" onSubmit={this.handleSubmit}>
        <InputTextField
          fieldName="name"
          fieldLabel="Duty Name"
          required
          requiredMessage="Please input a name for the duty."
        />
        <InputTextAreaField
          fieldName="description"
          fieldLabel="Description"
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
  graphql(CREATE_OUTSTATION_MEHFIL_DUTY, {
    name: 'createOutstationMehfilDuty',
    options: {
      refetchQueries: ['allMehfilDuties'],
    },
  }),
  WithBreadcrumbs(['Outstation', 'Mehfil Duties', 'New'])
)(NewForm);
