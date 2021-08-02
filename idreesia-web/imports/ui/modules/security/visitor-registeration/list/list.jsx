import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { useMutation, useQuery } from '@apollo/react-hooks';
import { DownloadOutlined, UploadOutlined } from '@ant-design/icons';

import { setBreadcrumbs } from 'meteor/idreesia-common/action-creators';
import { useQueryParams } from 'meteor/idreesia-common/hooks/common';
import { useDistinctCities } from 'meteor/idreesia-common/hooks/security';
import { toSafeInteger } from 'meteor/idreesia-common/utilities/lodash';

import {
  Button,
  Drawer,
  Dropdown,
  Menu,
  message,
} from '/imports/ui/controls';
import { VisitorsList, VisitorsListFilter } from '/imports/ui/modules/common';
import { VisitorStaysList } from '/imports/ui/modules/security/visitor-stays';
import { VisitorMulakaatsList } from '/imports/ui/modules/security/visitor-mulakaats';
import { SecuritySubModulePaths as paths } from '/imports/ui/modules/security';

import { PAGED_SECURITY_VISITORS, DELETE_SECURITY_VISITOR } from '../gql';

const ButtonGroupStyle = {
  display: 'flex',
  flexFlow: 'row nowrap',
  alignItems: 'center',
};

const List = ({ history, location }) => {
  const dispatch = useDispatch();
  const visitorsList = useRef(null);
  const [showStayList, setShowStayList] = useState(false);
  const [showMulakaatList, setShowMulakaatList] = useState(false);
  const [visitorIdForList, setVisitorIdForList] = useState(null);
  const { queryParams, setPageParams } = useQueryParams({
    history,
    location,
    paramNames: [
      'name',
      'cnicNumber',
      'phoneNumber',
      'city',
      'ehadDuration',
      'additionalInfo',
      'dataSource',
      'updatedBetween',
      'pageIndex',
      'pageSize',
    ],
  });

  const [deleteSecurityVisitor] = useMutation(DELETE_SECURITY_VISITOR);
  const { distinctCities, distinctCitiesRefetch } = useDistinctCities(
    'cache-first'
  );
  const { data, refetch } = useQuery(PAGED_SECURITY_VISITORS, {
    variables: { filter: queryParams },
  });

  useEffect(() => {
    dispatch(setBreadcrumbs(['Security', 'Visitor Registration', 'List']));
  }, [location]);

  const {
    name,
    cnicNumber,
    phoneNumber,
    city,
    ehadDuration,
    additionalInfo,
    dataSource,
    updatedBetween,
    pageIndex,
    pageSize,
  } = queryParams;

  const refreshData = () => {
    refetch();
    distinctCitiesRefetch();
  };

  const handleSelectItem = visitor => {
    history.push(paths.visitorRegistrationEditFormPath(visitor._id));
  };

  const handleDeleteItem = record => {
    deleteSecurityVisitor({
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
    history.push(paths.visitorRegistrationNewFormPath);
  };

  const handleUploadClicked = () => {
    history.push(paths.visitorRegistrationUploadFormPath);
  };

  const handleScanClicked = () => {
    history.push(paths.visitorRegistrationPath);
  };

  const handleAuditLogsAction = visitor => {
    history.push(`${paths.auditLogsPath}?entityId=${visitor._id}`);
  };

  const handleStayHistoryAction = visitor => {
    setShowStayList(true);
    setVisitorIdForList(visitor._id);
  };

  const handleMulakaatHistoryAction = visitor => {
    setShowMulakaatList(true);
    setVisitorIdForList(visitor._id);
  };

  const handleStayListClose = () => {
    setShowStayList(false);
    setVisitorIdForList(null);
  };

  const handleMulakaatListClose = () => {
    setShowMulakaatList(false);
    setVisitorIdForList(null);
  };

  const handleDownloadSelectedAsCSV = () => {
    const selectedRows = visitorsList.current.getSelectedRows();
    if (selectedRows.length === 0) return;

    const reportArgs = selectedRows.map(row => row._id);
    const url = `${
      window.location.origin
    }/generate-report?reportName=Visitors&reportArgs=${reportArgs.join(',')}`;
    window.open(url, '_blank');
  };

  const handleDownloadAllAsCSV = () => {
    const url = `${window.location.origin}/generate-report?reportName=Visitors&reportArgs=all`;
    window.open(url, '_blank');
  };

  const getActionsMenu = () => {
    const menu = (
      <Menu>
        <Menu.Item key="1" onClick={handleDownloadSelectedAsCSV}>
          <DownloadOutlined />
          Download Selected
        </Menu.Item>
        <Menu.Item key="2" onClick={handleDownloadAllAsCSV}>
          <UploadOutlined />
          Download All
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item key="3" onClick={handleUploadClicked}>
          <UploadOutlined />
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
          New Visitor
        </Button>
        &nbsp;&nbsp;
        <Button icon="scan" size="large" onClick={handleScanClicked}>
          Scan CNIC
        </Button>
      </div>
      <div className="list-table-header-section">
        <VisitorsListFilter
          name={name}
          cnicNumber={cnicNumber}
          phoneNumber={phoneNumber}
          city={city}
          ehadDuration={ehadDuration}
          additionalInfo={additionalInfo}
          dataSource={dataSource}
          updatedBetween={updatedBetween}
          showAdditionalInfoFilter
          showDataSourceFilter
          distinctCities={distinctCities || []}
          setPageParams={setPageParams}
          refreshData={refreshData}
        />
        &nbsp;&nbsp;
        {getActionsMenu()}
      </div>
    </div>
  );

  const pagedSecurityVisitors = data
    ? data.pagedSecurityVisitors
    : {
        data: [],
        totalResults: 0,
      };
  const numPageIndex = pageIndex ? toSafeInteger(pageIndex) : 0;
  const numPageSize = pageSize ? toSafeInteger(pageSize) : 20;

  return (
    <>
      <VisitorsList
        ref={visitorsList}
        showSelectionColumn
        showStatusColumn
        showCnicColumn
        showPhoneNumbersColumn
        showCityCountryColumn
        showStayHistoryAction
        showMulakaatHistoryAction
        showAuditLogsAction
        showDeleteAction
        listHeader={getTableHeader}
        handleSelectItem={handleSelectItem}
        handleDeleteItem={handleDeleteItem}
        handleStayHistoryAction={handleStayHistoryAction}
        handleMulakaatHistoryAction={handleMulakaatHistoryAction}
        handleAuditLogsAction={handleAuditLogsAction}
        setPageParams={setPageParams}
        pageIndex={numPageIndex}
        pageSize={numPageSize}
        pagedData={pagedSecurityVisitors}
      />
      <Drawer
        title="Stay History"
        width={600}
        onClose={handleStayListClose}
        visible={showStayList}
      >
        <VisitorStaysList
          showNewButton
          showActionsColumn
          visitorId={visitorIdForList}
        />
      </Drawer>
      <Drawer
        title="Mulakaat History"
        width={400}
        onClose={handleMulakaatListClose}
        visible={showMulakaatList}
      >
        <VisitorMulakaatsList
          showNewButton
          showActionsColumn
          visitorId={visitorIdForList}
        />
      </Drawer>
    </>
  );
};

List.propTypes = {
  history: PropTypes.object,
  location: PropTypes.object,
};

export default List;
