import React, { Component } from 'react';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';

import { Select, Row, Col } from 'antd';

const getYearMonthValue = (dateValue?: Dayjs | null) => {
  const currentDate = dayjs().startOf('day');
  const diffInMonths = currentDate.diff(dateValue, 'months');
  const yearValue =
    diffInMonths < 12 ? 0 : (diffInMonths - (diffInMonths % 12)) / 12;
  const monthValue = diffInMonths < 12 ? diffInMonths : diffInMonths % 12;
  return {
    years: yearValue,
    months: monthValue,
  };
};

interface CustomInputProps {
  value?: Dayjs | null;
  disabled?: boolean;
  onChange?(value: Dayjs): void;
}

interface CustomInputState {
  years: number;
  months: number;
}

const getYearOptions = () => {
  const yearOptions: React.ReactNode[] = [];
  for (let i = 0; i <= 40; i++) {
    yearOptions.push(
      <Select.Option key={i} value={i}>
        {i}
      </Select.Option>
    );
  }
  return yearOptions;
};

const getMonthOptions = () => {
  const monthOptions: React.ReactNode[] = [];
  for (let i = 0; i <= 11; i++) {
    monthOptions.push(
      <Select.Option key={i} value={i}>
        {i}
      </Select.Option>
    );
  }
  return monthOptions;
};

export default class CustomInput extends Component<CustomInputProps, CustomInputState> {
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
      <Row align="middle" gutter={10}>
        <Col span={5}>
          <Select
            style={{ width: '100%' }}
            onChange={this.handleYearChange}
            value={this.state.years}
          >
            {getYearOptions()}
          </Select>
        </Col>
        <Col>years</Col>
        <Col span={5}>
          <Select
            style={{ width: '100%' }}
            onChange={this.handleMonthChange}
            value={this.state.months}
          >
            {getMonthOptions()}
          </Select>
        </Col>
        <Col>months</Col>
      </Row>
    );
  }
}
