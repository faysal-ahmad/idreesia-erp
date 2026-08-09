import React, { useRef, useState } from 'react';
import { type RouteComponentProps } from 'react-router';
import { useMutation, useQuery } from '@apollo/client/react';
import {
  Button,
  Drawer,
  Dropdown,
  Space,
} from 'antd';
import { message } from '/imports/ui/antd-feedback';
import {
  DownloadOutlined,
  UploadOutlined,
  PlusCircleOutlined,
  SettingOutlined,
  ScanOutlined,
} from '@ant-design/icons';

import {
  useBreadcrumbs,
  useQueryParams,
} from 'meteor/idreesia-common/hooks/common';
import { useDistinctCities } from 'meteor/idreesia-common/hooks/security';
import { toSafeInteger } from 'meteor/idreesia-common/utilities/lodash';

import {
  VisitorsList,
  VisitorsListFilter,
  VisitorFilterChips,
} from '/imports/ui/modules/common';
import type { VisitorListItem } from '/imports/ui/modules/common/visitors/list';
import { VisitorStaysList } from '/imports/ui/modules/security/visitor-stays';
import { SecuritySubModulePaths as paths } from '/imports/ui/modules/security';

import { PAGED_SECURITY_VISITORS, DELETE_SECURITY_VISITOR } from '../gql';

type VisitorRecord = VisitorListItem;

type Props = RouteComponentProps;

const List = ({ history, location }: Props) => {
  useBreadcrumbs(['Security', 'Visitor Registration', 'List']);

  const visitorsList = useRef<InstanceType<typeof VisitorsList> | null>(null);
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

  const {
    name,
    cnicNumber,
    phoneNumber,
    city,
    ehadDuration,
    additionalInfo,
    updatedBetween,
    pageIndex,
    pageSize,
  } = queryParams;

  const refreshData = async () => {
    await refetch();
    await distinctCitiesRefetch();
  };

  const handleFilterSetPageParams = (params: {
    pageIndex?: string | number;
    name?: string;
    cnicNumber?: string;
    phoneNumber?: string;
    city?: string;
    ehadDuration?: string;
    additionalInfo?: string;
    updatedBetween?: string;
  }) => {
    setPageParams(params);
  };

  const handleListSetPageParams = (params: { pageIndex: string; pageSize: string }) => {
    setPageParams(params);
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

    const reportArgs = (selectedRows as VisitorListItem[]).map((row) => row._id);
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
            <DownloadOutlined />&nbsp;
            Download Selected
          </>
        ),
        onClick: handleDownloadSelectedAsCSV,
      },
      {
        key: '2',
        label: (
          <>
            <UploadOutlined />&nbsp;
            Download All
          </>
        ),
        onClick: handleDownloadAllAsCSV,
      },
      { type: 'divider' as const },
      {
        key: '3',
        label: (
          <>
            <UploadOutlined />&nbsp;
            Upload CSV Data
          </>
        ),
        onClick: handleUploadClicked,
      },
    ];

    return (
      <Dropdown menu={{ items: menuItems }}>
        <Button icon={<SettingOutlined />} />
      </Dropdown>
    );
  };

  const filterProps = {
    name: name as string | undefined,
    cnicNumber: cnicNumber as string | undefined,
    phoneNumber: phoneNumber as string | undefined,
    city: city as string | undefined,
    ehadDuration: ehadDuration as string | undefined,
    additionalInfo: additionalInfo as string | undefined,
    updatedBetween: updatedBetween as string | undefined,
    showAdditionalInfoFilter: true,
    distinctCities: distinctCities ?? [],
    setPageParams: handleFilterSetPageParams,
    refreshData,
  };

  const getTableHeader = () => (
    <div className="list-table-header">
      <Space size={12}>
        <Button
          type="primary"
          icon={<PlusCircleOutlined />}
          onClick={handleNewClicked}
        >
          New Visitor
        </Button>
        <Button icon={<ScanOutlined />} onClick={handleScanClicked}>
          Scan CNIC
        </Button>
      </Space>
      <div className="list-table-header-utilities">
        <Space size={8}>
          <VisitorsListFilter {...filterProps} />
          {getActionsMenu()}
        </Space>
        <VisitorFilterChips {...filterProps} />
      </div>
    </div>
  );

  const pagedData = data?.pagedSecurityVisitors;
  const pagedSecurityVisitors = {
    totalResults: pagedData?.totalResults ?? 0,
    data: (pagedData?.data ?? []).flatMap((row) =>
      row && row._id ? [row as VisitorListItem] : []
    ),
  };
  const numPageIndex = pageIndex ? toSafeInteger(pageIndex) : 0;
  const numPageSize = pageSize ? toSafeInteger(pageSize) : 20;

  return (
    <>
      <VisitorsList
        ref={visitorsList}
        showSelectionColumn
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
        setPageParams={handleListSetPageParams}
        pageIndex={numPageIndex}
        pageSize={numPageSize}
        pagedData={pagedSecurityVisitors}
      />
      <Drawer
        title="Stay History"
        width={600}
        onClose={handleStayListClose}
        open={showStayList}
      >
        {visitorIdForList ? (
          <VisitorStaysList
            showNewButton
            showActionsColumn
            visitorId={visitorIdForList}
          />
        ) : null}
      </Drawer>
    </>
  );
};

export default List;
