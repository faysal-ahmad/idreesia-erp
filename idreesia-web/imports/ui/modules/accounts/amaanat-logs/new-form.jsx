import React, { Component } from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { flowRight } from 'lodash';
import { graphql } from 'react-apollo';

import { WithBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import { Form, message } from '/imports/ui/controls';
import { AccountsSubModulePaths as paths } from '/imports/ui/modules/accounts';

import {
  DateField,
  InputTextField,
  InputNumberField,
  FormButtonsSaveCancel,
  InputTextAreaField,
} from '/imports/ui/modules/helpers/fields';

class NewForm extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    form: PropTypes.object,

    createAmaanatLog: PropTypes.func,
  };

  handleCancel = () => {
    const { history } = this.props;
    history.push(paths.amaanatLogsPath);
  };

  handleSubmit = e => {
    e.preventDefault();
    const { form, history, createAmaanatLog } = this.props;
    form.validateFields(
      (
        err,
        {
          fromCity,
          receivedDate,
          totalAmount,
          hadiaPortion,
          sadqaPortion,
          zakaatPortion,
          langarPortion,
          otherPortion,
          otherPortionDescription,
        }
      ) => {
        if (err) return;

        createAmaanatLog({
          variables: {
            fromCity,
            receivedDate,
            totalAmount,
            hadiaPortion,
            sadqaPortion,
            zakaatPortion,
            langarPortion,
            otherPortion,
            otherPortionDescription,
          },
        })
          .then(() => {
            history.push(paths.amaanatLogsPath);
          })
          .catch(error => {
            message.error(error.message, 5);
          });
      }
    );
  };

  render() {
    const { getFieldDecorator } = this.props.form;

    return (
      <Form layout="horizontal" onSubmit={this.handleSubmit}>
        <InputTextField
          fieldName="fromCity"
          fieldLabel="From City"
          required
          requiredMessage="Please enter a city name."
          getFieldDecorator={getFieldDecorator}
        />

        <DateField
          fieldName="receivedDate"
          fieldLabel="Received Date"
          required
          requiredMessage="Please select a received date."
          getFieldDecorator={getFieldDecorator}
        />

        <InputNumberField
          fieldName="totalAmount"
          fieldLabel="Total Amount"
          required
          requiredMessage="Please input a value for total amount."
          minValue={0}
          getFieldDecorator={getFieldDecorator}
        />

        <InputNumberField
          fieldName="hadiaPortion"
          fieldLabel="Hadia Portion"
          minValue={0}
          getFieldDecorator={getFieldDecorator}
        />

        <InputNumberField
          fieldName="sadqaPortion"
          fieldLabel="Sadqa Portion"
          minValue={0}
          getFieldDecorator={getFieldDecorator}
        />

        <InputNumberField
          fieldName="zakaatPortion"
          fieldLabel="Zakaat Portion"
          minValue={0}
          getFieldDecorator={getFieldDecorator}
        />

        <InputNumberField
          fieldName="langarPortion"
          fieldLabel="Langar Portion"
          minValue={0}
          getFieldDecorator={getFieldDecorator}
        />

        <InputNumberField
          fieldName="otherPortion"
          fieldLabel="Other Portion"
          minValue={0}
          getFieldDecorator={getFieldDecorator}
        />

        <InputTextAreaField
          fieldName="otherPortionDescription"
          fieldLabel="Other Portion Description"
          required={false}
          getFieldDecorator={getFieldDecorator}
        />

        <FormButtonsSaveCancel handleCancel={this.handleCancel} />
      </Form>
    );
  }
}

const formMutation = gql`
  mutation createAmaanatLog(
    $fromCity: String!
    $receivedDate: String!
    $totalAmount: Float!
    $hadiaPortion: Float
    $sadqaPortion: Float
    $zakaatPortion: Float
    $langarPortion: Float
    $otherPortion: Float
    $otherPortionDescription: String
  ) {
    createAmaanatLog(
      fromCity: $fromCity
      receivedDate: $receivedDate
      totalAmount: $totalAmount
      hadiaPortion: $hadiaPortion
      sadqaPortion: $sadqaPortion
      zakaatPortion: $zakaatPortion
      langarPortion: $langarPortion
      otherPortion: $otherPortion
      otherPortionDescription: $otherPortionDescription
    ) {
      _id
      fromCity
      receivedDate
      totalAmount
      hadiaPortion
      sadqaPortion
      zakaatPortion
      langarPortion
      otherPortion
      otherPortionDescription
    }
  }
`;

export default flowRight(
  Form.create(),
  graphql(formMutation, {
    name: 'createAmaanatLog',
    options: {
      refetchQueries: ['pagedAmaanatLogs'],
    },
  }),
  WithBreadcrumbs(['Accounts', 'Amaanat Logs', 'New'])
)(NewForm);
