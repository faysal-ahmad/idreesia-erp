import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Row, Table } from 'antd';
import { PersonName } from '/imports/ui/modules/helpers/controls';

export default class KarkunsList extends Component {
  static propTypes = {
    karkuns: PropTypes.array,
  };

  nameColumn = {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    render: (text, record) => <PersonName person={record} showLargeImage />,
  };

  cnicColumn = {
    title: 'CNIC Number',
    dataIndex: 'cnicNumber',
    key: 'cnicNumber',
  };

  phoneNumberColumn = {
    title: 'Contact Number',
    key: 'contactNumber',
    render: (text, record) => {
      const numbers = [];
      if (record.contactNumber1)
        numbers.push(<Row key="1">{record.contactNumber1}</Row>);
      if (record.contactNumber2)
        numbers.push(<Row key="2">{record.contactNumber2}</Row>);

      if (numbers.length === 0) return '';
      return <>{numbers}</>;
    },
  };

  dutiesColumn = {
    title: 'Duties',
    dataIndex: 'duties',
    key: 'duties',
    render: (duties, record) => {
      let dutyNames = [];

      if (duties.length > 0) {
        dutyNames = duties.map(duty => {
          let dutyName = duty.dutyName;
          if (duty.shiftName) {
            dutyName = `${dutyName} - ${duty.shiftName}`;
          }

          return <span>{dutyName}</span>;
        });
      }

      if (record.job) {
        dutyNames = [<span>{record.job.name}</span>].concat(dutyNames);
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
