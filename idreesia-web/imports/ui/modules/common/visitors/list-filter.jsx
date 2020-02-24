import React from 'react';
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

const ListFilter = ({
  form,
  setPageParams,
  refreshData,
  name,
  cnicNumber,
  phoneNumber,
  ehadDuration,
  additionalInfo,
  showAdditionalInfoFilter,
}) => {
  const handleReset = () => {
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

  const handleSubmit = () => {
    form.validateFields((err, values) => {
      if (err) return;
      setPageParams({
        pageIndex: 0,
        name: values.name,
        cnicNumber: values.cnicNumber,
        phoneNumber: values.phoneNumber,
        ehadDuration: values.ehadDuration,
        additionalInfo: values.additionalInfo,
      });
    });
  };

  const refreshButton = () => {
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

  const { getFieldDecorator } = form;
  const additionalInfoFilter = showAdditionalInfoFilter ? (
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
  ) : null;
  return (
    <Collapse style={ContainerStyle}>
      <Collapse.Panel header="Filter" key="1" extra={refreshButton()}>
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
          {additionalInfoFilter}
          <Form.Item {...buttonItemLayout}>
            <Row type="flex" justify="end">
              <Button type="default" onClick={handleReset}>
                Reset
              </Button>
              &nbsp;
              <Button type="primary" onClick={handleSubmit}>
                Search
              </Button>
            </Row>
          </Form.Item>
        </Form>
      </Collapse.Panel>
    </Collapse>
  );
};

ListFilter.propTypes = {
  form: PropTypes.object,
  showAdditionalInfoFilter: PropTypes.bool,

  name: PropTypes.string,
  cnicNumber: PropTypes.string,
  phoneNumber: PropTypes.string,
  ehadDuration: PropTypes.string,
  additionalInfo: PropTypes.string,
  setPageParams: PropTypes.func,
  refreshData: PropTypes.func,
};

ListFilter.defaultProps = {
  showAdditionalInfoFilter: false,
  cnicNumber: '',
  phoneNumber: '',
  additionalInfo: null,
  ehadDuration: null,
};

export default Form.create({ name: 'visitorsListFilter' })(ListFilter);
