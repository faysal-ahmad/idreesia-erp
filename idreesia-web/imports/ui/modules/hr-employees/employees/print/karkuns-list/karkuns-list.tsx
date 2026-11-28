import React, { Component } from 'react';
import { Row, Table } from 'antd';

import type { HrEmployeesByIdQuery } from 'meteor/idreesia-common/types/client-operations';
import { PersonName } from '/imports/ui/modules/helpers/controls';

import { jobText, shiftText, statusText } from '../employment-details';

type HrKarkunRow = NonNullable<
  NonNullable<HrEmployeesByIdQuery['hrEmployeesById']>[number]
>;

interface Props {
  karkuns?: HrKarkunRow[];
}

export default class KarkunsList extends Component<Props> {
  nameColumn = {
    title: 'Name',
    dataIndex: ['sharedData', 'name'],
    key: 'name',
    render: (_text: unknown, record: HrKarkunRow) => {
      if (!record._id || !record.sharedData?.name) return null;

      return (
        <PersonName
          person={{
            _id: record._id,
            name: record.sharedData.name,
            imageUrl: record.sharedData.imageUrl ?? undefined,
            imageThumbnailUrl: record.sharedData.imageThumbnailUrl ?? undefined,
          }}
          showLargeImage
          plainImage
        />
      );
    },
  };

  cnicColumn = {
    title: 'CNIC Number',
    dataIndex: ['sharedData', 'cnicNumber'],
    key: 'cnicNumber',
  };

  phoneNumberColumn = {
    title: 'Contact Number',
    key: 'contactNumber',
    render: (_text: unknown, record: HrKarkunRow) => {
      const numbers: React.ReactNode[] = [];
      const { contactNumber1, contactNumber2 } = record.sharedData ?? {};
      if (contactNumber1) {
        numbers.push(<Row key="1">{contactNumber1}</Row>);
      }
      if (contactNumber2) {
        numbers.push(<Row key="2">{contactNumber2}</Row>);
      }

      if (numbers.length === 0) return '';
      return <>{numbers}</>;
    },
  };

  jobColumn = {
    title: 'Job',
    key: 'job',
    render: (_text: unknown, record: HrKarkunRow) => jobText(record.employeeData),
  };

  shiftColumn = {
    title: 'Shift',
    key: 'jobShift',
    render: (_text: unknown, record: HrKarkunRow) => shiftText(record.employeeData),
  };

  statusColumn = {
    title: 'Status',
    key: 'employmentStatus',
    render: (_text: unknown, record: HrKarkunRow) => statusText(record.employeeData),
  };

  getColumns = () => [
    this.nameColumn,
    this.cnicColumn,
    this.phoneNumberColumn,
    this.jobColumn,
    this.shiftColumn,
    this.statusColumn,
  ];

  render() {
    const allKarkuns = (this.props.karkuns ?? []).slice();

    let index = 0;
    const lists = [];
    while (allKarkuns.length > 0) {
      const karkunsForPage = allKarkuns.splice(0, 10);
      lists.push(
        <Table
          rowKey="_id"
          key={`list_${index}`}
          dataSource={karkunsForPage}
          columns={this.getColumns() as any}
          bordered
          size="small"
          pagination={false}
          style={{ padding: '20px' }}
        />
      );

      lists.push(<div key={`pagebreak_${index}`} className="pagebreak" />);
      index++;
    }

    return <div>{lists}</div>;
  }
}
