import React, { Component } from 'react';
import { Button, Col, Form, Row } from 'antd';
import { CloseCircleOutlined, SaveOutlined } from '@ant-design/icons';

import type { UpdateSalaryMutationVariables } from 'meteor/idreesia-common/types/client-operations';
import { InputNumberField } from '/imports/ui/modules/helpers/fields';

const formItemLayout = {
  labelCol: { span: 12 },
  wrapperCol: { span: 6 },
};

interface SalaryRecord {
  _id: string;
  salary?: number | null;
  rashanMadad?: number | null;
  openingLoan?: number | null;
  loanDeduction?: number | null;
  newLoan?: number | null;
  otherDeduction?: number | null;
  arrears?: number | null;
}

interface SalaryValues extends Omit<SalaryRecord, '_id'> {}

interface EditFormProps {
  salary: SalaryRecord;
  handleSave(values: UpdateSalaryMutationVariables): void;
  handleCancel(): void;
}

class EditForm extends Component<EditFormProps> {
  handleFinish = ({
    salary,
    rashanMadad,
    openingLoan,
    loanDeduction,
    newLoan,
    otherDeduction,
    arrears,
  }: SalaryValues) => {
    const { salary: salaryObj, handleSave } = this.props;
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
  };

  render() {
    const { salary } = this.props;

    return (
      <Form layout="horizontal" onFinish={this.handleFinish}>
        <Row>
          <Col span={10}>
            <InputNumberField
              fieldName="salary"
              fieldLabel="Salary"
              minValue={0}
              initialValue={salary.salary}
              fieldLayout={formItemLayout}
            />
            <InputNumberField
              fieldName="rashanMadad"
              fieldLabel="Rashan"
              minValue={0}
              initialValue={salary.rashanMadad}
              fieldLayout={formItemLayout}
            />
            <InputNumberField
              fieldName="otherDeduction"
              fieldLabel="Other Deduction"
              minValue={0}
              initialValue={salary.otherDeduction}
              fieldLayout={formItemLayout}
            />
            <InputNumberField
              fieldName="arrears"
              fieldLabel="Arrears"
              minValue={0}
              initialValue={salary.arrears}
              fieldLayout={formItemLayout}
            />
          </Col>
          <Col span={10}>
            <InputNumberField
              fieldName="openingLoan"
              fieldLabel="Opening Loan"
              minValue={0}
              initialValue={salary.openingLoan}
              fieldLayout={formItemLayout}
            />
            <InputNumberField
              fieldName="loanDeduction"
              fieldLabel="Loan Deduction"
              minValue={0}
              initialValue={salary.loanDeduction}
              fieldLayout={formItemLayout}
            />
            <InputNumberField
              fieldName="newLoan"
              fieldLabel="New Loan"
              minValue={0}
              initialValue={salary.newLoan}
              fieldLayout={formItemLayout}
            />
          </Col>
        </Row>

        <Row justify="start">
          <Col offset={10}>
            <Button
              size="large"
              type="default"
              icon={<CloseCircleOutlined />}
              onClick={this.props.handleCancel}
            >
              Cancel
            </Button>
            &nbsp;
            <Button size="large" type="primary" icon={<SaveOutlined />} htmlType="submit">
              Save
            </Button>
          </Col>
        </Row>
      </Form>
    );
  }
}

export default EditForm;
