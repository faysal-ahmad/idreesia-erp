import React, { Component } from 'react';
import {
  Pagination,
  Popconfirm,
  Row,
  Table,
  Tooltip,
} from 'antd';
import {
  AuditOutlined,
  DeleteOutlined,
  MinusCircleOutlined,
} from '@ant-design/icons';

import { noop } from 'meteor/idreesia-common/utilities/lodash';
import type { HelperPagedHrKarkunsQuery } from 'meteor/idreesia-common/types/client-operations';
import { PersonName } from '/imports/ui/modules/helpers/controls';

type HrKarkunRow = NonNullable<
  NonNullable<
    NonNullable<HelperPagedHrKarkunsQuery['pagedHrKarkuns']>['data']
  >[number]
>;

interface KarkunListItem extends HrKarkunRow {
  city?: { name?: string | null; country?: string | null } | null;
  cityMehfil?: { name?: string | null } | null;
}

interface PagedData {
  totalResults?: number | null;
  data?: Array<KarkunListItem | null> | null;
}

interface PageParams {
  pageIndex: string;
  pageSize: string;
}

interface Props {
  showSelectionColumn?: boolean;
  showCnicColumn?: boolean;
  showPhoneNumbersColumn?: boolean;
  showDutiesColumn?: boolean;
  showMehfilCityColumn?: boolean;
  showDeleteAction?: boolean;
  showAuditLogsAction?: boolean;
  showRemoveAction?: boolean;
  listHeader?: () => React.ReactNode;
  handleSelectItem?(record: KarkunListItem): void;
  handleDeleteItem?(record: KarkunListItem): void;
  handleRemoveItem?(record: KarkunListItem): void;
  handleAuditLogsAction?(record: KarkunListItem): void;
  setPageParams(params: PageParams): void;
  pageIndex?: number;
  pageSize?: number;
  pagedData?: PagedData;
}

interface State {
  selectedRows: KarkunListItem[];
  scrollY: number;
}

const TABLE_HEADER_ROW_HEIGHT = 55;
const VIEWPORT_BOTTOM_GAP = 16;

export default class KarkunsList extends Component<Props, State> {
  static defaultProps = {
    showRemoveAction: false,
    showDeleteAction: false,
    showAuditLogsAction: false,

    handleSelectItem: noop,
    handleDeleteItem: noop,
    handleRemoveItem: noop,
    handleAuditLogsAction: noop,
    listHeader: () => null,
    pagedData: {
      totalResults: 0,
      data: [],
    }
  };

  containerRef = React.createRef<HTMLDivElement>();

  state: State = {
    selectedRows: [],
    scrollY: 360,
  };

  componentDidMount() {
    this.updateScrollY();
    window.addEventListener('resize', this.updateScrollY);
  }

  componentDidUpdate() {
    this.updateScrollY();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateScrollY);
  }

  updateScrollY = () => {
    requestAnimationFrame(() => {
      const container = this.containerRef.current;
      if (!container) return;

      const table = container.querySelector('.list-table');
      if (!table) return;

      const title = table.querySelector('.ant-table-title');
      const footer = table.querySelector('.ant-table-footer');
      const thead = table.querySelector('.ant-table-thead');
      const titleBottom = title
        ? title.getBoundingClientRect().bottom
        : table.getBoundingClientRect().top;
      const theadHeight = thead
        ? Math.ceil((thead as HTMLElement).getBoundingClientRect().height)
        : TABLE_HEADER_ROW_HEIGHT;
      const footerHeight = footer
        ? Math.ceil((footer as HTMLElement).getBoundingClientRect().height)
        : 64;

      // Bound by the nearest scroll container: a Drawer body when embedded
      // in one (e.g. karkun selection), otherwise Layout.Content's padding box.
      const boundEl = (container.closest('.ant-drawer-body') ??
        container.closest('.ant-layout-content')) as HTMLElement | null;
      let bottomLimit = window.innerHeight;
      if (boundEl) {
        const paddingBottom =
          Number.parseFloat(getComputedStyle(boundEl).paddingBottom) || 0;
        bottomLimit = boundEl.getBoundingClientRect().bottom - paddingBottom;
      }

      const nextScrollY = Math.max(
        200,
        Math.floor(
          bottomLimit -
            titleBottom -
            theadHeight -
            footerHeight -
            VIEWPORT_BOTTOM_GAP
        )
      );

      if (Math.abs(nextScrollY - this.state.scrollY) > 2) {
        this.setState({ scrollY: nextScrollY });
      }
    });
  };

  nameColumn = {
    title: 'Name',
    dataIndex: ['sharedData', 'name'],
    key: 'name',
    render: (_text: unknown, record: KarkunListItem) => {
      if (!record._id || !record.sharedData?.name) return null;
      return (
        <PersonName
          person={{
            _id: record._id,
            name: record.sharedData.name,
            imageId: record.sharedData.imageId ?? undefined,
            imageThumbnailId: record.sharedData.imageThumbnailId ?? undefined,
          }}
          onPersonNameClicked={this.props.handleSelectItem as Parameters<typeof PersonName>[0]['onPersonNameClicked']}
        />
      );
    },
  };

  cnicColumn = {
    title: 'CNIC Number',
    dataIndex: ['sharedData', 'cnicNumber'],
    key: 'cnicNumber',
  };

  phoneNumberColumn = {
    title: 'Contact Number',
    key: 'contactNumber',
    render: (_text: unknown, record: KarkunListItem) => {
      const numbers: React.ReactNode[] = [];
      const { contactNumber1, contactNumber2 } = record.sharedData ?? {};
      if (contactNumber1) {
        numbers.push(
          <Row key="1">
            <span>{contactNumber1}</span>
          </Row>
        );
      }

      if (contactNumber2) {
        numbers.push(
          <Row key="2">
            <span>{contactNumber2}</span>
          </Row>
        );
      }

      if (numbers.length === 0) return '';
      return <>{numbers}</>;
    },
  };

  mehfilCityColumn = {
    title: 'City / Mehfil',
    key: 'cityMehfil',
    render: (_text: unknown, record: KarkunListItem) => {
      const { city, cityMehfil } = record;
      const cityMehfilInfo: React.ReactNode[] = [];

      if (cityMehfil) {
        cityMehfilInfo.push(<Row key="1">{cityMehfil.name}</Row>);
      }
      if (city) {
        cityMehfilInfo.push(
          <Row key="2">{`${city.name}, ${city.country}`}</Row>
        );
      }

      if (cityMehfilInfo.length === 0) return '';
      return <>{cityMehfilInfo}</>;
    },
  };

  dutiesColumn = {
    title: 'Duties',
    dataIndex: ['karkunData', 'duties'],
    key: 'duties',
    render: (duties: NonNullable<KarkunListItem['karkunData']>['duties'] = []) => {
      let dutyNames: React.ReactNode[] = [];
      if (duties && duties.length > 0) {
        dutyNames = duties.map((duty) => {
          const dutyName = duty?.dutyName;
          return <span>{dutyName}</span>;
        });
      }

      if (dutyNames.length === 0) {
        return null;
      } else if (dutyNames.length === 1) {
        return dutyNames[0];
      }
      return (
        <>
          {dutyNames.map((dutyName, index) => (
            <Row key={index}>{dutyName}</Row>
          ))}
        </>
      );
    },
  };

  actionsColumn = {
    key: 'action',
    render: (_text: unknown, record: KarkunListItem) => {
      const {
        showAuditLogsAction,
        showDeleteAction,
        showRemoveAction,
        
        handleAuditLogsAction,
        handleDeleteItem,
        handleRemoveItem,
      } = this.props;

      const auditLogsAction = showAuditLogsAction ? (
        <Tooltip title="Audit Logs">
          <AuditOutlined
            className="list-actions-icon"
            onClick={() => {
              handleAuditLogsAction?.(record);
            }}
          />
        </Tooltip>
      ) : null;

      const deleteAction = showDeleteAction ? (
        <Popconfirm
          title="Are you sure you want to delete the data for this karkun?"
          onConfirm={() => {
            handleDeleteItem?.(record);
          }}
          okText="Yes"
          cancelText="No"
        >
          <Tooltip title="Delete">
            <DeleteOutlined className="list-actions-icon" />
          </Tooltip>
        </Popconfirm>
      ) : null;

      const removeAction = showRemoveAction ? (
        <Popconfirm
          title="Are you sure you want to remove this person from karkuns?"
          onConfirm={() => {
            handleRemoveItem?.(record);
          }}
          okText="Yes"
          cancelText="No"
        >
          <Tooltip title="Remove from karkuns">
            <MinusCircleOutlined className="list-actions-icon" />
          </Tooltip>
        </Popconfirm>
      ) : null;

      return (
        <div className="list-actions-column">
          {removeAction}
          {auditLogsAction}
          {deleteAction}
        </div>
      );
    },
  };

  getColumns = () => {
    const {
      showCnicColumn,
      showPhoneNumbersColumn,
      showMehfilCityColumn,
      showDutiesColumn,
      showAuditLogsAction,
      showDeleteAction,
    } = this.props;
    const columns: any[] = [this.nameColumn];

    if (showCnicColumn) {
      columns.push(this.cnicColumn);
    }

    if (showPhoneNumbersColumn) {
      columns.push(this.phoneNumberColumn);
    }

    if (showMehfilCityColumn) {
      columns.push(this.mehfilCityColumn);
    }

    if (showDutiesColumn) {
      columns.push(this.dutiesColumn);
    }

    if (showAuditLogsAction || showDeleteAction) {
      columns.push(this.actionsColumn);
    }

    return columns;
  };

  rowSelection = {
    onChange: (_selectedRowKeys: React.Key[], selectedRows: KarkunListItem[]) => {
      this.setState({
        selectedRows,
      });
    },
  };

  onPaginationChange = (pageIndex: number, pageSize?: number) => {
    const { setPageParams } = this.props;
    setPageParams({
      pageIndex: (pageIndex - 1).toString(),
      pageSize: (pageSize ?? 20).toString(),
    });
  };

  getSelectedRows = () => this.state.selectedRows;

  render() {
    const {
      pageIndex,
      pageSize,
      listHeader,
      showSelectionColumn,
      pagedData = { totalResults: 0, data: [] },
    } = this.props;

    const { totalResults, data: karkuns } = pagedData;

    const numPageIndex = pageIndex ? pageIndex + 1 : 1;
    const numPageSize = pageSize || 20;
    const { scrollY } = this.state;

    return (
      <div className="list-container" ref={this.containerRef}>
        <Table
          className="list-table"
          rowKey="_id"
          dataSource={(karkuns ?? []).filter(
            (karkun): karkun is KarkunListItem => karkun != null
          )}
          columns={this.getColumns() as any}
          title={listHeader}
          rowSelection={showSelectionColumn ? this.rowSelection : undefined}
          bordered
          size="middle"
          tableLayout="fixed"
          pagination={false}
          scroll={{ y: scrollY }}
          footer={() => (
            <Pagination
              current={numPageIndex}
              pageSize={numPageSize}
              showSizeChanger
              showTotal={(total: number, range: [number, number]) =>
                `${range[0]}-${range[1]} of ${total} items`
              }
              onChange={this.onPaginationChange}
              onShowSizeChange={this.onPaginationChange}
              total={totalResults ?? 0}
            />
          )}
        />
      </div>
    );
  }
}
