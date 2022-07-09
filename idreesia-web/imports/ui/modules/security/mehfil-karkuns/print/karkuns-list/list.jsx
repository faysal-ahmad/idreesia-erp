import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Row, Table } from 'antd';
import { PersonName } from '/imports/ui/modules/helpers/controls';

export class List extends Component {
  static propTypes = {
    karkuns: PropTypes.array,
  };

  nameColumn = {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    render: (text, record) => {
      const personNameData = {
        _id: record._id,
        name: record.karkun.sharedData.name,
        imageId: record.karkun.sharedData.imageId,
        image: record.karkun.sharedData.image,
      };

      return (
        <PersonName
          person={personNameData}
          onPersonNameClicked={() => {}}
        />
      );
    },
  };

  cnicColumn = {
    title: 'CNIC Number',
    key: 'cnicNumber',
    render: (text, record) => record.karkun.sharedData?.cnicNumber,
  };

  phoneNumberColumn = {
    title: 'Contact No.',
    key: 'contactNumbers',
    render: (text, record) => {
      const numbers = [];
      if (record.karkun.sharedData?.contactNumber1)
        numbers.push(<Row key="1">{record.karkun.sharedData?.contactNumber1}</Row>);
      if (record.karkun.sharedData.contactNumber2)
        numbers.push(<Row key="2">{record.karkun.sharedData?.contactNumber2}</Row>);

      if (numbers.length === 0) return '';
      return <>{numbers}</>;
    },
  };

  dutiesColumn = {
    title: 'Duty Name',
    key: 'dutyName',
    render: (text, record) => (
      <>
        <Row>{record.duty.name}</Row>
        <Row>{record.dutyDetail}</Row>
      </>
    ),
  };

  getColumns = () => {
    const columns = [
      this.nameColumn,
      this.cnicColumn,
      this.phoneNumberColumn,
      this.dutiesColumn,
    ];

    return columns;
  };

  render() {
    const allKarkuns = this.props.karkuns.slice();

    let index = 0;
    const lists = [];
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
