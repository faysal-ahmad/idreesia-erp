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

class NewForm extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,

    allCities: PropTypes.array,
    allCitiesLoading: PropTypes.bool,
    createPortal: PropTypes.func,
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
    const { createPortal, history } = this.props;
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
  };

  render() {
    const { allCities, allCitiesLoading } = this.props;
    const isFieldsTouched = this.state.isFieldsTouched;
    if (allCitiesLoading) return null;

    return (
      <Form layout="horizontal"  onFinish={this.handleFinish} onFieldsChange={this.handleFieldsChange}>
        <InputTextField
          fieldName="name"
          fieldLabel="Name"
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
        />
        <FormButtonsSaveCancel
          handleCancel={this.handleCancel}
          isFieldsTouched={isFieldsTouched}
        />
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
  WithAllCities(),
  graphql(formMutation, {
    name: 'createPortal',
    options: {
      refetchQueries: ['allPortals'],
    },
  }),
  WithBreadcrumbs(['Outstation', 'Portals', 'New'])
)(NewForm);
