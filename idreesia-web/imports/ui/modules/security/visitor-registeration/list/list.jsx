import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { useMutation, useQuery } from '@apollo/react-hooks';

import { setBreadcrumbs } from 'meteor/idreesia-common/action-creators';
import { useQueryParams } from 'meteor/idreesia-common/hooks/common';
import { toSafeInteger } from 'meteor/idreesia-common/utilities/lodash';

import {
  Button,
  Drawer,
  Dropdown,
  Icon,
  Menu,
  message,
} from '/imports/ui/controls';
import { VisitorsList } from '/imports/ui/modules/common';
import { VisitorStaysList } from '/imports/ui/modules/security/visitor-stays';
import { VisitorMulakaatsList } from '/imports/ui/modules/security/visitor-mulakaats';
import { SecuritySubModulePaths as paths } from '/imports/ui/modules/security';

import ListFilter from './list-filter';
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
  const { queryString, queryParams, setPageParams } = useQueryParams({
    history,
    location,
    paramNames: [
      'name',
      'cnicNumber',
      'phoneNumber',
      'ehadDuration',
      'additionalInfo',
      'pageIndex',
      'pageSize',
    ],
  });

  const [deleteSecurityVisitor] = useMutation(DELETE_SECURITY_VISITOR);
  const { data, refetch } = useQuery(PAGED_SECURITY_VISITORS, {
    variables: { queryString },
  });

  useEffect(() => {
    dispatch(setBreadcrumbs(['Security', 'Visitor Registration', 'List']));
  }, [location]);

  const {
    name,
    cnicNumber,
    phoneNumber,
    ehadDuration,
    additionalInfo,
    pageIndex,
    pageSize,
  } = queryParams;

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
          <Icon type="download" />
          Download Selected
        </Menu.Item>
        <Menu.Item key="2" onClick={handleDownloadAllAsCSV}>
          <Icon type="upload" />
          Download All
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
          New Visitor
        </Button>
        &nbsp;
        <Button icon="scan" size="large" onClick={handleScanClicked}>
          Scan CNIC
        </Button>
      </div>
      <div className="list-table-header-section">
        <ListFilter
          name={name}
          cnicNumber={cnicNumber}
          phoneNumber={phoneNumber}
          ehadDuration={ehadDuration}
          additionalInfo={additionalInfo}
          setPageParams={setPageParams}
        />
        &nbsp;&nbsp;
        {getActionsMenu()}
      </div>
    </div>
  );

  // if (loading) return null;
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
        showLookupAction={false}
        showDeleteAction
        listHeader={getTableHeader}
        handleSelectItem={handleSelectItem}
        handleDeleteItem={handleDeleteItem}
        handleStayHistoryAction={handleStayHistoryAction}
        handleMulakaatHistoryAction={handleMulakaatHistoryAction}
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
