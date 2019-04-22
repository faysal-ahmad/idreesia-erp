import React, { Component } from "react";
import PropTypes from "prop-types";
import { Button, DatePicker, Table } from "antd";
import { compose } from "react-apollo";

import { WithKarkunsByDuty } from "/imports/ui/modules/hr/common/composers";

const ToolbarStyle = {
  display: "flex",
  flexFlow: "row nowrap",
  justifyContent: "space-between",
  width: "100%",
};

export class AttendanceSheet extends Component {
  static propTypes = {
    dutyId: PropTypes.string,
    selectedMonth: PropTypes.object,
    karkunsLoading: PropTypes.bool,
    karkunsByDutyId: PropTypes.array,
    setSelectedMonth: PropTypes.func,
  };

  columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "CNIC Number",
      dataIndex: "cnicNumber",
      key: "cnicNumber",
    },
  ];

  handleMonthChange = value => {
    const { setSelectedMonth } = this.props;
    setSelectedMonth(value);
  };

  handleMonthGoBack = () => {
    const { setSelectedMonth, selectedMonth } = this.props;
    setSelectedMonth(selectedMonth.clone().subtract(1, "months"));
  };

  handleMonthGoForward = () => {
    const { setSelectedMonth, selectedMonth } = this.props;
    setSelectedMonth(selectedMonth.clone().add(1, "months"));
  };

  getTableHeader = () => {
    const { selectedMonth } = this.props;
    return (
      <div style={ToolbarStyle}>
        <div>
          <Button
            type="primary"
            shape="circle"
            icon="left"
            onClick={this.handleMonthGoBack}
          />
          &nbsp;&nbsp;
          <DatePicker.MonthPicker
            allowClear={false}
            format="MMM, YYYY"
            onChange={this.handleMonthChange}
            value={selectedMonth}
          />
          &nbsp;&nbsp;
          <Button
            type="primary"
            shape="circle"
            icon="right"
            onClick={this.handleMonthGoForward}
          />
        </div>
      </div>
    );
  };

  render() {
    const { karkunsByDutyId } = this.props;

    return (
      <Table
        rowKey="_id"
        title={this.getTableHeader}
        columns={this.columns}
        dataSource={karkunsByDutyId}
        pagination={false}
        bordered
      />
    );
  }
}

export default compose(WithKarkunsByDuty())(AttendanceSheet);
