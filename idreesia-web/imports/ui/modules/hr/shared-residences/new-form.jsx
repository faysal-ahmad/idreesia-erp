import React, { Component } from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { flowRight } from 'lodash';

import { Form, message } from '/imports/ui/controls';
import { WithBreadcrumbs } from '/imports/ui/composers';
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
    createSharedResidence: PropTypes.func,
  };

  handleCancel = () => {
    const { history } = this.props;
    history.goBack();
  };

  handleSubmit = e => {
    e.preventDefault();
    const { form, createSharedResidence, history } = this.props;
    form.validateFields((err, { name, address, ownerKarkun }) => {
      if (err) return;

      createSharedResidence({
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
    const { getFieldDecorator } = this.props.form;

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
        <FormButtonsSaveCancel handleCancel={this.handleCancel} />
      </Form>
    );
  }
}

const formMutation = gql`
  mutation createSharedResidence(
    $name: String!
    $address: String
    $ownerKarkunId: String
  ) {
    createSharedResidence(
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
    name: 'createSharedResidence',
    options: {
      refetchQueries: ['pagedSharedResidences'],
    },
  }),
  WithBreadcrumbs(['Security', 'Shared Residences', 'New'])
)(NewForm);
