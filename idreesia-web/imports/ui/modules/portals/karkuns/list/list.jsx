import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { useQuery } from '@apollo/react-hooks';
import { useParams } from 'react-router-dom';

import { setBreadcrumbs } from 'meteor/idreesia-common/action-creators';
import { toSafeInteger } from 'meteor/idreesia-common/utilities/lodash';
import { useQueryParams } from 'meteor/idreesia-common/hooks/common';
import { useAllMehfilDuties } from 'meteor/idreesia-common/hooks/outstation';
import {
  usePortal,
  usePortalCities,
  usePortalCityMehfils,
} from 'meteor/idreesia-common/hooks/portals';
import { KarkunsList, KarkunsListFilter } from '/imports/ui/modules/common';
import { PortalsSubModulePaths as paths } from '/imports/ui/modules/portals';

import { PAGED_PORTAL_KARKUNS } from '../gql';

const List = ({ history, location }) => {
  const dispatch = useDispatch();
  const karkunsList = useRef(null);
  const { portalId } = useParams();
  const { portal } = usePortal();
  const { queryParams, setPageParams } = useQueryParams({
    history,
    location,
    paramNames: [
      'name',
      'cnicNumber',
      'phoneNumber',
      'bloodGroup',
      'lastTarteeb',
      'dutyId',
      'cityId',
      'cityMehfilId',
      'pageIndex',
      'pageSize',
    ],
  });

  const { allMehfilDuties, allMehfilDutiesLoading } = useAllMehfilDuties();
  const { portalCities, portalCitiesLoading } = usePortalCities();
  const {
    portalCityMehfils,
    portalCityMehfilsLoading,
  } = usePortalCityMehfils();
  const { data, loading, refetch } = useQuery(PAGED_PORTAL_KARKUNS, {
    variables: {
      portalId,
      filter: queryParams,
    },
  });

  useEffect(() => {
    if (portal) {
      dispatch(
        setBreadcrumbs(['Mehfil Portal', portal.name, 'Karkuns', 'List'])
      );
    } else {
      dispatch(setBreadcrumbs(['Mehfil Portal', 'Karkuns', 'List']));
    }
  }, [location, portal]);

  const handleSelectItem = karkun => {
    history.push(paths.karkunsEditFormPath(portalId, karkun._id));
  };

  if (loading) return null;
  const { pagedPortalKarkuns } = data;
  const {
    name,
    cnicNumber,
    phoneNumber,
    bloodGroup,
    lastTarteeb,
    dutyId,
    cityId,
    cityMehfilId,
    pageIndex,
    pageSize,
  } = queryParams;
  const numPageIndex = pageIndex ? toSafeInteger(pageIndex) : 0;
  const numPageSize = pageSize ? toSafeInteger(pageSize) : 20;

  const getListFilter = () => {
    if (
      allMehfilDutiesLoading ||
      portalCitiesLoading ||
      portalCityMehfilsLoading
    ) {
      return null;
    }

    return (
      <KarkunsListFilter
        showMehfilDutyFilter
        showCityMehfilFilter
        mehfilDuties={allMehfilDuties}
        cities={portalCities}
        cityMehfils={portalCityMehfils}
        name={name}
        cnicNumber={cnicNumber}
        phoneNumber={phoneNumber}
        bloodGroup={bloodGroup}
        lastTarteeb={lastTarteeb}
        dutyId={dutyId}
        cityId={cityId}
        cityMehfilId={cityMehfilId}
        setPageParams={setPageParams}
        refreshData={refetch}
      />
    );
  };

  const getTableHeader = () => (
    <div className="list-table-header">
      <div />
      {getListFilter()}
    </div>
  );

  return (
    <KarkunsList
      ref={karkunsList}
      showSelectionColumn={false}
      showCnicColumn
      showPhoneNumbersColumn
      showMehfilCityColumn
      showDutiesColumn
      showDeleteAction={false}
      listHeader={getTableHeader}
      handleSelectItem={handleSelectItem}
      setPageParams={setPageParams}
      pageIndex={numPageIndex}
      pageSize={numPageSize}
      pagedData={pagedPortalKarkuns}
    />
  );
};

List.propTypes = {
  history: PropTypes.object,
  location: PropTypes.object,
};

export default List;
