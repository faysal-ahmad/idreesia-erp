import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { WithBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import { Form, message } from '/imports/ui/controls';
import {
  InputTextField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';

import { PAGED_CITIES, ALL_CITIES, CREATE_CITY } from '../gql';

class NewForm extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    form: PropTypes.object,
    createCity: PropTypes.func,
  };

  handleCancel = () => {
    const { history } = this.props;
    history.goBack();
  };

  handleSubmit = e => {
    e.preventDefault();
    const { form, createCity, history } = this.props;
    form.validateFields((err, { name, region, country }) => {
      if (err) return;

      createCity({
        variables: {
          name,
          region,
          country,
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
    const { getFieldDecorator } = this.props.form;

    return (
      <Form layout="horizontal" onSubmit={this.handleSubmit}>
        <InputTextField
          fieldName="name"
          fieldLabel="City Name"
          required
          requiredMessage="Please input a name for the city."
          getFieldDecorator={getFieldDecorator}
        />
        <InputTextField
          fieldName="region"
          fieldLabel="Region"
          getFieldDecorator={getFieldDecorator}
        />
        <InputTextField
          fieldName="country"
          fieldLabel="Country"
          initialValue="Pakistan"
          required
          requiredMessage="Please input a name for the country."
          getFieldDecorator={getFieldDecorator}
        />
        <FormButtonsSaveCancel handleCancel={this.handleCancel} />
      </Form>
    );
  }
}

export default flowRight(
  Form.create(),
  graphql(CREATE_CITY, {
    name: 'createCity',
    options: {
      refetchQueries: [{ query: PAGED_CITIES }, { query: ALL_CITIES }],
    },
  }),
  WithBreadcrumbs(['Outstation', 'Cities & Mehfils', 'New'])
)(NewForm);
