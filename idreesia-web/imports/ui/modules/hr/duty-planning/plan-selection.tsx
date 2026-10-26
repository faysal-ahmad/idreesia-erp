import React, { useMemo } from 'react';
import dayjs from 'dayjs';
import { SyncOutlined } from '@ant-design/icons';
import { Button, DatePicker, Segmented, Space, Spin, TreeSelect } from 'antd';

import {
  useAllDutyLocations,
  useAllMSDuties,
} from '/imports/ui/modules/hr/common/hooks';

interface LocationOption {
  _id: string;
  dutyId: string;
  name: string;
}

interface DutyOption {
  _id: string;
  name: string;
}

export interface SelectedPlan {
  duty: { _id: string; name: string };
  location: { _id: string; name: string };
}

interface PlanSelectionProps {
  locationId: string;
  onLocationIdChange: (locationId: string) => void;
  daysStart: string;
  onDaysStartChange: (value: string) => void;
  view: 'days' | 'week';
  onViewChange: (view: 'days' | 'week') => void;
  refreshing: boolean;
  onRefresh: () => void;
  children: (selection: SelectedPlan | null) => React.ReactNode;
}

const PlanSelection = ({
  locationId,
  onLocationIdChange,
  daysStart,
  onDaysStartChange,
  view,
  onViewChange,
  refreshing,
  onRefresh,
  children,
}: PlanSelectionProps) => {
  const { allMSDuties, allMSDutiesLoading } = useAllMSDuties();
  const { allDutyLocations, allDutyLocationsLoading } = useAllDutyLocations();

  const duties = (allMSDuties ?? []).filter(
    (duty): duty is DutyOption => duty?._id != null && duty.name != null
  );
  const locations = (allDutyLocations ?? []).filter(
    (item): item is LocationOption =>
      item?._id != null && item.dutyId != null && item.name != null
  );
  const treeData = useMemo(
    () =>
      duties
        .slice()
        .sort((left, right) => left.name.localeCompare(right.name))
        .flatMap(duty => {
          const dutyChildren = locations
            .filter(item => item.dutyId === duty._id)
            .sort((left, right) => left.name.localeCompare(right.name))
            .map(item => ({
              title: item.name,
              label: `${duty.name} · ${item.name}`,
              value: item._id,
            }));
          if (dutyChildren.length === 0) return [];
          return [
            {
              title: duty.name,
              value: `duty:${duty._id}`,
              selectable: false,
              children: dutyChildren,
            },
          ];
        }),
    [duties, locations]
  );

  const selectedLocation = locations.find(item => item._id === locationId);
  const selectedDuty = duties.find(duty => duty._id === selectedLocation?.dutyId);
  const selection =
    selectedDuty && selectedLocation
      ? {
          duty: { _id: selectedDuty._id, name: selectedDuty.name },
          location: { _id: selectedLocation._id, name: selectedLocation.name },
        }
      : null;

  if (
    (allMSDutiesLoading && !allMSDuties) ||
    (allDutyLocationsLoading && !allDutyLocations)
  ) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <>
      <div className="duty-roster-selection">
        <div className="duty-roster-toolbar">
          <Space size={12}>
            <span className="duty-roster-select-label">Duty Location</span>
            <TreeSelect
              className="duty-roster-location-select"
              placeholder="Select a duty location"
              showSearch
              treeDefaultExpandAll
              treeNodeFilterProp="title"
              treeNodeLabelProp="label"
              treeData={treeData}
              value={locationId || undefined}
              onChange={value => onLocationIdChange(value ? String(value) : '')}
            />
          </Space>
          <Space size={12}>
            <DatePicker
              className="duty-roster-start-date"
              format="DD MMM, YYYY"
              allowClear={false}
              value={dayjs(daysStart)}
              onChange={value => {
                if (value) onDaysStartChange(value.format('YYYY-MM-DD'));
              }}
            />
            <Segmented
              value={view}
              options={[
                { label: '3 Days', value: 'days' },
                { label: 'Week', value: 'week' },
              ]}
              onChange={value => onViewChange(value === 'days' ? 'days' : 'week')}
            />
            <Button
              icon={<SyncOutlined />}
              title="Reload Data"
              disabled={!selection}
              loading={refreshing}
              onClick={onRefresh}
            />
          </Space>
        </div>
      </div>
      {children(selection)}
    </>
  );
};

export default PlanSelection;
