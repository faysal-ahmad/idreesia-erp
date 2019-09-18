import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Form, message } from 'antd';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { flowRight } from 'lodash';

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
    form.validateFields((err, { address, ownerKarkun }) => {
      if (err) return;

      createSharedResidence({
        variables: {
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
          fieldName="address"
          fieldLabel="Address"
          required
          requiredMessage="Please input address for the residence."
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
  mutation createSharedResidence($address: String!, $ownerKarkunId: String) {
    createSharedResidence(address: $address, ownerKarkunId: $ownerKarkunId) {
      _id
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
      refetchQueries: ['allSharedResidences'],
    },
  }),
  WithBreadcrumbs(['Security', 'Shared Residences', 'New'])
)(NewForm);
