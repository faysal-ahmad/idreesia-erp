import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { Form, message } from 'antd';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { WithBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import { HRSubModulePaths as paths } from '/imports/ui/modules/hr';
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
    dutyLocationById: PropTypes.object,
    updateDutyLocation: PropTypes.func,
  };

  state = {
    isFieldsTouched: false,
  };

  handleCancel = () => {
    const { history } = this.props;
    history.push(paths.dutyLocationsPath);
  };

  handleFieldsChange = () => {
    this.setState({ isFieldsTouched: true });
  }

  handleFinish = ({ name }) => {
    const { history, dutyLocationById, updateDutyLocation } = this.props;
    updateDutyLocation({
      variables: {
        id: dutyLocationById._id,
        name,
      },
    })
      .then(() => {
        history.push(paths.dutyLocationsPath);
      })
      .catch(error => {
        message.error(error.message, 5);
      });
  };

  render() {
    const { loading, dutyLocationById } = this.props;
    const isFieldsTouched = this.state.isFieldsTouched;
    if (loading) return null;

    return (
      <Fragment>
        <Form layout="horizontal" onFinish={this.handleFinish} onFieldsChange={this.handleFieldsChange}>
          <InputTextField
            fieldName="name"
            fieldLabel="Name"
            initialValue={dutyLocationById.name}
            required
            requiredMessage="Please input a name for the duty location."
          />
          <FormButtonsSaveCancel
            handleCancel={this.handleCancel}
            isFieldsTouched={isFieldsTouched}
          />
        </Form>
        <AuditInfo record={dutyLocationById} />
      </Fragment>
    );
  }
}

const formQuery = gql`
  query dutyLocationById($id: String!) {
    dutyLocationById(id: $id) {
      _id
      name
      createdAt
      createdBy
      updatedAt
      updatedBy
    }
  }
`;

const formMutation = gql`
  mutation updateDutyLocation($id: String!, $name: String!) {
    updateDutyLocation(id: $id, name: $name) {
      _id
      name
      createdAt
      createdBy
      updatedAt
      updatedBy
    }
  }
`;

export default flowRight(
  graphql(formMutation, {
    name: 'updateDutyLocation',
    options: {
      refetchQueries: ['allDutyLocations'],
    },
  }),
  graphql(formQuery, {
    props: ({ data }) => ({ ...data }),
    options: ({ match }) => {
      const { dutyLocationId } = match.params;
      return { variables: { id: dutyLocationId } };
    },
  }),
  WithBreadcrumbs(['HR', 'Duty Locations', 'Edit'])
)(EditForm);
