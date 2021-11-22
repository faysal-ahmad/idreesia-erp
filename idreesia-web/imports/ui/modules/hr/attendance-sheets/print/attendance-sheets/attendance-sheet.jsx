import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Row, Table } from 'antd';
import { PersonName } from '/imports/ui/modules/helpers/controls';
import { filter, sortBy } from 'meteor/idreesia-common/utilities/lodash';

const HeadingContainerStyle = {
  display: 'flex',
  flexFlow: 'row wrap',
  justifyContent: 'center',
  fontWeight: 'bold',
};

export default class AttendanceSheet extends Component {
  static propTypes = {
    month: PropTypes.string,
    attendanceByMonth: PropTypes.array,
  };

  nameColumn = {
    title: 'Name',
    dataIndex: 'karkun.name',
    key: 'karkun.name',
    render: (text, record) => <PersonName person={record.karkun} />,
  };

  phoneNumberColumn = {
    title: 'Contact Number',
    key: 'contactNumber',
    render: (text, record) => {
      const numbers = [];
      const karkun = record.karkun;
      if (karkun.contactNumber1)
        numbers.push(<Row key="1">{karkun.contactNumber1}</Row>);
      if (karkun.contactNumber2)
        numbers.push(<Row key="2">{karkun.contactNumber2}</Row>);

      if (numbers.length === 0) return '';
      return <>{numbers}</>;
    },
  };

  dutiesColumn = {
    title: 'Duties',
    key: 'duties',
    render: (text, record) => {
      let name;
      if (record.job) {
        name = record.job.name;
      } else {
        name = record.duty.name;
        if (record.shift) {
          name = `${name} - ${record.shift.name}`;
        }
      }

      return name;
    },
  };

  percentageColumn = {
    title: 'Attendance %',
    dataIndex: 'percentage',
    key: 'percentage',
    render: text => `${text}%`,
  };

  getColumns = () => {
    const columns = [
      this.nameColumn,
      this.phoneNumberColumn,
      this.dutiesColumn,
      this.percentageColumn,
    ];

    return columns;
  };

  render() {
    const { month, attendanceByMonth } = this.props;
    const filterAttendanceByMonth = filter(attendanceByMonth, attendance => !!attendance.karkun)
    const sortedAttendanceByMonth = sortBy(filterAttendanceByMonth, 'karkun.name');

    let index = 0;
    const lists = [];
    while (sortedAttendanceByMonth.length > 0) {
      const attendanceForPage = sortedAttendanceByMonth.splice(0, 15);
      lists.push(
        <>
        <div style={HeadingContainerStyle}>Attendance for Month: {month}</div>
        <Table
          rowKey="_id"
          key={`list_${index}`}
          dataSource={attendanceForPage}
          columns={this.getColumns()}
          bordered
          size="small"
          pagination={false}
          style={{ padding: '20px' }}
        />
        </>
      );

      lists.push(<div key={`pagebreak_${index}`} className="pagebreak" />);
      index++;
    }

    return <div>{lists}</div>;
  }
}
