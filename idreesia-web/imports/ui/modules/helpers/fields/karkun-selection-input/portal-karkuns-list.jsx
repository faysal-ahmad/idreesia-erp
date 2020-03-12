import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useQuery } from '@apollo/react-hooks';

import { toSafeInteger } from 'meteor/idreesia-common/utilities/lodash';
import {
  usePortalCities,
  usePortalCityMehfils,
} from 'meteor/idreesia-common/hooks/portals';
import { useAllMehfilDuties } from 'meteor/idreesia-common/hooks/outstation';
import { KarkunsList, KarkunsListFilter } from '/imports/ui/modules/common';

import { PAGED_PORTAL_KARKUNS } from './gql';

const List = ({ portalId, handleSelectItem }) => {
  const [name, setName] = useState(null);
  const [cnicNumber, setCnicNumber] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState(null);
  const [dutyId, setDutyId] = useState(null);
  const [cityId, setCityId] = useState(null);
  const [cityMehfilId, setCityMehfilId] = useState(null);
  const [pageIndex, setPageIndex] = useState('0');
  const [pageSize, setPageSize] = useState('20');

  const setPageParams = values => {
    if (values.hasOwnProperty('name')) setName(values.name);
    if (values.hasOwnProperty('cnicNumber')) setCnicNumber(values.cnicNumber);
    if (values.hasOwnProperty('phoneNumber'))
      setPhoneNumber(values.phoneNumber);
    if (values.hasOwnProperty('dutyId')) setDutyId(values.dutyId);
    if (values.hasOwnProperty('cityId')) setCityId(values.cityId);
    if (values.hasOwnProperty('cityMehfilId'))
      setCityMehfilId(values.cityMehfilId);
    if (values.hasOwnProperty('pageIndex')) setPageIndex(values.pageIndex);
    if (values.hasOwnProperty('pageSize')) setPageSize(values.pageSize);
  };

  const { allMehfilDuties, allMehfilDutiesLoading } = useAllMehfilDuties();
  const { portalCities, portalCitiesLoading } = usePortalCities();
  const {
    portalCityMehfils,
    portalCityMehfilsLoading,
  } = usePortalCityMehfils();
  const { data, loading, refetch } = useQuery(PAGED_PORTAL_KARKUNS, {
    variables: {
      portalId,
      filter: {
        name,
        cnicNumber,
        phoneNumber,
        dutyId,
        cityId,
        cityMehfilId,
        pageIndex,
        pageSize,
      },
    },
  });

  if (loading) return null;
  const { pagedPortalKarkuns } = data;
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
        showBloodGroupFilter={false}
        showAttendanceFilter={false}
        showLastTarteebFilter={false}
        showMehfilDutyFilter
        showCityMehfilFilter
        showRegionFilter={false}
        mehfilDuties={allMehfilDuties}
        cities={portalCities}
        cityMehfils={portalCityMehfils}
        name={name}
        cnicNumber={cnicNumber}
        phoneNumber={phoneNumber}
        dutyId={dutyId}
        cityId={cityId}
        cityMehfilId={cityMehfilId}
        setPageParams={setPageParams}
        refreshData={refetch}
      />
    );
  };

  const getTableHeader = () => (
    <div className="list-table-header">{getListFilter()}</div>
  );

  return (
    <KarkunsList
      showSelectionColumn={false}
      showCnicColumn={false}
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
  portalId: PropTypes.string,
  handleSelectItem: PropTypes.func,
};

export default List;
