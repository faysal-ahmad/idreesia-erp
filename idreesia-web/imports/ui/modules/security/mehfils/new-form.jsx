import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { WithBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import { Form, message } from '/imports/ui/controls';
import {
  InputTextField,
  DateField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';

import { CREATE_MEHFIL, ALL_MEHFILS } from './gql';

class NewForm extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    form: PropTypes.object,
    createMehfil: PropTypes.func,
  };

  handleCancel = () => {
    const { history } = this.props;
    history.goBack();
  };

  handleSubmit = e => {
    e.preventDefault();
    const { form, createMehfil, history } = this.props;
    form.validateFields((err, { name, mehfilDate }) => {
      if (err) return;

      createMehfil({
        variables: {
          name,
          mehfilDate,
        },
      })
        .catch(error => {
          message.error(error.message, 5);
        })
        .finally(() => {
          history.goBack();
        });
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;

    return (
      <Form layout="horizontal" onSubmit={this.handleSubmit}>
        <InputTextField
          fieldName="name"
          fieldLabel="Mehfil Name"
          required
          requiredMessage="Please input a name for the mehfil."
          getFieldDecorator={getFieldDecorator}
        />
        <DateField
          fieldName="mehfilDate"
          fieldLabel="Mehfil Date"
          required
          requiredMessage="Please input a date for the mehfil."
          getFieldDecorator={getFieldDecorator}
        />
        <FormButtonsSaveCancel handleCancel={this.handleCancel} />
      </Form>
    );
  }
}

export default flowRight(
  Form.create(),
  graphql(CREATE_MEHFIL, {
    name: 'createMehfil',
    options: {
      refetchQueries: [{ query: ALL_MEHFILS }],
    },
  }),
  WithBreadcrumbs(['Security', 'Mehfils', 'New'])
)(NewForm);
