import React from 'react';
import PropTypes from 'prop-types';
import { useQuery, useMutation } from '@apollo/react-hooks';
import moment from 'moment';

import { Col, Collapse, Form, Row, message } from '/imports/ui/controls';
import {
  InputNumberField,
  MonthField,
  RadioGroupField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';

const { Panel } = Collapse;

const formItemLayout = {
  labelCol: { span: 14 },
  wrapperCol: { span: 6 },
};

const formMonthItemLayout = {
  labelCol: { span: 12 },
  wrapperCol: { span: 12 },
};

import {
  OPERATIONS_IMDAD_REQUEST_BY_ID,
  SET_OPERATIONS_APPROVED_IMDAD,
  PAGED_OPERATIONS_IMDAD_REQUESTS,
} from '../gql';

const ApprovedImdad = ({ requestId, form, history }) => {
  const [setOperationsApprovedImdad] = useMutation(
    SET_OPERATIONS_APPROVED_IMDAD,
    {
      refetchQueries: [
        { query: PAGED_OPERATIONS_IMDAD_REQUESTS, variables: { filter: {} } },
      ],
      awaitRefetchQueries: true,
    }
  );

  const { data, loading } = useQuery(OPERATIONS_IMDAD_REQUEST_BY_ID, {
    variables: { _id: requestId },
  });

  if (loading) return null;
  const { operationsImdadRequestById } = data;
  const approvedImdad = operationsImdadRequestById.approvedImdad || {};
  const { isFieldsTouched } = form;

  const handleCancel = () => {
    history.goBack();
  };

  const handleSubmit = e => {
    e.preventDefault();
    form.validateFields((err, values) => {
      if (err) return;

      setOperationsApprovedImdad({
        variables: {
          _id: requestId,
          approvedImdad: {
            fromMonth: values.fromMonth
              ? values.fromMonth.format('MM-YYYY')
              : null,
            toMonth: values.toMonth ? values.toMonth.format('MM-YYYY') : null,
            oneOffMedical: values.oneOffMedical || 0,
            oneOffHouseConstruction: values.oneOffHouseConstruction || 0,
            oneOffMarriageExpense: values.oneOffMarriageExpense || 0,
            oneOffMiscPayment: values.oneOffMiscPayment || 0,
            fixedRecurringWeeklyPayment:
              values.fixedRecurringWeeklyPayment || 0,
            fixedRecurringMonthlyPayment:
              values.fixedRecurringMonthlyPayment || 0,
            fixedRecurringHouseRent: values.fixedRecurringHouseRent || 0,
            ration: values.ration || 'none',
            fixedRecurringMedical: values.fixedRecurringMedical || 0,
            fixedRecurringSchoolFee: values.fixedRecurringSchoolFee || 0,
            fixedRecurringMilk: values.fixedRecurringMilk || 0,
            fixedRecurringFuel: values.fixedRecurringFuel || 0,
            variableRecurringMedical: values.variableRecurringMedical || 0,
            variableRecurringUtilityBills:
              values.variableRecurringUtilityBills || 0,
          },
        },
      })
        .then(() => {
          history.goBack();
        })
        .catch(error => {
          message.error(error.message, 5);
        });
    });
  };

  debugger;
  return (
    <Form layout="horizontal" onSubmit={handleSubmit}>
      <Row type="flex">
        <Col span={10}>
          <MonthField
            fieldName="fromMonth"
            fieldLabel="From Month"
            initialValue={
              approvedImdad.fromMonth
                ? moment(approvedImdad.fromMonth, 'MM-YYYY')
                : moment()
            }
            fieldLayout={formMonthItemLayout}
          />
        </Col>
        <Col span={10}>
          <MonthField
            fieldName="toMonth"
            fieldLabel="To Month"
            initialValue={
              approvedImdad.toMonth
                ? moment(approvedImdad.toMonth, 'MM-YYYY')
                : moment()
            }
            fieldLayout={formMonthItemLayout}
          />
        </Col>
      </Row>
      <Collapse>
        <Panel header="One-off Imdad">
          <Row type="flex">
            <Col span={10}>
              <InputNumberField
                fieldName="oneOffMedical"
                fieldLabel="Medical Expense"
                initialValue={approvedImdad.oneOffMedical || 0}
                fieldLayout={formItemLayout}
              />
              <InputNumberField
                fieldName="oneOffHouseConstruction"
                fieldLabel="House Construction"
                initialValue={approvedImdad.oneOffHouseConstruction || 0}
                fieldLayout={formItemLayout}
              />
            </Col>
            <Col span={10}>
              <InputNumberField
                fieldName="oneOffMarriageExpense"
                fieldLabel="Marriage Expense"
                initialValue={approvedImdad.oneOffMarriageExpense || 0}
                fieldLayout={formItemLayout}
              />
              <InputNumberField
                fieldName="oneOffMiscPayment"
                fieldLabel="Misc. Payment"
                initialValue={approvedImdad.oneOffMiscPayment || 0}
                fieldLayout={formItemLayout}
              />
            </Col>
          </Row>
        </Panel>
        <Panel header="Fixed Recurring Imdad">
          <Row type="flex">
            <Col span={10}>
              <InputNumberField
                fieldName="fixedRecurringWeeklyPayment"
                fieldLabel="Weekly Payment"
                initialValue={approvedImdad.fixedRecurringWeeklyPayment || 0}
                fieldLayout={formItemLayout}
              />
              <InputNumberField
                fieldName="fixedRecurringMonthlyPayment"
                fieldLabel="Monthly Payment"
                initialValue={approvedImdad.fixedRecurringMonthlyPayment || 0}
                fieldLayout={formItemLayout}
              />
              <InputNumberField
                fieldName="fixedRecurringHouseRent"
                fieldLabel="House Rent"
                initialValue={approvedImdad.fixedRecurringHouseRent || 0}
                fieldLayout={formItemLayout}
              />
              <RadioGroupField
                fieldName="ration"
                fieldLabel="Ration"
                options={[
                  { label: 'None', value: 'none' },
                  { label: 'Small', value: 'small' },
                  { label: 'Large', value: 'large' },
                ]}
                initialValue={approvedImdad.ration || 'none'}
                fieldLayout={formItemLayout}
              />
            </Col>
            <Col span={10}>
              <InputNumberField
                fieldName="fixedRecurringMedical"
                fieldLabel="Medical Expenses"
                initialValue={approvedImdad.fixedRecurringMedical || 0}
                fieldLayout={formItemLayout}
              />
              <InputNumberField
                fieldName="fixedRecurringSchoolFee"
                fieldLabel="School Fees"
                initialValue={approvedImdad.fixedRecurringSchoolFee || 0}
                fieldLayout={formItemLayout}
              />
              <InputNumberField
                fieldName="fixedRecurringMilk"
                fieldLabel="Milk Expense"
                initialValue={approvedImdad.fixedRecurringMilk || 0}
                fieldLayout={formItemLayout}
              />
              <InputNumberField
                fieldName="fixedRecurringFuel"
                fieldLabel="Fuel Expense"
                initialValue={approvedImdad.fixedRecurringFuel || 0}
                fieldLayout={formItemLayout}
              />
            </Col>
          </Row>
        </Panel>
        <Panel header="Variable (On Actual) Recurring Imdad">
          <InputNumberField
            fieldName="variableRecurringMedical"
            fieldLabel="Medical Expenses"
            initialValue={approvedImdad.variableRecurringMedical || 0}
          />
          <InputNumberField
            fieldName="variableRecurringUtilityBills"
            fieldLabel="Utility Bills"
            initialValue={approvedImdad.variableRecurringUtilityBills || 0}
          />
        </Panel>
      </Collapse>
      <br />
      <FormButtonsSaveCancel
        handleCancel={handleCancel}
        isFieldsTouched={isFieldsTouched}
      />
    </Form>
  );
};

ApprovedImdad.propTypes = {
  history: PropTypes.object,
  form: PropTypes.object,
  requestId: PropTypes.string,
};

export default Form.create()(ApprovedImdad);
