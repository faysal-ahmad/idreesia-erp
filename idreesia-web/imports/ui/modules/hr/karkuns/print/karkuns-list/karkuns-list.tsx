import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Row, Table } from 'antd';
import { PersonName } from '/imports/ui/modules/helpers/controls';

const AntRow = Row as any;
const AntTable = Table as any;
const PersonNameControl = PersonName as any;
type AnyRecord = Record<string, any>;
interface Props { karkuns?: AnyRecord[]; }

export default class KarkunsList extends Component<Props> {
  static propTypes = {
    karkuns: PropTypes.array,
  };

  nameColumn = {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    render: (_text: unknown, record: AnyRecord) => <PersonNameControl person={record} showLargeImage />,
  };

  cnicColumn = {
    title: 'CNIC Number',
    dataIndex: 'cnicNumber',
    key: 'cnicNumber',
  };

  phoneNumberColumn = {
    title: 'Contact Number',
    key: 'contactNumber',
    render: (_text: unknown, record: AnyRecord) => {
      const numbers: React.ReactNode[] = [];
      if (record.contactNumber1)
        numbers.push(<AntRow key="1">{record.contactNumber1}</AntRow>);
      if (record.contactNumber2)
        numbers.push(<AntRow key="2">{record.contactNumber2}</AntRow>);

      if (numbers.length === 0) return '';
      return <>{numbers}</>;
    },
  };

  dutiesColumn = {
    title: 'Duties',
    dataIndex: 'duties',
    key: 'duties',
    render: (duties: AnyRecord[] | undefined, record: AnyRecord) => {
      const normalizedDuties = duties ?? [];
      let dutyNames: React.ReactNode[] = [];

      if (normalizedDuties.length > 0) {
        dutyNames = normalizedDuties.map((duty: AnyRecord) => {
          let dutyName = duty.dutyName;
          if (duty.shiftName) {
            dutyName = `${dutyName} - ${duty.shiftName}`;
          }

          return <span>{dutyName}</span>;
        });
      }

      if (record.job) {
        dutyNames = ([<span>{record.job.name}</span>] as React.ReactNode[]).concat(dutyNames);
      }

      if (dutyNames.length === 0) {
        return null;
      } else if (dutyNames.length === 1) {
        return dutyNames[0];
      }
      return (
        <>
          {dutyNames.map((dutyName, index) => (
            <AntRow key={index}>{dutyName}</AntRow>
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
    const allKarkuns = (this.props.karkuns ?? []).slice();

    let index = 0;
    const lists = [];
    while (allKarkuns.length > 0) {
      const karkunsForPage = allKarkuns.splice(0, 10);
      lists.push(
        <AntTable
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
