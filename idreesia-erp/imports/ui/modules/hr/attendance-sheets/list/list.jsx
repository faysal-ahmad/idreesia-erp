import React, { Component } from "react";
import PropTypes from "prop-types";
import { Button, DatePicker, Select, Table } from "antd";
import { compose } from "react-apollo";

import { WithKarkunsByDuty } from "/imports/ui/modules/hr/common/composers";

const ToolbarStyle = {
  display: "flex",
  flexFlow: "row nowrap",
  justifyContent: "space-between",
  width: "100%",
};

const ToolbarSectionStyle = {
  display: "flex",
  flexFlow: "row nowrap",
  justifyContent: "left",
  width: "100%",
};

const SelectStyle = {
  width: "300px",
};

export class List extends Component {
  static propTypes = {
    dutyId: PropTypes.string,
    selectedMonth: PropTypes.object,
    allDuties: PropTypes.array,

    karkunsByDutyId: PropTypes.array,
    karkunsLoading: PropTypes.bool,
    setPageParams: PropTypes.func,
    handleUploadAttendanceSheet: PropTypes.func,
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
    {
      title: "Present",
      dataIndex: "present",
      key: "present",
    },
    {
      title: "Absent",
      dataIndex: "absent",
      key: "absent",
    },
    {
      title: "Percentage",
      dataIndex: "percentage",
      key: "percentage",
    },
  ];

  handleMonthChange = value => {
    const { setPageParams } = this.props;
    setPageParams({
      selectedMonth: value,
    });
  };

  handleMonthGoBack = () => {
    const { selectedMonth, setPageParams } = this.props;
    setPageParams({
      selectedMonth: selectedMonth.clone().subtract(1, "months"),
    });
  };

  handleMonthGoForward = () => {
    const { selectedMonth, setPageParams } = this.props;
    setPageParams({
      selectedMonth: selectedMonth.clone().add(1, "months"),
    });
  };

  getDutySelector = () => {
    const { dutyId, allDuties } = this.props;

    let options = [];
    if (allDuties) {
      options = allDuties.map(duty => (
        <Select.Option key={duty._id} value={duty._id}>
          {duty.name}
        </Select.Option>
      ));
    }

    return (
      <Select
        type="default"
        style={SelectStyle}
        onClick={this.handleDutySelectionChange}
        defaultValue={dutyId}
        onChange={this.handleSizeChange}
      >
        {options}
      </Select>
    );
  };

  getTableHeader = () => {
    const { selectedMonth, handleUploadAttendanceSheet } = this.props;
    return (
      <div style={ToolbarStyle}>
        <div style={ToolbarSectionStyle}>
          {this.getDutySelector()}
          &nbsp;&nbsp;
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
        <div>
          <Button
            type="primary"
            icon="upload"
            onClick={handleUploadAttendanceSheet}
          >
            Upload Attendance Sheet
          </Button>
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

export default compose(WithKarkunsByDuty())(List);
