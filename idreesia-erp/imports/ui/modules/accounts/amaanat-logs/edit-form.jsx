import React, { Component } from "react";
import PropTypes from "prop-types";
import { Form, message } from "antd";
import gql from "graphql-tag";
import { compose, graphql } from "react-apollo";
import moment from "moment";

import { WithBreadcrumbs } from "/imports/ui/composers";
import { AccountsSubModulePaths as paths } from "/imports/ui/modules/accounts";

import {
  DateField,
  InputTextField,
  InputNumberField,
  FormButtonsSaveCancel,
  InputTextAreaField,
} from "/imports/ui/modules/helpers/fields";

class NewForm extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    form: PropTypes.object,

    formDataLoading: PropTypes.bool,
    amaanatLogById: PropTypes.object,
    updateAmaanatLog: PropTypes.func,
  };

  handleCancel = () => {
    const { history } = this.props;
    history.push(paths.amaanatLogsPath);
  };

  handleSubmit = e => {
    e.preventDefault();
    const { form, history, amaanatLogById, updateAmaanatLog } = this.props;
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

        updateAmaanatLog({
          variables: {
            _id: amaanatLogById._id,
            fromCity,
            receivedDate,
            totalAmount,
            hadiaPortion: hadiaPortion || null,
            sadqaPortion: sadqaPortion || null,
            zakaatPortion: zakaatPortion || null,
            langarPortion: langarPortion || null,
            otherPortion: otherPortion || null,
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
    const { form, formDataLoading, amaanatLogById } = this.props;
    if (formDataLoading) return null;
    const { getFieldDecorator } = form;

    return (
      <Form layout="horizontal" onSubmit={this.handleSubmit}>
        <InputTextField
          fieldName="fromCity"
          fieldLabel="From City"
          initialValue={amaanatLogById.fromCity}
          required
          requiredMessage="Please enter a city name."
          getFieldDecorator={getFieldDecorator}
        />

        <DateField
          fieldName="receivedDate"
          fieldLabel="Received Date"
          initialValue={moment(Number(amaanatLogById.receivedDate))}
          required
          requiredMessage="Please select a received date."
          getFieldDecorator={getFieldDecorator}
        />

        <InputNumberField
          fieldName="totalAmount"
          fieldLabel="Total Amount"
          initialValue={amaanatLogById.totalAmount}
          required
          requiredMessage="Please input a value for total amount."
          minValue={0}
          getFieldDecorator={getFieldDecorator}
        />

        <InputNumberField
          fieldName="hadiaPortion"
          fieldLabel="Hadia Portion"
          initialValue={amaanatLogById.hadiaPortion}
          minValue={0}
          getFieldDecorator={getFieldDecorator}
        />

        <InputNumberField
          fieldName="sadqaPortion"
          fieldLabel="Sadqa Portion"
          initialValue={amaanatLogById.sadqaPortion}
          minValue={0}
          getFieldDecorator={getFieldDecorator}
        />

        <InputNumberField
          fieldName="zakaatPortion"
          fieldLabel="Zakaat Portion"
          initialValue={amaanatLogById.zakaatPortion}
          minValue={0}
          getFieldDecorator={getFieldDecorator}
        />

        <InputNumberField
          fieldName="langarPortion"
          fieldLabel="Langar Portion"
          initialValue={amaanatLogById.langarPortion}
          minValue={0}
          getFieldDecorator={getFieldDecorator}
        />

        <InputNumberField
          fieldName="otherPortion"
          fieldLabel="Other Portion"
          initialValue={amaanatLogById.otherPortion}
          minValue={0}
          getFieldDecorator={getFieldDecorator}
        />

        <InputTextAreaField
          fieldName="otherPortionDescription"
          fieldLabel="Other Portion Description"
          initialValue={amaanatLogById.otherPortionDescription}
          required={false}
          getFieldDecorator={getFieldDecorator}
        />

        <FormButtonsSaveCancel handleCancel={this.handleCancel} />
      </Form>
    );
  }
}

const formQuery = gql`
  query amaanatLogById($_id: String!) {
    amaanatLogById(_id: $_id) {
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

const formMutation = gql`
  mutation updateAmaanatLog(
    $_id: String!
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
    updateAmaanatLog(
      _id: $_id
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

export default compose(
  Form.create(),
  graphql(formMutation, {
    name: "updateAmaanatLog",
    options: {
      refetchQueries: ["pagedAmaanatLogs"],
    },
  }),
  graphql(formQuery, {
    props: ({ data }) => ({ formDataLoading: data.loading, ...data }),
    options: ({ match }) => {
      const { logId } = match.params;
      return { variables: { _id: logId } };
    },
  }),
  WithBreadcrumbs(["Accounts", "Amaanat Logs", "Edit"])
)(NewForm);
