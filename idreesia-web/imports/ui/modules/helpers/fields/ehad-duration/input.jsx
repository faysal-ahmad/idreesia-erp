import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

import { Input, Select, Row, Col } from 'antd';

export default class CustomInput extends Component {
  static propTypes = {
    value: PropTypes.object,
    disabled: PropTypes.bool,
    onChange: PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.monthSelect = React.createRef();
    this.yearSelect = React.createRef();
  }

  getYearOptions = () => {
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

  getMonthOptions = () => {
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

  handleYearChange = years => {
    const { onChange } = this.props;
    const months = this.monthSelect.current.props.value;
    const totalMonths = years * 12 + months;
    const newValue = moment().startOf('day');
    newValue.subtract(totalMonths, 'months');
    onChange(newValue);
  };

  handleMonthChange = months => {
    const { onChange } = this.props;
    const years = this.yearSelect.current.props.value;
    const totalMonths = years * 12 + months;
    const newValue = moment().startOf('day');
    newValue.subtract(totalMonths, 'months');
    onChange(newValue);
  };

  render() {
    const { value } = this.props;
    const currentDate = moment().startOf('day');
    const diffInMonths = currentDate.diff(value, 'months');
    const yearValue =
      diffInMonths < 12 ? 0 : (diffInMonths - (diffInMonths % 12)) / 12;
    const monthValue = diffInMonths < 12 ? diffInMonths : diffInMonths % 12;

    return (
      <Input.Group>
        <Row type="flex" align="middle" gutter={10}>
          <Col span={5}>
            <Select
              ref={this.yearSelect}
              style={{ width: '100%' }}
              onChange={this.handleYearChange}
              value={yearValue}
            >
              {this.getYearOptions()}
            </Select>
          </Col>
          <Col>years</Col>
          <Col span={5}>
            <Select
              ref={this.monthSelect}
              style={{ width: '100%' }}
              onChange={this.handleMonthChange}
              value={monthValue}
            >
              {this.getMonthOptions()}
            </Select>
          </Col>
          <Col>months</Col>
        </Row>
      </Input.Group>
    );
  }
}
