import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Pagination, Space, Table } from 'antd';
import { LinkOutlined, UserAddOutlined } from '@ant-design/icons';

import ListFilter, { KarkunsFilterChips } from '/imports/ui/modules/hr-karkuns/karkuns/list/list-filter';

import PersonName from '../person-name/person-name';
import type { PersonSearch } from './use-person-search';
import type { PickerPerson } from './types';

/** How a picker's rows look and what their buttons do. */
export interface PersonPickerRowOptions {
  /** People already picked or added; their row shows a disabled button. */
  selectedIds?: string[];
  /** Also marks a row as already picked, from the row itself. */
  isSelected?(person: PickerPerson): boolean;
  selectedLabel?: string;
  /** The text of the row button that picks a person. */
  addLabel?: string;
  /** Shows the S/O (parent name) column. Defaults to true. */
  showParentName?: boolean;
  /** Person whose add is in flight; their button shows a spinner. */
  addingId?: string | null;
  onPick(person: PickerPerson): void;
  /** When set, a second button below the add button, e.g. "Link User". */
  linkLabel?: string;
  onLink?(person: PickerPerson): void;
  /** What the pagination calls the rows ("karkuns", "people"). */
  itemsLabel?: string;
}

interface Props extends PersonPickerRowOptions {
  search: PersonSearch;
}

const TABLE_HEADER_ROW_HEIGHT = 55;
const FOOTER_HEIGHT = 64;
const BOTTOM_GAP = 16;
const MIN_SCROLL_Y = 200;

/**
 * Presentational person picker: the filter toolbar, the table and the
 * pagination. The search (see usePersonSearch) is passed in, so this control
 * never knows which query or which people it shows.
 */
const PersonPickerList = ({
  search,
  selectedIds = [],
  isSelected,
  selectedLabel = 'Member',
  addLabel = 'Add',
  showParentName = true,
  addingId,
  onPick,
  linkLabel = 'Link',
  onLink,
  itemsLabel = 'karkuns',
}: Props) => {
  const {
    people,
    totalResults,
    loading,
    pageIndex,
    pageSize,
    filter,
    setPageParams,
    refresh,
  } = search;
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
  }, [updateScrollY, people, loading]);

  const columns = [
    {
      title: 'Name',
      key: 'name',
      render: (_text: unknown, record: PickerPerson) => (
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
    ...(showParentName
      ? [
          {
            title: 'S/O',
            dataIndex: 'parentName',
            key: 'parentName',
          },
        ]
      : []),
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
      width: 140,
      render: (_text: unknown, record: PickerPerson) => {
        if (selectedIds.includes(record._id) || isSelected?.(record)) {
          return (
            <Button size="small" disabled>
              {selectedLabel}
            </Button>
          );
        }
        const addButton = (
          <Button
            size="small"
            type="primary"
            icon={<UserAddOutlined />}
            loading={addingId === record._id}
            onClick={() => onPick(record)}
          >
            {addLabel}
          </Button>
        );
        if (!onLink) return addButton;
        return (
          <Space direction="vertical" size={4}>
            {addButton}
            <Button
              size="small"
              icon={<LinkOutlined />}
              onClick={() => onLink(record)}
            >
              {linkLabel}
            </Button>
          </Space>
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
      refreshData: refresh,
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
        dataSource={people}
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
              `${range[0]}-${range[1]} of ${total} ${itemsLabel}`
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

export default PersonPickerList;
