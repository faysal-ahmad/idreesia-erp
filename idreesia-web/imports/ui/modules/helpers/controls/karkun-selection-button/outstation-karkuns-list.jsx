import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useQuery } from '@apollo/react-hooks';

import { toSafeInteger } from 'meteor/idreesia-common/utilities/lodash';
import {
  useAllCities,
  useAllCityMehfils,
  useAllMehfilDuties,
  useDistinctRegions,
} from 'meteor/idreesia-common/hooks/outstation';
import { KarkunsList, KarkunsListFilter } from '/imports/ui/modules/common';

import { PAGED_OUTSTATION_KARKUNS } from './gql';

const List = ({ handleSelectItem }) => {
  const [name, setName] = useState(null);
  const [cnicNumber, setCnicNumber] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState(null);
  const [dutyId, setDutyId] = useState(null);
  const [cityId, setCityId] = useState(null);
  const [cityMehfilId, setCityMehfilId] = useState(null);
  const [region, setRegion] = useState(null);
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
    if (values.hasOwnProperty('region')) setRegion(values.region);
    if (values.hasOwnProperty('pageIndex')) setPageIndex(values.pageIndex);
    if (values.hasOwnProperty('pageSize')) setPageSize(values.pageSize);
  };

  const { allMehfilDuties, allMehfilDutiesLoading } = useAllMehfilDuties();
  const { allCities, allCitiesLoading } = useAllCities();
  const { allCityMehfils, allCityMehfilsLoading } = useAllCityMehfils();
  const { distinctRegions, distinctRegionsLoading } = useDistinctRegions();
  const { data, loading, refetch } = useQuery(PAGED_OUTSTATION_KARKUNS, {
    variables: {
      filter: {
        name,
        cnicNumber,
        phoneNumber,
        dutyId,
        cityId,
        cityMehfilId,
        region,
        pageIndex,
        pageSize,
      },
    },
  });

  if (loading) return null;
  const { pagedOutstationKarkuns } = data;
  const numPageIndex = pageIndex ? toSafeInteger(pageIndex) : 0;
  const numPageSize = pageSize ? toSafeInteger(pageSize) : 20;

  const getListFilter = () => {
    if (
      allMehfilDutiesLoading ||
      allCitiesLoading ||
      allCityMehfilsLoading ||
      distinctRegionsLoading
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
        showRegionFilter
        mehfilDuties={allMehfilDuties}
        cities={allCities}
        cityMehfils={allCityMehfils}
        regions={distinctRegions}
        name={name}
        cnicNumber={cnicNumber}
        phoneNumber={phoneNumber}
        dutyId={dutyId}
        cityId={cityId}
        cityMehfilId={cityMehfilId}
        region={region}
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
      pagedData={pagedOutstationKarkuns}
    />
  );
};

List.propTypes = {
  handleSelectItem: PropTypes.func,
};

export default List;
