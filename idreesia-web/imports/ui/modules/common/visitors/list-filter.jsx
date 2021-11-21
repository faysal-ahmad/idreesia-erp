import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

import { Formats } from 'meteor/idreesia-common/constants';
import { DataSource } from 'meteor/idreesia-common/constants';

import { Button, Collapse, Form, Row } from '/imports/ui/controls';
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
  form,
  setPageParams,
  refreshData,
  name,
  cnicNumber,
  phoneNumber,
  city,
  ehadDuration,
  additionalInfo,
  dataSource,
  updatedBetween,
  showAdditionalInfoFilter,
  showDataSourceFilter,
  distinctCities,
}) => {
  const handleReset = () => {
    form.resetFields();
    setPageParams({
      pageIndex: '0',
      name: '',
      cnicNumber: '',
      phoneNumber: '',
      city: '',
      ehadDuration: '',
      additionalInfo: '',
      dataSource: '',
      updatedBetween: JSON.stringify(['', '']),
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
        city: values.city,
        ehadDuration: values.ehadDuration,
        additionalInfo: values.additionalInfo,
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
    });
  };

  const refreshButton = () => <RefreshButton refreshData={refreshData} />;

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
    />
  ) : null;

  const dataSourceFilter = showDataSourceFilter ? (
    <SelectField
      fieldName="dataSource"
      fieldLabel="Data Source"
      required={false}
      data={[
        {
          label: 'Security',
          value: DataSource.SECURITY,
        },
        {
          label: 'Outstation',
          value: DataSource.OUTSTATION,
        },
        {
          label: 'Operations',
          value: DataSource.OPERATIONS,
        },
        {
          label: 'Portals',
          value: DataSource.PORTAL,
        },
      ]}
      getDataValue={({ value }) => value}
      getDataText={({ label }) => label}
      initialValue={dataSource}
      fieldLayout={formItemLayout}
    />
  ) : null;

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
        <Form layout="horizontal">
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
          {additionalInfoFilter}
          {dataSourceFilter}
          {updatedBetweenField}
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
  showDataSourceFilter: PropTypes.bool,

  name: PropTypes.string,
  cnicNumber: PropTypes.string,
  phoneNumber: PropTypes.string,
  city: PropTypes.string,
  ehadDuration: PropTypes.string,
  additionalInfo: PropTypes.string,
  updatedBetween: PropTypes.string,
  dataSource: PropTypes.string,
  distinctCities: PropTypes.array,
  setPageParams: PropTypes.func,
  refreshData: PropTypes.func,
};

ListFilter.defaultProps = {
  showAdditionalInfoFilter: false,
  showDataSourceFilter: false,
  cnicNumber: '',
  phoneNumber: '',
  city: '',
  additionalInfo: null,
  ehadDuration: null,
  distinctCities: [],
};

export default Form.create({ name: 'visitorsListFilter' })(ListFilter);
