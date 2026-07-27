import React from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import { Button, Collapse, Form, Row } from 'antd';

import { Formats } from 'meteor/idreesia-common/constants';
import { DataSource } from 'meteor/idreesia-common/constants';

import {
  DateRangeField,
  InputCnicField,
  InputMobileField,
  InputTextField,
  SelectField,
  EhadDurationFilterField,
} from '/imports/ui/modules/helpers/fields';
import { RefreshButton } from '/imports/ui/modules/helpers/controls';

const AntButton = Button as any;
const AntCollapse = Collapse as any;
const AntForm = Form as any;
const AntFormItem = (Form as any).Item;
const AntRow = Row as any;
const DateRangeInputField = DateRangeField as any;
const CnicField = InputCnicField as any;
const MobileField = InputMobileField as any;
const TextField = InputTextField as any;
const SelectInputField = SelectField as any;
const EhadDurationFilterInputField = EhadDurationFilterField as any;
const RefreshControl = RefreshButton as any;
type AnyRecord = Record<string, any>;
interface Props extends AnyRecord { setPageParams(params: AnyRecord): void; refreshData?: () => void; distinctCities?: string[]; }
interface LabelValue { label: string; value: string; }

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
  additionalInfo,
  dataSource,
  updatedBetween,
  showAdditionalInfoFilter,
  showDataSourceFilter,
  distinctCities,
}: Props) => {
  const [form] = AntForm.useForm();

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

  const handleFinish = (values: AnyRecord) => {
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
        values.updatedBetween?.[0]
          ? values.updatedBetween?.[0].format(Formats.DATE_FORMAT)
          : '',
        values.updatedBetween?.[1]
          ? values.updatedBetween?.[1].format(Formats.DATE_FORMAT)
          : '',
      ]),
    });
  };

  const refreshButton = () => <RefreshControl refreshData={refreshData} />;

  const additionalInfoFilter = showAdditionalInfoFilter ? (
    <SelectInputField
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
      getDataValue={({ value }: LabelValue) => value}
      getDataText={({ label }: LabelValue) => label}
      initialValue={additionalInfo}
      fieldLayout={formItemLayout}
    />
  ) : null;

  const dataSourceFilter = showDataSourceFilter ? (
    <SelectInputField
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
      getDataValue={({ value }: LabelValue) => value}
      getDataText={({ label }: LabelValue) => label}
      initialValue={dataSource}
      fieldLayout={formItemLayout}
    />
  ) : null;

  let initialValue;
  if (updatedBetween) {
    const dates = updatedBetween ? JSON.parse(updatedBetween) : null;
    initialValue = [
      dates[0] ? dayjs(dates[0], Formats.DATE_FORMAT) : null,
      dates[1] ? dayjs(dates[1], Formats.DATE_FORMAT) : null,
    ];
  } else {
    initialValue = [null, null];
  }

  const updatedBetweenField = (
    <DateRangeInputField
      fieldName="updatedBetween"
      fieldLabel="Updated"
      required={false}
      fieldLayout={formItemLayout}
      initialValue={initialValue}
    />
  );

  return (
    <AntCollapse
      style={ContainerStyle as any}
      items={[
        {
          key: '1',
          label: 'Filter',
          extra: refreshButton(),
          children: (
            <AntForm form={form} layout="horizontal" onFinish={handleFinish}>
              <TextField
                fieldName="name"
                fieldLabel="Name"
                required={false}
                fieldLayout={formItemLayout}
                initialValue={name}
              />
              <CnicField
                fieldName="cnicNumber"
                fieldLabel="CNIC Number"
                required={false}
                requiredMessage="Please input a valid CNIC number."
                fieldLayout={formItemLayout}
                initialValue={cnicNumber}
              />
              <MobileField
                fieldName="phoneNumber"
                fieldLabel="Phone Number"
                required={false}
                fieldLayout={formItemLayout}
                initialValue={phoneNumber}
              />
              <SelectInputField
                data={distinctCities}
                getDataValue={(cityName: string) => cityName}
                getDataText={(cityName: string) => cityName}
                initialValue={city}
                fieldName="city"
                fieldLabel="City"
                fieldLayout={formItemLayout}
              />
              <EhadDurationFilterInputField
                fieldName="ehadDuration"
                fieldLabel="Ehad Duration"
                required={false}
                fieldLayout={formItemLayout}
                initialValue={ehadDuration}
              />
              {additionalInfoFilter}
              {dataSourceFilter}
              {updatedBetweenField}
              <AntFormItem {...buttonItemLayout}>
                <AntRow type="flex" justify="end">
                  <AntButton type="default" onClick={handleReset}>
                    Reset
                  </AntButton>
                  &nbsp;
                  <AntButton type="primary" htmlType="submit">
                    Search
                  </AntButton>
                </AntRow>
              </AntFormItem>
            </AntForm>
          ),
        },
      ]}
    />
  );
};

ListFilter.propTypes = {
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

export default ListFilter;
