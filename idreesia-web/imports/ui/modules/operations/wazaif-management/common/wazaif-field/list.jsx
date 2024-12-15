import React from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';

import { Formats } from 'meteor/idreesia-common/constants';
import { noop } from 'meteor/idreesia-common/utilities/lodash';
import {
  Pagination,
  Table,
} from 'antd';
import { WazeefaName } from '/imports/ui/modules/helpers/controls';

const List = ({
  listHeader,
  handleSelectItem,
  setPageParams,
  pageIndex,
  pageSize,
  pagedData,
}) => {
  const nameColumn = {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    render: (text, record) => (
      <WazeefaName
        wazeefa={record}
        onWazeefaNameClicked={handleSelectItem}
      />
    ),
  };

  const revisionNumberColumn = {
    title: 'Revision No.',
    dataIndex: 'revisionNumber',
    key: 'revisionNumber',
    width: 100,
  };

  const revisionDateColumn = {
    title: 'Revision Date',
    dataIndex: 'revisionDate',
    key: 'revisionDate',
    width: 150,
    render: text =>
      text ? dayjs(Number(text)).format(Formats.DATE_FORMAT) : '',
  };

  const columns = [
    nameColumn,
    revisionNumberColumn,
    revisionDateColumn,
  ];

  const onPaginationChange = (newPageIndex, newPageSize) => {
    setPageParams({
      pageIndex: newPageIndex - 1,
      pageSize: newPageSize,
    });
  };

  const { totalResults, data } = pagedData;
  const numPageIndex = pageIndex ? pageIndex + 1 : 1;
  const numPageSize = pageSize || 20;

  return (
    <>
      <Table
        rowKey="_id"
        dataSource={data}
        columns={columns}
        title={listHeader}
        rowSelection={null}
        bordered
        size="small"
        pagination={false}
        footer={() => (
          <Pagination
            current={numPageIndex}
            pageSize={numPageSize}
            showSizeChanger
            showTotal={(total, range) =>
              `${range[0]}-${range[1]} of ${total} items`
            }
            onChange={onPaginationChange}
            onShowSizeChange={onPaginationChange}
            total={totalResults}
          />
        )}
      />
    </>
  );
}

List.propTypes = {
  listHeader: PropTypes.func,
  handleSelectItem: PropTypes.func,
  setPageParams: PropTypes.func,

  pageIndex: PropTypes.number,
  pageSize: PropTypes.number,
  pagedData: PropTypes.shape({
    totalResults: PropTypes.number,
    data: PropTypes.array,
  }),
};

List.defaultProps = {
  handleSelectItem: noop,
  listHeader: () => null,
};

export default List;