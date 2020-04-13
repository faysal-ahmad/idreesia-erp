import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Button, Col, Form, Row } from '/imports/ui/controls';
import { InputNumberField } from '/imports/ui/modules/helpers/fields';

const formItemLayout = {
  labelCol: { span: 12 },
  wrapperCol: { span: 6 },
};

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
    form.validateFields(
      (
        err,
        {
          salary,
          rashanMadad,
          openingLoan,
          loanDeduction,
          newLoan,
          otherDeduction,
          arrears,
        }
      ) => {
        if (err) return;

        handleSave({
          _id: salaryObj._id,
          salary: salary || 0,
          rashanMadad: rashanMadad || 0,
          openingLoan: openingLoan || 0,
          loanDeduction: loanDeduction || 0,
          newLoan: newLoan || 0,
          otherDeduction: otherDeduction || 0,
          arrears: arrears || 0,
        });
      }
    );
  };

  render() {
    const {
      salary,
      form: { getFieldDecorator },
    } = this.props;

    return (
      <Form layout="horizontal" onSubmit={this.handleSubmit}>
        <Row>
          <Col span={10}>
            <InputNumberField
              fieldName="salary"
              fieldLabel="Salary"
              minValue={0}
              initialValue={salary.salary}
              fieldLayout={formItemLayout}
              getFieldDecorator={getFieldDecorator}
            />
            <InputNumberField
              fieldName="rashanMadad"
              fieldLabel="Rashan"
              minValue={0}
              initialValue={salary.rashanMadad}
              fieldLayout={formItemLayout}
              getFieldDecorator={getFieldDecorator}
            />
            <InputNumberField
              fieldName="otherDeduction"
              fieldLabel="Other Deduction"
              minValue={0}
              initialValue={salary.otherDeduction}
              fieldLayout={formItemLayout}
              getFieldDecorator={getFieldDecorator}
            />
            <InputNumberField
              fieldName="arrears"
              fieldLabel="Arrears"
              minValue={0}
              initialValue={salary.arrears}
              fieldLayout={formItemLayout}
              getFieldDecorator={getFieldDecorator}
            />
          </Col>
          <Col span={10}>
            <InputNumberField
              fieldName="openingLoan"
              fieldLabel="Opening Loan"
              minValue={0}
              initialValue={salary.openingLoan}
              fieldLayout={formItemLayout}
              getFieldDecorator={getFieldDecorator}
            />
            <InputNumberField
              fieldName="loanDeduction"
              fieldLabel="Loan Deduction"
              minValue={0}
              initialValue={salary.loanDeduction}
              fieldLayout={formItemLayout}
              getFieldDecorator={getFieldDecorator}
            />
            <InputNumberField
              fieldName="newLoan"
              fieldLabel="New Loan"
              minValue={0}
              initialValue={salary.newLoan}
              fieldLayout={formItemLayout}
              getFieldDecorator={getFieldDecorator}
            />
          </Col>
        </Row>

        <Row type="flex" justify="start">
          <Col offset={10}>
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
