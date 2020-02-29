import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useMutation, useQuery } from '@apollo/react-hooks';

import { setBreadcrumbs } from 'meteor/idreesia-common/action-creators';
import { find, toSafeInteger } from 'meteor/idreesia-common/utilities/lodash';
import { useQueryParams } from 'meteor/idreesia-common/hooks/common';
import {
  useAllPortals,
  useDistinctRegions,
} from 'meteor/idreesia-common/hooks/outstation';
import {
  Button,
  Icon,
  Pagination,
  Table,
  Tooltip,
  message,
} from '/imports/ui/controls';
import { OutstationSubModulePaths as paths } from '/imports/ui/modules/outstation';

import ListFilter from './list-filter';
import { PAGED_CITIES, REMOVE_CITY } from '../gql';

const List = ({ history, location }) => {
  const dispatch = useDispatch();
  const [removeCity] = useMutation(REMOVE_CITY);
  const { queryParams, setPageParams } = useQueryParams({
    history,
    location,
    paramNames: ['portalId', 'region', 'pageIndex', 'pageSize'],
  });

  const { allPortalsLoading, allPortals } = useAllPortals();
  const { distinctRegionsLoading, distinctRegions } = useDistinctRegions();
  const { data, loading, refetch } = useQuery(PAGED_CITIES, {
    variables: {
      filter: queryParams,
    },
  });

  useEffect(() => {
    dispatch(setBreadcrumbs(['Outstation', 'Cities & Mehfils', 'List']));
  }, [location]);

  const handleNewClicked = () => {
    history.push(paths.citiesNewFormPath);
  };

  const handleDeleteClicked = record => {
    removeCity({
      variables: {
        _id: record._id,
      },
    }).catch(error => {
      message.error(error.message, 5);
    });
  };

  const onPaginationChange = (pageIndex, pageSize) => {
    setPageParams({
      pageIndex: pageIndex - 1,
      pageSize,
    });
  };

  if (loading || allPortalsLoading || distinctRegionsLoading) return null;
  const { pagedCities } = data;
  const { region, portalId, pageIndex, pageSize } = queryParams;
  const numPageIndex = pageIndex ? toSafeInteger(pageIndex) + 1 : 1;
  const numPageSize = pageSize ? toSafeInteger(pageSize) : 20;

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Link to={`${paths.citiesEditFormPath(record._id)}`}>{text}</Link>
      ),
    },
    {
      title: 'Region',
      dataIndex: 'region',
      key: 'region',
    },
    {
      title: 'Country',
      dataIndex: 'country',
      key: 'country',
    },
    {
      title: 'Mehfils',
      dataIndex: 'mehfils',
      key: 'mehfils',
      render: (text, record) => {
        if (!record.mehfils || record.mehfils.length === 0) return null;
        const mehfilNames = record.mehfils.map(mehfil => mehfil.name);
        return mehfilNames.join(', ');
      },
    },
    {
      title: 'In Portal',
      key: 'portal',
      render: (text, record) => {
        const cityPortal = find(allPortals, portal => {
          const cityIds = portal.cityIds || [];
          return cityIds.indexOf(record._id) !== -1;
        });

        return cityPortal ? cityPortal.name : '';
      },
    },
    {
      key: 'action',
      render: (text, record) => (
        <Tooltip key="delete" title="Delete">
          <Icon
            type="delete"
            className="list-actions-icon"
            onClick={() => {
              handleDeleteClicked(record);
            }}
          />
        </Tooltip>
      ),
    },
  ];

  const getTableHeader = () => (
    <div className="list-table-header">
      <div>
        <Button
          size="large"
          type="primary"
          icon="plus-circle-o"
          onClick={handleNewClicked}
        >
          New City
        </Button>
      </div>
      <div className="list-table-header-section">
        <ListFilter
          distinctRegions={distinctRegions}
          allPortals={allPortals}
          region={region}
          portalId={portalId}
          setPageParams={setPageParams}
          refreshData={refetch}
        />
      </div>
    </div>
  );

  return (
    <Table
      rowKey="_id"
      dataSource={pagedCities.data}
      columns={columns}
      bordered
      pagination={false}
      title={getTableHeader}
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
          total={pagedCities.totalResults}
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
