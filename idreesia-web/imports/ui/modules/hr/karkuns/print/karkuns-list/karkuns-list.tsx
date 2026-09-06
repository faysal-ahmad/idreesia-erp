import React, { Component } from 'react';

import { Row, Table } from 'antd';
import type { HrKarkunsByIdQuery } from 'meteor/idreesia-common/types/client-operations';
import { PersonName } from '/imports/ui/modules/helpers/controls';

type KarkunRow = NonNullable<
  NonNullable<HrKarkunsByIdQuery['hrKarkunsById']>[number]
>;
type KarkunDuty = NonNullable<
  NonNullable<NonNullable<KarkunRow['karkunData']>['duties']>[number]
>;

interface Props {
  karkuns?: Array<KarkunRow | null> | null;
}

export default class KarkunsList extends Component<Props> {
  nameColumn = {
    title: 'Name',
    dataIndex: ['sharedData', 'name'],
    key: 'name',
    render: (_text: unknown, record: KarkunRow) => (
      <PersonName
        person={
          record._id && record.sharedData?.name
            ? {
                _id: record._id,
                name: record.sharedData.name,
                imageId: record.sharedData.imageId ?? undefined,
                image: record.sharedData.image?.data
                  ? { data: record.sharedData.image.data ?? undefined }
                  : undefined,
                imageThumbnail: record.sharedData.imageThumbnail?.data
                  ? { data: record.sharedData.imageThumbnail.data ?? undefined }
                  : undefined,
              }
            : null
        }
        showLargeImage
      />
    ),
  };

  cnicColumn = {
    title: 'CNIC Number',
    dataIndex: ['sharedData', 'cnicNumber'],
    key: 'cnicNumber',
  };

  phoneNumberColumn = {
    title: 'Contact Number',
    key: 'contactNumber',
    render: (_text: unknown, record: KarkunRow) => {
      const numbers: React.ReactNode[] = [];
      const { contactNumber1, contactNumber2 } = record.sharedData ?? {};
      if (contactNumber1) numbers.push(<Row key="1">{contactNumber1}</Row>);
      if (contactNumber2) numbers.push(<Row key="2">{contactNumber2}</Row>);

      if (numbers.length === 0) return '';
      return <>{numbers}</>;
    },
  };

  dutiesColumn = {
    title: 'Duties',
    dataIndex: ['karkunData', 'duties'],
    key: 'duties',
    render: (duties: KarkunDuty[] | null | undefined, record: KarkunRow) => {
      const normalizedDuties = (duties ?? []).filter(
        (duty): duty is KarkunDuty => duty != null
      );
      let dutyNames: React.ReactNode[] = [];

      if (normalizedDuties.length > 0) {
        dutyNames = normalizedDuties.map((duty, index) => {
          let dutyName = duty.dutyName;
          if (duty.shiftName) {
            dutyName = `${dutyName} - ${duty.shiftName}`;
          }

          return <span key={index}>{dutyName}</span>;
        });
      }

      const job = record.employeeData?.job;
      if (job) {
        dutyNames = ([<span key="job">{job.name}</span>] as React.ReactNode[]).concat(
          dutyNames
        );
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

  getColumns = () => {
    const columns: any[] = [
      this.nameColumn,
      this.cnicColumn,
      this.phoneNumberColumn,
      this.dutiesColumn,
    ];

    return columns;
  };

  render() {
    const allKarkuns = (this.props.karkuns ?? [])
      .filter((karkun): karkun is KarkunRow => karkun != null)
      .slice();

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
