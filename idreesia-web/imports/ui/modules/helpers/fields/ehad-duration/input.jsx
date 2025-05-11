import React, { Component } from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';

import { Input, Select, Row, Col } from 'antd';

const getYearMonthValue = dateValue => {
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

const getYearOptions = () => {
  const yearOptions = [];
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
  const monthOptions = [];
  for (let i = 0; i <= 11; i++) {
    monthOptions.push(
      <Select.Option key={i} value={i}>
        {i}
      </Select.Option>
    );
  }
  return monthOptions;
};

export default class CustomInput extends Component {
  static propTypes = {
    value: PropTypes.object,
    disabled: PropTypes.bool,
    onChange: PropTypes.func,
  };

  state = getYearMonthValue(this.props.value);

  handleYearChange = years => {
    const months = this.state.months;
    this.setState({
      months,
      years, 
    });

    const totalMonths = years * 12 + months;
    const newDateValue = dayjs().startOf('day');
    newDateValue.subtract(totalMonths, 'months');
    this.props.onChange(newDateValue);
  };

  handleMonthChange = months => {
    const years = this.state.years;
    this.setState({
      months,
      years, 
    });

    const totalMonths = years * 12 + months;
    const newDateValue = dayjs().startOf('day');
    newDateValue.subtract(totalMonths, 'months');
    this.props.onChange(newDateValue);
  };

  render() {
    return (
      <Input.Group>
        <Row type="flex" align="middle" gutter={10}>
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
      </Input.Group>
    );
  }
}
