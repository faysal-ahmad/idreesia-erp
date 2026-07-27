import React, { Component } from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import { Collapse, Form, Row, Button } from 'antd';

import { Formats } from 'meteor/idreesia-common/constants';
import { StayReasons } from 'meteor/idreesia-common/constants/security';
import {
  AutoCompleteField,
  InputTextField,
  DateField,
  SelectField,
} from '/imports/ui/modules/helpers/fields';

import { WithDistinctCities } from 'meteor/idreesia-common/composers/security';

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

const AntCollapse = Collapse as any;
const AntForm = Form as any;
const AntRow = Row as any;
const AntButton = Button as any;
const AutoComplete = AutoCompleteField as any;
const TextField = InputTextField as any;
const FormDateField = DateField as any;
const DropdownField = SelectField as any;
interface QueryParams { [key: string]: string | undefined; }
interface FilterValues { startDate?: unknown; endDate?: unknown; name?: string; city?: string; stayReason?: string; additionalInfo?: string; }
interface SelectOption { _id?: string; name?: string; label?: string; value?: string; }
interface ListFilterProps {
  setPageParams(params: Record<string, unknown>): void;
  queryParams: QueryParams;
  distinctCities?: string[];
}

class ListFilter extends Component<ListFilterProps> {
  static propTypes = {
    setPageParams: PropTypes.func,
    queryParams: PropTypes.object,

    distinctCitiesLoading: PropTypes.bool,
    distinctCities: PropTypes.array,
  };

  handleFinish = ({ startDate, endDate, name, city, stayReason, additionalInfo }: FilterValues) => {
    const { setPageParams } = this.props;
    setPageParams({
      startDate: startDate ? dayjs(startDate as string | number | Date).format(Formats.DATE_FORMAT) : null,
      endDate: endDate ? dayjs(endDate as string | number | Date).format(Formats.DATE_FORMAT) : null,
      name,
      city,
      stayReason,
      additionalInfo,
      pageIndex: 0,
    });
  };

  handleReset = () => {
    const { setPageParams } = this.props;
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

  render() {
    const {
      distinctCities,
      queryParams: {
        startDate,
        endDate,
        name,
        city,
        stayReason,
        additionalInfo,
      },
    } = this.props;

    const mStartDate = startDate ? dayjs(startDate, Formats.DATE_FORMAT) : null;
    const mEndDate = endDate ? dayjs(endDate, Formats.DATE_FORMAT) : null;

    return (
      <AntCollapse
        style={ContainerStyle}
        items={[
          {
            key: '1',
            label: 'Filter',
            children: (
              <AntForm layout="horizontal" onFinish={this.handleFinish}>
                <FormDateField
                  fieldName="startDate"
                  fieldLabel="Start Date"
                  fieldLayout={formItemLayout}
                  required={false}
                  initialValue={mStartDate}
                />
                <FormDateField
                  fieldName="endDate"
                  fieldLabel="End Date"
                  fieldLayout={formItemLayout}
                  required={false}
                  initialValue={mEndDate}
                />
                <TextField
                  fieldName="name"
                  fieldLabel="Name"
                  required={false}
                  fieldLayout={formItemLayout}
                  initialValue={name}
                />
                <AutoComplete
                  fieldName="city"
                  fieldLabel="City"
                  fieldLayout={formItemLayout}
                  dataSource={distinctCities}
                  initialValue={city}
                  required={false}
                />
                <DropdownField
                  data={StayReasons}
                  getDataValue={({ _id }: SelectOption) => _id}
                  getDataText={({ name: _name }: SelectOption) => _name}
                  initialValue={stayReason}
                  fieldName="stayReason"
                  fieldLabel="Stay Reason"
                  fieldLayout={formItemLayout}
                />
                <DropdownField
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
                  getDataValue={({ value }: SelectOption) => value}
                  getDataText={({ label }: SelectOption) => label}
                  initialValue={additionalInfo}
                  fieldLayout={formItemLayout}
                />

                <AntForm.Item {...buttonItemLayout}>
                  <AntRow type="flex" justify="end">
                    <AntButton type="default" onClick={this.handleReset}>
                      Reset
                    </AntButton>
                    &nbsp;
                    <AntButton type="primary" htmlType="submit">
                      Search
                    </AntButton>
                  </AntRow>
                </AntForm.Item>
              </AntForm>
            ),
          },
        ]}
      />
    );
  }
}

export default WithDistinctCities()(ListFilter as any);
