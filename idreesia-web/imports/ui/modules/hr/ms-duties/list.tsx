import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import { useMutation, useQuery } from '@apollo/client/react';
import dayjs from 'dayjs';
import {
  DeleteOutlined,
  PlusCircleOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import {
  Button,
  Form,
  Modal,
  Pagination,
  Popconfirm,
  Space,
  Spin,
  Table,
  Tooltip,
} from 'antd';
import { message } from '/imports/ui/antd-feedback';

import { useBreadcrumbs } from 'meteor/idreesia-common/hooks/common';
import type {
  CreateDutyMutation,
  CreateDutyMutationVariables,
  ListAllMsDutiesQuery,
  ListAllMsDutiesQueryVariables,
  RemoveDutyMutation,
  RemoveDutyMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';
import { HRSubModulePaths as paths } from '/imports/ui/modules/hr';

import {
  CREATE_DUTY_LOCATION,
  CREATE_DUTY_SHIFT,
  UPDATE_DUTY_LOCATION,
  UPDATE_DUTY_SHIFT,
} from './gql';
import NewForm, { type NewDutyFormValues } from './new-form';
import LocationForm, { type LocationFormValues } from './location-form';
import DutyLocationsPanel, { type DutyLocationRow } from './locations-panel';
import ShiftForm, { type ShiftFormValues } from './shift-form';
import DutyShiftsPanel, { type DutyShiftRow } from './shifts-panel';

const RouterLink = Link as any;

const DEFAULT_PAGE_SIZE = 20;
const TABLE_HEADER_ROW_HEIGHT = 55;
const VIEWPORT_BOTTOM_GAP = 16;

const LIST_ALL_MS_DUTIES: TypedDocumentNode<
  ListAllMsDutiesQuery,
  ListAllMsDutiesQueryVariables
> = gql`
  query listAllMSDuties {
    allMSDuties {
      _id
      name
      description
      canDelete
      shifts {
        _id
        dutyId
        name
        startTime
        endTime
        attendanceSheet
        canDelete
      }
      locations {
        _id
        dutyId
        name
        canDelete
      }
    }
  }
`;

const CREATE_DUTY: TypedDocumentNode<
  CreateDutyMutation,
  CreateDutyMutationVariables
> = gql`
  mutation createDuty(
    $name: String!
    $isMehfilDuty: Boolean!
    $description: String
    $attendanceSheet: String
  ) {
    createDuty(
      name: $name
      isMehfilDuty: $isMehfilDuty
      description: $description
      attendanceSheet: $attendanceSheet
    ) {
      _id
      name
      isMehfilDuty
      description
      attendanceSheet
    }
  }
`;

const REMOVE_DUTY: TypedDocumentNode<
  RemoveDutyMutation,
  RemoveDutyMutationVariables
> = gql`
  mutation removeDuty($_id: String!) {
    removeDuty(_id: $_id)
  }
`;

const toTimeVariable = (value: unknown): string | null => {
  if (value == null || value === '') return null;
  if (dayjs.isDayjs(value)) return value.toISOString();
  if (value instanceof Date) return value.toISOString();
  return String(value);
};

type DutyRow = NonNullable<
  NonNullable<ListAllMsDutiesQuery['allMSDuties']>[number]
> & { _id: string; name: string };

const List = () => {
  useBreadcrumbs(['HR', 'Duties & Shifts']);

  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(360);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [showNewFormModal, setShowNewFormModal] = useState(false);
  const [newForm] = Form.useForm<NewDutyFormValues>();
  const [shiftDutyId, setShiftDutyId] = useState<string | null>(null);
  const [editingShift, setEditingShift] = useState<DutyShiftRow | null>(null);
  const [shiftForm] = Form.useForm<ShiftFormValues>();
  const [locationDutyId, setLocationDutyId] = useState<string | null>(null);
  const [editingLocation, setEditingLocation] = useState<DutyLocationRow | null>(
    null
  );
  const [locationForm] = Form.useForm<LocationFormValues>();
  const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>([]);

  const { data, loading, refetch } = useQuery(LIST_ALL_MS_DUTIES);
  const allMSDuties = (data?.allMSDuties ?? []).filter(
    (row): row is DutyRow =>
      row != null && row._id != null && row.name != null
  );

  const [createDuty, { loading: creating }] = useMutation(CREATE_DUTY, {
    refetchQueries: ['listAllMSDuties', 'composerAllMSDuties'],
  });
  const [removeDuty] = useMutation(REMOVE_DUTY, {
    refetchQueries: ['listAllMSDuties', 'composerAllMSDuties'],
  });
  const [createDutyShift, { loading: creatingShift }] = useMutation(
    CREATE_DUTY_SHIFT,
    {
      refetchQueries: [
        'listAllMSDuties',
        'composerAllMSDuties',
        'dutyShiftsByDutyId',
      ],
    }
  );
  const [updateDutyShift, { loading: updatingShift }] = useMutation(
    UPDATE_DUTY_SHIFT,
    {
      refetchQueries: [
        'listAllMSDuties',
        'composerAllMSDuties',
        'dutyShiftsByDutyId',
      ],
    }
  );
  const locationRefetchQueries = [
    'listAllMSDuties',
    'composerAllMSDuties',
    'composerAllDutyLocations',
    'dutyLocationsByDutyId',
  ];
  const [createDutyLocation, { loading: creatingLocation }] = useMutation(
    CREATE_DUTY_LOCATION,
    { refetchQueries: locationRefetchQueries }
  );
  const [updateDutyLocation, { loading: updatingLocation }] = useMutation(
    UPDATE_DUTY_LOCATION,
    { refetchQueries: locationRefetchQueries }
  );

  const updateScrollY = () => {
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
        ? Math.ceil((thead as HTMLElement).getBoundingClientRect().height)
        : TABLE_HEADER_ROW_HEIGHT;
      const footerHeight = footer
        ? Math.ceil((footer as HTMLElement).getBoundingClientRect().height)
        : 64;

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

      setScrollY(prev =>
        Math.abs(nextScrollY - prev) > 2 ? nextScrollY : prev
      );
    });
  };

  useEffect(() => {
    updateScrollY();
    window.addEventListener('resize', updateScrollY);
    return () => window.removeEventListener('resize', updateScrollY);
  });

  const handleNewClicked = () => {
    newForm.resetFields();
    setShowNewFormModal(true);
  };

  const handleCloseNewForm = () => {
    setShowNewFormModal(false);
    newForm.resetFields();
  };

  const handleCreateDuty = () =>
    newForm
      .validateFields()
      .then(values =>
        createDuty({
          variables: {
            name: values.name,
            isMehfilDuty: false,
            description: values.description,
            attendanceSheet: values.attendanceSheet,
          },
        })
      )
      .then(() => {
        message.success('Duty created', 2);
        handleCloseNewForm();
      })
      .catch((error: Error) => {
        if (error?.message) {
          message.error(error.message, 5);
        }
      });

  const handleDeleteClicked = (record: DutyRow) => {
    removeDuty({
      variables: {
        _id: record._id,
      },
    }).catch((error: Error) => {
      message.error(error.message, 5);
    });
  };

  const handleCloseShiftForm = () => {
    setShiftDutyId(null);
    setEditingShift(null);
    shiftForm.resetFields();
  };

  const handleAddShiftClicked = (record: DutyRow) => {
    setEditingShift(null);
    shiftForm.resetFields();
    shiftForm.setFieldsValue({
      startTime: dayjs(),
      endTime: dayjs(),
    });
    setShiftDutyId(record._id);
  };

  const handleEditShiftClicked = (dutyId: string, shift: DutyShiftRow) => {
    setEditingShift(shift);
    shiftForm.setFieldsValue({
      name: shift.name,
      startTime: shift.startTime ? dayjs(shift.startTime) : null,
      endTime: shift.endTime ? dayjs(shift.endTime) : null,
    });
    setShiftDutyId(dutyId);
  };

  const handleSaveShift = () => {
    const dutyId = shiftDutyId;
    if (!dutyId) return undefined;

    return shiftForm
      .validateFields()
      .then(values => {
        const variables = {
          name: values.name,
          dutyId,
          startTime: toTimeVariable(values.startTime),
          endTime: toTimeVariable(values.endTime),
          attendanceSheet: editingShift?.attendanceSheet ?? null,
        };

        if (editingShift) {
          return updateDutyShift({
            variables: {
              _id: editingShift._id,
              ...variables,
            },
          }).then(() => {
            message.success('Shift updated', 2);
            handleCloseShiftForm();
          });
        }

        return createDutyShift({ variables }).then(() => {
          message.success('Shift created', 2);
          handleCloseShiftForm();
        });
      })
      .catch((error: Error) => {
        if (error?.message) {
          message.error(error.message, 5);
        }
      });
  };

  const handleCloseLocationForm = () => {
    setLocationDutyId(null);
    setEditingLocation(null);
    locationForm.resetFields();
  };

  const handleAddLocationClicked = (record: DutyRow) => {
    setEditingLocation(null);
    locationForm.resetFields();
    setLocationDutyId(record._id);
  };

  const handleEditLocationClicked = (
    dutyId: string,
    location: DutyLocationRow
  ) => {
    setEditingLocation(location);
    locationForm.setFieldsValue({
      name: location.name,
    });
    setLocationDutyId(dutyId);
  };

  const handleSaveLocation = () => {
    const dutyId = locationDutyId;
    if (!dutyId) return undefined;

    return locationForm
      .validateFields()
      .then(values => {
        if (editingLocation) {
          return updateDutyLocation({
            variables: {
              id: editingLocation._id,
              name: values.name,
              dutyId,
            },
          }).then(() => {
            message.success('Location updated', 2);
            handleCloseLocationForm();
          });
        }

        return createDutyLocation({
          variables: {
            name: values.name,
            dutyId,
          },
        }).then(() => {
          message.success('Location created', 2);
          handleCloseLocationForm();
        });
      })
      .catch((error: Error) => {
        if (error?.message) {
          message.error(error.message, 5);
        }
      });
  };

  const handleRefresh = () => {
    refetch().then(() => {
      message.success('Data Reloaded', 2);
    });
  };

  const onPaginationChange = (page: number, nextPageSize?: number) => {
    setPageIndex(page - 1);
    if (nextPageSize != null) setPageSize(nextPageSize);
  };

  // Shift add/remove refetches this query and sets `loading` while the
  // previous result is still here. A full-page spinner would unmount the
  // table and collapse the open duty.
  if (loading && !data) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  const getDutyShifts = (record: DutyRow): DutyShiftRow[] =>
    (record.shifts ?? [])
      .filter(
        (shift): shift is NonNullable<typeof shift> =>
          shift != null && shift._id != null && shift.name != null
      )
      .map(shift => ({
        _id: shift._id as string,
        dutyId: shift.dutyId,
        name: shift.name as string,
        startTime: shift.startTime,
        endTime: shift.endTime,
        attendanceSheet: shift.attendanceSheet,
        canDelete: shift.canDelete,
      }));

  const getDutyLocations = (record: DutyRow): DutyLocationRow[] =>
    (record.locations ?? [])
      .filter(
        (location): location is NonNullable<typeof location> =>
          location != null && location._id != null && location.name != null
      )
      .map(location => ({
        _id: location._id as string,
        dutyId: location.dutyId,
        name: location.name as string,
        canDelete: location.canDelete,
      }));

  const totalResults = allMSDuties.length;
  const maxPageIndex = Math.max(0, Math.ceil(totalResults / pageSize) - 1);
  const safePageIndex = Math.min(pageIndex, maxPageIndex);
  const pageData = allMSDuties.slice(
    safePageIndex * pageSize,
    safePageIndex * pageSize + pageSize
  );

  const columns: any[] = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: DutyRow) => (
        <RouterLink to={paths.msDutiesEditFormPath(record._id)}>
          {text}
        </RouterLink>
      ),
    },
    {
      title: 'Shifts',
      key: 'shifts',
      width: 100,
      render: (_text: unknown, record: DutyRow) => record.shifts?.length ?? 0,
    },
    {
      title: 'Locations',
      key: 'locations',
      width: 110,
      render: (_text: unknown, record: DutyRow) =>
        record.locations?.length ?? 0,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      key: 'action',
      width: 72,
      render: (_text: unknown, record: DutyRow) => (
        <div className="list-actions-column">
          {record.canDelete ? (
            <Popconfirm
              title="Are you sure you want to delete this duty?"
              onConfirm={() => {
                handleDeleteClicked(record);
              }}
              okText="Yes"
              cancelText="No"
            >
              <Tooltip title="Delete">
                <DeleteOutlined className="list-actions-icon" />
              </Tooltip>
            </Popconfirm>
          ) : null}
        </div>
      ),
    },
  ];

  const getTableHeader = () => (
    <div className="list-table-header">
      <Space size={12}>
        <Button
          type="primary"
          icon={<PlusCircleOutlined />}
          onClick={handleNewClicked}
        >
          New Duty
        </Button>
      </Space>
      <div className="list-table-header-utilities">
        <Space size={8}>
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
    <>
      <div className="list-container" ref={containerRef}>
        <Table
          className="list-table"
          rowKey="_id"
          dataSource={pageData}
          columns={columns}
          title={getTableHeader}
          bordered
          size="middle"
          tableLayout="fixed"
          pagination={false}
          scroll={{ y: scrollY }}
          expandable={{
            expandedRowKeys,
            onExpandedRowsChange: keys => setExpandedRowKeys(keys.map(String)),
            expandedRowRender: (record: DutyRow) => (
              <div className="duty-expanded">
                <DutyShiftsPanel
                  shifts={getDutyShifts(record)}
                  onAdd={() => handleAddShiftClicked(record)}
                  onEdit={shift => handleEditShiftClicked(record._id, shift)}
                />
                <DutyLocationsPanel
                  locations={getDutyLocations(record)}
                  onAdd={() => handleAddLocationClicked(record)}
                  onEdit={location =>
                    handleEditLocationClicked(record._id, location)
                  }
                />
              </div>
            ),
          }}
          footer={() => (
            <Pagination
              current={safePageIndex + 1}
              pageSize={pageSize}
              showSizeChanger
              showTotal={(total, range) =>
                `${range[0]}-${range[1]} of ${total} items`
              }
              onChange={onPaginationChange}
              onShowSizeChange={onPaginationChange}
              total={totalResults}
            />
          )}
        />
      </div>

      <Modal
        title="New Duty"
        open={showNewFormModal}
        width={560}
        okText="Save"
        confirmLoading={creating}
        onOk={handleCreateDuty}
        onCancel={handleCloseNewForm}
        destroyOnHidden
      >
        <NewForm form={newForm} />
      </Modal>

      <Modal
        title={editingShift ? 'Edit Shift' : 'New Shift'}
        open={shiftDutyId != null}
        width={600}
        okText="Save"
        confirmLoading={creatingShift || updatingShift}
        onOk={handleSaveShift}
        onCancel={handleCloseShiftForm}
        destroyOnHidden
      >
        <ShiftForm form={shiftForm} />
      </Modal>

      <Modal
        title={editingLocation ? 'Edit Location' : 'New Location'}
        open={locationDutyId != null}
        width={560}
        okText="Save"
        confirmLoading={creatingLocation || updatingLocation}
        onOk={handleSaveLocation}
        onCancel={handleCloseLocationForm}
        destroyOnHidden
      >
        <LocationForm form={locationForm} />
      </Modal>
    </>
  );
};

export default List;
