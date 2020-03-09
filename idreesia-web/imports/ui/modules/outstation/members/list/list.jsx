import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { useMutation, useQuery } from '@apollo/react-hooks';

import { setBreadcrumbs } from 'meteor/idreesia-common/action-creators';
import { useQueryParams } from 'meteor/idreesia-common/hooks/common';
import { useDistinctCities } from 'meteor/idreesia-common/hooks/security';
import { toSafeInteger } from 'meteor/idreesia-common/utilities/lodash';

import { Button, Dropdown, Icon, Menu, message } from '/imports/ui/controls';
import { VisitorsList, VisitorsListFilter } from '/imports/ui/modules/common';
import { OutstationSubModulePaths as paths } from '/imports/ui/modules/outstation';

import { PAGED_OUTSTATION_MEMBERS, DELETE_OUTSTATION_MEMBER } from '../gql';

const ButtonGroupStyle = {
  display: 'flex',
  flexFlow: 'row nowrap',
  alignItems: 'center',
};

const List = ({ history, location }) => {
  const dispatch = useDispatch();
  const visitorsList = useRef(null);
  const { queryParams, setPageParams } = useQueryParams({
    history,
    location,
    paramNames: [
      'name',
      'cnicNumber',
      'phoneNumber',
      'city',
      'ehadDuration',
      'pageIndex',
      'pageSize',
    ],
  });

  const [deleteOutstationMember] = useMutation(DELETE_OUTSTATION_MEMBER);
  const { distinctCities } = useDistinctCities();
  const { data, refetch } = useQuery(PAGED_OUTSTATION_MEMBERS, {
    variables: { filter: queryParams },
  });

  useEffect(() => {
    dispatch(setBreadcrumbs(['Outstation', 'Members', 'List']));
  }, [location]);

  const {
    name,
    cnicNumber,
    phoneNumber,
    city,
    ehadDuration,
    pageIndex,
    pageSize,
  } = queryParams;

  const handleSelectItem = member => {
    history.push(paths.membersEditFormPath(member._id));
  };

  const handleDeleteItem = record => {
    deleteOutstationMember({
      variables: {
        _id: record._id,
      },
    })
      .then(() => {
        refetch();
      })
      .catch(error => {
        message.error(error.message, 5);
      });
  };

  const handleNewClicked = () => {
    history.push(paths.membersNewFormPath);
  };

  const handleExportSelected = () => {
    const selectedRows = visitorsList.current.getSelectedRows();
    if (selectedRows.length === 0) return;

    const reportArgs = selectedRows.map(row => row._id);
    const url = `${
      window.location.origin
    }/generate-report?reportName=OutstationMembers&reportArgs=${reportArgs.join(
      ','
    )}`;
    window.open(url, '_blank');
  };

  const handleUploadClicked = () => {
    history.push(paths.membersUploadFormPath);
  };

  const getActionsMenu = () => {
    const menu = (
      <Menu>
        <Menu.Item key="1" onClick={handleExportSelected}>
          <Icon type="download" />
          Download Selected
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item key="3" onClick={handleUploadClicked}>
          <Icon type="upload" />
          Upload CSV Data
        </Menu.Item>
      </Menu>
    );

    return (
      <Dropdown overlay={menu}>
        <Button icon="setting" size="large" />
      </Dropdown>
    );
  };

  const getTableHeader = () => (
    <div className="list-table-header">
      <div style={ButtonGroupStyle}>
        <Button
          type="primary"
          icon="plus-circle-o"
          size="large"
          onClick={handleNewClicked}
        >
          New Member
        </Button>
      </div>
      <div className="list-table-header-section">
        <VisitorsListFilter
          name={name}
          cnicNumber={cnicNumber}
          phoneNumber={phoneNumber}
          city={city}
          ehadDuration={ehadDuration}
          showAdditionalInfoFilter={false}
          distinctCities={distinctCities}
          setPageParams={setPageParams}
          refreshData={refetch}
        />
        &nbsp;&nbsp;
        {getActionsMenu()}
      </div>
    </div>
  );

  const pagedOutstationMembers = data
    ? data.pagedOutstationMembers
    : {
        data: [],
        totalResults: 0,
      };
  const numPageIndex = pageIndex ? toSafeInteger(pageIndex) : 0;
  const numPageSize = pageSize ? toSafeInteger(pageSize) : 20;

  return (
    <VisitorsList
      ref={visitorsList}
      showCnicColumn
      showPhoneNumbersColumn
      showCityCountryColumn
      showMulakaatHistoryAction={false}
      showLookupAction={false}
      showDeleteAction
      listHeader={getTableHeader}
      handleSelectItem={handleSelectItem}
      handleDeleteItem={handleDeleteItem}
      setPageParams={setPageParams}
      pageIndex={numPageIndex}
      pageSize={numPageSize}
      pagedData={pagedOutstationMembers}
    />
  );
};

List.propTypes = {
  history: PropTypes.object,
  location: PropTypes.object,
};

export default List;
