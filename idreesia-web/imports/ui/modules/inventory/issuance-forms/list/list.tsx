import React, { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import dayjs from 'dayjs';
import { type RouteComponentProps } from 'react-router';
import { useParams } from 'react-router-dom';
import {
  Button,
  Divider,
  Dropdown,
  Pagination,
  Table,
  Tooltip,
} from 'antd';
import { message, modal } from '/imports/ui/antd-feedback';
import {
  CheckSquareOutlined,
  DeleteOutlined,
  EditOutlined,
  FileExcelOutlined,
  FileOutlined,
  PlusCircleOutlined,
  PrinterOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import type { PagedIssuanceFormsQuery } from 'meteor/idreesia-common/types/client-operations';
import { toSafeInteger } from 'meteor/idreesia-common/utilities/lodash';
import { Formats } from 'meteor/idreesia-common/constants';
import { useDynamicBreadcrumbs, useQueryParams } from 'meteor/idreesia-common/hooks/common';
import { InventorySubModulePaths as paths } from '/imports/ui/modules/inventory';
import {
  usePhysicalStore,
  usePhysicalStoreLocations,
} from '/imports/ui/modules/inventory/common/hooks';

import ListFilter from './list-filter';
import {
  APPROVE_ISSUANCE_FORMS,
  PAGED_ISSUANCE_FORMS,
  REMOVE_ISSUANCE_FORMS,
} from '../gql';

type IssuanceFormRow = NonNullable<
  NonNullable<
    NonNullable<PagedIssuanceFormsQuery['pagedIssuanceForms']>['data']
  >[number]
>;

type RouteParams = {
  physicalStoreId: string;
};

type Props = RouteComponentProps<RouteParams>;

interface RefreshParams {
  approvalStatus?: string[];
  startDate?: dayjs.Dayjs | null;
  endDate?: dayjs.Dayjs | null;
  locationId?: string;
  pageIndex?: number;
  pageSize?: number;
}

const List = ({ history, location }: Props) => {
  const { physicalStoreId } = useParams<RouteParams>();
  const { physicalStore } = usePhysicalStore(physicalStoreId);
  const { locationsByPhysicalStoreId } = usePhysicalStoreLocations(physicalStoreId);
  const { queryString, queryParams } = useQueryParams({
    history,
    location,
    paramNames: [
      'showApproved',
      'showUnapproved',
      'locationId',
      'startDate',
      'endDate',
      'pageIndex',
      'pageSize',
    ],
    paramDefaultValues: {
      showApproved: 'true',
      showUnapproved: 'true',
      locationId: '',
      startDate: '',
      endDate: '',
    },
  });
  const [selectedRows, setSelectedRows] = useState<IssuanceFormRow[]>([]);

  useDynamicBreadcrumbs(
    physicalStore
      ? ['Inventory', physicalStore.name, 'Issuance Forms', 'List']
      : ['Inventory', 'Issuance Forms', 'List']
  );

  const { data, loading, refetch } = useQuery(PAGED_ISSUANCE_FORMS, {
    variables: { physicalStoreId, queryString },
  });
  const [removeIssuanceForms] = useMutation(REMOVE_ISSUANCE_FORMS, {
    refetchQueries: [
      'pagedIssuanceForms',
      'issuanceFormsByStockItem',
      'pagedStockItems',
    ],
  });
  const [approveIssuanceForms] = useMutation(APPROVE_ISSUANCE_FORMS, {
    refetchQueries: [
      'pagedIssuanceForms',
      'issuanceFormsByStockItem',
      'pagedStockItems',
    ],
  });

  const refreshPage = (newParams: RefreshParams) => {
    const {
      approvalStatus,
      startDate,
      endDate,
      locationId,
      pageIndex,
      pageSize,
    } = newParams;

    let showApprovedVal;
    let showUnapprovedVal;
    if (Object.prototype.hasOwnProperty.call(newParams, 'approvalStatus')) {
      showApprovedVal =
        approvalStatus?.indexOf('approved') !== -1 ? 'true' : 'false';
      showUnapprovedVal =
        approvalStatus?.indexOf('unapproved') !== -1 ? 'true' : 'false';
    } else {
      showApprovedVal = String(queryParams.showApproved || 'true');
      showUnapprovedVal = String(queryParams.showUnapproved || 'true');
    }

    let locationIdVal;
    if (Object.prototype.hasOwnProperty.call(newParams, 'locationId')) {
      locationIdVal = locationId ?? '';
    } else {
      locationIdVal = String(queryParams.locationId || '');
    }

    let startDateVal;
    if (Object.prototype.hasOwnProperty.call(newParams, 'startDate')) {
      startDateVal = startDate ? startDate.format(Formats.DATE_FORMAT) : '';
    } else {
      startDateVal = String(queryParams.startDate || '');
    }

    let endDateVal;
    if (Object.prototype.hasOwnProperty.call(newParams, 'endDate')) {
      endDateVal = endDate ? endDate.format(Formats.DATE_FORMAT) : '';
    } else {
      endDateVal = String(queryParams.endDate || '');
    }

    let pageIndexVal;
    if (Object.prototype.hasOwnProperty.call(newParams, 'pageIndex')) {
      pageIndexVal = pageIndex || 0;
    } else {
      pageIndexVal = queryParams.pageIndex || 0;
    }

    let pageSizeVal;
    if (Object.prototype.hasOwnProperty.call(newParams, 'pageSize')) {
      pageSizeVal = pageSize || 20;
    } else {
      pageSizeVal = queryParams.pageSize || 20;
    }

    const path = `${location.pathname}?showApproved=${showApprovedVal}&showUnapproved=${showUnapprovedVal}&locationId=${locationIdVal}&startDate=${startDateVal}&endDate=${endDateVal}&pageIndex=${pageIndexVal}&pageSize=${pageSizeVal}`;
    history.push(path);
  };

  const handleNewClicked = () => {
    history.push(paths.issuanceFormsNewFormPath(physicalStoreId));
  };

  const handleEditClicked = (record: IssuanceFormRow) => {
    history.push(paths.issuanceFormsEditFormPath(physicalStoreId, record._id as string));
  };

  const handleViewClicked = (record: IssuanceFormRow) => {
    history.push(paths.issuanceFormsViewFormPath(physicalStoreId, record._id as string));
  };

  const handlePrintClicked = (record: IssuanceFormRow) => {
    history.push(paths.issuanceFormsPrintFormPath(physicalStoreId, record._id as string));
  };

  const handleDeleteSelected = () => {
    const _ids = selectedRows.map((row) => row._id as string);
    removeIssuanceForms({
      variables: {
        _ids,
        physicalStoreId,
      },
    })
      .then(() => {
        message.success('Issuance forms have been deleted.', 5);
      })
      .catch((error: Error) => {
        message.error(error.message, 5);
      });
  };

  const handleApproveSelected = () => {
    const _ids = selectedRows.map((row) => row._id as string);
    approveIssuanceForms({
      variables: {
        _ids,
        physicalStoreId,
      },
    })
      .then(() => {
        message.success('Issuance forms have been approved.', 5);
      })
      .catch((error: Error) => {
        message.error(error.message, 5);
      });
  };

  const handleExportSelected = () => {
    const reportArgs = selectedRows.map((row) => row._id as string);
    const url = `${window.location.origin}/generate-report?reportName=IssuanceForms&reportArgs=${reportArgs.join(',')}`;
    window.open(url, '_blank');
  };

  const handleAction = ({ key }: { key: string }) => {
    if (selectedRows.length === 0) return;

    if (key === 'approve') {
      handleApproveSelected();
    } else if (key === 'export') {
      handleExportSelected();
    } else if (key === 'delete') {
      modal.confirm({
        title: 'Delete Issuance Forms',
        content: 'Are you sure you want to delete the selected issuance forms?',
        onOk: () => {
          handleDeleteSelected();
        },
      });
    }
  };

  const onChange = (pageIndex: number, pageSize: number) => {
    refreshPage({
      pageIndex: pageIndex - 1,
      pageSize,
    });
  };

  if (loading) return null;

  const pagedIssuanceForms = data?.pagedIssuanceForms ?? { totalResults: 0, data: [] };
  const { totalResults, data: tableData } = pagedIssuanceForms;
  const rows = (tableData ?? []).filter((row): row is IssuanceFormRow => row != null);

  const pageIndex = queryParams.pageIndex;
  const pageSize = queryParams.pageSize;
  const numPageIndex = pageIndex ? toSafeInteger(pageIndex) + 1 : 1;
  const numPageSize = pageSize ? toSafeInteger(pageSize) : 20;

  const columns = [
    {
      title: 'Issue Date',
      dataIndex: 'issueDate',
      key: 'issueDate',
      render: (text: string) => dayjs(Number(text)).format('DD MMM, YYYY'),
    },
    {
      title: 'Issued To',
      dataIndex: ['refIssuedTo', 'name'],
      key: 'refIssuedTo.name',
      render: (text: string, record: IssuanceFormRow) => {
        if (record.handedOverTo) {
          return `${record.handedOverTo} - [on behalf of ${text}]`;
        }
        return text;
      },
    },
    {
      title: 'For Location',
      dataIndex: ['refLocation', 'name'],
      key: 'refLocation.name',
    },
    {
      title: 'Issuance Details',
      key: 'details',
      render: (_text: unknown, record: IssuanceFormRow) => {
        const row = record;
        const { items, attachments } = row;
        const formattedItems = (items ?? [])
          .filter((item): item is NonNullable<typeof item> => item != null)
          .map((item) => {
            const key = `${item.stockItemId}${item.isInflow}`;
            let quantity: number | string = item.quantity ?? 0;
            if (item.refStockItem?.unitOfMeasurement !== 'quantity') {
              quantity = `${quantity} ${item.refStockItem?.unitOfMeasurement ?? ''}`;
            }
            return (
              <li key={key}>
                {`${item.refStockItem?.name ?? ''} [${quantity} ${item.isInflow ? 'Returned' : 'Issued'}]`}
              </li>
            );
          });

        const formattedAttachments = (attachments ?? [])
          .filter((attachment): attachment is NonNullable<typeof attachment> => attachment != null)
          .map((attachment) => (
            <li key={attachment._id ?? undefined}>{attachment.name}</li>
          ));

        if (formattedAttachments.length > 0) {
          return (
            <>
              <ul>{formattedItems}</ul>
              <Divider>Attachments</Divider>
              <ul>{formattedAttachments}</ul>
            </>
          );
        }

        return <ul>{formattedItems}</ul>;
      },
    },
    {
      title: 'Actions',
      key: 'action',
      render: (_text: unknown, record: IssuanceFormRow) => {
        if (!record.approvedOn) {
          return (
            <div className="list-actions-column">
              <Tooltip title="Edit">
                <EditOutlined
                  className="list-actions-icon"
                  onClick={() => handleEditClicked(record)}
                />
              </Tooltip>
              <Tooltip title="Print">
                <PrinterOutlined
                  className="list-actions-icon"
                  onClick={() => handlePrintClicked(record)}
                />
              </Tooltip>
            </div>
          );
        }

        return (
          <div className="list-actions-column">
            <Tooltip title="View">
              <FileOutlined
                className="list-actions-icon"
                onClick={() => handleViewClicked(record)}
              />
            </Tooltip>
            <Tooltip title="Print">
              <PrinterOutlined
                className="list-actions-icon"
                onClick={() => handlePrintClicked(record)}
              />
            </Tooltip>
          </div>
        );
      },
    },
  ];

  const getActionsMenu = () => {
    const items = [
      {
        key: 'approve',
        label: 'Approve Selected',
        icon: <CheckSquareOutlined />,
      },
      {
        key: 'export',
        label: 'Export Selected',
        icon: <FileExcelOutlined />,
      },
      { type: 'divider' as const },
      {
        key: 'delete',
        label: 'Delete Selected',
        icon: <DeleteOutlined />,
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
      <Button
        size="large"
        type="primary"
        icon={<PlusCircleOutlined />}
        onClick={handleNewClicked}
      >
        New Issuance Form
      </Button>
      <div className="list-table-header-section">
        <ListFilter
          allLocations={(locationsByPhysicalStoreId ?? []).filter(
            (entry): entry is NonNullable<typeof entry> => entry != null
          )}
          refreshPage={refreshPage}
          queryParams={queryParams as Record<string, string | number | boolean | null | undefined | string[]>}
          refreshData={() => {
            refetch();
          }}
        />
        &nbsp;&nbsp;
        {getActionsMenu()}
      </div>
    </div>
  );

  return (
    <Table
      rowKey="_id"
      dataSource={rows}
      columns={columns}
      bordered
      title={getTableHeader}
      rowSelection={{
        onChange: (_selectedRowKeys, nextSelectedRows: IssuanceFormRow[]) => {
          setSelectedRows(nextSelectedRows);
        },
      }}
      size="small"
      pagination={false}
      footer={() => (
        <Pagination
          defaultCurrent={1}
          defaultPageSize={20}
          current={numPageIndex}
          pageSize={numPageSize}
          showSizeChanger
          showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} items`}
          onChange={onChange}
          onShowSizeChange={onChange}
          total={totalResults ?? 0}
        />
      )}
    />
  );
};

export default List;
