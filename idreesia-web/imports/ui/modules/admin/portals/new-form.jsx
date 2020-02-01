import React, { Component } from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { WithBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import { WithAllCities } from '/imports/ui/modules/outstation/common/composers';
import { Form, message } from '/imports/ui/controls';
import {
  InputTextField,
  SelectField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';

class NewForm extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    form: PropTypes.object,

    allCities: PropTypes.array,
    allCitiesLoading: PropTypes.bool,
    createPortal: PropTypes.func,
  };

  handleCancel = () => {
    const { history } = this.props;
    history.goBack();
  };

  handleSubmit = e => {
    e.preventDefault();
    const { form, createPortal, history } = this.props;
    form.validateFields((err, { name, cityIds }) => {
      if (err) return;
      createPortal({
        variables: {
          name,
          cityIds,
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
    const { allCities, allCitiesLoading } = this.props;
    const { getFieldDecorator } = this.props.form;
    if (allCitiesLoading) return null;

    return (
      <Form layout="horizontal" onSubmit={this.handleSubmit}>
        <InputTextField
          fieldName="name"
          fieldLabel="Name"
          required
          requiredMessage="Please input a name for the portal."
          getFieldDecorator={getFieldDecorator}
        />
        <SelectField
          data={allCities}
          getDataValue={({ _id }) => _id}
          getDataText={({ name }) => name}
          mode="tags"
          fieldName="cityIds"
          fieldLabel="Cities"
          getFieldDecorator={getFieldDecorator}
        />
        <FormButtonsSaveCancel handleCancel={this.handleCancel} />
      </Form>
    );
  }
}

const formMutation = gql`
  mutation createPortal($name: String!, $cityIds: [String]) {
    createPortal(name: $name, cityIds: $cityIds) {
      _id
      name
      cityIds
    }
  }
`;

export default flowRight(
  Form.create(),
  WithAllCities(),
  graphql(formMutation, {
    name: 'createPortal',
    options: {
      refetchQueries: ['allPortals'],
    },
  }),
  WithBreadcrumbs(['Admin', 'Setup', 'Portals', 'New'])
)(NewForm);
