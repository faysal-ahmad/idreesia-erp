import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Row, Table } from 'antd';
import { PersonName } from '/imports/ui/modules/helpers/controls';

const AntRow = Row as any;
const AntTable = Table as any;
const PersonNameComponent = PersonName as any;

interface SharedData {
  name?: string;
  imageId?: string;
  image?: unknown;
  cnicNumber?: string;
  contactNumber1?: string;
  contactNumber2?: string;
}

interface KarkunRecord {
  sharedData: SharedData;
  isKarkun?: boolean;
  karkunData?: { city?: { name?: string } };
  visitorData?: { city?: string };
}

interface MehfilKarkun {
  _id: string;
  karkun: KarkunRecord;
  duty?: { name?: string };
  dutyDetail?: string;
}

interface ListProps {
  karkuns?: MehfilKarkun[];
}

export class List extends Component<ListProps> {
  static propTypes = {
    karkuns: PropTypes.array,
  };

  nameColumn = {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    render: (_text: unknown, record: MehfilKarkun) => {
      const personNameData = {
        _id: record._id,
        name: record.karkun.sharedData.name,
        imageId: record.karkun.sharedData.imageId,
        image: record.karkun.sharedData.image,
      };

      return (
        <PersonNameComponent
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
      if (record.karkun.isKarkun && record.karkun.karkunData?.city) {
        return record.karkun.karkunData.city.name;
      } else if (record.karkun.visitorData?.city) {
        return record.karkun.visitorData?.city;
      }

      return '';
    },
  };

  cnicColumn = {
    title: 'CNIC Number',
    key: 'cnicNumber',
    render: (_text: unknown, record: MehfilKarkun) => record.karkun.sharedData?.cnicNumber,
  };

  phoneNumberColumn = {
    title: 'Contact No.',
    key: 'contactNumbers',
    render: (_text: unknown, record: MehfilKarkun) => {
      const numbers: React.ReactNode[] = [];
      if (record.karkun.sharedData?.contactNumber1)
        numbers.push(<AntRow key="1">{record.karkun.sharedData?.contactNumber1}</AntRow>);
      if (record.karkun.sharedData.contactNumber2)
        numbers.push(<AntRow key="2">{record.karkun.sharedData?.contactNumber2}</AntRow>);

      if (numbers.length === 0) return '';
      return <>{numbers}</>;
    },
  };

  dutiesColumn = {
    title: 'Duty Details',
    key: 'dutyDetails',
    render: (_text: unknown, record: MehfilKarkun) => (
      <>
        <AntRow>{record.duty?.name}</AntRow>
        <AntRow>{record.dutyDetail}</AntRow>
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
        <AntTable
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
