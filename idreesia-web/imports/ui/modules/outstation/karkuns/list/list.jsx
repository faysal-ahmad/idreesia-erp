import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { useMutation, useQuery } from '@apollo/react-hooks';

import { setBreadcrumbs } from 'meteor/idreesia-common/action-creators';
import { toSafeInteger } from 'meteor/idreesia-common/utilities/lodash';
import { useQueryParams } from 'meteor/idreesia-common/hooks/common';
import {
  useAllCities,
  useAllCityMehfils,
  useAllMehfilDuties,
  useDistinctRegions,
} from 'meteor/idreesia-common/hooks/outstation';
import { Button, Tooltip, message } from '/imports/ui/controls';
import { KarkunsList, KarkunsListFilter } from '/imports/ui/modules/common';
import { OutstationSubModulePaths as paths } from '/imports/ui/modules/outstation';

import { DELETE_OUTSTATION_KARKUN, PAGED_OUTSTATION_KARKUNS } from '../gql';

const List = ({ history, location }) => {
  const dispatch = useDispatch();
  const karkunsList = useRef(null);
  const [deleteOutstationKarkun] = useMutation(DELETE_OUTSTATION_KARKUN);
  const { queryParams, setPageParams } = useQueryParams({
    history,
    location,
    paramNames: [
      'name',
      'cnicNumber',
      'phoneNumber',
      'bloodGroup',
      'lastTarteeb',
      'attendance',
      'dutyId',
      'cityId',
      'cityMehfilId',
      'region',
      'pageIndex',
      'pageSize',
    ],
  });

  const { allMehfilDuties, allMehfilDutiesLoading } = useAllMehfilDuties();
  const { allCities, allCitiesLoading } = useAllCities();
  const { allCityMehfils, allCityMehfilsLoading } = useAllCityMehfils();
  const { distinctRegions, distinctRegionsLoading } = useDistinctRegions();
  const { data, loading, refetch } = useQuery(PAGED_OUTSTATION_KARKUNS, {
    variables: {
      filter: queryParams,
    },
  });

  useEffect(() => {
    dispatch(setBreadcrumbs(['Outstation', 'Karkuns', 'List']));
  }, [location]);

  const handleNewClicked = () => {
    history.push(paths.karkunsNewFormPath);
  };

  const handleDeleteItem = record => {
    deleteOutstationKarkun({
      variables: {
        _id: record._id,
      },
    }).catch(error => {
      message.error(error.message, 5);
    });
  };

  const handleExportSelected = () => {
    const selectedRows = karkunsList.current.getSelectedRows();
    if (selectedRows.length === 0) return;

    const reportArgs = selectedRows.map(row => row._id);
    const url = `${
      window.location.origin
    }/generate-report?reportName=OutstationKarkuns&reportArgs=${reportArgs.join(
      ','
    )}`;
    window.open(url, '_blank');
  };

  const handleSelectItem = karkun => {
    history.push(`${paths.karkunsPath}/${karkun._id}`);
  };

  if (loading) return null;
  const { pagedOutstationKarkuns } = data;
  const {
    name,
    cnicNumber,
    phoneNumber,
    bloodGroup,
    lastTarteeb,
    attendance,
    dutyId,
    cityId,
    cityMehfilId,
    region,
    pageIndex,
    pageSize,
  } = queryParams;
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
        showAttendanceFilter
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
        bloodGroup={bloodGroup}
        lastTarteeb={lastTarteeb}
        attendance={attendance}
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
    <div className="list-table-header">
      <div>
        <Button
          size="large"
          type="primary"
          icon="plus-circle-o"
          onClick={handleNewClicked}
        >
          New Karkun
        </Button>
      </div>
      <div className="list-table-header-section">
        {getListFilter()}
        &nbsp;&nbsp;
        <Tooltip title="Download Selected Data">
          <Button icon="download" size="large" onClick={handleExportSelected} />
        </Tooltip>
      </div>
    </div>
  );

  return (
    <KarkunsList
      ref={karkunsList}
      showSelectionColumn
      showCnicColumn
      showPhoneNumbersColumn
      showMehfilCityColumn
      showDutiesColumn
      showDeleteAction
      listHeader={getTableHeader}
      handleSelectItem={handleSelectItem}
      handleDeleteItem={handleDeleteItem}
      setPageParams={setPageParams}
      pageIndex={numPageIndex}
      pageSize={numPageSize}
      pagedData={pagedOutstationKarkuns}
    />
  );
};

List.propTypes = {
  history: PropTypes.object,
  location: PropTypes.object,
};

export default List;
