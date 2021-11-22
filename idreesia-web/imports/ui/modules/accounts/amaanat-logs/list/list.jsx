import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { useQuery, useMutation } from '@apollo/react-hooks';
import { Button, message } from 'antd';
import { PlusCircleOutlined } from '@ant-design/icons';

import { setBreadcrumbs } from 'meteor/idreesia-common/action-creators';
import { toSafeInteger } from 'meteor/idreesia-common/utilities/lodash';
import { useQueryParams } from 'meteor/idreesia-common/hooks/common';
import {
  useAllCities,
  useAllCityMehfils,
} from 'meteor/idreesia-common/hooks/outstation';
import {
  AmaanatLogsList,
  AmaanatLogsListFilter,
} from '/imports/ui/modules/common';
import { AccountsSubModulePaths as paths } from '/imports/ui/modules/accounts';

import {
  PAGED_ACCOUNTS_AMAANAT_LOGS,
  REMOVE_ACCOUNTS_AMAANAT_LOG,
} from '../gql';

const List = ({ history, location }) => {
  const dispatch = useDispatch();
  const { allCities, allCitiesLoading } = useAllCities();
  const { allCityMehfils, allCityMehfilsLoading } = useAllCityMehfils();
  const { queryParams, setPageParams } = useQueryParams({
    history,
    location,
    paramNames: [
      'cityId',
      'cityMehfilId',
      'startDate',
      'endDate',
      'pageIndex',
      'pageSize',
    ],
  });

  const [removeAccountsAmaanatLog] = useMutation(REMOVE_ACCOUNTS_AMAANAT_LOG);
  const { data, loading, refetch } = useQuery(PAGED_ACCOUNTS_AMAANAT_LOGS, {
    variables: {
      filter: queryParams,
    },
  });

  useEffect(() => {
    dispatch(setBreadcrumbs(['Accounts', 'Amaanat Logs', 'List']));
  }, [location]);

  if (loading || allCitiesLoading || allCityMehfilsLoading) return null;
  const { pagedAccountsAmaanatLogs } = data;
  const {
    cityId,
    cityMehfilId,
    startDate,
    endDate,
    pageIndex,
    pageSize,
  } = queryParams;
  const numPageIndex = pageIndex ? toSafeInteger(pageIndex) : 0;
  const numPageSize = pageSize ? toSafeInteger(pageSize) : 20;

  const handleNewClicked = () => {
    history.push(paths.amaanatLogsNewFormPath);
  };

  const handleSelectItem = amaanatLog => {
    history.push(paths.amaanatLogsEditFormPath(amaanatLog._id));
  };

  const handleDeleteItem = amaanatLog => {
    removeAccountsAmaanatLog({
      variables: { _id: amaanatLog._id },
    })
      .then(() => {
        refetch();
      })
      .catch(error => {
        message.error(error.message, 5);
      });
  };

  const getTableHeader = () => (
    <div className="list-table-header">
      <Button
        size="large"
        type="primary"
        icon={<PlusCircleOutlined />}
        onClick={handleNewClicked}
      >
        New Amaanat Log
      </Button>
      <AmaanatLogsListFilter
        cities={allCities}
        cityMehfils={allCityMehfils}
        cityId={cityId}
        cityMehfilId={cityMehfilId}
        startDate={startDate}
        endDate={endDate}
        setPageParams={setPageParams}
        refreshData={refetch}
      />
    </div>
  );

  return (
    <AmaanatLogsList
      listHeader={getTableHeader}
      handleSelectItem={handleSelectItem}
      handleDeleteItem={handleDeleteItem}
      setPageParams={setPageParams}
      pageIndex={numPageIndex}
      pageSize={numPageSize}
      pagedData={pagedAccountsAmaanatLogs}
    />
  );
};

List.propTypes = {
  history: PropTypes.object,
  location: PropTypes.object,
};

export default List;
