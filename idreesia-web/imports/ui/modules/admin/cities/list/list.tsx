import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useMutation, useQuery } from '@apollo/client/react';
import gql from 'graphql-tag';
import { DeleteOutlined, PlusCircleOutlined } from '@ant-design/icons';
import {
  Button,
  Pagination,
  Table,
  Tooltip,
  message,
} from 'antd';

import { setBreadcrumbs } from 'meteor/idreesia-common/action-creators';
import { toSafeInteger } from 'meteor/idreesia-common/utilities/lodash';
import {
  useQueryParams,
  useAllCities,
} from 'meteor/idreesia-common/hooks/common';
import { AdminSubModulePaths as paths } from '/imports/ui/modules/admin';

import ListFilter from './list-filter';
import { PAGED_CITIES, REMOVE_CITY } from '../gql';

const RouterLink = Link as any;
const AntDeleteOutlined = DeleteOutlined as any;
const AntPlusCircleOutlined = PlusCircleOutlined as any;
const AntButton = Button as any;
const AntPagination = Pagination as any;
const AntTable = Table as any;
const AntTooltip = Tooltip as any;
type AnyRecord = Record<string, any>;
interface HistoryLike { push(path: string): void; }
interface LocationLike { pathname: string; search: string; }
interface PagedCities { totalResults: number; data: AnyRecord[]; }
interface QueryData { pagedCities?: PagedCities | null; }
interface DistinctRegionsData { distinctRegions?: string[] | null; }
interface Props { history: HistoryLike; location: LocationLike; }

const DISTINCT_REGIONS = gql`
  query distinctRegions {
    distinctRegions
  }
`;

const List = ({ history, location }: Props) => {
  const dispatch = useDispatch<any>();
  const [removeCity] = useMutation(REMOVE_CITY as any);
  const { queryParams, setPageParams } = useQueryParams({
    history,
    location,
    paramNames: ['peripheryOf', 'region', 'pageIndex', 'pageSize'],
  });

  const { allCitiesLoading, allCities } = useAllCities();
  const { data: distinctRegionsData, loading: distinctRegionsLoading } = useQuery(
    DISTINCT_REGIONS as any
  );
  const distinctRegions = distinctRegionsData
    ? (distinctRegionsData as DistinctRegionsData).distinctRegions
    : null;
  const { data, loading, refetch } = useQuery(PAGED_CITIES as any, {
    variables: {
      filter: queryParams,
    },
  });

  useEffect(() => {
    dispatch(setBreadcrumbs(['Admin', 'Locations Management', 'Cities & Mehfils', 'List']));
  }, [location]);

  const handleNewClicked = () => {
    history.push(paths.citiesNewFormPath);
  };

  const handleDeleteClicked = (record: AnyRecord) => {
    removeCity({
      variables: {
        _id: record._id,
      },
    }).catch((error: Error) => {
      message.error(error.message, 5);
    });
  };

  const onPaginationChange = (pageIndex: number, pageSize?: number) => {
    setPageParams({
      pageIndex: pageIndex - 1,
      pageSize: pageSize ?? 20,
    });
  };

  if (loading || allCitiesLoading || distinctRegionsLoading) return null;
  const { pagedCities } = (data ?? {}) as QueryData;
  const { peripheryOf, region, pageIndex, pageSize } = queryParams;
  const numPageIndex = pageIndex ? toSafeInteger(pageIndex) + 1 : 1;
  const numPageSize = pageSize ? toSafeInteger(pageSize) : 20;

  const columns: any[] = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: 150,
      render: (text: string, record: AnyRecord) => (
        <RouterLink to={`${paths.citiesEditFormPath(record._id)}`}>{text}</RouterLink>
      ),
    },
    {
      title: 'Periphery Of',
      key: 'peripheryOf',
      width: 150,
      render: (_text: unknown, record: AnyRecord) => record?.peripheryOfCity?.name,
    },
    {
      title: 'Region',
      dataIndex: 'region',
      width: 75,
      key: 'region',
    },
    {
      title: 'Mehfils',
      dataIndex: 'mehfils',
      key: 'mehfils',
      render: (_text: unknown, record: AnyRecord) => {
        if (!record.mehfils || record.mehfils.length === 0) return null;
        const mehfilNames = record.mehfils.map((mehfil: AnyRecord) => (
          <li>{mehfil.name}</li>
        ));
        return <ul>{mehfilNames}</ul>;
      },
    },
    {
      title: 'Karkuns',
      dataIndex: 'karkunCount',
      width: 80,
      key: 'karkunCount',
    },
    {
      title: 'Members',
      dataIndex: 'memberCount',
      width: 80,
      key: 'memberCount',
    },
    {
      key: 'action',
      width: 50,
      render: (text: string, record: AnyRecord) => (
        <AntTooltip key="delete" title="Delete">
          <AntDeleteOutlined
            className="list-actions-icon"
            onClick={() => {
              handleDeleteClicked(record);
            }}
          />
        </AntTooltip>
      ),
    },
  ];

  const getTableHeader = () => (
    <div className="list-table-header">
      <div>
        <AntButton
          size="large"
          type="primary"
          icon={<AntPlusCircleOutlined />}
          onClick={handleNewClicked}
        >
          New City
        </AntButton>
      </div>
      <div className="list-table-header-section">
        <ListFilter
          allCities={(allCities ?? []) as any}
          distinctRegions={distinctRegions ?? []}
          peripheryOf={typeof peripheryOf === 'string' ? peripheryOf : null}
          region={typeof region === 'string' ? region : null}
          setPageParams={setPageParams}
          refreshData={refetch}
        />
      </div>
    </div>
  );

  return (
    <AntTable
      rowKey="_id"
      dataSource={pagedCities?.data ?? []}
      columns={columns as any}
      bordered
      size="small"
      pagination={false}
      title={getTableHeader}
      footer={() => (
        <AntPagination
          current={numPageIndex}
          pageSize={numPageSize}
          showSizeChanger
          showTotal={(total: number, range: [number, number]) =>
            `${range[0]}-${range[1]} of ${total} items`
          }
          onChange={onPaginationChange}
          onShowSizeChange={onPaginationChange}
          total={pagedCities?.totalResults ?? 0}
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
