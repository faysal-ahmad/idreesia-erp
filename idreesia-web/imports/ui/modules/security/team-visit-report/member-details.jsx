import React, { useState } from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';
import moment from 'moment';
import { WarningTwoTone } from '@ant-design/icons';

import { Pagination, Table } from 'antd';
import { VisitorName } from '/imports/ui/modules/security/common/controls';
import { Formats } from 'meteor/idreesia-common/constants';

import {
  DEFAULT_PAGE_INDEX_INT,
  DEFAULT_PAGE_SIZE_INT,
} from 'meteor/idreesia-common/constants/list-options';

const StatusStyle = {
  fontSize: 20,
};

const listQuery = gql`
  query pagedVisitorStays($queryString: String!) {
    pagedVisitorStays(queryString: $queryString) {
      totalResults
      data {
        _id
        visitorId
        dutyId
        shiftId
        stayReason
        dutyShiftName
        refVisitor {
          _id
          name
          imageId
          criminalRecord
          otherNotes
        }
      }
    }
  }
`;

const columns = [
  {
    title: '',
    key: 'status',
    render: (text, record) => {
      const { refVisitor } = record;
      if (refVisitor.criminalRecord) {
        return (
          <WarningTwoTone
            style={StatusStyle}
            twoToneColor="red"
          />
        );
      } else if (refVisitor.otherNotes) {
        return (
          <WarningTwoTone
            style={StatusStyle}
            twoToneColor="orange"
          />
        );
      }

      return null;
    },
  },
  {
    title: 'Name',
    dataIndex: 'refVisitor.name',
    key: 'refVisitor.name',
    render: (text, record) => (
      <VisitorName
        visitor={record.refVisitor}
        onVisitorNameClicked={() => {}}
      />
    ),
  },
  {
    title: 'Role',
    dataIndex: 'stayReason',
    key: 'stayReason',
    render: text => (text === 'team-visit-co' ? 'CO' : ''),
  },
  {
    title: 'Duty/Shift',
    dataIndex: 'dutyShiftName',
    key: 'dutyShiftName',
  },
];

const getQueryString = ({ teamName, visitDate, pageIndex, pageSize }) => {
  const mVisitDate = moment(Number(visitDate)).format(Formats.DATE_FORMAT);
  return `?startDate=${mVisitDate}&endDate=${mVisitDate}&teamName=${teamName}&pageIndex=${pageIndex}&pageSize=${pageSize}`;
};

const MemberDetails = ({ teamName, visitDate }) => {
  const [pageIndex, setPageIndex] = useState(DEFAULT_PAGE_INDEX_INT);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE_INT);
  const { data, loading } = useQuery(listQuery, {
    variables: {
      queryString: getQueryString({ teamName, visitDate, pageIndex, pageSize }),
    },
  });

  const onChange = (index, size) => {
    setPageIndex(index - 1);
    setPageSize(size);
  };

  const onShowSizeChange = (index, size) => {
    setPageIndex(index - 1);
    setPageSize(size);
  };

  if (loading) return null;
  const { pagedVisitorStays } = data;

  return (
    <Table
      rowKey="_id"
      dataSource={pagedVisitorStays.data}
      columns={columns}
      bordered
      size="small"
      pagination={false}
      footer={() => (
        <Pagination
          current={pageIndex + 1}
          pageSize={pageSize}
          showSizeChanger
          showTotal={(total, range) =>
            `${range[0]}-${range[1]} of ${total} items`
          }
          onChange={onChange}
          onShowSizeChange={onShowSizeChange}
          total={pagedVisitorStays.totalResults}
        />
      )}
    />
  );
};

MemberDetails.propTypes = {
  teamName: PropTypes.string,
  visitDate: PropTypes.string,
};

export default MemberDetails;
