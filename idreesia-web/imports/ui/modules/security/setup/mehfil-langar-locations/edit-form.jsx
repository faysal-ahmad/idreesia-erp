import React, { Component, Fragment } from 'react';
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
import { AuditInfo } from '/imports/ui/modules/common';

class EditForm extends Component {
  static propTypes = {
    match: PropTypes.object,
    history: PropTypes.object,
    location: PropTypes.object,

    loading: PropTypes.bool,
    securityMehfilLangarLocationById: PropTypes.object,
    updateSecurityMehfilLangarLocation: PropTypes.func,
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

  handleFinish = ({ name, urduName }) => {
    const { history, securityMehfilLangarLocationById, updateSecurityMehfilLangarLocation } = this.props;
    updateSecurityMehfilLangarLocation({
      variables: {
        id: securityMehfilLangarLocationById._id,
        name,
        urduName,
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
    const { loading, securityMehfilLangarLocationById } = this.props;
    const isFieldsTouched = this.state.isFieldsTouched;
    if (loading) return null;

    return (
      <Fragment>
        <Form layout="horizontal" onFinish={this.handleFinish} onFieldsChange={this.handleFieldsChange}>
          <InputTextField
            fieldName="name"
            fieldLabel="Name"
            initialValue={securityMehfilLangarLocationById.name}
            required
            requiredMessage="Please input a name for the langar location."
          />
          <InputTextField
            fieldName="urduName"
            fieldLabel="Urdu Name"
            initialValue={securityMehfilLangarLocationById.urduName}
            required
            requiredMessage="Please input an urdu name for the langar location."
          />
          <FormButtonsSaveCancel
            handleCancel={this.handleCancel}
            isFieldsTouched={isFieldsTouched}
          />
        </Form>
        <AuditInfo record={securityMehfilLangarLocationById} />
      </Fragment>
    );
  }
}

const formQuery = gql`
  query securityMehfilLangarLocationById($id: String!) {
    securityMehfilLangarLocationById(id: $id) {
      _id
      name
      urduName
      createdAt
      createdBy
      updatedAt
      updatedBy
    }
  }
`;

const formMutation = gql`
  mutation updateSecurityMehfilLangarLocation($id: String!, $name: String!, $urduName: String!) {
    updateSecurityMehfilLangarLocation(id: $id, name: $name, urduName: $urduName) {
      _id
      name
      urduName
      createdAt
      createdBy
      updatedAt
      updatedBy
    }
  }
`;

export default flowRight(
  graphql(formMutation, {
    name: 'updateSecurityMehfilLangarLocation',
    options: {
      refetchQueries: ['allSecurityMehfilLangarLocations'],
    },
  }),
  graphql(formQuery, {
    props: ({ data }) => ({ ...data }),
    options: ({ match }) => {
      const { mehfilLangarLocationId } = match.params;
      return { variables: { id: mehfilLangarLocationId } };
    },
  }),
  WithBreadcrumbs(['Security', 'Mehfil Langar Locations', 'Edit'])
)(EditForm);
