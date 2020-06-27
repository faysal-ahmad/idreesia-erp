import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Row, Table } from '/imports/ui/controls';
import { PersonName } from '/imports/ui/modules/helpers/controls';

export default class KarkunList extends Component {
  static propTypes = {
    attendanceByMonth: PropTypes.array,
  };

  nameColumn = {
    title: 'Name',
    key: 'name',
    render: (text, record) => (
      <PersonName person={record.karkun} showLargeImage />
    ),
  };

  cnicColumn = {
    title: 'CNIC Number',
    dataIndex: 'karkun.cnicNumber',
    key: 'karkun.cnicNumber',
  };

  phoneNumberColumn = {
    title: 'Contact Number',
    key: 'contactNumber',
    render: (text, record) => {
      const numbers = [];
      const { karkun } = record;
      if (karkun.contactNumber1)
        numbers.push(<Row key="1">{karkun.contactNumber1}</Row>);
      if (karkun.contactNumber2)
        numbers.push(<Row key="2">{karkun.contactNumber2}</Row>);

      if (numbers.length === 0) return '';
      return <>{numbers}</>;
    },
  };

  dutiesColumn = {
    title: 'Duties',
    key: 'duties',
    render: (duties, record) => {
      const dutyNames = [];
      const { duty, shift, job } = record;
      if (duty) {
        const dutyName = shift ? `${duty.name} - ${shift.name}` : duty.name;
        dutyNames.push(<span key={`duty_${record._id}`}>{dutyName}</span>);
      }

      if (job) {
        dutyNames.push(<span key={`job_${record._id}`}>{job.name}</span>);
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
    const attendanceByMonth = this.props.attendanceByMonth.slice();

    let index = 0;
    const lists = [];
    while (attendanceByMonth.length > 0) {
      const attendanceForPage = attendanceByMonth.splice(0, 10);
      lists.push(
        <Table
          rowKey="_id"
          key={`list_${index}`}
          dataSource={attendanceForPage}
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
