import React, { Component } from "react";
import PropTypes from "prop-types";
import { Avatar, Button, DatePicker, Select, Table } from "antd";
import gql from "graphql-tag";
import { compose, graphql } from "react-apollo";

import { Formats } from "meteor/idreesia-common/constants";

const ToolbarStyle = {
  display: "flex",
  flexFlow: "row nowrap",
  justifyContent: "space-between",
  alignItems: "center",
  width: "100%",
};

const ToolbarSectionStyle = {
  display: "flex",
  flexFlow: "row nowrap",
  justifyContent: "left",
};

const SelectStyle = {
  width: "300px",
};

const NameDivStyle = {
  display: "flex",
  flexFlow: "row nowrap",
  justifyContent: "flex-start",
  alignItems: "center",
  width: "100%",
  cursor: "pointer",
};

export class List extends Component {
  static propTypes = {
    selectedMonth: PropTypes.object,
    selectedDutyId: PropTypes.string,
    allDuties: PropTypes.array,

    attendanceByMonth: PropTypes.array,
    attendanceLoading: PropTypes.bool,
    setPageParams: PropTypes.func,
    handleUploadAttendanceSheet: PropTypes.func,
    handleViewCards: PropTypes.func,
  };

  state = {
    selectedRows: [],
  };

  columns = [
    {
      title: "Name",
      dataIndex: "karkun.name",
      key: "karkun.name",
      render: (text, record) => {
        if (record.karkun.imageId) {
          const url = Meteor.absoluteUrl(
            `download-file?attachmentId=${record.karkun.imageId}`
          );
          return (
            <div style={NameDivStyle}>
              <Avatar shape="square" size="large" src={url} />
              &nbsp;&nbsp;
              {text}
            </div>
          );
        }

        return (
          <div style={NameDivStyle}>
            <Avatar shape="square" size="large" icon="picture" />
            &nbsp;&nbsp;
            {text}
          </div>
        );
      },
    },
    {
      title: "Shift Name",
      dataIndex: "shift.name",
      key: "shift.name",
    },
    {
      title: "Present",
      dataIndex: "presentCount",
      key: "presentCount",
    },
    {
      title: "Absent",
      dataIndex: "absentCount",
      key: "absentCount",
    },
    {
      title: "Percentage",
      dataIndex: "percentage",
      key: "percentage",
      render: text => `${text}%`,
    },
  ];

  rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      this.setState({
        selectedRows,
      });
    },
  };

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

  handleDutySelectionChange = value => {
    const { setPageParams } = this.props;
    setPageParams({
      selectedDutyId: value,
    });
  };

  handleShiftSelectionChange = value => {
    const { setPageParams } = this.props;
    setPageParams({
      selectedShiftId: value,
    });
  };

  handleViewCards = () => {
    const { handleViewCards } = this.props;
    const { selectedRows } = this.state;
    if (handleViewCards) {
      handleViewCards(selectedRows);
    }
  };

  getDutySelector = () => {
    const { selectedDutyId, allDuties } = this.props;

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
        onChange={this.handleDutySelectionChange}
        defaultValue={selectedDutyId}
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
        <div>
          <Button
            type="primary"
            icon="upload"
            onClick={handleUploadAttendanceSheet}
          >
            Upload Attendance
          </Button>
          &nbsp;
          <Button type="primary" icon="idcard" onClick={this.handleViewCards}>
            Duty Cards
          </Button>
        </div>
      </div>
    );
  };

  render() {
    const { attendanceByMonth } = this.props;

    return (
      <Table
        rowKey="_id"
        title={this.getTableHeader}
        columns={this.columns}
        rowSelection={this.rowSelection}
        dataSource={attendanceByMonth}
        pagination={false}
        bordered
      />
    );
  }
}

const attendanceByMonthQuery = gql`
  query attendanceByMonth($month: String!, $dutyId: String) {
    attendanceByMonth(month: $month, dutyId: $dutyId) {
      _id
      karkunId
      month
      dutyId
      shiftId
      absentCount
      presentCount
      percentage
      meetingCardBarcodeId
      karkun {
        _id
        name
        imageId
      }
      shift {
        _id
        name
      }
    }
  }
`;

export default compose(
  graphql(attendanceByMonthQuery, {
    props: ({ data }) => ({ attendanceLoading: data.loading, ...data }),
    options: ({ selectedMonth, selectedDutyId }) => ({
      variables: {
        month: selectedMonth.format(Formats.DATE_FORMAT),
        dutyId: selectedDutyId,
      },
    }),
  })
)(List);
