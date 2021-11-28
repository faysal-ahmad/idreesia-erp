import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';
import { Form, message } from 'antd';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { WithBreadcrumbs } from 'meteor/idreesia-common/composers/common';
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
    createMehfil: PropTypes.func,
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

  handleFinish = ({ name, mehfilDate }) => {
    const { createMehfil, history } = this.props;
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
  };

  render() {
    const isFieldsTouched = this.state.isFieldsTouched;

    return (
      <Form layout="horizontal" onFinish={this.handleFinish} onFieldsChange={this.handleFieldsChange}>
        <InputTextField
          fieldName="name"
          fieldLabel="Mehfil Name"
          required
          requiredMessage="Please input a name for the mehfil."
        />
        <DateField
          fieldName="mehfilDate"
          fieldLabel="Mehfil Date"
          required
          requiredMessage="Please input a date for the mehfil."
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
  graphql(CREATE_MEHFIL, {
    name: 'createMehfil',
    options: {
      refetchQueries: [{ query: ALL_MEHFILS }],
    },
  }),
  WithBreadcrumbs(['Security', 'Mehfils', 'New'])
)(NewForm);
