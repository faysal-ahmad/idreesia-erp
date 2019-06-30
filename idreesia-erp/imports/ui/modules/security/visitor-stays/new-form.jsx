import React, { Component } from "react";
import PropTypes from "prop-types";
import { Button, Form, Row, message } from "antd";
import gql from "graphql-tag";
import { compose, graphql } from "react-apollo";

import { DateField } from "/imports/ui/modules/helpers/fields";

const RowStyle = {
  height: "40px",
  paddingRight: "100px",
};

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
    form.validateFields((err, { fromDate, toDate }) => {
      if (err) return;

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
        <Row type="flex" justify="end" style={RowStyle}>
          <DateField
            fieldName="fromDate"
            fieldLabel="From"
            fieldLayout={null}
            allowClear={false}
            required
            requiredMessage="Please select a from date."
            getFieldDecorator={getFieldDecorator}
          />
          <DateField
            fieldName="toDate"
            fieldLabel="To"
            fieldLayout={null}
            allowClear={false}
            required
            requiredMessage="Please select a to date."
            getFieldDecorator={getFieldDecorator}
          />
        </Row>
        <Row type="flex" justify="end" style={RowStyle}>
          <Form.Item>
            <Button type="primary" htmlType="submit" icon="plus-circle-o">
              Add Stay
            </Button>
          </Form.Item>
        </Row>
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
