import React, { useState, type CSSProperties } from 'react';
import dayjs, { type Dayjs } from 'dayjs';
import { Badge, Button, Flex, Form, Popover } from 'antd';
import { FilterOutlined } from '@ant-design/icons';

import { Formats } from 'meteor/idreesia-common/constants';
import {
  CheckboxField,
  DateField,
  SelectField,
} from '/imports/ui/modules/helpers/fields';

import type { FilterChip } from '../../common/filter-chips';
import { getReviewLabel, ReviewOptions } from '../../common/review-tag';

const FilterPanelStyle: CSSProperties = {
  width: 640,
  paddingTop: 4,
};

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};

export interface NamedOption {
  _id: string;
  name: string;
}

export interface AlertFilterParams {
  profileId?: string | null;
  channelId?: string | null;
  review?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  includeTest?: string | null;
}

interface FilterValues {
  profileId?: string;
  channelId?: string;
  review?: string;
  startDate?: Dayjs | null;
  endDate?: Dayjs | null;
  includeTest?: boolean;
}

const findName = (options: NamedOption[], id: string) =>
  options.find(({ _id }) => _id === id)?.name ?? id;

export const getAlertFilterChips = (
  {
    profileId,
    channelId,
    review,
    startDate,
    endDate,
    includeTest,
  }: AlertFilterParams,
  profiles: NamedOption[],
  channels: NamedOption[]
): FilterChip[] => {
  const chips: FilterChip[] = [];
  if (profileId) {
    chips.push({
      key: 'profileId',
      label: 'Profile',
      value: findName(profiles, profileId),
    });
  }
  if (channelId) {
    chips.push({
      key: 'channelId',
      label: 'Channel',
      value: findName(channels, channelId),
    });
  }
  if (review) {
    chips.push({
      key: 'review',
      label: 'Review',
      value: getReviewLabel(review),
    });
  }
  if (startDate)
    chips.push({ key: 'startDate', label: 'Start Date', value: startDate });
  if (endDate)
    chips.push({ key: 'endDate', label: 'End Date', value: endDate });
  if (includeTest === 'true') {
    chips.push({
      key: 'includeTest',
      label: 'Include',
      value: 'Test profiles',
    });
  }
  return chips;
};

interface Props {
  queryParams: AlertFilterParams;
  profiles: NamedOption[];
  channels: NamedOption[];
  setPageParams(params: Record<string, string | number | null>): void;
}

const ListFilter = ({
  queryParams,
  profiles,
  channels,
  setPageParams,
}: Props) => {
  const [form] = Form.useForm<FilterValues>();
  const [open, setOpen] = useState(false);
  const { profileId, channelId, review, startDate, endDate, includeTest } =
    queryParams;

  const syncFormValues = () => {
    form.setFieldsValue({
      profileId: profileId || undefined,
      channelId: channelId || undefined,
      review: review || undefined,
      startDate: startDate ? dayjs(startDate, Formats.DATE_FORMAT) : null,
      endDate: endDate ? dayjs(endDate, Formats.DATE_FORMAT) : null,
      includeTest: includeTest === 'true',
    });
  };

  const handleFinish = (values: FilterValues) => {
    setPageParams({
      profileId: values.profileId || null,
      channelId: values.channelId || null,
      review: values.review || null,
      startDate: values.startDate
        ? dayjs(values.startDate).format(Formats.DATE_FORMAT)
        : null,
      endDate: values.endDate
        ? dayjs(values.endDate).format(Formats.DATE_FORMAT)
        : null,
      includeTest: values.includeTest ? 'true' : null,
      pageIndex: 0,
    });
    setOpen(false);
  };

  const filterForm = (
    <div className="list-filter-panel" style={FilterPanelStyle}>
      <Form form={form} layout="horizontal" onFinish={handleFinish}>
        <SelectField<NamedOption>
          fieldName="profileId"
          fieldLabel="Profile"
          data={profiles}
          getDataValue={({ _id }) => _id}
          getDataText={({ name }) => name}
          fieldLayout={formItemLayout}
        />
        <SelectField<NamedOption>
          fieldName="channelId"
          fieldLabel="Channel"
          data={channels}
          getDataValue={({ _id }) => _id}
          getDataText={({ name }) => name}
          fieldLayout={formItemLayout}
        />
        <SelectField<(typeof ReviewOptions)[number]>
          fieldName="review"
          fieldLabel="Review"
          data={ReviewOptions}
          getDataValue={({ value }) => value}
          getDataText={({ label }) => label}
          fieldLayout={formItemLayout}
        />
        <DateField
          fieldName="startDate"
          fieldLabel="Start Date"
          required={false}
          fieldLayout={formItemLayout}
        />
        <DateField
          fieldName="endDate"
          fieldLabel="End Date"
          required={false}
          fieldLayout={formItemLayout}
        />
        <CheckboxField
          fieldName="includeTest"
          fieldLabel="Test Profiles"
          fieldLayout={formItemLayout}
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
    <Popover
      trigger="click"
      placement="bottomRight"
      open={open}
      onOpenChange={nextOpen => {
        if (nextOpen) syncFormValues();
        setOpen(nextOpen);
      }}
      content={filterForm}
    >
      <Badge
        count={getAlertFilterChips(queryParams, profiles, channels).length}
        size="small"
        offset={[-2, 2]}
      >
        <Button icon={<FilterOutlined />}>Filter</Button>
      </Badge>
    </Popover>
  );
};

export default ListFilter;
