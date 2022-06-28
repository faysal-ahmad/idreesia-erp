import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Button, Collapse, Form, Row } from 'antd';

import { Formats } from 'meteor/idreesia-common/constants';

import {
  DateRangeField,
  InputCnicField,
  InputMobileField,
  InputTextField,
  SelectField,
  EhadDurationFilterField,
} from '/imports/ui/modules/helpers/fields';
import { RefreshButton } from '/imports/ui/modules/helpers/controls';

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
  setPageParams,
  refreshData,
  name,
  cnicNumber,
  phoneNumber,
  city,
  ehadDuration,
  updatedBetween,
  distinctCities,
}) => {
  const [form] = Form.useForm();

  const handleReset = () => {
    form.resetFields();
    setPageParams({
      pageIndex: '0',
      name: '',
      cnicNumber: '',
      phoneNumber: '',
      city: '',
      ehadDuration: '',
      dataSource: '',
      updatedBetween: JSON.stringify(['', '']),
    });
  };

  const handleFinish = values => {
    setPageParams({
      pageIndex: 0,
      name: values.name,
      cnicNumber: values.cnicNumber,
      phoneNumber: values.phoneNumber,
      city: values.city,
      ehadDuration: values.ehadDuration,
      dataSource: values.dataSource,
      updatedBetween: JSON.stringify([
        values.updatedBetween[0]
          ? values.updatedBetween[0].format(Formats.DATE_FORMAT)
          : '',
        values.updatedBetween[1]
          ? values.updatedBetween[1].format(Formats.DATE_FORMAT)
          : '',
      ]),
    });
  };

  const refreshButton = () => <RefreshButton refreshData={refreshData} />;

  let initialValue;
  if (updatedBetween) {
    const dates = updatedBetween ? JSON.parse(updatedBetween) : null;
    initialValue = [
      dates[0] ? moment(dates[0], Formats.DATE_FORMAT) : null,
      dates[1] ? moment(dates[1], Formats.DATE_FORMAT) : null,
    ];
  } else {
    initialValue = [null, null];
  }

  const updatedBetweenField = (
    <DateRangeField
      fieldName="updatedBetween"
      fieldLabel="Updated"
      required={false}
      fieldLayout={formItemLayout}
      initialValue={initialValue}
    />
  );

  return (
    <Collapse style={ContainerStyle}>
      <Collapse.Panel header="Filter" key="1" extra={refreshButton()}>
        <Form form={form} layout="horizontal" onFinish={handleFinish}>
          <InputTextField
            fieldName="name"
            fieldLabel="Name"
            required={false}
            fieldLayout={formItemLayout}
            initialValue={name}
          />
          <InputCnicField
            fieldName="cnicNumber"
            fieldLabel="CNIC Number"
            required={false}
            requiredMessage="Please input a valid CNIC number."
            fieldLayout={formItemLayout}
            initialValue={cnicNumber}
          />
          <InputMobileField
            fieldName="phoneNumber"
            fieldLabel="Phone Number"
            required={false}
            fieldLayout={formItemLayout}
            initialValue={phoneNumber}
          />
          <SelectField
            data={distinctCities}
            getDataValue={cityName => cityName}
            getDataText={cityName => cityName}
            initialValue={city}
            fieldName="city"
            fieldLabel="City"
            fieldLayout={formItemLayout}
          />
          <EhadDurationFilterField
            fieldName="ehadDuration"
            fieldLabel="Ehad Duration"
            required={false}
            fieldLayout={formItemLayout}
            initialValue={ehadDuration}
          />
          {updatedBetweenField}
          <Form.Item {...buttonItemLayout}>
            <Row type="flex" justify="end">
              <Button type="default" onClick={handleReset}>
                Reset
              </Button>
              &nbsp;
              <Button type="primary" htmlType="submit">
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
  name: PropTypes.string,
  cnicNumber: PropTypes.string,
  phoneNumber: PropTypes.string,
  city: PropTypes.string,
  ehadDuration: PropTypes.string,
  updatedBetween: PropTypes.string,
  distinctCities: PropTypes.array,
  setPageParams: PropTypes.func,
  refreshData: PropTypes.func,
};

ListFilter.defaultProps = {
  cnicNumber: '',
  phoneNumber: '',
  city: '',
  additionalInfo: null,
  ehadDuration: null,
  distinctCities: [],
};

export default ListFilter;
