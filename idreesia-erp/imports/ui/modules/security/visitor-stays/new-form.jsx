import React, { Component } from "react";
import PropTypes from "prop-types";
import { Button, Form, message } from "antd";
import gql from "graphql-tag";
import { compose, graphql } from "react-apollo";
import moment from "moment";

import { InputNumberField } from "/imports/ui/modules/helpers/fields";

class NewForm extends Component {
  static propTypes = {
    form: PropTypes.object,
    visitorId: PropTypes.string,
    handleAddItem: PropTypes.func,
    createVisitorStay: PropTypes.func,
  };

  handleSubmit = e => {
    e.preventDefault();
    const { form, visitorId, createVisitorStay } = this.props;
    form.validateFields((err, { numOfDays }) => {
      if (err) return;

      const fromDate = moment();
      const toDate = moment();
      if (numOfDays > 1) {
        toDate.addDays(numOfDays - 1);
      }

      createVisitorStay({
        variables: {
          visitorId,
          fromDate,
          toDate,
        },
      }).catch(error => {
        message.error(error.message, 5);
      });
    });
  };

  render() {
    const {
      form: { getFieldDecorator },
    } = this.props;

    return (
      <Form layout="inline" onSubmit={this.handleSubmit}>
        <InputNumberField
          fieldName="numOfDays"
          fieldLabel="Num of days"
          fieldLayout={null}
          initialValue={1}
          minValue={1}
          getFieldDecorator={getFieldDecorator}
        />
        <Form.Item>
          <Button type="primary" htmlType="submit" icon="plus-circle-o">
            Add Stay
          </Button>
        </Form.Item>
      </Form>
    );
  }
}

const formMutation = gql`
  mutation createVisitorStay(
    $visitorId: String!
    $fromDate: String!
    $toDate: String!
  ) {
    createVisitorStay(
      visitorId: $visitorId
      fromDate: $fromDate
      toDate: $toDate
    ) {
      _id
      visitorId
      fromDate
      toDate
    }
  }
`;

export default compose(
  Form.create(),
  graphql(formMutation, {
    name: "createVisitorStay",
    options: {
      refetchQueries: ["pagedVisitorStaysByVisitorId"],
    },
  })
)(NewForm);
