import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { WithBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import { Form, message } from 'antd';
import {
  InputTextField,
  InputTextAreaField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';
import { AuditInfo } from '/imports/ui/modules/common';

import {
  PAYMENT_TYPE_BY_ID,
  UPDATE_PAYMENT_TYPE,
  ALL_PAYMENT_TYPES,
} from './gql';

class EditForm extends Component {
  static propTypes = {
    match: PropTypes.object,
    history: PropTypes.object,
    location: PropTypes.object,

    loading: PropTypes.bool,
    paymentTypeById: PropTypes.object,
    updatePaymentType: PropTypes.func,
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

  handleFinish = ({ name, description }) => {
    const { history, paymentTypeById, updatePaymentType } = this.props;
    updatePaymentType({
      variables: {
        id: paymentTypeById._id,
        name,
        description,
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
    const { loading, paymentTypeById } = this.props;
    const isFieldsTouched = this.state.isFieldsTouched;
    if (loading) return null;

    return (
      <Fragment>
        <Form layout="horizontal" onFinish={this.handleFinish} onFieldsChange={this.handleFieldsChange}>
          <InputTextField
            fieldName="name"
            fieldLabel="Payment Type"
            initialValue={paymentTypeById.name}
            required
            requiredMessage="Please input a name for the payment type."
          />
          <InputTextAreaField
            disabled
            fieldName="description"
            fieldLabel="Description"
            initialValue={paymentTypeById.description}
          />
          <FormButtonsSaveCancel
            handleCancel={this.handleCancel}
            isFieldsTouched={isFieldsTouched}
          />
        </Form>
        <AuditInfo record={paymentTypeById} />
      </Fragment>
    );
  }
}

export default flowRight(
  graphql(UPDATE_PAYMENT_TYPE, {
    name: 'updatePaymentType',
    options: {
      refetchQueries: [{ query: ALL_PAYMENT_TYPES }],
    },
  }),
  graphql(PAYMENT_TYPE_BY_ID, {
    props: ({ data }) => ({ ...data }),
    options: ({ match }) => {
      const { paymentTypeId } = match.params;
      return { variables: { id: paymentTypeId } };
    },
  }),
  WithBreadcrumbs(['Accounts', 'Payment Types', 'Edit'])
)(EditForm);
