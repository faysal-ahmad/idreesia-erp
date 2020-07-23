import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useQuery, useMutation } from '@apollo/react-hooks';

import { setBreadcrumbs } from 'meteor/idreesia-common/action-creators';
import { toSafeInteger } from 'meteor/idreesia-common/utilities/lodash';
import { useQueryParams } from 'meteor/idreesia-common/hooks/common';

import {
  Button,
  Icon,
  Pagination,
  Table,
  Tooltip,
  message,
} from '/imports/ui/controls';
import { VisitorName } from '/imports/ui/modules/security/common/controls';
import { SecuritySubModulePaths as paths } from '/imports/ui/modules/security';
import ListFilter from './list-filter';

import { PAGED_SHARED_RESIDENCES, REMOVE_SHARED_RESIDENCE } from '../gql';

const List = ({ history, location }) => {
  const dispatch = useDispatch();
  const [removeSharedResidence] = useMutation(REMOVE_SHARED_RESIDENCE);
  const { queryParams, setPageParams } = useQueryParams({
    history,
    location,
    paramNames: ['address', 'residentName', 'pageIndex', 'pageSize'],
  });

  const { data, loading, refetch } = useQuery(PAGED_SHARED_RESIDENCES, {
    variables: {
      filter: queryParams,
    },
  });

  useEffect(() => {
    dispatch(setBreadcrumbs(['Security', 'Shared Residences', 'List']));
  }, [location]);

  if (loading) return null;

  const handleNewClicked = () => {
    history.push(paths.sharedResidencesNewFormPath);
  };

  const handleDeleteClicked = record => {
    removeSharedResidence({
      variables: {
        _id: record._id,
      },
    }).catch(error => {
      message.error(error.message, 5);
    });
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Link to={`${paths.sharedResidencesEditFormPath(record._id)}`}>
          {text}
        </Link>
      ),
    },
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: 'Residents',
      dataIndex: 'residents',
      key: 'residents',
      render: (text, record) => {
        const residents = record.residents || [];
        const residentsNodes = residents.map(residentObj => {
          const visitor = residentObj.resident;
          const additionalInfo = [];
          if (residentObj.isOwner) {
            additionalInfo.push('Owner');
          }
          if (residentObj.roomNumber) {
            additionalInfo.push(`Room No. ${residentObj.roomNumber}`);
          }

          return (
            <div>
              <VisitorName
                key={visitor._id}
                visitor={visitor}
                additionalInfo={additionalInfo.join(' - ')}
              />
            </div>
          );
        });
        return <ul>{residentsNodes}</ul>;
      },
    },
    {
      key: 'action',
      render: (text, record) => {
        if (record.residentCount === 0) {
          return (
            <Tooltip key="delete" title="Delete">
              <Icon
                type="delete"
                className="list-actions-icon"
                onClick={() => {
                  handleDeleteClicked(record);
                }}
              />
            </Tooltip>
          );
        }

        return null;
      },
    },
  ];

  const { address, residentName, pageIndex, pageSize } = queryParams;
  const numPageIndex = pageIndex ? toSafeInteger(pageIndex) + 1 : 1;
  const numPageSize = pageSize ? toSafeInteger(pageSize) : 20;

  const getTableHeader = () => (
    <div className="list-table-header">
      <Button type="primary" icon="plus-circle-o" onClick={handleNewClicked}>
        New Shared Residence
      </Button>
      <ListFilter
        address={address}
        residentName={residentName}
        setPageParams={setPageParams}
        refreshData={refetch}
      />
    </div>
  );

  const { pagedSharedResidences } = data;

  return (
    <Table
      rowKey="_id"
      dataSource={pagedSharedResidences.data}
      columns={columns}
      bordered
      size="small"
      pagination={false}
      title={getTableHeader}
      footer={() => (
        <Pagination
          defaultCurrent={1}
          defaultPageSize={20}
          current={numPageIndex}
          pageSize={numPageSize}
          showSizeChanger
          showTotal={(total, range) =>
            `${range[0]}-${range[1]} of ${total} items`
          }
          onChange={this.onChange}
          onShowSizeChange={this.onShowSizeChange}
          total={pagedSharedResidences.totalResults}
        />
      )}
    />
  );
};

List.propTypes = {
  history: PropTypes.object,
  location: PropTypes.object,
};

export default List;
