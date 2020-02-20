import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Collapse, Form, Row, Button } from '/imports/ui/controls';
import {
  InputCnicField,
  InputMobileField,
  InputTextField,
  SelectField,
} from '/imports/ui/modules/helpers/fields';

const ContainerStyle = {
  width: '500px',
};

const formItemLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 12 },
};

const buttonItemLayout = {
  wrapperCol: { span: 12, offset: 4 },
};

class ListFilter extends Component {
  static propTypes = {
    form: PropTypes.object,
    name: PropTypes.string,
    cnicNumber: PropTypes.string,
    phoneNumber: PropTypes.string,
    additionalInfo: PropTypes.string,
    setPageParams: PropTypes.func,
  };

  static defaultProps = {
    cnicNumber: '',
    phoneNumber: '',
    additionalInfo: null,
    filterCriteria: {},
  };

  handleReset = () => {
    const { form, setPageParams } = this.props;
    form.resetFields();
    setPageParams({
      pageIndex: 0,
      name: '',
      cnicNumber: '',
      phoneNumber: '',
      additionalInfo: null,
    });
  };

  handleSubmit = () => {
    const { form, setPageParams } = this.props;

    form.validateFields(
      (err, { name, cnicNumber, phoneNumber, additionalInfo }) => {
        if (err) return;
        setPageParams({
          pageIndex: 0,
          name,
          cnicNumber,
          phoneNumber,
          additionalInfo,
        });
      }
    );
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { name, cnicNumber, phoneNumber, additionalInfo } = this.props;

    return (
      <Collapse style={ContainerStyle}>
        <Collapse.Panel header="Filter" key="1">
          <Form layout="horizontal">
            <InputTextField
              fieldName="name"
              fieldLabel="Name"
              required={false}
              fieldLayout={formItemLayout}
              initialValue={name}
              getFieldDecorator={getFieldDecorator}
            />
            <InputCnicField
              fieldName="cnicNumber"
              fieldLabel="CNIC Number"
              required={false}
              requiredMessage="Please input a valid CNIC number."
              fieldLayout={formItemLayout}
              initialValue={cnicNumber}
              getFieldDecorator={getFieldDecorator}
            />
            <InputMobileField
              fieldName="phoneNumber"
              fieldLabel="Phone Number"
              required={false}
              fieldLayout={formItemLayout}
              initialValue={phoneNumber}
              getFieldDecorator={getFieldDecorator}
            />
            <SelectField
              fieldName="additionalInfo"
              fieldLabel="Additional Info"
              required={false}
              data={[
                {
                  label: 'Has Associated Notes',
                  value: 'has-notes',
                },
                {
                  label: 'Has Crimial Record',
                  value: 'has-criminal-record',
                },
                {
                  label: 'Has Notes or Crimial Record',
                  value: 'has-notes-or-criminal-record',
                },
              ]}
              getDataValue={({ value }) => value}
              getDataText={({ label }) => label}
              initialValue={additionalInfo}
              fieldLayout={formItemLayout}
              getFieldDecorator={getFieldDecorator}
            />
            <Form.Item {...buttonItemLayout}>
              <Row type="flex" justify="end">
                <Button type="default" onClick={this.handleReset}>
                  Reset
                </Button>
                &nbsp;
                <Button type="primary" onClick={this.handleSubmit}>
                  Search
                </Button>
              </Row>
            </Form.Item>
          </Form>
        </Collapse.Panel>
      </Collapse>
    );
  }
}

export default Form.create({ name: 'visitorsListFilter' })(ListFilter);
