import React from 'react';
import { Link } from 'react-router-dom';
import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import { useMutation, useQuery } from '@apollo/client/react';
import { DeleteOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { type History } from 'history';
import {
  Button,
  Pagination,
  Table,
  Tooltip,
} from 'antd';
import { message } from '/imports/ui/antd-feedback';
import {
  useBreadcrumbs,
  useQueryParams,
  useAllCities,
} from 'meteor/idreesia-common/hooks/common';
import type {
  DistinctRegionsQuery,
  DistinctRegionsQueryVariables,
  PagedCitiesQuery,
} from 'meteor/idreesia-common/types/client-operations';
import { toSafeInteger } from 'meteor/idreesia-common/utilities/lodash';
import { AdminSubModulePaths as paths } from '/imports/ui/modules/admin';

import ListFilter from './list-filter';
import { PAGED_CITIES, REMOVE_CITY } from '../gql';

const RouterLink = Link as any;

const DISTINCT_REGIONS: TypedDocumentNode<
  DistinctRegionsQuery,
  DistinctRegionsQueryVariables
> = gql`
  query distinctRegions {
    distinctRegions
  }
`;

type CityRow = NonNullable<
  NonNullable<NonNullable<PagedCitiesQuery['pagedCities']>['data']>[number]
> & { _id: string };

interface ListProps {
  history: History;
  location: {
    pathname: string;
    search: string;
  };
}

const List = ({ history, location }: ListProps) => {
  useBreadcrumbs(['Admin', 'Locations Management', 'Cities & Mehfils', 'List']);
  const [removeCity] = useMutation(REMOVE_CITY);
  const { queryParams, setPageParams } = useQueryParams({
    history,
    location,
    paramNames: ['peripheryOf', 'region', 'pageIndex', 'pageSize'],
  });

  const { allCitiesLoading, allCities } = useAllCities();
  const { data: distinctRegionsData, loading: distinctRegionsLoading } = useQuery(
    DISTINCT_REGIONS
  );
  const distinctRegions = (distinctRegionsData?.distinctRegions ?? []).filter(
    (region): region is string => region != null
  );
  const { data, loading, refetch } = useQuery(PAGED_CITIES, {
    variables: {
      filter: queryParams,
    },
  });

  const handleNewClicked = () => {
    history.push(paths.citiesNewFormPath);
  };

  const handleDeleteClicked = (record: CityRow) => {
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
  const pagedCities = data?.pagedCities;
  const { peripheryOf, region, pageIndex, pageSize } = queryParams;
  const numPageIndex = pageIndex ? toSafeInteger(pageIndex) + 1 : 1;
  const numPageSize = pageSize ? toSafeInteger(pageSize) : 20;

  const cityRows: CityRow[] = (pagedCities?.data ?? []).filter(
    (row): row is CityRow => row != null && row._id != null
  );

  const columns: any[] = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: 150,
      render: (text: string, record: CityRow) => (
        <RouterLink to={`${paths.citiesEditFormPath(record._id)}`}>{text}</RouterLink>
      ),
    },
    {
      title: 'Periphery Of',
      key: 'peripheryOf',
      width: 150,
      render: (_text: unknown, record: CityRow) => record?.peripheryOfCity?.name,
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
      render: (_text: unknown, record: CityRow) => {
        if (!record.mehfils || record.mehfils.length === 0) return null;
        const mehfilNames = record.mehfils
          .filter((mehfil) => mehfil != null)
          .map((mehfil) => (
            <li key={mehfil._id ?? mehfil.name}>{mehfil.name}</li>
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
      render: (_text: unknown, record: CityRow) => (
        <Tooltip key="delete" title="Delete">
          <DeleteOutlined
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
          icon={<PlusCircleOutlined />}
          onClick={handleNewClicked}
        >
          New City
        </Button>
      </div>
      <div className="list-table-header-section">
        <ListFilter
          allCities={allCities ?? []}
          distinctRegions={distinctRegions}
          peripheryOf={typeof peripheryOf === 'string' ? peripheryOf : null}
          region={typeof region === 'string' ? region : null}
          setPageParams={setPageParams}
          refreshData={refetch}
        />
      </div>
    </div>
  );

  return (
    <Table
      rowKey="_id"
      dataSource={cityRows}
      columns={columns as any}
      bordered
      size="small"
      pagination={false}
      title={getTableHeader}
      footer={() => (
        <Pagination
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

export default List;
