import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { useMutation, useQuery } from '@apollo/client/react';
import {
  Button,
  Drawer,
  Dropdown,
  message,
} from 'antd';
import {
  DownloadOutlined,
  UploadOutlined,
  PlusCircleOutlined,
  SettingOutlined,
  ScanOutlined,
} from '@ant-design/icons';

import { setBreadcrumbs } from 'meteor/idreesia-common/action-creators';
import { useQueryParams } from 'meteor/idreesia-common/hooks/common';
import { useDistinctCities } from 'meteor/idreesia-common/hooks/security';
import { toSafeInteger } from 'meteor/idreesia-common/utilities/lodash';

import { VisitorsList, VisitorsListFilter } from '/imports/ui/modules/common';
import { VisitorStaysList } from '/imports/ui/modules/security/visitor-stays';
import { SecuritySubModulePaths as paths } from '/imports/ui/modules/security';

import { PAGED_SECURITY_VISITORS, DELETE_SECURITY_VISITOR } from '../gql';

const AntButton = Button as any;
const AntDrawer = Drawer as any;
const AntDropdown = Dropdown as any;
const AntDownloadOutlined = DownloadOutlined as any;
const AntUploadOutlined = UploadOutlined as any;
const AntPlusCircleOutlined = PlusCircleOutlined as any;
const AntSettingOutlined = SettingOutlined as any;
const AntScanOutlined = ScanOutlined as any;
const VisitorsListComponent = VisitorsList as any;
const VisitorsListFilterComponent = VisitorsListFilter as any;
const VisitorStaysListComponent = VisitorStaysList as any;

const ButtonGroupStyle = {
  display: 'flex',
  flexFlow: 'row nowrap',
  alignItems: 'center',
};

interface HistoryLike {
  push(path: string): void;
}

interface LocationLike {
  pathname: string;
  search: string;
}

interface ListProps {
  history: HistoryLike;
  location: LocationLike;
}

interface QueryParams {
  name?: string;
  cnicNumber?: string;
  phoneNumber?: string;
  city?: string;
  ehadDuration?: string;
  additionalInfo?: string;
  dataSource?: string;
  updatedBetween?: string;
  pageIndex?: string;
  pageSize?: string;
}

interface VisitorRecord {
  _id: string;
}

interface VisitorsListRef {
  getSelectedRows(): VisitorRecord[];
}

interface PagedVisitors {
  data: VisitorRecord[];
  totalResults: number;
}

interface VisitorsData {
  pagedSecurityVisitors?: PagedVisitors;
}

const emptyPagedVisitors: PagedVisitors = {
  data: [],
  totalResults: 0,
};

const List = ({ history, location }: ListProps) => {
  const dispatch = useDispatch();
  const visitorsList = useRef<VisitorsListRef | null>(null);
  const [showStayList, setShowStayList] = useState(false);
  const [visitorIdForList, setVisitorIdForList] = useState<string | null>(null);
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

  const [deleteSecurityVisitor] = useMutation(DELETE_SECURITY_VISITOR as any);
  const { distinctCities, distinctCitiesRefetch } = useDistinctCities(
    'cache-first'
  );
  const { data, refetch } = useQuery(PAGED_SECURITY_VISITORS as any, {
    variables: { filter: queryParams },
  });

  useEffect(() => {
    dispatch(setBreadcrumbs(['Security', 'Visitor Registration', 'List']));
  }, [dispatch, location]);

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
  } = queryParams as QueryParams;

  const refreshData = () => {
    refetch();
    distinctCitiesRefetch();
  };

  const handleSelectItem = (visitor: VisitorRecord) => {
    history.push(paths.visitorRegistrationEditFormPath(visitor._id));
  };

  const handleDeleteItem = (record: VisitorRecord) => {
    deleteSecurityVisitor({
      variables: {
        _id: record._id,
      },
    })
      .then(() => {
        refetch();
      })
      .catch((error: Error) => {
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

  const handleAuditLogsAction = (visitor: VisitorRecord) => {
    history.push(`${paths.auditLogsPath}?entityId=${visitor._id}`);
  };

  const handleStayHistoryAction = (visitor: VisitorRecord) => {
    setShowStayList(true);
    setVisitorIdForList(visitor._id);
  };

  const handleStayListClose = () => {
    setShowStayList(false);
    setVisitorIdForList(null);
  };

  const handleDownloadSelectedAsCSV = () => {
    const selectedRows = visitorsList.current?.getSelectedRows() ?? [];
    if (selectedRows.length === 0) return;

    const reportArgs = selectedRows.map((row: VisitorRecord) => row._id);
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
    const menuItems = [
      {
        key: '1',
        label: (
          <>
            <AntDownloadOutlined />&nbsp;
            Download Selected
          </>
        ),
        onClick: handleDownloadSelectedAsCSV,
      },
      {
        key: '2',
        label: (
          <>
            <AntUploadOutlined />&nbsp;
            Download All
          </>
        ),
        onClick: handleDownloadAllAsCSV,
      },
      { type: 'divider' },
      {
        key: '3',
        label: (
          <>
            <AntUploadOutlined />&nbsp;
            Upload CSV Data
          </>
        ),
        onClick: handleUploadClicked,
      },
    ];

    return (
      <AntDropdown menu={{ items: menuItems }}>
        <AntButton icon={<AntSettingOutlined />} size="large" />
      </AntDropdown>
    );
  };

  const getTableHeader = () => (
    <div className="list-table-header">
      <div style={ButtonGroupStyle}>
        <AntButton
          type="primary"
          icon={<AntPlusCircleOutlined />}
          size="large"
          onClick={handleNewClicked}
        >
          New Visitor
        </AntButton>
        &nbsp;&nbsp;
        <AntButton icon={<AntScanOutlined />} size="large" onClick={handleScanClicked}>
          Scan CNIC
        </AntButton>
      </div>
      <div className="list-table-header-section">
        <VisitorsListFilterComponent
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
    ? (data as VisitorsData).pagedSecurityVisitors ?? emptyPagedVisitors
    : emptyPagedVisitors;
  const numPageIndex = pageIndex ? toSafeInteger(pageIndex) : 0;
  const numPageSize = pageSize ? toSafeInteger(pageSize) : 20;

  return (
    <>
      <VisitorsListComponent
        ref={visitorsList}
        showSelectionColumn
        showStatusColumn
        showCnicColumn
        showPhoneNumbersColumn
        showCityCountryColumn
        showStayHistoryAction
        showAuditLogsAction
        showDeleteAction
        listHeader={getTableHeader}
        handleSelectItem={handleSelectItem}
        handleDeleteItem={handleDeleteItem}
        handleStayHistoryAction={handleStayHistoryAction}
        handleAuditLogsAction={handleAuditLogsAction}
        setPageParams={setPageParams}
        pageIndex={numPageIndex}
        pageSize={numPageSize}
        pagedData={pagedSecurityVisitors}
      />
      <AntDrawer
        title="Stay History"
        width={600}
        onClose={handleStayListClose}
        open={showStayList}
      >
        <VisitorStaysListComponent
          showNewButton
          showActionsColumn
          visitorId={visitorIdForList}
        />
      </AntDrawer>
    </>
  );
};

List.propTypes = {
  history: PropTypes.object,
  location: PropTypes.object,
};

export default List;
