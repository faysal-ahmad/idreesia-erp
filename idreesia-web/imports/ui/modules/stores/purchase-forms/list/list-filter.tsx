import React, { useMemo, useState, type CSSProperties } from 'react';
import dayjs, { type Dayjs } from 'dayjs';
import {
  Badge,
  Button,
  Flex,
  Form,
  Popover,
  Space,
  Tag,
} from 'antd';
import { message } from '/imports/ui/antd-feedback';
import { FilterOutlined, SyncOutlined } from '@ant-design/icons';

import { Formats } from 'meteor/idreesia-common/constants';
import {
  CheckboxGroupField,
  DateField,
  SelectField,
} from '/imports/ui/modules/helpers/fields';

const FilterPanelStyle: CSSProperties = {
  width: 640,
  paddingTop: 4,
  overflow: 'visible',
};

const FilterFormStyle: CSSProperties = {
  width: '100%',
};

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};

interface VendorOption {
  _id: string | null;
  name: string | null;
}

export interface PurchaseListFilterParams {
  approvalStatus?: string[];
  startDate?: Dayjs | null;
  endDate?: Dayjs | null;
  vendorId?: string;
  pageIndex?: number;
}

interface QueryParams {
  showApproved?: string | number | boolean | null;
  showUnapproved?: string | number | boolean | null;
  vendorId?: string | number | boolean | null;
  startDate?: string | number | boolean | null;
  endDate?: string | number | boolean | null;
}

interface Props {
  refreshPage(params: PurchaseListFilterParams): void;
  refreshData?(): void | Promise<unknown>;
  queryParams: QueryParams;
  vendorsByPhysicalStoreId: VendorOption[];
}

type FilterChipKey = 'approvalStatus' | 'vendorId' | 'startDate' | 'endDate';

interface FilterChip {
  key: FilterChipKey;
  label: string;
  value: string;
}

interface FilterValues {
  approvalStatus?: string[];
  vendorId?: string;
  startDate?: Dayjs | null;
  endDate?: Dayjs | null;
}

const hasFilterValue = (value?: string | null) =>
  value != null && String(value).trim() !== '';

const getApprovalStatus = (queryParams: QueryParams): string[] => {
  const status: string[] = [];
  if (!queryParams.showApproved || queryParams.showApproved === 'true') {
    status.push('approved');
  }
  if (!queryParams.showUnapproved || queryParams.showUnapproved === 'true') {
    status.push('unapproved');
  }
  return status;
};

const getPurchaseFilterChips = (
  queryParams: QueryParams,
  vendors: VendorOption[] = []
): FilterChip[] => {
  const chips: FilterChip[] = [];
  const status = getApprovalStatus(queryParams);
  const bothStatuses =
    status.includes('approved') && status.includes('unapproved');

  if (!bothStatuses) {
    const label =
      status.length === 0
        ? 'None'
        : status.map((s) => (s === 'approved' ? 'Approved' : 'Unapproved')).join(', ');
    chips.push({ key: 'approvalStatus', label: 'Status', value: label });
  }

  if (hasFilterValue(queryParams.startDate ? String(queryParams.startDate) : null)) {
    chips.push({
      key: 'startDate',
      label: 'Start Date',
      value: String(queryParams.startDate),
    });
  }
  if (hasFilterValue(queryParams.endDate ? String(queryParams.endDate) : null)) {
    chips.push({
      key: 'endDate',
      label: 'End Date',
      value: String(queryParams.endDate),
    });
  }

  const vendorId = queryParams.vendorId ? String(queryParams.vendorId) : '';
  if (hasFilterValue(vendorId)) {
    const vendor = vendors.find((item) => item._id === vendorId);
    chips.push({
      key: 'vendorId',
      label: 'Vendor',
      value: vendor?.name || vendorId,
    });
  }

  return chips;
};

export const PurchaseFilterChips = ({
  refreshPage,
  queryParams,
  vendorsByPhysicalStoreId,
}: Props) => {
  const chips = useMemo(
    () => getPurchaseFilterChips(queryParams, vendorsByPhysicalStoreId),
    [queryParams, vendorsByPhysicalStoreId]
  );

  if (chips.length === 0) return null;

  const clearChip = (key: FilterChipKey) => {
    if (key === 'approvalStatus') {
      refreshPage({
        approvalStatus: ['approved', 'unapproved'],
        pageIndex: 0,
      });
      return;
    }
    if (key === 'vendorId') {
      refreshPage({ vendorId: '', pageIndex: 0 });
      return;
    }
    if (key === 'startDate') {
      refreshPage({ startDate: null, pageIndex: 0 });
      return;
    }
    refreshPage({ endDate: null, pageIndex: 0 });
  };

  const clearAll = () => {
    refreshPage({
      approvalStatus: ['approved', 'unapproved'],
      vendorId: '',
      startDate: null,
      endDate: null,
      pageIndex: 0,
    });
  };

  return (
    <Flex
      wrap="wrap"
      gap={8}
      align="center"
      justify="flex-end"
      className="list-filter-chips"
    >
      {chips.map((chip) => (
        <Tag
          key={chip.key}
          closable
          onClose={(event) => {
            event.preventDefault();
            clearChip(chip.key);
          }}
        >
          <span>
            {chip.label}: {chip.value}
          </span>
        </Tag>
      ))}
      <Button type="link" size="small" onClick={clearAll}>
        Clear all
      </Button>
    </Flex>
  );
};

const ListFilter = ({
  refreshPage,
  refreshData,
  queryParams,
  vendorsByPhysicalStoreId,
}: Props) => {
  const [form] = Form.useForm<FilterValues>();
  const [open, setOpen] = useState(false);

  const status = getApprovalStatus(queryParams);
  const mStartDate = queryParams.startDate
    ? dayjs(String(queryParams.startDate), Formats.DATE_FORMAT)
    : null;
  const mEndDate = queryParams.endDate
    ? dayjs(String(queryParams.endDate), Formats.DATE_FORMAT)
    : null;
  const vendorId = queryParams.vendorId
    ? String(queryParams.vendorId)
    : undefined;

  const activeFilterCount = getPurchaseFilterChips(
    queryParams,
    vendorsByPhysicalStoreId
  ).length;

  const syncFormValues = () => {
    form.setFieldsValue({
      approvalStatus: status,
      vendorId,
      startDate: mStartDate?.isValid() ? mStartDate : null,
      endDate: mEndDate?.isValid() ? mEndDate : null,
    });
  };

  const handleFinish = ({
    approvalStatus,
    vendorId: nextVendorId,
    startDate,
    endDate,
  }: FilterValues) => {
    refreshPage({
      approvalStatus,
      vendorId: nextVendorId || '',
      startDate: startDate ?? null,
      endDate: endDate ?? null,
      pageIndex: 0,
    });
    setOpen(false);
  };

  const handleRefresh = () => {
    if (!refreshData) return;
    Promise.resolve(refreshData()).then(() => {
      message.success('Data Reloaded', 2);
    });
  };

  const filterForm = (
    <div className="list-filter-panel" style={FilterPanelStyle}>
      <Form
        form={form}
        layout="horizontal"
        style={FilterFormStyle}
        onFinish={handleFinish}
      >
        <CheckboxGroupField
          fieldName="approvalStatus"
          fieldLabel="Status"
          fieldLayout={formItemLayout}
          options={[
            { label: 'Approved', value: 'approved' },
            { label: 'Unapproved', value: 'unapproved' },
          ]}
          initialValue={status}
        />
        <DateField
          fieldName="startDate"
          fieldLabel="Start Date"
          fieldLayout={formItemLayout}
          required={false}
          initialValue={mStartDate?.isValid() ? mStartDate : null}
        />
        <DateField
          fieldName="endDate"
          fieldLabel="End Date"
          fieldLayout={formItemLayout}
          required={false}
          initialValue={mEndDate?.isValid() ? mEndDate : null}
        />
        <SelectField<VendorOption>
          data={vendorsByPhysicalStoreId}
          getDataValue={({ _id }) => _id ?? ''}
          getDataText={({ name }) => name ?? ''}
          fieldName="vendorId"
          fieldLabel="Vendor"
          fieldLayout={formItemLayout}
          initialValue={vendorId}
        />
        <Form.Item style={{ marginBottom: 0 }}>
          <Flex justify="flex-end">
            <Button type="primary" htmlType="submit">
              Search
            </Button>
          </Flex>
        </Form.Item>
      </Form>
    </div>
  );

  return (
    <Space size={8}>
      <Popover
        trigger="click"
        placement="bottomRight"
        open={open}
        onOpenChange={(nextOpen) => {
          if (nextOpen) syncFormValues();
          setOpen(nextOpen);
        }}
        content={filterForm}
      >
        <Badge count={activeFilterCount} size="small" offset={[-2, 2]}>
          <Button icon={<FilterOutlined />}>Filter</Button>
        </Badge>
      </Popover>
      {refreshData ? (
        <Button
          icon={<SyncOutlined />}
          onClick={handleRefresh}
          title="Reload Data"
        />
      ) : null}
    </Space>
  );
};

export default ListFilter;
