import React, { useMemo, useState, type CSSProperties } from 'react';
import { Badge, Button, Flex, Form, Popover, Space, Tag } from 'antd';
import { FilterOutlined, SyncOutlined } from '@ant-design/icons';

import { SelectField } from '/imports/ui/modules/helpers/fields';
import {
  useAllDutyLocations,
  useAllMSDuties,
} from '/imports/ui/modules/hr/common/hooks';

type PageParamValue = string | number | boolean | null | undefined;

export interface DutyRostersListFilterProps {
  setPageParams(params: Record<string, PageParamValue>): void;
  refreshData?: () => Promise<unknown>;
  dutyId?: string;
  locationId?: string;
}

interface FilterChip {
  key: 'dutyId' | 'locationId';
  label: string;
  value: string;
}

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

const hasFilterValue = (value?: string | null) =>
  value != null && String(value).trim() !== '';

export const getDutyRostersFilterChips = ({
  dutyId,
  locationId,
  dutyName,
  locationName,
}: {
  dutyId?: string;
  locationId?: string;
  dutyName?: string;
  locationName?: string;
}): FilterChip[] => {
  const chips: FilterChip[] = [];
  if (hasFilterValue(dutyId)) {
    chips.push({
      key: 'dutyId',
      label: 'Duty',
      value: dutyName || String(dutyId),
    });
  }
  if (hasFilterValue(locationId)) {
    chips.push({
      key: 'locationId',
      label: 'Location',
      value: locationName || String(locationId),
    });
  }
  return chips;
};

export const DutyRostersFilterChips = ({
  setPageParams,
  dutyId,
  locationId,
  dutyName,
  locationName,
}: DutyRostersListFilterProps & {
  dutyName?: string;
  locationName?: string;
}) => {
  const chips = useMemo(
    () =>
      getDutyRostersFilterChips({
        dutyId,
        locationId,
        dutyName,
        locationName,
      }),
    [dutyId, locationId, dutyName, locationName]
  );

  if (chips.length === 0) return null;

  const clearChip = (key: FilterChip['key']) => {
    setPageParams({
      [key]: '',
      ...(key === 'dutyId' ? { locationId: '' } : {}),
    });
  };

  const clearAll = () => {
    setPageParams({
      dutyId: '',
      locationId: '',
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
      {chips.map(chip => (
        <Tag
          key={chip.key}
          closable
          onClose={event => {
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
  setPageParams,
  refreshData,
  dutyId,
  locationId,
}: DutyRostersListFilterProps) => {
  const [form] = Form.useForm();
  const [open, setOpen] = useState(false);
  const { allMSDuties } = useAllMSDuties();
  const { allDutyLocations } = useAllDutyLocations();
  const watchedDutyId = Form.useWatch('dutyId', form);

  const duties = (allMSDuties ?? []).filter(
    (duty): duty is { _id: string; name: string } =>
      duty?._id != null && duty.name != null
  );
  const locations = (allDutyLocations ?? []).filter(
    (location): location is { _id: string; dutyId: string; name: string } =>
      location?._id != null &&
      location.name != null &&
      (!watchedDutyId || location.dutyId === watchedDutyId)
  );

  const dutyName = duties.find(duty => duty._id === dutyId)?.name;
  const locationName = (allDutyLocations ?? []).find(
    location => location?._id === locationId
  )?.name;
  const activeFilterCount = getDutyRostersFilterChips({
    dutyId,
    locationId,
    dutyName: dutyName ?? undefined,
    locationName: locationName ?? undefined,
  }).length;

  const syncFormValues = () => {
    form.setFieldsValue({ dutyId, locationId });
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (nextOpen) syncFormValues();
  };

  const handleSearch = () => {
    form.validateFields().then(values => {
      setPageParams({
        dutyId: values.dutyId || '',
        locationId: values.locationId || '',
      });
      setOpen(false);
    });
  };

  const handleRefresh = () => {
    refreshData?.();
  };

  const content = (
    <div className="list-filter-panel" style={FilterPanelStyle}>
      <Form form={form} layout="horizontal" style={FilterFormStyle}>
        <SelectField
          data={duties}
          fieldName="dutyId"
          fieldLabel="Duty"
          fieldLayout={formItemLayout}
          placeholder="Select a duty"
          onChange={() => form.setFieldValue('locationId', undefined)}
        />
        <SelectField
          data={locations}
          fieldName="locationId"
          fieldLabel="Location"
          fieldLayout={formItemLayout}
          placeholder="Select a location"
        />
        <Flex justify="flex-end">
          <Button type="primary" onClick={handleSearch}>
            Search
          </Button>
        </Flex>
      </Form>
    </div>
  );

  return (
    <Space size={8}>
      <Popover
        content={content}
        trigger="click"
        placement="bottomRight"
        open={open}
        onOpenChange={handleOpenChange}
      >
        <Badge count={activeFilterCount}>
          <Button icon={<FilterOutlined />}>Filter</Button>
        </Badge>
      </Popover>
      <Button icon={<SyncOutlined />} onClick={handleRefresh} title="Reload Data" />
    </Space>
  );
};

export default ListFilter;
