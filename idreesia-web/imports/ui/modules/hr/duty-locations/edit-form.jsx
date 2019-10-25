import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { WithBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import { Form, message } from '/imports/ui/controls';
import { HRSubModulePaths as paths } from '/imports/ui/modules/hr';
import {
  InputTextField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';
import { RecordInfo } from '/imports/ui/modules/helpers/controls';

class EditForm extends Component {
  static propTypes = {
    match: PropTypes.object,
    history: PropTypes.object,
    location: PropTypes.object,
    form: PropTypes.object,

    loading: PropTypes.bool,
    dutyLocationById: PropTypes.object,
    updateDutyLocation: PropTypes.func,
  };

  handleCancel = () => {
    const { history } = this.props;
    history.push(paths.dutyLocationsPath);
  };

  handleSubmit = e => {
    e.preventDefault();
    const { form, history, dutyLocationById, updateDutyLocation } = this.props;
    form.validateFields((err, { name }) => {
      if (err) return;

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
    });
  };

  render() {
    const { loading, dutyLocationById } = this.props;
    const { getFieldDecorator } = this.props.form;
    if (loading) return null;

    return (
      <Fragment>
        <Form layout="horizontal" onSubmit={this.handleSubmit}>
          <InputTextField
            fieldName="name"
            fieldLabel="Name"
            initialValue={dutyLocationById.name}
            required
            requiredMessage="Please input a name for the duty location."
            getFieldDecorator={getFieldDecorator}
          />
          <FormButtonsSaveCancel handleCancel={this.handleCancel} />
        </Form>
        <RecordInfo record={dutyLocationById} />
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
  Form.create(),
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
  WithBreadcrumbs(['HR', 'Setup', 'Duty Locations', 'Edit'])
)(EditForm);
