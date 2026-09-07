import React, { Component } from 'react';
import { AuditOutlined, DeleteOutlined, HistoryOutlined, PlusCircleOutlined } from '@ant-design/icons';

import { noop } from 'meteor/idreesia-common/utilities/lodash';
import {
  Pagination,
  Popconfirm,
  Row,
  Table,
  Tag,
  Tooltip,
} from 'antd';
import { PersonName } from '/imports/ui/modules/helpers/controls';

export interface PersonTag {
  _id: string;
  name?: string | null;
  color?: string | null;
  textColor?: string | null;
}

export interface PersonListItem {
  _id: string;
  name?: string | null;
  parentName?: string | null;
  referenceName?: string | null;
  cnicNumber?: string | null;
  contactNumber1?: string | null;
  contactNumber2?: string | null;
  city?: string | null;
  country?: string | null;
  imageId?: string | null;
  imageThumbnailId?: string | null;
  imageVectorStatus?: string | null;
  image?: { data?: string | null } | null;
  criminalRecord?: string | null;
  otherNotes?: string | null;
  isKarkun?: boolean | null;
  tags?: (PersonTag | null)[] | null;
}

interface PagedData { totalResults: number; data: PersonListItem[]; }

interface Props {
  showSelectionColumn?: boolean;
  showCnicColumn?: boolean;
  showPhoneNumbersColumn?: boolean;
  showCityCountryColumn?: boolean;
  showDeleteAction?: boolean;
  showStayHistoryAction?: boolean;
  showAuditLogsAction?: boolean;
  showKarkunCreateAction?: boolean;
  listHeader?: () => React.ReactNode;
  handleSelectItem?(record: PersonListItem): void;
  handleDeleteItem?(record: PersonListItem): void;
  handleStayHistoryAction?(record: PersonListItem): void;
  handleAuditLogsAction?(record: PersonListItem): void;
  handleKarkunCreateAction?(record: PersonListItem): void;
  setPageParams(params: { pageIndex: string; pageSize: string; }): void;
  pageIndex?: number;
  pageSize?: number;
  pagedData?: PagedData;
  /** Noun used in the pagination summary, e.g. "X-Y of Z {itemsLabel}". */
  itemsLabel?: string;
}

interface State {
  selectedRows: PersonListItem[];
  scrollY: number;
}

const TABLE_HEADER_ROW_HEIGHT = 55;
const VIEWPORT_BOTTOM_GAP = 16;

export default class PersonGeneralList extends Component<Props, State> {
  static defaultProps = {
    showDeleteAction: false,
    showStayHistoryAction: false,
    showAuditLogsAction: false,
    showKarkunCreateAction: false,

    handleSelectItem: noop,
    handleDeleteItem: noop,
    handleStayHistoryAction: noop,
    handleAuditLogsAction: noop,
    handleKarkunCreateAction: noop,
    listHeader: () => null,
    itemsLabel: 'people',
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
    // Measure after layout so filter chips in the table title are included.
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

      // Stay inside Layout.Content's padding box (padding: 24), not the
      // window edge — otherwise chips grow the title and clip pagination.
      const contentEl = container.closest(
        '.ant-layout-content'
      ) as HTMLElement | null;
      let bottomLimit = window.innerHeight;
      if (contentEl) {
        const paddingBottom =
          Number.parseFloat(getComputedStyle(contentEl).paddingBottom) || 0;
        bottomLimit =
          contentEl.getBoundingClientRect().bottom - paddingBottom;
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
    dataIndex: 'name',
    key: 'name',
    render: (_text: unknown, record: PersonListItem) => {
      const tags = (record.tags ?? []).filter(
        (tag): tag is PersonTag => tag != null
      );

      return (
        <div className="visitors-list-name-column">
          <PersonName
            person={{
              _id: record._id,
              name: record.name ?? '',
              imageId: record.imageId ?? undefined,
              imageThumbnailId: record.imageThumbnailId ?? undefined,
              imageVectorStatus: record.imageVectorStatus,
              image: record.image
                ? { data: record.image.data ?? undefined }
                : undefined,
            }}
            onPersonNameClicked={() => this.props.handleSelectItem?.(record)}
          />
          {tags.length > 0 ? (
            <div className="visitors-list-name-column-tags">
              {tags.map((tag) => (
                <Tag
                  key={tag._id}
                  color={tag.color ?? undefined}
                  variant="solid"
                  style={{ color: tag.textColor ?? undefined }}
                >
                  {tag.name}
                </Tag>
              ))}
            </div>
          ) : null}
        </div>
      );
    },
  };

  cnicColumn = {
    title: 'CNIC Number',
    dataIndex: 'cnicNumber',
    key: 'cnicNumber',
    width: 170,
  };

  phoneNumberColumn = {
    title: 'Contact Number',
    key: 'contactNumber',
    width: 160,
    render: (_text: unknown, record: PersonListItem) => {
      const numbers: React.ReactNode[] = [];
      if (record.contactNumber1)
        numbers.push(<Row key="1">{record.contactNumber1}</Row>);
      if (record.contactNumber2)
        numbers.push(<Row key="2">{record.contactNumber2}</Row>);

      if (numbers.length === 0) return '';
      return <>{numbers}</>;
    },
  };

  cityCountryColumn = {
    title: 'City / Country',
    key: 'cityCountry',
    width: 200,
    render: (_text: unknown, record: PersonListItem) => {
      if (record.city) {
        return `${record.city}, ${record.country}`;
      }
      return record.country;
    },
  };

  actionsColumn = {
    key: 'action',
    width: 100,
    render: (_text: unknown, record: PersonListItem) => {
      const {
        showDeleteAction,
        showStayHistoryAction,
        showAuditLogsAction,
        showKarkunCreateAction,
        handleDeleteItem,
        handleStayHistoryAction,
        handleAuditLogsAction,
        handleKarkunCreateAction,
      } = this.props;

      const stayHistoryAction = showStayHistoryAction ? (
        <Tooltip title="Stay History">
          <HistoryOutlined
            className="list-actions-icon"
            onClick={() => {
              handleStayHistoryAction?.(record);
            }}
          />
        </Tooltip>
      ) : null;

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

      const createAction =
        showKarkunCreateAction && !record.isKarkun ? (
          <Popconfirm
            title="Are you sure you want to add this person to karkuns?"
            onConfirm={() => {
              handleKarkunCreateAction?.(record);
            }}
            okText="Yes"
            cancelText="No"
          >
          <Tooltip title="Add to karkuns">
            <PlusCircleOutlined className="list-actions-icon" />
          </Tooltip>
        </Popconfirm>
        ) : null;

      const deleteAction = showDeleteAction ? (
        <Popconfirm
          title="Are you sure you want to delete the data for this person?"
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

      return (
        <div className="list-actions-column">
          {stayHistoryAction}
          {auditLogsAction}
          {createAction}
          {deleteAction}
        </div>
      );
    },
  };

  getColumns = () => {
    const {
      showCnicColumn,
      showPhoneNumbersColumn,
      showCityCountryColumn,
      showDeleteAction,
      showStayHistoryAction,
      showAuditLogsAction,
      showKarkunCreateAction,
    } = this.props;

    const columns: any[] = [];
    columns.push(this.nameColumn);

    if (showCnicColumn) {
      columns.push(this.cnicColumn);
    }

    if (showPhoneNumbersColumn) {
      columns.push(this.phoneNumberColumn);
    }

    if (showCityCountryColumn) {
      columns.push(this.cityCountryColumn);
    }

    if (
      showDeleteAction ||
      showStayHistoryAction ||
      showAuditLogsAction ||
      showKarkunCreateAction
    ) {
      columns.push(this.actionsColumn);
    }

    return columns;
  };

  rowSelection = {
    columnWidth: 48,
    onChange: (_selectedRowKeys: React.Key[], selectedRows: PersonListItem[]) => {
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

  getRowClassName = (record: PersonListItem) => {
    if (record.criminalRecord) return 'visitors-list-row-alert';
    if (record.otherNotes) return 'visitors-list-row-warning';
    return '';
  };

  render() {
    const {
      pageIndex,
      pageSize,
      listHeader,
      showSelectionColumn,
      pagedData = { totalResults: 0, data: [] },
      itemsLabel,
    } = this.props;

    const { totalResults, data } = pagedData;

    const numPageIndex = pageIndex ? pageIndex + 1 : 1;
    const numPageSize = pageSize || 20;

    const { scrollY } = this.state;

    return (
      <div className="list-container" ref={this.containerRef}>
        <Table
          className="list-table"
          rowKey="_id"
          dataSource={data}
          columns={this.getColumns() as any}
          title={listHeader}
          rowSelection={showSelectionColumn ? this.rowSelection : undefined}
          rowClassName={this.getRowClassName}
          size="medium"
          bordered
          tableLayout="fixed"
          pagination={false}
          scroll={{ y: scrollY }}
          footer={() => (
            <Pagination
              current={numPageIndex}
              pageSize={numPageSize}
              showSizeChanger
              showTotal={(total: number, range: [number, number]) =>
                `${range[0]}-${range[1]} of ${total} ${itemsLabel}`
              }
              onChange={this.onPaginationChange}
              onShowSizeChange={this.onPaginationChange}
              total={totalResults}
            />
          )}
        />
      </div>
    );
  }
}
