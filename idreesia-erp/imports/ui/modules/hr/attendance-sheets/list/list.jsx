import React, { Component } from "react";
import PropTypes from "prop-types";
import {
  Avatar,
  Button,
  Cascader,
  DatePicker,
  Dropdown,
  Icon,
  Menu,
  Table,
} from "antd";
import gql from "graphql-tag";
import { compose, graphql } from "react-apollo";
import { filter } from "lodash";

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

const CascaderStyle = {
  width: "300px",
};

const NameDivStyle = {
  display: "flex",
  flexFlow: "row nowrap",
  justifyContent: "flex-start",
  alignItems: "center",
  width: "100%",
};

export class List extends Component {
  static propTypes = {
    selectedMonth: PropTypes.object,
    selectedDutyId: PropTypes.string,
    selectedShiftId: PropTypes.string,
    allDuties: PropTypes.array,
    allDutyShifts: PropTypes.array,

    attendanceByMonth: PropTypes.array,
    attendanceLoading: PropTypes.bool,
    setPageParams: PropTypes.func,
    handleUploadAttendanceSheet: PropTypes.func,
    handleViewCards: PropTypes.func,
    handleDeleteAttendance: PropTypes.func,
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

  handleDutyShiftSelectionChange = value => {
    const { setPageParams } = this.props;
    setPageParams({
      selectedDutyId: value[0],
      selectedShiftId: value[1],
    });
  };

  handleViewCards = () => {
    const { handleViewCards } = this.props;
    const { selectedRows } = this.state;
    if (handleViewCards) {
      handleViewCards(selectedRows);
    }
  };

  handleDeleteAttendance = () => {
    const { handleDeleteAttendance } = this.props;
    const { selectedRows } = this.state;
    if (handleDeleteAttendance) {
      handleDeleteAttendance(selectedRows);
    }
  };

  getDutyShiftSelector = () => {
    const {
      selectedDutyId,
      selectedShiftId,
      allDuties,
      allDutyShifts,
    } = this.props;
    const data = allDuties.map(duty => {
      const dutyShifts = filter(
        allDutyShifts,
        dutyShift => dutyShift.dutyId === duty._id
      );
      const dataItem = {
        label: duty.name,
        value: duty._id,
        children: dutyShifts.map(dutyShift => ({
          value: dutyShift._id,
          label: dutyShift.name,
        })),
      };

      return dataItem;
    });

    return (
      <Cascader
        style={CascaderStyle}
        onChange={this.handleDutyShiftSelectionChange}
        defaultValue={[selectedDutyId, selectedShiftId]}
        options={data}
        changeOnSelect
      />
    );
  };

  getActionsMenu = () => {
    const { handleUploadAttendanceSheet } = this.props;
    const menu = (
      <Menu>
        <Menu.Item key="1" onClick={handleUploadAttendanceSheet}>
          <Icon type="upload" />
          Upload Attendance
        </Menu.Item>
        <Menu.Item key="2" onClick={this.handleViewCards}>
          <Icon type="idcard" />
          Print Duty Cards
        </Menu.Item>
        <Menu.Item key="3" onClick={this.handleDeleteAttendance}>
          <Icon type="delete" />
          Delete Attendance
        </Menu.Item>
      </Menu>
    );

    return (
      <Dropdown overlay={menu}>
        <Button icon="setting">Actions</Button>
      </Dropdown>
    );
  };

  getTableHeader = () => {
    const { selectedMonth } = this.props;
    return (
      <div style={ToolbarStyle}>
        <div style={ToolbarSectionStyle}>
          {this.getDutyShiftSelector()}
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
        <div>{this.getActionsMenu()}</div>
      </div>
    );
  };

  render() {
    const { attendanceByMonth } = this.props;

    return (
      <Table
        rowKey="_id"
        size="small"
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
    options: ({ selectedMonth, selectedDutyId, selectedShiftId }) => ({
      variables: {
        month: selectedMonth.format(Formats.DATE_FORMAT),
        dutyId: selectedDutyId,
        shiftId: selectedShiftId,
      },
    }),
  })
)(List);
