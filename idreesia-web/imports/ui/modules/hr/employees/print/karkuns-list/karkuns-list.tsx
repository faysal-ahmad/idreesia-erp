import React, { Component } from 'react';
import { Row, Table } from 'antd';

import type { HrKarkunsByIdQuery } from 'meteor/idreesia-common/types/client-operations';
import { PersonName } from '/imports/ui/modules/helpers/controls';

type HrKarkunRow = NonNullable<
  NonNullable<HrKarkunsByIdQuery['hrKarkunsById']>[number]
>;
type HrKarkunDuty = NonNullable<
  NonNullable<NonNullable<HrKarkunRow['karkunData']>['duties']>[number]
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
            imageId: record.sharedData.imageId ?? undefined,
            image: record.sharedData.image?.data
              ? { data: record.sharedData.image.data ?? undefined }
              : undefined,
          }}
          showLargeImage
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

  dutiesColumn = {
    title: 'Duties',
    dataIndex: ['karkunData', 'duties'],
    key: 'duties',
    render: (duties: HrKarkunDuty[] | null | undefined, record: HrKarkunRow) => {
      const normalizedDuties = (duties ?? []).filter(
        (duty): duty is HrKarkunDuty => duty != null
      );
      let dutyNames: React.ReactNode[] = [];

      if (normalizedDuties.length > 0) {
        dutyNames = normalizedDuties.map((duty, index) => {
          let dutyName = duty.dutyName ?? '';
          if (duty.shiftName) {
            dutyName = `${dutyName} - ${duty.shiftName}`;
          }

          return <span key={index}>{dutyName}</span>;
        });
      }

      const job = record.employeeData?.job;
      if (job?.name) {
        dutyNames = [
          <span key="job">{job.name}</span>,
          ...dutyNames,
        ];
      }

      if (dutyNames.length === 0) {
        return null;
      } else if (dutyNames.length === 1) {
        return dutyNames[0];
      }
      return (
        <>
          {dutyNames.map((dutyName, index) => (
            <Row key={index}>{dutyName}</Row>
          ))}
        </>
      );
    },
  };

  getColumns = () => [
    this.nameColumn,
    this.cnicColumn,
    this.phoneNumberColumn,
    this.dutiesColumn,
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
