import React, { Component, type CSSProperties } from 'react';

import { Row, Table } from 'antd';
import { PersonName } from '/imports/ui/modules/helpers/controls';

import type { SheetRow } from '../use-sheet-rows';

interface AttendanceSheetProps {
  month?: string;
  rows?: SheetRow[];
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
    key: 'name',
    render: (_text: unknown, record: SheetRow) => {
      const sharedData = record.karkun?.sharedData;
      return (
        <PersonName
          person={{
            _id: record.karkunId,
            name: sharedData?.name ?? record.name ?? '',
            imageId: sharedData?.imageId ?? undefined,
            imageThumbnailId: sharedData?.imageThumbnailId ?? undefined,
          }}
        />
      );
    },
  };

  phoneNumberColumn = {
    title: 'Contact Number',
    key: 'contactNumber',
    render: (_text: unknown, record: SheetRow) => {
      const numbers = [];
      const sharedData = record.karkun?.sharedData;
      if (!sharedData) return '';
      if (sharedData.contactNumber1)
        numbers.push(<Row key="1">{sharedData.contactNumber1}</Row>);

      if (numbers.length === 0) return '';
      return <>{numbers}</>;
    },
  };

  dutiesColumn = {
    title: 'Duties',
    key: 'duties',
    render: (_text: unknown, record: SheetRow) =>
      [record.duty?.name, record.location?.name, record.shiftName]
        .filter(Boolean)
        .join(' – '),
  };

  percentageColumn = {
    title: 'Attendance %',
    dataIndex: 'percentage',
    key: 'percentage',
    render: (text: number | null) => `${text ?? 0}%`,
  };

  getColumns = () => [
    this.nameColumn,
    this.phoneNumberColumn,
    this.dutiesColumn,
    this.percentageColumn,
  ];

  render() {
    const { month, rows } = this.props;
    // Rows arrive sorted by name from the server.
    const pages = [...(rows ?? [])];

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
