import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

import { Formats } from 'meteor/idreesia-common/constants';
import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { Table } from '/imports/ui/controls';

class AttendanceSheets extends Component {
  static propTypes = {
    match: PropTypes.object,
    history: PropTypes.object,
    location: PropTypes.object,

    loading: PropTypes.bool,
    attendanceByKarkun: PropTypes.array,
  };

  columns = [
    {
      title: 'Month',
      dataIndex: 'month',
      key: 'month',
      render: text => {
        const date = moment(`01-${text}`, Formats.DATE_FORMAT);
        return date.format('MMM, YYYY');
      },
    },
    {
      title: 'Job / Duty / Shift',
      key: 'shift.name',
      render: (text, record) => {
        let name;
        if (record.job) {
          name = record.job.name;
        } else if (record.duty) {
          name = record.duty.name;
          if (record.shift) {
            name = `${name} - ${record.shift.name}`;
          }
        }

        return name;
      },
    },
    {
      title: 'Present',
      dataIndex: 'presentCount',
      key: 'presentCount',
    },
    {
      title: 'Absent',
      dataIndex: 'absentCount',
      key: 'absentCount',
    },
    {
      title: 'Percentage',
      dataIndex: 'percentage',
      key: 'percentage',
      render: text => `${text}%`,
    },
  ];

  render() {
    const { attendanceByKarkun, loading } = this.props;
    if (loading) return null;
    debugger;

    return (
      <Table
        rowKey="_id"
        size="small"
        columns={this.columns}
        dataSource={attendanceByKarkun}
        pagination={false}
        bordered
      />
    );
  }
}

const listQuery = gql`
  query attendanceByKarkun($karkunId: String!) {
    attendanceByKarkun(karkunId: $karkunId) {
      _id
      dutyId
      shiftId
      jobId
      month
      absentCount
      presentCount
      percentage
      job {
        _id
        name
      }
      duty {
        _id
        name
      }
      shift {
        _id
        name
      }
    }
  }
`;

export default flowRight(
  graphql(listQuery, {
    props: ({ data }) => ({ ...data }),
    options: ({ match }) => {
      const { karkunId } = match.params;
      return { variables: { karkunId } };
    },
  })
)(AttendanceSheets);
