import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Button, Col, Form, Row } from '/imports/ui/controls';
import { InputNumberField } from '/imports/ui/modules/helpers/fields';

class EditForm extends Component {
  static propTypes = {
    form: PropTypes.object,
    salary: PropTypes.object,
    handleSave: PropTypes.func,
    handleCancel: PropTypes.func,
  };

  handleSubmit = e => {
    e.preventDefault();
    const { salary: salaryObj, form, handleSave } = this.props;
    form.validateFields((err, { salary, openingLoan, deduction, newLoan }) => {
      if (err) return;

      handleSave({
        _id: salaryObj._id,
        salary,
        openingLoan,
        deduction,
        newLoan,
      });
    });
  };

  render() {
    const {
      salary,
      form: { getFieldDecorator },
    } = this.props;

    return (
      <Form layout="horizontal" onSubmit={this.handleSubmit}>
        <InputNumberField
          fieldName="salary"
          fieldLabel="Salary"
          initialValue={salary.salary}
          getFieldDecorator={getFieldDecorator}
        />
        <InputNumberField
          fieldName="openingLoan"
          fieldLabel="Opening Loan"
          initialValue={salary.openingLoan}
          getFieldDecorator={getFieldDecorator}
        />
        <InputNumberField
          fieldName="deduction"
          fieldLabel="Deduction"
          initialValue={salary.deduction}
          getFieldDecorator={getFieldDecorator}
        />
        <InputNumberField
          fieldName="newLoan"
          fieldLabel="New Loan"
          initialValue={salary.newLoan}
          getFieldDecorator={getFieldDecorator}
        />

        <Row type="flex" justify="start">
          <Col offset={5}>
            <Button
              size="large"
              type="default"
              icon="close-circle"
              onClick={this.props.handleCancel}
            >
              Cancel
            </Button>
            &nbsp;
            <Button size="large" type="primary" icon="save" htmlType="submit">
              Save
            </Button>
          </Col>
        </Row>
      </Form>
    );
  }
}

export default Form.create()(EditForm);
