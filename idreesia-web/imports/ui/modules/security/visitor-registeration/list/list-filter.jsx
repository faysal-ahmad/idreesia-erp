import React, { Component } from 'react';
import PropTypes from 'prop-types';

import {
  Button,
  Collapse,
  Form,
  Icon,
  Row,
  Tooltip,
} from '/imports/ui/controls';
import {
  InputCnicField,
  InputMobileField,
  InputTextField,
  SelectField,
  EhadDurationFilterField,
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
    ehadDuration: PropTypes.string,
    additionalInfo: PropTypes.string,
    setPageParams: PropTypes.func,
    refreshData: PropTypes.func,
  };

  static defaultProps = {
    cnicNumber: '',
    phoneNumber: '',
    additionalInfo: null,
    ehadDuration: null,
  };

  handleReset = () => {
    const { form, setPageParams } = this.props;
    form.resetFields();
    setPageParams({
      pageIndex: 0,
      name: '',
      cnicNumber: '',
      phoneNumber: '',
      ehadDuration: '',
      additionalInfo: null,
    });
  };

  handleSubmit = () => {
    const { form, setPageParams } = this.props;

    form.validateFields(
      (
        err,
        { name, cnicNumber, phoneNumber, ehadDuration, additionalInfo }
      ) => {
        if (err) return;
        setPageParams({
          pageIndex: 0,
          name,
          cnicNumber,
          phoneNumber,
          ehadDuration,
          additionalInfo,
        });
      }
    );
  };

  refreshButton = () => {
    const { refreshData } = this.props;
    if (!refreshData) return null;
    return (
      <Tooltip title="Reload Data">
        <Icon
          type="sync"
          onClick={event => {
            event.stopPropagation();
            refreshData();
          }}
        />
      </Tooltip>
    );
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const {
      name,
      cnicNumber,
      phoneNumber,
      ehadDuration,
      additionalInfo,
    } = this.props;

    return (
      <Collapse style={ContainerStyle}>
        <Collapse.Panel header="Filter" key="1" extra={this.refreshButton()}>
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
            <EhadDurationFilterField
              fieldName="ehadDuration"
              fieldLabel="Ehad Duration"
              required={false}
              fieldLayout={formItemLayout}
              initialValue={ehadDuration}
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
