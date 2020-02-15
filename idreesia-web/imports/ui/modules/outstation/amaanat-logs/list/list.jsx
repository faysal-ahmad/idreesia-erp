import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { useQuery, useMutation } from '@apollo/react-hooks';

import { setBreadcrumbs } from 'meteor/idreesia-common/action-creators';
import { toSafeInteger } from 'meteor/idreesia-common/utilities/lodash';
import { useQueryParams } from 'meteor/idreesia-common/hooks/common';
import { Button, message } from '/imports/ui/controls';
import {
  AmaanatLogsList,
  AmaanatLogsListFilter,
} from '/imports/ui/modules/common';
import { OutstationSubModulePaths as paths } from '/imports/ui/modules/outstation';
import {
  useAllCities,
  useAllCityMehfils,
} from '/imports/ui/modules/outstation/common/hooks';

import {
  PAGED_OUTSTATION_AMAANAT_LOGS,
  REMOVE_OUTSTATION_AMAANAT_LOG,
} from '../gql';

const List = ({ history, location }) => {
  const dispatch = useDispatch();
  const { allCities, allCitiesLoading } = useAllCities();
  const { allCityMehfils, allCityMehfilsLoading } = useAllCityMehfils();
  const { queryString, queryParams, setPageParams } = useQueryParams({
    history,
    location,
    paramNames: [
      'cityId',
      'cityMehfilId',
      'hasPortion',
      'startDate',
      'endDate',
      'pageIndex',
      'pageSize',
    ],
  });

  const [removeOutstationAmaanatLog] = useMutation(
    REMOVE_OUTSTATION_AMAANAT_LOG
  );
  const { data, loading, refetch } = useQuery(PAGED_OUTSTATION_AMAANAT_LOGS, {
    variables: {
      queryString,
    },
  });

  useEffect(() => {
    dispatch(setBreadcrumbs(['Mehfil Portal', 'Amaanat Logs', 'List']));
  }, [location]);

  if (loading || allCitiesLoading || allCityMehfilsLoading) return null;
  const { pagedOutstationAmaanatLogs } = data;
  const {
    cityId,
    cityMehfilId,
    hasPortion,
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
    removeOutstationAmaanatLog({
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
      <Button type="primary" icon="plus-circle-o" onClick={handleNewClicked}>
        New Amaanat Log
      </Button>
      <AmaanatLogsListFilter
        cities={allCities}
        cityMehfils={allCityMehfils}
        cityId={cityId}
        cityMehfilId={cityMehfilId}
        hasPortion={hasPortion}
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
      pagedData={pagedOutstationAmaanatLogs}
    />
  );
};

List.propTypes = {
  history: PropTypes.object,
  location: PropTypes.object,
};

export default List;
