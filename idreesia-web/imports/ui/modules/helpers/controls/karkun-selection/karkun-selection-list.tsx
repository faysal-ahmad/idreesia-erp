import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Pagination, Space, Table } from 'antd';
import { UserAddOutlined } from '@ant-design/icons';

import ListFilter, {
  KarkunsFilterChips,
  type PageParams,
} from '/imports/ui/modules/hr/karkuns/list/list-filter';

import PersonName from '../person-name/person-name';

export interface KarkunSelectionItem {
  _id: string;
  name?: string | null;
  parentName?: string | null;
  cnicNumber?: string | null;
  contactNumber1?: string | null;
  imageUrl?: string | null;
  imageThumbnailUrl?: string | null;
}

export type KarkunSelectionPageParams = PageParams;

export interface KarkunSelectionFilter {
  name?: string | null;
  cnicNumber?: string | null;
  phoneNumber?: string | null;
}

interface Props {
  karkuns: KarkunSelectionItem[];
  totalResults: number;
  loading?: boolean;
  pageIndex: number;
  pageSize: number;
  filter: KarkunSelectionFilter;
  /** Karkuns already selected/added; their row shows a disabled button. */
  selectedIds?: string[];
  selectedLabel?: string;
  /** Karkun whose add is in flight; its button shows a spinner. */
  addingId?: string | null;
  /** Partial filter/paging updates, same shape the HR karkuns list uses. */
  setPageParams(params: KarkunSelectionPageParams): void;
  refreshData(): Promise<unknown>;
  onAdd(karkun: KarkunSelectionItem): void;
}

const TABLE_HEADER_ROW_HEIGHT = 55;
const FOOTER_HEIGHT = 64;
const BOTTOM_GAP = 16;
const MIN_SCROLL_Y = 200;

/**
 * Presentational karkun picker. The parent runs the search query (each use
 * case has its own endpoint and access rules) and passes the results in;
 * this control only renders the toolbar, table and pagination.
 */
const KarkunSelectionList = ({
  karkuns,
  totalResults,
  loading,
  pageIndex,
  pageSize,
  filter,
  selectedIds = [],
  selectedLabel = 'Member',
  addingId,
  setPageParams,
  refreshData,
  onAdd,
}: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(360);

  // Size the table body to the enclosing Drawer body (or Layout.Content) so
  // only the rows scroll and the toolbar and pagination stay visible.
  const updateScrollY = useCallback(() => {
    requestAnimationFrame(() => {
      const container = containerRef.current;
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
        ? Math.ceil(thead.getBoundingClientRect().height)
        : TABLE_HEADER_ROW_HEIGHT;
      const footerHeight = footer
        ? Math.ceil(footer.getBoundingClientRect().height)
        : FOOTER_HEIGHT;

      const boundEl = (container.closest('.ant-drawer-body') ??
        container.closest('.ant-layout-content')) as HTMLElement | null;
      let bottomLimit = window.innerHeight;
      if (boundEl) {
        const paddingBottom =
          Number.parseFloat(getComputedStyle(boundEl).paddingBottom) || 0;
        bottomLimit = boundEl.getBoundingClientRect().bottom - paddingBottom;
      }

      const nextScrollY = Math.max(
        MIN_SCROLL_Y,
        Math.floor(
          bottomLimit - titleBottom - theadHeight - footerHeight - BOTTOM_GAP
        )
      );

      setScrollY(prev =>
        Math.abs(nextScrollY - prev) > 2 ? nextScrollY : prev
      );
    });
  }, []);

  useEffect(() => {
    window.addEventListener('resize', updateScrollY);
    return () => window.removeEventListener('resize', updateScrollY);
  }, [updateScrollY]);

  useEffect(() => {
    updateScrollY();
  }, [updateScrollY, karkuns, loading]);

  const columns = [
    {
      title: 'Name',
      key: 'name',
      render: (_text: unknown, record: KarkunSelectionItem) => (
        <PersonName
          person={{
            _id: record._id,
            name: record.name ?? '',
            imageUrl: record.imageUrl,
            imageThumbnailUrl: record.imageThumbnailUrl,
          }}
        />
      ),
    },
    {
      title: 'S/O',
      dataIndex: 'parentName',
      key: 'parentName',
    },
    {
      title: 'CNIC Number',
      dataIndex: 'cnicNumber',
      key: 'cnicNumber',
      width: 160,
    },
    {
      title: 'Contact Number',
      dataIndex: 'contactNumber1',
      key: 'contactNumber1',
      width: 150,
    },
    {
      key: 'action',
      width: 110,
      render: (_text: unknown, record: KarkunSelectionItem) => {
        if (selectedIds.includes(record._id)) {
          return (
            <Button size="small" disabled>
              {selectedLabel}
            </Button>
          );
        }
        return (
          <Button
            size="small"
            type="primary"
            icon={<UserAddOutlined />}
            loading={addingId === record._id}
            onClick={() => onAdd(record)}
          >
            Add
          </Button>
        );
      },
    },
  ];

  const listHeader = () => {
    const filterProps = {
      ...filter,
      // Selection only filters by name, CNIC and phone.
      showDutyFilter: false,
      showBloodGroupFilter: false,
      setPageParams,
      refreshData,
    };

    return (
      <div className="list-table-header">
        <Space size={12} />
        <div className="list-table-header-utilities">
          <Space size={8}>
            <ListFilter {...filterProps} />
          </Space>
          <KarkunsFilterChips {...filterProps} />
        </div>
      </div>
    );
  };

  return (
    <div className="list-container" ref={containerRef}>
      <Table
        className="list-table"
        rowKey="_id"
        dataSource={karkuns}
        columns={columns}
        title={listHeader}
        loading={loading}
        bordered
        size="middle"
        tableLayout="fixed"
        pagination={false}
        scroll={{ y: scrollY }}
        footer={() => (
          <Pagination
            current={pageIndex + 1}
            pageSize={pageSize}
            showSizeChanger
            showTotal={(total, range) =>
              `${range[0]}-${range[1]} of ${total} karkuns`
            }
            onChange={(page, size) =>
              setPageParams({ pageIndex: page - 1, pageSize: size })
            }
            onShowSizeChange={(page, size) =>
              setPageParams({ pageIndex: page - 1, pageSize: size })
            }
            total={totalResults}
          />
        )}
      />
    </div>
  );
};

export default KarkunSelectionList;
