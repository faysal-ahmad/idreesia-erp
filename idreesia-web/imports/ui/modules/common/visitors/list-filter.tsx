import React, { type CSSProperties } from 'react';
import dayjs, { type Dayjs } from 'dayjs';
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

interface PageParams {
  pageIndex: string | number;
  name?: string;
  cnicNumber?: string;
  phoneNumber?: string;
  city?: string;
  ehadDuration?: string;
  additionalInfo?: string;
  dataSource?: string;
  updatedBetween?: string;
}

export interface VisitorListFilterFormValues {
  name?: string;
  cnicNumber?: string;
  phoneNumber?: string;
  city?: string;
  ehadDuration?: string;
  additionalInfo?: string;
  dataSource?: string;
  updatedBetween?: [Dayjs | null, Dayjs | null];
}

interface Props {
  setPageParams(params: PageParams): void;
  refreshData?: () => Promise<unknown>;
  name?: string;
  cnicNumber?: string;
  phoneNumber?: string;
  city?: string;
  ehadDuration?: string | null;
  additionalInfo?: string | null;
  dataSource?: string;
  updatedBetween?: string;
  showAdditionalInfoFilter?: boolean;
  showDataSourceFilter?: boolean;
  distinctCities?: string[];
}

interface LabelValue { label: string; value: string; }

const ContainerStyle: CSSProperties = {
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
  cnicNumber = '',
  phoneNumber = '',
  city = '',
  ehadDuration = null,
  additionalInfo = null,
  dataSource,
  updatedBetween,
  showAdditionalInfoFilter = false,
  showDataSourceFilter = false,
  distinctCities = [],
}: Props) => {
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
      additionalInfo: '',
      dataSource: '',
      updatedBetween: JSON.stringify(['', '']),
    });
  };

  const handleFinish = (values: VisitorListFilterFormValues) => {
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
      getDataValue={({ value }: LabelValue) => value}
      getDataText={({ label }: LabelValue) => label}
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
    <DateRangeField
      fieldName="updatedBetween"
      fieldLabel="Updated"
      required={false}
      fieldLayout={formItemLayout}
      initialValue={initialValue}
    />
  );

  return (
    <Collapse
      style={ContainerStyle}
      items={[
        {
          key: '1',
          label: 'Filter',
          extra: refreshButton(),
          children: (
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
                data={distinctCities as any}
                getDataValue={((cityName: string) => cityName) as any}
                getDataText={((cityName: string) => cityName) as any}
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
                <Row justify="end">
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
          ),
        },
      ]}
    />
  );
};

export default ListFilter;
