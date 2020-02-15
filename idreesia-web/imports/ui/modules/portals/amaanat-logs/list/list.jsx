import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { useQuery, useMutation } from '@apollo/react-hooks';
import { useParams } from 'react-router-dom';

import { setBreadcrumbs } from 'meteor/idreesia-common/action-creators';
import { toSafeInteger } from 'meteor/idreesia-common/utilities/lodash';
import { useQueryParams } from 'meteor/idreesia-common/hooks/common';
import { Button, message } from '/imports/ui/controls';
import { AmaanatLogsList } from '/imports/ui/modules/common';
import { PortalsSubModulePaths as paths } from '/imports/ui/modules/portals';
import {
  usePortal,
  usePortalCities,
  usePortalCityMehfils,
} from '/imports/ui/modules/portals/common/hooks';

import ListFilter from './list-filter';
import { PAGED_PORTAL_AMAANAT_LOGS, REMOVE_PORTAL_AMAANAT_LOG } from '../gql';

const List = ({ history, location }) => {
  const dispatch = useDispatch();
  const { portalId } = useParams();
  const { portal } = usePortal();
  const { portalCities, portalCitiesLoading } = usePortalCities();
  const {
    portalCityMehfils,
    portalCityMehfilsLoading,
  } = usePortalCityMehfils();
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

  const [removePortalAmaanatLog] = useMutation(REMOVE_PORTAL_AMAANAT_LOG);
  const { data, loading, refetch } = useQuery(PAGED_PORTAL_AMAANAT_LOGS, {
    variables: {
      portalId,
      queryString,
    },
  });

  useEffect(() => {
    if (portal) {
      dispatch(
        setBreadcrumbs(['Mehfil Portal', portal.name, 'Amaanat Logs', 'List'])
      );
    } else {
      dispatch(setBreadcrumbs(['Mehfil Portal', 'Amaanat Logs', 'List']));
    }
  }, [location, portal]);

  if (loading || portalCitiesLoading || portalCityMehfilsLoading) return null;
  const { pagedPortalAmaanatLogs } = data;
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
    history.push(paths.amaanatLogsNewFormPath(portalId));
  };

  const handleSelectItem = amaanatLog => {
    history.push(paths.amaanatLogsEditFormPath(portalId, amaanatLog._id));
  };

  const handleDeleteItem = amaanatLog => {
    removePortalAmaanatLog({
      variables: { portalId, _id: amaanatLog._id },
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
      <ListFilter
        cities={portalCities}
        cityMehfils={portalCityMehfils}
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
      pagedData={pagedPortalAmaanatLogs}
    />
  );
};

List.propTypes = {
  history: PropTypes.object,
  location: PropTypes.object,
};

export default List;
