import React, { Component, type CSSProperties } from 'react';

import { Row, Table } from 'antd';
import { PersonName } from '/imports/ui/modules/helpers/controls';
import { sortBy } from 'meteor/idreesia-common/utilities/lodash';
import type { AttendanceByMonthQuery } from 'meteor/idreesia-common/types/client-operations';

type AttendanceRow = NonNullable<
  NonNullable<AttendanceByMonthQuery['attendanceByMonth']>[number]
>;

type AttendanceListRow = AttendanceRow & { _id: string };

interface AttendanceSheetProps {
  month?: string;
  attendanceByMonth?: AttendanceRow[];
}

const HeadingContainerStyle: CSSProperties = {
  display: 'flex',
  flexFlow: 'row wrap',
  justifyContent: 'center',
  fontWeight: 'bold',
};

export default class AttendanceSheet extends Component<AttendanceSheetProps> {
  nameColumn = {
    title: 'Name',
    dataIndex: ['karkun', 'sharedData', 'name'],
    key: 'karkun.name',
    render: (_text: unknown, record: AttendanceListRow) => {
      const karkun = record.karkun;
      if (!karkun?._id || !karkun.sharedData?.name) return null;
      return (
        <PersonName
          person={{
            _id: karkun._id,
            name: karkun.sharedData.name,
            imageId: karkun.sharedData.imageId ?? undefined,
          }}
        />
      );
    },
  };

  phoneNumberColumn = {
    title: 'Contact Number',
    key: 'contactNumber',
    render: (_text: unknown, record: AttendanceListRow) => {
      const numbers = [];
      const sharedData = record.karkun?.sharedData;
      if (!sharedData) return '';
      if (sharedData.contactNumber1)
        numbers.push(<Row key="1">{sharedData.contactNumber1}</Row>);
      if (sharedData.contactNumber2)
        numbers.push(<Row key="2">{sharedData.contactNumber2}</Row>);

      if (numbers.length === 0) return '';
      return <>{numbers}</>;
    },
  };

  dutiesColumn = {
    title: 'Duties',
    key: 'duties',
    render: (_text: unknown, record: AttendanceListRow) => {
      if (record.job?.name) {
        return record.job.name;
      }
      let name = record.duty?.name ?? '';
      if (record.shift?.name) {
        name = `${name} - ${record.shift.name}`;
      }
      return name;
    },
  };

  percentageColumn = {
    title: 'Attendance %',
    dataIndex: 'percentage',
    key: 'percentage',
    render: (text: number | null) => `${text}%`,
  };

  getColumns = () => [
    this.nameColumn,
    this.phoneNumberColumn,
    this.dutiesColumn,
    this.percentageColumn,
  ];

  render() {
    const { month, attendanceByMonth } = this.props;
    const filterAttendanceByMonth = (attendanceByMonth ?? []).filter(
      (attendance): attendance is AttendanceListRow =>
        !!attendance?.karkun && !!attendance._id
    );
    const sortedAttendanceByMonth = sortBy(filterAttendanceByMonth, row => row.karkun?.sharedData?.name);
    const pages = [...sortedAttendanceByMonth];

    let index = 0;
    const lists = [];
    while (pages.length > 0) {
      const attendanceForPage = pages.splice(0, 15);
      lists.push(
        <React.Fragment key={`list_${index}`}>
          <div style={HeadingContainerStyle}>Attendance for Month: {month}</div>
          <Table
            rowKey="_id"
            dataSource={attendanceForPage}
            columns={this.getColumns()}
            bordered
            size="small"
            pagination={false}
            style={{ padding: '20px' }}
          />
        </React.Fragment>
      );

      lists.push(<div key={`pagebreak_${index}`} className="pagebreak" />);
      index++;
    }

    return <div>{lists}</div>;
  }
}
