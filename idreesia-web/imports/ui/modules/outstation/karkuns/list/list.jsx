import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { useMutation, useQuery } from '@apollo/react-hooks';
import { Button, Dropdown, message } from 'antd';
import { DeleteOutlined, DownloadOutlined, SettingOutlined, UploadOutlined } from '@ant-design/icons';

import { setBreadcrumbs } from 'meteor/idreesia-common/action-creators';
import { toSafeInteger } from 'meteor/idreesia-common/utilities/lodash';
import { useQueryParams } from 'meteor/idreesia-common/hooks/common';
import {
  useAllCities,
  useAllCityMehfils,
  useAllMehfilDuties,
  useDistinctRegions,
} from 'meteor/idreesia-common/hooks/outstation';
import { KarkunsList, KarkunsListFilter } from '/imports/ui/modules/common';
import { OutstationSubModulePaths as paths } from '/imports/ui/modules/outstation';

import {
  DELETE_OUTSTATION_KARKUNS,
  PAGED_OUTSTATION_KARKUNS,
} from '../gql';

const List = ({ history, location }) => {
  const dispatch = useDispatch();
  const karkunsList = useRef(null);
  const [deleteOutstationKarkuns] = useMutation(DELETE_OUTSTATION_KARKUNS);
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
      'ehadKarkun',
      'cityId',
      'cityMehfilId',
      'region',
      'updatedBetween',
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

  const handleDeleteSelected = () => {
    const selectedRows = karkunsList.current.getSelectedRows();
    if (selectedRows.length === 0) return;

    const _ids = selectedRows.map(row => row._id);
    deleteOutstationKarkuns({
      variables: {
        _ids,
      },
    })
      .then(() => {
        refetch();
      })
      .catch(error => {
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

  const handleUploadClicked = () => {
    history.push(paths.karkunsUploadFormPath);
  };

  const handleSelectItem = karkun => {
    history.push(paths.karkunsEditFormPath(karkun._id));
  };

  const handleAuditLogsAction = karkun => {
    history.push(`${paths.auditLogsPath}?entityId=${karkun._id}`);
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
    ehadKarkun,
    cityId,
    cityMehfilId,
    region,
    updatedBetween,
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
        showEhadKarkunFilter
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
        ehadKarkun={ehadKarkun}
        cityId={cityId}
        cityMehfilId={cityMehfilId}
        region={region}
        updatedBetween={updatedBetween}
        setPageParams={setPageParams}
        refreshData={refetch}
      />
    );
  };

  const handleAction = ({ key }) => {
    if (key === 'download-selected') {
      handleExportSelected();
    } else if (key === 'delete-selected') {
      handleDeleteSelected();
    } else if (key === 'upload-csv') {
      handleUploadClicked();
    }
  }

  const getActionsMenu = () => {
    const items = [
      {
        key: 'download-selected',
        label: 'Download Selected',
        icon: <DownloadOutlined />,
      },
      {
        key: 'delete-selected',
        label: 'Delete Selected',
        icon: <DeleteOutlined />,
      },
      {
        type: 'divider',
      },
      {
        key: 'upload-csv',
        label: 'Upload CSV Data',
        icon: <UploadOutlined />,
      },
    ];

    return (
      <Dropdown menu={{ items, onClick: handleAction }}>
        <Button icon={<SettingOutlined />} size="large" />
      </Dropdown>
    );
  };

  const getTableHeader = () => (
    <div className="list-table-header">
      <div />
      <div className="list-table-header-section">
        {getListFilter()}
        &nbsp;&nbsp;
        {getActionsMenu()}
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
      showAuditLogsAction
      showDeleteAction={false}
      listHeader={getTableHeader}
      handleSelectItem={handleSelectItem}
      handleAuditLogsAction={handleAuditLogsAction}
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
