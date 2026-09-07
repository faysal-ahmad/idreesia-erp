import React, { Component } from 'react';
import { Row, Table } from 'antd';
import type { MehfilKarkunsByIdsQuery } from 'meteor/idreesia-common/types/client-operations';
import { PersonName } from '/imports/ui/modules/helpers/controls';

type MehfilKarkun = NonNullable<
  NonNullable<MehfilKarkunsByIdsQuery['mehfilKarkunsByIds']>[number]
>;

interface ListProps {
  karkuns?: MehfilKarkun[];
}

export class List extends Component<ListProps> {
  nameColumn = {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    render: (_text: unknown, record: MehfilKarkun) => {
      const image = record.karkun?.sharedData?.image;
      const imageThumbnail = record.karkun?.sharedData?.imageThumbnail;
      const personNameData = {
        _id: record._id ?? '',
        name: record.karkun?.sharedData?.name ?? '',
        ...(image?.data ? { image: { data: image.data } } : {}),
        ...(imageThumbnail?.data
          ? { imageThumbnail: { data: imageThumbnail.data } }
          : {}),
      };

      return (
        <PersonName
          person={personNameData}
          onPersonNameClicked={() => {}}
        />
      );
    },
  };

  cityColumn = {
    title: 'City',
    key: 'cityCountry',
    render: (_text: unknown, record: MehfilKarkun) => {
      if (record.karkun?.isKarkun && record.karkun.karkunData?.city) {
        return record.karkun.karkunData.city.name;
      } else if (record.karkun?.visitorData?.city) {
        return record.karkun.visitorData.city;
      }

      return '';
    },
  };

  cnicColumn = {
    title: 'CNIC Number',
    key: 'cnicNumber',
    render: (_text: unknown, record: MehfilKarkun) => record.karkun?.sharedData?.cnicNumber,
  };

  phoneNumberColumn = {
    title: 'Contact No.',
    key: 'contactNumbers',
    render: (_text: unknown, record: MehfilKarkun) => {
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
    render: (_text: unknown, record: MehfilKarkun) => (
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
