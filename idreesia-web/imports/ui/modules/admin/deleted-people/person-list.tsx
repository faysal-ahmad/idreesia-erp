import React, { Component } from 'react';

import { DeleteOutlined, RollbackOutlined } from '@ant-design/icons';
import { Pagination, Popconfirm, Row, Table, Tag, Tooltip } from 'antd';
import { PersonName } from '/imports/ui/modules/helpers/controls';

import RelationCountsTable, {
  hasOnlyOwnedRelations,
  type RelationCountItem,
} from './relation-counts-table';

export interface PersonTag {
  _id: string;
  name?: string | null;
  color?: string | null;
  textColor?: string | null;
}

export interface DeletedPersonListItem {
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

export interface RelationCounts {
  total: number;
  counts: RelationCountItem[];
}

interface PagedData { totalResults: number; data: DeletedPersonListItem[]; }

interface Props {
  listHeader?: () => React.ReactNode;
  handleSelectItem?(record: DeletedPersonListItem): void;
  handleHardDeleteItem?(record: DeletedPersonListItem): void;
  handleRestoreItem?(record: DeletedPersonListItem): void;
  setPageParams(params: { pageIndex: string; pageSize: string; }): void;
  pageIndex?: number;
  pageSize?: number;
  pagedData?: PagedData;
  relationCountsByPersonId: Record<string, RelationCounts>;
  relationCountsLoading?: boolean;
}

interface State {
  scrollY: number;
}

const TABLE_HEADER_ROW_HEIGHT = 55;
const VIEWPORT_BOTTOM_GAP = 16;

export default class DeletedPeopleList extends Component<Props, State> {
  static defaultProps = {
    listHeader: () => null,
  };

  containerRef = React.createRef<HTMLDivElement>();

  state: State = {
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
    render: (_text: unknown, record: DeletedPersonListItem) => {
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
    render: (_text: unknown, record: DeletedPersonListItem) => {
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
    render: (_text: unknown, record: DeletedPersonListItem) => {
      if (record.city) {
        return `${record.city}, ${record.country}`;
      }
      return record.country;
    },
  };

  relationshipsColumn = {
    title: 'Relationships',
    key: 'relationshipsCount',
    width: 130,
    render: (_text: unknown, record: DeletedPersonListItem) => {
      const total = this.props.relationCountsByPersonId[record._id]?.total;
      return total == null ? '-' : total;
    },
  };

  actionsColumn = {
    key: 'action',
    width: 100,
    render: (_text: unknown, record: DeletedPersonListItem) => {
      const {
        relationCountsByPersonId,
        handleHardDeleteItem,
        handleRestoreItem,
      } = this.props;
      const relationCounts = relationCountsByPersonId[record._id];
      const canHardDelete =
        !!relationCounts && hasOnlyOwnedRelations(relationCounts.counts);

      return (
        <div className="list-actions-column">
          <Popconfirm
            title="Are you sure you want to undo the delete for this person?"
            onConfirm={() => {
              handleRestoreItem?.(record);
            }}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Undo Delete">
              <RollbackOutlined className="list-actions-icon" />
            </Tooltip>
          </Popconfirm>
          {canHardDelete ? (
            <Popconfirm
              title="Are you sure you want to permanently delete this person?"
              onConfirm={() => {
                handleHardDeleteItem?.(record);
              }}
              okText="Yes"
              cancelText="No"
            >
              <Tooltip title="Delete Permanently">
                <DeleteOutlined className="list-actions-icon" />
              </Tooltip>
            </Popconfirm>
          ) : null}
        </div>
      );
    },
  };

  getColumns = () => [
    this.nameColumn,
    this.cnicColumn,
    this.phoneNumberColumn,
    this.cityCountryColumn,
    this.relationshipsColumn,
    this.actionsColumn,
  ];

  renderExpandedRow = (record: DeletedPersonListItem) => {
    const { relationCountsByPersonId, relationCountsLoading } = this.props;
    const relationCounts = relationCountsByPersonId[record._id];

    return (
      <RelationCountsTable
        counts={relationCounts?.counts ?? []}
        loading={relationCountsLoading && !relationCounts}
      />
    );
  };

  onPaginationChange = (pageIndex: number, pageSize?: number) => {
    const { setPageParams } = this.props;
    setPageParams({
      pageIndex: (pageIndex - 1).toString(),
      pageSize: (pageSize ?? 20).toString(),
    });
  };

  getRowClassName = (record: DeletedPersonListItem) => {
    if (record.criminalRecord) return 'visitors-list-row-alert';
    if (record.otherNotes) return 'visitors-list-row-warning';
    return '';
  };

  render() {
    const {
      pageIndex,
      pageSize,
      listHeader,
      pagedData = { totalResults: 0, data: [] },
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
          rowClassName={this.getRowClassName}
          size="medium"
          bordered
          tableLayout="fixed"
          pagination={false}
          scroll={{ y: scrollY }}
          expandable={{ expandedRowRender: this.renderExpandedRow }}
          footer={() => (
            <Pagination
              current={numPageIndex}
              pageSize={numPageSize}
              showSizeChanger
              showTotal={(total: number, range: [number, number]) =>
                `${range[0]}-${range[1]} of ${total} people`
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
