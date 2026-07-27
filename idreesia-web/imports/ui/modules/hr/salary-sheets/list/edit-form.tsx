import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Col, Form, Row } from 'antd';
import { CloseCircleOutlined, SaveOutlined } from '@ant-design/icons';

import { InputNumberField } from '/imports/ui/modules/helpers/fields';

const formItemLayout = {
  labelCol: { span: 12 },
  wrapperCol: { span: 6 },
};

const AntButton = Button as any;
const AntCol = Col as any;
const AntForm = Form as any;
const AntRow = Row as any;
const AntCloseCircleOutlined = CloseCircleOutlined as any;
const AntSaveOutlined = SaveOutlined as any;
const NumberField = InputNumberField as any;
interface SalaryRecord { _id: string; salary?: number; rashanMadad?: number; openingLoan?: number; loanDeduction?: number; newLoan?: number; otherDeduction?: number; arrears?: number; }
interface SalaryValues extends Omit<SalaryRecord, '_id'> {}
interface EditFormProps { salary: SalaryRecord; handleSave(values: SalaryRecord): void; handleCancel(): void; }

class EditForm extends Component<EditFormProps> {
  static propTypes = {
    salary: PropTypes.object,
    handleSave: PropTypes.func,
    handleCancel: PropTypes.func,
  };

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
      <AntForm layout="horizontal" onFinish={this.handleFinish}>
        <AntRow>
          <AntCol span={10}>
            <NumberField
              fieldName="salary"
              fieldLabel="Salary"
              minValue={0}
              initialValue={salary.salary}
              fieldLayout={formItemLayout}
            />
            <NumberField
              fieldName="rashanMadad"
              fieldLabel="Rashan"
              minValue={0}
              initialValue={salary.rashanMadad}
              fieldLayout={formItemLayout}
            />
            <NumberField
              fieldName="otherDeduction"
              fieldLabel="Other Deduction"
              minValue={0}
              initialValue={salary.otherDeduction}
              fieldLayout={formItemLayout}
            />
            <NumberField
              fieldName="arrears"
              fieldLabel="Arrears"
              minValue={0}
              initialValue={salary.arrears}
              fieldLayout={formItemLayout}
            />
          </AntCol>
          <AntCol span={10}>
            <NumberField
              fieldName="openingLoan"
              fieldLabel="Opening Loan"
              minValue={0}
              initialValue={salary.openingLoan}
              fieldLayout={formItemLayout}
            />
            <NumberField
              fieldName="loanDeduction"
              fieldLabel="Loan Deduction"
              minValue={0}
              initialValue={salary.loanDeduction}
              fieldLayout={formItemLayout}
            />
            <NumberField
              fieldName="newLoan"
              fieldLabel="New Loan"
              minValue={0}
              initialValue={salary.newLoan}
              fieldLayout={formItemLayout}
            />
          </AntCol>
        </AntRow>

        <AntRow type="flex" justify="start">
          <AntCol offset={10}>
            <AntButton
              size="large"
              type="default"
              icon={<AntCloseCircleOutlined />}
              onClick={this.props.handleCancel}
            >
              Cancel
            </AntButton>
            &nbsp;
            <AntButton size="large" type="primary" icon={<AntSaveOutlined />} htmlType="submit">
              Save
            </AntButton>
          </AntCol>
        </AntRow>
      </AntForm>
    );
  }
}

export default EditForm;
