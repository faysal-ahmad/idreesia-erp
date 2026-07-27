import React, { Component } from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';

import { Input, Select, Row, Col } from 'antd';

const getYearMonthValue = (dateValue: any) => {
  const currentDate = dayjs().startOf('day');
  const diffInMonths = currentDate.diff(dateValue, 'months');
  const yearValue =
    diffInMonths < 12 ? 0 : (diffInMonths - (diffInMonths % 12)) / 12;
  const monthValue = diffInMonths < 12 ? diffInMonths : diffInMonths % 12;
  return {
    years: yearValue,
    months: monthValue,
  };
}

const TextInput = Input as any;
const AntSelect = Select as any;
const AntRow = Row as any;
const AntCol = Col as any;
interface CustomInputProps { value?: any; disabled?: boolean; onChange?(value: any): void; }
interface CustomInputState { years: number; months: number; }

const getYearOptions = () => {
  const yearOptions: React.ReactNode[] = [];
  for (let i = 0; i <= 40; i++) {
    yearOptions.push(
      <AntSelect.Option key={i} value={i}>
        {i}
      </AntSelect.Option>
    );
  }
  return yearOptions;
};

const getMonthOptions = () => {
  const monthOptions: React.ReactNode[] = [];
  for (let i = 0; i <= 11; i++) {
    monthOptions.push(
      <AntSelect.Option key={i} value={i}>
        {i}
      </AntSelect.Option>
    );
  }
  return monthOptions;
};

export default class CustomInput extends Component<CustomInputProps, CustomInputState> {
  static propTypes = {
    value: PropTypes.object,
    disabled: PropTypes.bool,
    onChange: PropTypes.func,
  };

  state = getYearMonthValue(this.props.value);

  handleYearChange = (years: number) => {
    const months = this.state.months;
    this.setState({
      months,
      years, 
    });

    const totalMonths = years * 12 + months;
    let newDateValue = dayjs().startOf('day');
    newDateValue = newDateValue.subtract(totalMonths, 'months');
    this.props.onChange?.(newDateValue);
  };

  handleMonthChange = (months: number) => {
    const years = this.state.years;
    this.setState({
      months,
      years, 
    });

    const totalMonths = years * 12 + months;
    let newDateValue = dayjs().startOf('day');
    newDateValue = newDateValue.subtract(totalMonths, 'months');
    this.props.onChange?.(newDateValue);
  };

  render() {
    return (
      <TextInput.Group>
        <AntRow type="flex" align="middle" gutter={10}>
          <AntCol span={5}>
            <AntSelect
              style={{ width: '100%' }}
              onChange={this.handleYearChange}
              value={this.state.years}
            >
              {getYearOptions()}
            </AntSelect>
          </AntCol>
          <AntCol>years</AntCol>
          <AntCol span={5}>
            <AntSelect
              style={{ width: '100%' }}
              onChange={this.handleMonthChange}
              value={this.state.months}
            >
              {getMonthOptions()}
            </AntSelect>
          </AntCol>
          <AntCol>months</AntCol>
        </AntRow>
      </TextInput.Group>
    );
  }
}
