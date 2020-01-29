import React, { Component } from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { WithBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import { WithAllCities } from '/imports/ui/modules/hr/common/composers';
import { Form, message } from '/imports/ui/controls';
import {
  InputTextField,
  SelectField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';

class EditForm extends Component {
  static propTypes = {
    match: PropTypes.object,
    history: PropTypes.object,
    location: PropTypes.object,
    form: PropTypes.object,

    loading: PropTypes.bool,
    portalById: PropTypes.object,
    allCities: PropTypes.array,
    allCitiesLoading: PropTypes.bool,
    updatePortal: PropTypes.func,
  };

  handleCancel = () => {
    const { history } = this.props;
    history.goBack();
  };

  handleSubmit = e => {
    e.preventDefault();
    const { form, history, portalById, updatePortal } = this.props;
    form.validateFields((err, { name, cityIds }) => {
      if (err) return;

      updatePortal({
        variables: {
          _id: portalById._id,
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
    const { loading, portalById, allCities, allCitiesLoading } = this.props;
    if (loading || allCitiesLoading) return null;
    const { getFieldDecorator } = this.props.form;

    return (
      <Form layout="horizontal" onSubmit={this.handleSubmit}>
        <InputTextField
          fieldName="name"
          fieldLabel="Name"
          initialValue={portalById.name}
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
          initialValue={portalById.cityIds}
          getFieldDecorator={getFieldDecorator}
        />
        <FormButtonsSaveCancel handleCancel={this.handleCancel} />
      </Form>
    );
  }
}

const formQuery = gql`
  query portalById($_id: String!) {
    portalById(_id: $_id) {
      _id
      name
      cityIds
    }
  }
`;

const formMutation = gql`
  mutation updatePortal($_id: String!, $name: String!, $cityIds: [String]) {
    updateCompany(_id: $_id, name: $name, cityIds: $cityIds) {
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
    name: 'updatePortal',
    options: {
      refetchQueries: ['allPortals'],
    },
  }),
  graphql(formQuery, {
    props: ({ data }) => ({ ...data }),
    options: ({ match }) => {
      const { portalId } = match.params;
      return { variables: { _id: portalId } };
    },
  }),
  WithBreadcrumbs(['Admin', 'Setup', 'Portals', 'Edit'])
)(EditForm);
