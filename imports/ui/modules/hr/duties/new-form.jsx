import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { merge } from 'react-komposer';
import { Form } from 'antd';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

import { WithBreadcrumbs } from '/imports/ui/composers';
import { HRSubModulePaths as paths } from '/imports/ui/modules/hr';
import { InputTextField, FormButtonsSaveCancel } from '/imports/ui/modules/helpers/fields';

class NewForm extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    form: PropTypes.object,
    createDuty: PropTypes.func
  };

  handleCancel = () => {
    const { history } = this.props;
    history.push(paths.dutiesPath);
  };

  handleSubmit = e => {
    e.preventDefault();
    const { form, createDuty, history } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (err) return;

      createDuty({
        variables: {
          name: fieldsValue.name
        }
      })
        .then(() => {
          history.push(paths.dutiesPath);
        })
        .catch(error => {
          console.log(error);
        });
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;

    return (
      <Form layout="horizontal" onSubmit={this.handleSubmit}>
        <InputTextField
          fieldName="name"
          fieldLabel="Duty Name"
          required={true}
          requiredMessage="Please input a name for the duty."
          getFieldDecorator={getFieldDecorator}
        />
        <FormButtonsSaveCancel handleCancel={this.handleCancel} />
      </Form>
    );
  }
}

const formMutation = gql`
  mutation createDuty($name: String!) {
    createDuty(name: $name) {
      _id
      name
    }
  }
`;

export default merge(
  Form.create(),
  graphql(formMutation, {
    name: 'createDuty',
    options: {
      refetchQueries: ['allDuties']
    }
  }),
  WithBreadcrumbs(['HR', 'Setup', 'Duties', 'New'])
)(NewForm);
