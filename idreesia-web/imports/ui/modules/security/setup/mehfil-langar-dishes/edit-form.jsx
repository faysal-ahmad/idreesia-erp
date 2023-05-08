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
    securityMehfilLangarDishById: PropTypes.object,
    updateSecurityMehfilLangarDish: PropTypes.func,
  };

  state = {
    isFieldsTouched: false,
  };

  handleCancel = () => {
    const { history } = this.props;
    history.push(paths.mehfilLangarDishesPath);
  };

  handleFieldsChange = () => {
    this.setState({ isFieldsTouched: true });
  }

  handleFinish = ({ name, urduName }) => {
    const { history, securityMehfilLangarDishById, updateSecurityMehfilLangarDish } = this.props;
    updateSecurityMehfilLangarDish({
      variables: {
        id: securityMehfilLangarDishById._id,
        name,
        urduName,
      },
    })
      .then(() => {
        history.push(paths.mehfilLangarDishesPath);
      })
      .catch(error => {
        message.error(error.message, 5);
      });
  };

  render() {
    const { loading, securityMehfilLangarDishById } = this.props;
    const isFieldsTouched = this.state.isFieldsTouched;
    if (loading) return null;

    return (
      <Fragment>
        <Form layout="horizontal" onFinish={this.handleFinish} onFieldsChange={this.handleFieldsChange}>
          <InputTextField
            fieldName="name"
            fieldLabel="Name"
            initialValue={securityMehfilLangarDishById.name}
            required
            requiredMessage="Please input a name for the langar dish."
          />
          <InputTextField
            fieldName="urduName"
            fieldLabel="Urdu Name"
            initialValue={securityMehfilLangarDishById.urduName}
            required
            requiredMessage="Please input an urdu name for the langar dish."
          />
          <FormButtonsSaveCancel
            handleCancel={this.handleCancel}
            isFieldsTouched={isFieldsTouched}
          />
        </Form>
        <AuditInfo record={securityMehfilLangarDishById} />
      </Fragment>
    );
  }
}

const formQuery = gql`
  query securityMehfilLangarDishById($id: String!) {
    securityMehfilLangarDishById(id: $id) {
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
  mutation updateSecurityMehfilLangarDish($id: String!, $name: String!, $urduName: String!) {
    updateSecurityMehfilLangarDish(id: $id, name: $name, urduName: $urduName) {
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
    name: 'updateSecurityMehfilLangarDish',
    options: {
      refetchQueries: ['allSecurityMehfilLangarDishes'],
    },
  }),
  graphql(formQuery, {
    props: ({ data }) => ({ ...data }),
    options: ({ match }) => {
      const { mehfilLangarDishId } = match.params;
      return { variables: { id: mehfilLangarDishId } };
    },
  }),
  WithBreadcrumbs(['Security', 'Mehfil Langar Dishes', 'Edit'])
)(EditForm);
