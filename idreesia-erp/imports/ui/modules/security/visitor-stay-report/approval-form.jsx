import React, { Component } from "react";
import PropTypes from "prop-types";
import { Button, Form, Row, message } from "antd";
import gql from "graphql-tag";
import { compose, graphql } from "react-apollo";

import { InputTextAreaField } from "/imports/ui/modules/helpers/fields";

const FieldLayout = {
  labelCol: { span: 2 },
  wrapperCol: { span: 12 },
};

const ButtonsLayout = {
  wrapperCol: { span: 12, offset: 2 },
};

class ApprovalForm extends Component {
  static propTypes = {
    form: PropTypes.object,
    visitorStayId: PropTypes.string,
    approved: PropTypes.bool,

    approveVisitorStay: PropTypes.func,
    handleClose: PropTypes.func,
  };

  handleSubmit = e => {
    e.preventDefault();
    const {
      form,
      approved,
      visitorStayId,
      approveVisitorStay,
      handleClose,
    } = this.props;
    form.validateFields((err, { notes }) => {
      if (err) return;

      approveVisitorStay({
        variables: {
          _id: visitorStayId,
          approved: !approved,
          notes,
        },
      })
        .then(() => {
          handleClose();
        })
        .catch(error => {
          message.error(error.message, 5);
        });
    });
  };

  render() {
    const {
      approved,
      form: { getFieldDecorator },
    } = this.props;

    return (
      <Form layout="horizontal" onSubmit={this.handleSubmit}>
        <InputTextAreaField
          fieldName="notes"
          fieldLabel="Notes"
          fieldLayout={FieldLayout}
          getFieldDecorator={getFieldDecorator}
        />
        <Form.Item {...ButtonsLayout}>
          <Row type="flex" justify="end">
            <Button type="default" onClick={this.props.handleClose}>
              Cancel
            </Button>
            &nbsp;
            <Button type="primary" htmlType="submit">
              {approved ? "Unapprove" : "Approve"}
            </Button>
          </Row>
        </Form.Item>
      </Form>
    );
  }
}

const formMutation = gql`
  mutation approveVisitorStay(
    $_id: String!
    $approved: Boolean!
    $notes: String
  ) {
    approveVisitorStay(_id: $_id, approved: $approved, notes: $notes)
  }
`;

export default compose(
  Form.create(),
  graphql(formMutation, {
    name: "approveVisitorStay",
    options: {
      refetchQueries: ["pagedVisitorStays"],
    },
  })
)(ApprovalForm);
