import React, { useState } from 'react';
import { type RouteComponentProps } from 'react-router';
import { useMutation, useQuery } from '@apollo/client/react';
import { LinkOutlined, SyncOutlined } from '@ant-design/icons';
import { Button, Modal, Space, Tabs } from 'antd';
import { message } from '/imports/ui/antd-feedback';

import {
  useBreadcrumbs,
  useQueryParams,
} from 'meteor/idreesia-common/hooks/common';
import { toSafeInteger } from 'meteor/idreesia-common/utilities/lodash';

import FixSpelling from '/imports/ui/modules/security/visitor-stay-report/fix-spelling';
import {
  PAGED_FREE_FORM_CITIES,
  PAGED_FREE_FORM_COUNTRIES,
  RENAME_FREE_FORM_CITY,
  RENAME_FREE_FORM_COUNTRY,
  UPDATE_CITY_LOCATION_MAPPINGS,
} from './gql';
import ValuesTable, {
  type FreeFormKind,
  type FreeFormRow,
} from './values-table';

type Props = RouteComponentProps;

const TAB_COUNTRIES: FreeFormKind = 'countries';
const TAB_CITIES: FreeFormKind = 'cities';

const List = ({ history, location }: Props) => {
  useBreadcrumbs(['Admin', 'Free Form Data']);

  const { queryParams, setPageParams } = useQueryParams({
    history,
    location,
    paramNames: ['default-active-tab', 'pageIndex', 'pageSize'],
    paramDefaultValues: { 'default-active-tab': TAB_COUNTRIES },
  });

  const activeKey: FreeFormKind =
    queryParams['default-active-tab'] === TAB_CITIES
      ? TAB_CITIES
      : TAB_COUNTRIES;
  const pageIndex = toSafeInteger(queryParams.pageIndex);
  const pageSize = toSafeInteger(queryParams.pageSize) || 20;

  const variables = { pageIndex, pageSize };
  const countries = useQuery(PAGED_FREE_FORM_COUNTRIES, {
    variables,
    skip: activeKey !== TAB_COUNTRIES,
  });
  const cities = useQuery(PAGED_FREE_FORM_CITIES, {
    variables,
    skip: activeKey !== TAB_CITIES,
  });

  const [renaming, setRenaming] = useState<{
    kind: FreeFormKind;
    name: string;
  } | null>(null);
  // Renaming changes people's data, so the list (and any cached lookups)
  // must be re-read.
  const [renameFreeFormCity] = useMutation(RENAME_FREE_FORM_CITY, {
    refetchQueries: ['pagedFreeFormCities', 'distinctCities'],
  });
  const [renameFreeFormCountry] = useMutation(RENAME_FREE_FORM_COUNTRY, {
    refetchQueries: ['pagedFreeFormCountries', 'distinctCountries'],
  });

  const [updateCityLocationMappings, { loading: updatingMappings }] =
    useMutation(UPDATE_CITY_LOCATION_MAPPINGS, {
      refetchQueries: ['pagedFreeFormCities'],
    });

  const handleUpdateMappings = () => {
    updateCityLocationMappings()
      .then(result => {
        const count = result.data?.updateCityLocationMappings ?? 0;
        message.success(
          count === 0
            ? 'No new location mappings found.'
            : `${count} location mapping(s) added.`,
          3
        );
      })
      .catch((error: Error) => {
        message.error(error.message, 5);
      });
  };

  const handleRenameSave = (
    _spellingType: string,
    existingSpelling: string,
    newSpelling: string
  ) => {
    const kind = renaming?.kind;
    setRenaming(null);
    if (!kind || existingSpelling === newSpelling.trim()) return;

    const variables = { existingSpelling, newSpelling };
    const label = kind === TAB_CITIES ? 'City' : 'Country';
    const request =
      kind === TAB_CITIES
        ? renameFreeFormCity({ variables }).then(
            result => result.data?.renameFreeFormCity ?? 0
          )
        : renameFreeFormCountry({ variables }).then(
            result => result.data?.renameFreeFormCountry ?? 0
          );
    request
      .then(count => {
        message.success(`${label} renamed for ${count} people.`, 3);
      })
      .catch((error: Error) => {
        message.error(error.message, 5);
      });
  };

  const active = activeKey === TAB_COUNTRIES ? countries : cities;
  const paged =
    activeKey === TAB_COUNTRIES
      ? countries.data?.pagedFreeFormCountries
      : cities.data?.pagedFreeFormCities;
  const rows: FreeFormRow[] = (paged?.data ?? []).filter(
    (row): row is FreeFormRow => row?.name != null
  );

  const handleRefresh = () => {
    active.refetch().then(() => {
      message.success('Data Reloaded', 2);
    });
  };

  const renderTable = (kind: FreeFormKind) =>
    activeKey === kind ? (
      <ValuesTable
        kind={kind}
        rows={rows}
        totalResults={paged?.totalResults ?? 0}
        loading={active.loading}
        pageIndex={pageIndex}
        pageSize={pageSize}
        setPageParams={params => setPageParams(params)}
        onRename={name => setRenaming({ kind, name })}
        showLocationMapping={kind === TAB_CITIES}
      />
    ) : null;

  return (
    <>
    <Tabs
      activeKey={activeKey}
      onChange={key => {
        // Each tab has its own list, so start it from the first page.
        setPageParams({ 'default-active-tab': key, pageIndex: '0' });
      }}
      tabBarExtraContent={
        <Space size={8}>
          {activeKey === TAB_CITIES ? (
            <Button
              type="primary"
              icon={<LinkOutlined />}
              loading={updatingMappings}
              onClick={handleUpdateMappings}
            >
              Update Location Mappings
            </Button>
          ) : null}
          <Button
            icon={<SyncOutlined />}
            onClick={handleRefresh}
            title="Reload Data"
          />
        </Space>
      }
      items={[
        {
          key: TAB_COUNTRIES,
          label: 'Countries',
          children: renderTable(TAB_COUNTRIES),
        },
        {
          key: TAB_CITIES,
          label: 'Cities',
          children: renderTable(TAB_CITIES),
        },
      ]}
    />
    <Modal
      title={renaming?.kind === TAB_CITIES ? 'Rename City' : 'Rename Country'}
      open={renaming !== null}
      onCancel={() => setRenaming(null)}
      width={600}
      footer={null}
      destroyOnHidden
    >
      {renaming !== null ? (
        <FixSpelling
          spellingType={renaming.kind}
          existingSpelling={renaming.name}
          onSave={handleRenameSave}
          onCancel={() => setRenaming(null)}
        />
      ) : null}
    </Modal>
    </>
  );
};

export default List;
