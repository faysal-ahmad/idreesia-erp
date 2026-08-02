import React, { type CSSProperties } from 'react';
import dayjs, { type Dayjs } from 'dayjs';
import { Collapse, Form, Row, Button } from 'antd';

import { Formats } from 'meteor/idreesia-common/constants';
import { StayReasons } from 'meteor/idreesia-common/constants/security';
import { useDistinctCities } from 'meteor/idreesia-common/hooks/security';
import {
  AutoCompleteField,
  InputTextField,
  DateField,
  SelectField,
} from '/imports/ui/modules/helpers/fields';

import type { PageParams } from './list-container';

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

interface LabelValue {
  label: string;
  value: string;
}

interface FilterValues {
  startDate?: Dayjs;
  endDate?: Dayjs;
  name?: string;
  city?: string;
  stayReason?: string;
  additionalInfo?: string;
}

interface QueryParams {
  startDate?: string;
  endDate?: string;
  name?: string;
  city?: string;
  stayReason?: string;
  additionalInfo?: string;
}

interface Props {
  setPageParams(params: PageParams): void;
  queryParams?: QueryParams;
}

const additionalInfoOptions: LabelValue[] = [
  { label: 'Has Associated Notes', value: 'has-notes' },
  { label: 'Has Crimial Record', value: 'has-criminal-record' },
  { label: 'Has Notes or Crimial Record', value: 'has-notes-or-criminal-record' },
];

const ListFilter = ({ setPageParams, queryParams = {} }: Props) => {
  const { distinctCities, distinctCitiesLoading } = useDistinctCities();
  const {
    startDate,
    endDate,
    name,
    city,
    stayReason,
    additionalInfo,
  } = queryParams;

  const handleFinish = ({
    startDate: start,
    endDate: end,
    name: nameVal,
    city: cityVal,
    stayReason: stayReasonVal,
    additionalInfo: additionalInfoVal,
  }: FilterValues) => {
    setPageParams({
      startDate: start ? dayjs(start).format(Formats.DATE_FORMAT) : null,
      endDate: end ? dayjs(end).format(Formats.DATE_FORMAT) : null,
      name: nameVal,
      city: cityVal,
      stayReason: stayReasonVal,
      additionalInfo: additionalInfoVal,
      pageIndex: 0,
    });
  };

  const handleReset = () => {
    setPageParams({
      startDate: null,
      endDate: null,
      name: null,
      city: null,
      stayReason: null,
      additionalInfo: null,
      pageIndex: 0,
    });
  };

  if (distinctCitiesLoading) return null;

  const mStartDate = startDate ? dayjs(startDate, Formats.DATE_FORMAT) : null;
  const mEndDate = endDate ? dayjs(endDate, Formats.DATE_FORMAT) : null;

  return (
    <Collapse
      style={ContainerStyle}
      items={[
        {
          key: '1',
          label: 'Filter',
          children: (
            <Form layout="horizontal" onFinish={handleFinish}>
              <DateField
                fieldName="startDate"
                fieldLabel="Start Date"
                fieldLayout={formItemLayout}
                required={false}
                initialValue={mStartDate}
              />
              <DateField
                fieldName="endDate"
                fieldLabel="End Date"
                fieldLayout={formItemLayout}
                required={false}
                initialValue={mEndDate}
              />
              <InputTextField
                fieldName="name"
                fieldLabel="Name"
                required={false}
                fieldLayout={formItemLayout}
                initialValue={name}
              />
              <AutoCompleteField
                fieldName="city"
                fieldLabel="City"
                fieldLayout={formItemLayout}
                dataSource={distinctCities ?? undefined}
                initialValue={city}
                required={false}
              />
              <SelectField
                data={StayReasons}
                getDataValue={({ _id }) => _id}
                getDataText={({ name: reasonName }) => reasonName}
                initialValue={stayReason}
                fieldName="stayReason"
                fieldLabel="Stay Reason"
                fieldLayout={formItemLayout}
              />
              <SelectField<LabelValue>
                fieldName="additionalInfo"
                fieldLabel="Additional Info"
                required={false}
                data={additionalInfoOptions}
                getDataValue={({ value }) => value}
                getDataText={({ label }) => label}
                initialValue={additionalInfo}
                fieldLayout={formItemLayout}
              />

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
