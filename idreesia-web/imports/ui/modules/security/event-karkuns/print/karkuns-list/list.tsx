import React, { Component } from 'react';
import { Row, Table } from 'antd';
import type { SecurityEventKarkunsByIdsQuery } from 'meteor/idreesia-common/types/client-operations';
import { PersonName } from '/imports/ui/modules/helpers/controls';

type EventKarkun = NonNullable<
  NonNullable<SecurityEventKarkunsByIdsQuery['securityEventKarkunsByIds']>[number]
>;

interface ListProps {
  karkuns?: EventKarkun[];
}

export class List extends Component<ListProps> {
  nameColumn = {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    render: (_text: unknown, record: EventKarkun) => {
      const personNameData = {
        _id: record._id ?? '',
        name: record.karkun?.sharedData?.name ?? '',
        imageUrl: record.karkun?.sharedData?.imageUrl,
        imageThumbnailUrl: record.karkun?.sharedData?.imageThumbnailUrl,
      };

      return (
        <PersonName
          person={personNameData}
          plainImage
          onPersonNameClicked={() => {}}
        />
      );
    },
  };

  cityColumn = {
    title: 'City',
    key: 'cityCountry',
    render: (_text: unknown, record: EventKarkun) => {
      if (record.karkun?.isKarkun && record.karkun.karkunData?.cityLocation) {
        return record.karkun.karkunData.cityLocation.name;
      } else if (record.karkun?.visitorData?.city) {
        return record.karkun.visitorData.city;
      }

      return '';
    },
  };

  cnicColumn = {
    title: 'CNIC Number',
    key: 'cnicNumber',
    render: (_text: unknown, record: EventKarkun) => record.karkun?.sharedData?.cnicNumber,
  };

  phoneNumberColumn = {
    title: 'Contact No.',
    key: 'contactNumbers',
    render: (_text: unknown, record: EventKarkun) => {
      const numbers: React.ReactNode[] = [];
      if (record.karkun?.sharedData?.contactNumber1)
        numbers.push(<Row key="1">{record.karkun.sharedData.contactNumber1}</Row>);
      if (record.karkun?.sharedData?.contactNumber2)
        numbers.push(<Row key="2">{record.karkun.sharedData.contactNumber2}</Row>);

      if (numbers.length === 0) return '';
      return <>{numbers}</>;
    },
  };

  dutiesColumn = {
    title: 'Duty Details',
    key: 'dutyDetails',
    render: (_text: unknown, record: EventKarkun) => (
      <>
        <Row>{record.duty?.name}</Row>
        <Row>{record.dutyDetail}</Row>
      </>
    ),
  };

  getColumns = () => {
    const columns = [
      this.nameColumn,
      this.cnicColumn,
      this.cityColumn,
      this.phoneNumberColumn,
      this.dutiesColumn,
    ];

    return columns;
  };

  render() {
    const allKarkuns = (this.props.karkuns ?? []).slice();

    let index = 0;
    const lists: React.ReactNode[] = [];
    while (allKarkuns.length > 0) {
      const karkunsForPage = allKarkuns.splice(0, 10);
      lists.push(
        <Table
          rowKey="_id"
          key={`list_${index}`}
          dataSource={karkunsForPage}
          columns={this.getColumns()}
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
