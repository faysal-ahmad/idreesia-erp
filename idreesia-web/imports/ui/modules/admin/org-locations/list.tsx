import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery } from '@apollo/client/react';
import { Button, Form, Input, Modal, Space, Spin, Table, Tag } from 'antd';
import { PlusCircleOutlined, SyncOutlined } from '@ant-design/icons';
import { message } from '/imports/ui/antd-feedback';

import {
  OrgLocationAllowedChildTypes,
  OrgLocationTypes,
} from 'meteor/idreesia-common/constants/organization';
import { useBreadcrumbs } from 'meteor/idreesia-common/hooks/common';
import { AdminSubModulePaths as paths } from '/imports/ui/modules/admin';

import { ALL_ORG_LOCATIONS, CREATE_ORG_LOCATION, UPDATE_ORG_LOCATION } from './gql';
import NewForm, { type NewLocationFormValues } from './new-form';
import { toLocationRecords } from './helpers';
import {
  ORG_LOCATION_TYPE_COLORS,
  ORG_LOCATION_TYPE_LABELS,
  type LocationRecord,
} from './org-location-types';

const TABLE_HEADER_ROW_HEIGHT = 55;
const VIEWPORT_BOTTOM_GAP = 16;

interface TreeRow extends LocationRecord {
  children?: TreeRow[];
}

const buildTree = (locations: LocationRecord[]): TreeRow[] => {
  const rows = new Map<string, TreeRow>(
    locations.map(l => [l._id, { ...l }])
  );
  const roots: TreeRow[] = [];
  rows.forEach(row => {
    const parent = row.parentId ? rows.get(row.parentId) : undefined;
    if (parent) (parent.children ??= []).push(row);
    else roots.push(row);
  });
  return roots;
};

/**
 * Keeps the rows whose name matches the term together with their ancestors,
 * so a match always shows where it sits.
 */
const filterTree = (rows: TreeRow[], term: string): TreeRow[] =>
  rows.flatMap(row => {
    const children = row.children ? filterTree(row.children, term) : [];
    const matches = row.name.toLowerCase().includes(term);
    if (!matches && children.length === 0) return [];
    return [{ ...row, children: children.length > 0 ? children : undefined }];
  });

const collectParentKeys = (rows: TreeRow[]): string[] =>
  rows.flatMap(row =>
    row.children ? [row._id, ...collectParentKeys(row.children)] : []
  );

const List = () => {
  useBreadcrumbs(['Admin', 'Organization Locations']);
  const { data, loading, refetch } = useQuery(ALL_ORG_LOCATIONS);
  const [updateOrgLocation] = useMutation(UPDATE_ORG_LOCATION, {
    refetchQueries: ['allOrgLocations'],
  });
  const [createOrgLocation, { loading: creating }] = useMutation(
    CREATE_ORG_LOCATION,
    { refetchQueries: ['allOrgLocations'] }
  );
  const [showNewFormModal, setShowNewFormModal] = useState(false);
  const [newForm] = Form.useForm<NewLocationFormValues>();
  const [dragId, setDragId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(360);
  const [searchText, setSearchText] = useState('');
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);

  const locations = useMemo(
    () => toLocationRecords(data?.allOrgLocations),
    [data]
  );
  const byId = useMemo(
    () => new Map(locations.map(l => [l._id, l])),
    [locations]
  );
  const fullTree = useMemo(() => buildTree(locations), [locations]);
  const searchTerm = searchText.trim().toLowerCase();
  const tree = useMemo(
    () => (searchTerm ? filterTree(fullTree, searchTerm) : fullTree),
    [fullTree, searchTerm]
  );

  // Searching opens every branch so the matches are visible; clearing the
  // search goes back to just the top level. Reloading the data keeps the
  // current expansion; it only resets when the search text changes or the
  // first data arrives.
  const hasLocations = locations.length > 0;
  useEffect(() => {
    setExpandedKeys(
      searchTerm ? collectParentKeys(tree) : fullTree.map(row => row._id)
    );
  }, [searchTerm, hasLocations]);

  // A drop target is valid when the dragged location may be a direct child of
  // it, and it is not the current parent, itself, or inside the dragged subtree.
  const canDrop = (draggedId: string | null, targetId: string) => {
    const dragged = draggedId ? byId.get(draggedId) : undefined;
    const target = byId.get(targetId);
    if (!dragged || !target) return false;
    if (dragged.type === OrgLocationTypes.ROOT) return false;
    if (dragged._id === target._id) return false;
    if (dragged.parentId === target._id) return false;
    if (target.allParentIds.includes(dragged._id)) return false;
    return OrgLocationAllowedChildTypes[target.type].includes(dragged.type);
  };

  const resetDrag = () => {
    setDragId(null);
    setOverId(null);
  };

  const handleDrop = (targetId: string) => {
    const dragged = dragId ? byId.get(dragId) : undefined;
    const target = byId.get(targetId);
    const valid = canDrop(dragId, targetId);
    resetDrag();
    if (!dragged || !target || !valid) return;

    Modal.confirm({
      title: `Move "${dragged.name}" under "${target.name}"?`,
      content: 'Everything inside it moves along.',
      okText: 'Move',
      onOk: () =>
        // Mehfil details are omitted, so they stay as they are.
        updateOrgLocation({
          variables: {
            _id: dragged._id,
            name: dragged.name,
            parentId: target._id,
          },
        })
          .then(() => {
            message.success('Location moved', 2);
          })
          .catch((error: Error) => {
            message.error(error.message, 5);
          }),
    });
  };

  // Sizes the table body to the space left in the page, so only the rows
  // scroll and the toolbar stays in view.
  const updateScrollY = () => {
    requestAnimationFrame(() => {
      const container = containerRef.current;
      if (!container) return;
      const table = container.querySelector('.list-table');
      if (!table) return;

      const title = table.querySelector('.ant-table-title');
      const thead = table.querySelector('.ant-table-thead');
      const titleBottom = title
        ? title.getBoundingClientRect().bottom
        : table.getBoundingClientRect().top;
      const theadHeight = thead
        ? Math.ceil((thead as HTMLElement).getBoundingClientRect().height)
        : TABLE_HEADER_ROW_HEIGHT;

      const contentEl = container.closest(
        '.ant-layout-content'
      ) as HTMLElement | null;
      let bottomLimit = window.innerHeight;
      if (contentEl) {
        const paddingBottom =
          Number.parseFloat(getComputedStyle(contentEl).paddingBottom) || 0;
        bottomLimit = contentEl.getBoundingClientRect().bottom - paddingBottom;
      }

      const nextScrollY = Math.max(
        200,
        Math.floor(bottomLimit - titleBottom - theadHeight - VIEWPORT_BOTTOM_GAP)
      );
      setScrollY(prev => (Math.abs(nextScrollY - prev) > 2 ? nextScrollY : prev));
    });
  };

  useEffect(() => {
    updateScrollY();
    window.addEventListener('resize', updateScrollY);
    return () => window.removeEventListener('resize', updateScrollY);
  });

  if (loading && !data) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  const columns: any[] = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: '33%',
      render: (text: string, record: TreeRow) => (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
          }}
        >
          <Link to={paths.orgLocationsEditFormPath(record._id)}>{text}</Link>
          <Tag color={ORG_LOCATION_TYPE_COLORS[record.type]} style={{ marginInlineEnd: 0 }}>
            {ORG_LOCATION_TYPE_LABELS[record.type]}
          </Tag>
        </div>
      ),
    },
    {
      title: 'Committees',
      dataIndex: 'committees',
      key: 'committees',
      render: (committees: TreeRow['committees'], record: TreeRow) =>
        committees.map((committee, index) => (
          <React.Fragment key={committee._id}>
            {index > 0 ? ', ' : null}
            <Link
              to={paths.orgLocationCommitteeEditFormPath(
                record._id,
                committee._id
              )}
            >
              {committee.name}
            </Link>
          </React.Fragment>
        )),
    },
    {
      title: 'Observers',
      dataIndex: 'observerCount',
      key: 'observers',
      width: 100,
    },
  ];

  const handleCloseNewForm = () => {
    setShowNewFormModal(false);
    newForm.resetFields();
  };

  const handleCreate = () =>
    newForm
      .validateFields()
      .then(values =>
        createOrgLocation({
          variables: {
            name: values.name,
            type: values.type,
            parentId: values.parentId,
          },
        })
      )
      .then(() => {
        message.success('Location created', 2);
        handleCloseNewForm();
      })
      .catch((error: Error) => {
        if (error?.message) message.error(error.message, 5);
      });

  const handleRefresh = () => {
    refetch().then(() => {
      message.success('Data Reloaded', 2);
    });
  };

  const getTableHeader = () => (
    <div className="list-table-header">
      <Space size={12}>
        <Button
          type="primary"
          icon={<PlusCircleOutlined />}
          onClick={() => {
            newForm.resetFields();
            setShowNewFormModal(true);
          }}
        >
          New Location
        </Button>
      </Space>
      <div className="list-table-header-utilities">
        <Space size={8}>
          <Input.Search
            allowClear
            placeholder="Search locations"
            style={{ width: 280 }}
            value={searchText}
            onChange={event => setSearchText(event.target.value)}
          />
          <Button
            icon={<SyncOutlined />}
            onClick={handleRefresh}
            title="Reload Data"
          />
        </Space>
      </div>
    </div>
  );

  return (
    <div className="list-container org-locations-list" ref={containerRef}>
      <Table
        className="list-table"
        rowKey="_id"
        dataSource={tree}
        columns={columns}
        title={getTableHeader}
        loading={loading}
        bordered
        size="middle"
        tableLayout="fixed"
        pagination={false}
        scroll={{ y: scrollY }}
        locale={{ emptyText: searchTerm ? 'No matching locations' : 'No data' }}
        expandable={{
          expandedRowKeys: expandedKeys,
          onExpandedRowsChange: keys => setExpandedKeys(keys as string[]),
        }}
        onRow={(record: TreeRow) => {
          let dropClass = '';
          if (dragId && overId === record._id) {
            dropClass = canDrop(dragId, record._id)
              ? 'org-location-row-drop-valid'
              : 'org-location-row-drop-invalid';
          }
          const classes = [
            dragId === record._id ? 'org-location-row-dragging' : '',
            dropClass,
          ];
          return {
            className: classes.filter(Boolean).join(' '),
            draggable: record.type !== OrgLocationTypes.ROOT,
            onDragStart: (event: React.DragEvent) => {
              const { dataTransfer } = event;
              dataTransfer.effectAllowed = 'move';
              dataTransfer.setData('text/plain', record._id);
              setDragId(record._id);
            },
            onDragOver: (event: React.DragEvent) => {
              if (!dragId) return;
              if (canDrop(dragId, record._id)) event.preventDefault();
              if (overId !== record._id) setOverId(record._id);
            },
            onDrop: (event: React.DragEvent) => {
              event.preventDefault();
              handleDrop(record._id);
            },
            onDragEnd: resetDrag,
          };
        }}
      />

      <Modal
        title="New Location"
        open={showNewFormModal}
        width={720}
        okText="Save"
        confirmLoading={creating}
        onOk={handleCreate}
        onCancel={handleCloseNewForm}
        destroyOnHidden
      >
        <NewForm form={newForm} locations={locations} />
      </Modal>
    </div>
  );
};

export default List;
