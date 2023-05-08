import React, { Component } from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { Form, message } from 'antd';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { WithBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import { SecuritySubModulePaths as paths } from '/imports/ui/modules/security';
import {
  InputTextField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';

class NewForm extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    createSecurityMehfilLangarLocation: PropTypes.func,
  };

  state = {
    isFieldsTouched: false,
  };

  handleCancel = () => {
    const { history } = this.props;
    history.push(paths.mehfilLangarLocationsPath);
  };

  handleFieldsChange = () => {
    this.setState({ isFieldsTouched: true });
  }

  handleFinish = fieldsValue => {
    const { createSecurityMehfilLangarLocation, history } = this.props;
    createSecurityMehfilLangarLocation({
      variables: {
        name: fieldsValue.name,
        urduName: fieldsValue.urduName,
      },
    })
      .then(() => {
        history.push(paths.mehfilLangarLocationsPath);
      })
      .catch(error => {
        message.error(error.message, 5);
      });
  };

  render() {
    const isFieldsTouched = this.state.isFieldsTouched;
    return (
      <Form layout="horizontal" onFinish={this.handleFinish} onFieldsChange={this.handleFieldsChange}>
        <InputTextField
          fieldName="name"
          fieldLabel="Name"
          required
          requiredMessage="Please input a name for the langar location."
        />
        <InputTextField
          fieldName="urduName"
          fieldLabel="Urdu Name"
          required
          requiredMessage="Please input an urdu name for the langar location."
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
  mutation createSecurityMehfilLangarLocation($name: String!, $urduName: String!) {
    createSecurityMehfilLangarLocation(name: $name, urduName: $urduName) {
      _id
      name
      urduName
    }
  }
`;

export default flowRight(
  graphql(formMutation, {
    name: 'createSecurityMehfilLangarLocation',
    options: {
      refetchQueries: ['allSecurityMehfilLangarLocations'],
    },
  }),
  WithBreadcrumbs(['Security', 'Mehfil Langar Locations', 'New'])
)(NewForm);
