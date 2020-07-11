import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { WithBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import { Form, message } from '/imports/ui/controls';
import {
  InputTextField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';
import { KarkunField } from '/imports/ui/modules/hr/karkuns/field';
import { AuditInfo } from '/imports/ui/modules/common';

class EditForm extends Component {
  static propTypes = {
    match: PropTypes.object,
    history: PropTypes.object,
    location: PropTypes.object,
    form: PropTypes.object,

    loading: PropTypes.bool,
    hrSharedResidenceById: PropTypes.object,
    updateHRSharedResidence: PropTypes.func,
  };

  handleCancel = () => {
    const { history } = this.props;
    history.goBack();
  };

  handleSubmit = e => {
    e.preventDefault();
    const {
      form,
      history,
      hrSharedResidenceById,
      updateHRSharedResidence,
    } = this.props;
    form.validateFields((err, { name, address, ownerKarkun }) => {
      if (err) return;

      updateHRSharedResidence({
        variables: {
          _id: hrSharedResidenceById._id,
          name,
          address,
          ownerKarkunId: ownerKarkun ? ownerKarkun._id : null,
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
    const { loading, hrSharedResidenceById } = this.props;
    const { getFieldDecorator, isFieldsTouched } = this.props.form;
    if (loading) return null;

    return (
      <Fragment>
        <Form layout="horizontal" onSubmit={this.handleSubmit}>
          <InputTextField
            fieldName="name"
            fieldLabel="Name"
            required
            requiredMessage="Please input name for the residence."
            initialValue={hrSharedResidenceById.name}
            getFieldDecorator={getFieldDecorator}
          />
          <InputTextField
            fieldName="address"
            fieldLabel="Address"
            initialValue={hrSharedResidenceById.address}
            getFieldDecorator={getFieldDecorator}
          />
          <KarkunField
            fieldName="ownerKarkun"
            fieldLabel="Owned By"
            placeholder="Owned By"
            initialValue={hrSharedResidenceById.owner}
            getFieldDecorator={getFieldDecorator}
          />
          <FormButtonsSaveCancel
            handleCancel={this.handleCancel}
            isFieldsTouched={isFieldsTouched}
          />
        </Form>
        <AuditInfo record={hrSharedResidenceById} />
      </Fragment>
    );
  }
}

const formQuery = gql`
  query hrSharedResidenceById($_id: String!) {
    hrSharedResidenceById(_id: $_id) {
      _id
      name
      address
      owner {
        _id
        name
      }
      createdAt
      createdBy
      updatedAt
      updatedBy
    }
  }
`;

const formMutation = gql`
  mutation updateHRSharedResidence(
    $_id: String!
    $name: String!
    $address: String
    $ownerKarkunId: String
  ) {
    updateHRSharedResidence(
      _id: $_id
      name: $name
      address: $address
      ownerKarkunId: $ownerKarkunId
    ) {
      _id
      name
      address
      ownerKarkunId
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
    name: 'updateHRSharedResidence',
    options: {
      refetchQueries: ['pagedHRSharedResidences'],
    },
  }),
  graphql(formQuery, {
    props: ({ data }) => ({ ...data }),
    options: ({ match }) => {
      const { sharedResidenceId } = match.params;
      return { variables: { _id: sharedResidenceId } };
    },
  }),
  WithBreadcrumbs(['HR', 'Shared Residences', 'Edit'])
)(EditForm);
