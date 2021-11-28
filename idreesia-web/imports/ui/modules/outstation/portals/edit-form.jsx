import React, { Component } from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { Form, message } from 'antd';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { WithBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import { WithAllCities } from '/imports/ui/modules/outstation/common/composers';
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

    loading: PropTypes.bool,
    portalById: PropTypes.object,
    allCities: PropTypes.array,
    allCitiesLoading: PropTypes.bool,
    updatePortal: PropTypes.func,
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

  handleFinish = ({ name, cityIds }) => {
    const { history, portalById, updatePortal } = this.props;
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
  };

  render() {
    const { loading, portalById, allCities, allCitiesLoading } = this.props;
    const isFieldsTouched = this.state.isFieldsTouched;
    if (loading || allCitiesLoading) return null;

    return (
      <Form layout="horizontal" onFinish={this.handleFinish} onFieldsChange={this.handleFieldsChange}>
        <InputTextField
          fieldName="name"
          fieldLabel="Name"
          initialValue={portalById.name}
          required
          requiredMessage="Please input a name for the portal."
        />
        <SelectField
          data={allCities}
          getDataValue={({ _id }) => _id}
          getDataText={({ name }) => name}
          mode="tags"
          fieldName="cityIds"
          fieldLabel="Cities"
          initialValue={portalById.cityIds || []}
        />
        <FormButtonsSaveCancel
          handleCancel={this.handleCancel}
          isFieldsTouched={isFieldsTouched}
        />
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
    updatePortal(_id: $_id, name: $name, cityIds: $cityIds) {
      _id
      name
      cityIds
    }
  }
`;

export default flowRight(
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
  WithBreadcrumbs(['Outstation', 'Portals', 'Edit'])
)(EditForm);
