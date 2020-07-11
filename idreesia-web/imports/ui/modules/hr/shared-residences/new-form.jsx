import React, { Component } from 'react';
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

class NewForm extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    form: PropTypes.object,
    createHRSharedResidence: PropTypes.func,
  };

  handleCancel = () => {
    const { history } = this.props;
    history.goBack();
  };

  handleSubmit = e => {
    e.preventDefault();
    const { form, createHRSharedResidence, history } = this.props;
    form.validateFields((err, { name, address, ownerKarkun }) => {
      if (err) return;

      createHRSharedResidence({
        variables: {
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
    const { getFieldDecorator, isFieldsTouched } = this.props.form;

    return (
      <Form layout="horizontal" onSubmit={this.handleSubmit}>
        <InputTextField
          fieldName="name"
          fieldLabel="Name"
          required
          requiredMessage="Please input name for the residence."
          getFieldDecorator={getFieldDecorator}
        />
        <InputTextField
          fieldName="address"
          fieldLabel="Address"
          getFieldDecorator={getFieldDecorator}
        />
        <KarkunField
          fieldName="ownerKarkun"
          fieldLabel="Owned By"
          placeholder="Owned By"
          getFieldDecorator={getFieldDecorator}
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
  mutation createHRSharedResidence(
    $name: String!
    $address: String
    $ownerKarkunId: String
  ) {
    createHRSharedResidence(
      name: $name
      address: $address
      ownerKarkunId: $ownerKarkunId
    ) {
      _id
      name
      address
      ownerKarkunId
    }
  }
`;

export default flowRight(
  Form.create(),
  graphql(formMutation, {
    name: 'createHRSharedResidence',
    options: {
      refetchQueries: ['pagedHRSharedResidences'],
    },
  }),
  WithBreadcrumbs(['HR', 'Shared Residences', 'New'])
)(NewForm);
