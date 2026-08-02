import React from 'react';
import dayjs from 'dayjs';
import { type CSSProperties } from 'react';
import { Button, Collapse, Form, Row } from 'antd';

import { Formats } from 'meteor/idreesia-common/constants';
import {
  TreeSelectField,
  CheckboxGroupField,
  DateField,
} from '/imports/ui/modules/helpers/fields';
import { RefreshButton } from '/imports/ui/modules/helpers/controls';

const ContainerStyle: CSSProperties = {
  width: '500px',
};

const formItemLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 12 },
};

const buttonItemLayout = {
  wrapperCol: { span: 12, offset: 4 },
};

interface LocationRecord {
  _id: string | null;
  name: string | null;
}

export interface IssuanceListFilterParams {
  approvalStatus?: string[];
  locationId?: string;
  startDate?: dayjs.Dayjs | null;
  endDate?: dayjs.Dayjs | null;
  pageIndex?: number;
  pageSize?: number;
}

interface ListFilterProps {
  allLocations?: LocationRecord[];
  refreshPage(params: IssuanceListFilterParams): void;
  queryParams: Record<string, string | number | boolean | null | undefined | string[]>;
  refreshData?(): void;
}

const ListFilter = ({
  allLocations,
  refreshPage,
  queryParams,
  refreshData,
}: ListFilterProps) => {
  const handleFinish = ({
    approvalStatus,
    locationId,
    startDate,
    endDate,
  }: IssuanceListFilterParams) => {
    refreshPage({
      approvalStatus,
      locationId,
      startDate,
      endDate,
      pageIndex: 0,
    });
  };

  const handleReset = () => {
    refreshPage({
      approvalStatus: ['approved', 'unapproved'],
      locationId: '',
      startDate: null,
      endDate: null,
      pageIndex: 0,
    });
  };

  const {
    startDate,
    endDate,
    locationId,
    showApproved,
    showUnapproved,
  } = queryParams;

  const mStartDate = startDate ? dayjs(String(startDate), Formats.DATE_FORMAT) : null;
  const mEndDate = endDate ? dayjs(String(endDate), Formats.DATE_FORMAT) : null;
  const status: string[] = [];
  if (!showApproved || showApproved === 'true') status.push('approved');
  if (!showUnapproved || showUnapproved === 'true') status.push('unapproved');

  return (
    <Collapse
      style={ContainerStyle}
      items={[
        {
          key: '1',
          label: 'Filter',
            extra: <RefreshButton refreshData={refreshData ? async () => { refreshData(); } : undefined} />,
          children: (
            <Form layout="horizontal" onFinish={handleFinish}>
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
              <TreeSelectField
                data={allLocations ?? []}
                fieldName="locationId"
                fieldLabel="Location"
                fieldLayout={formItemLayout}
                initialValue={locationId ? String(locationId) : undefined}
              />

              <Form.Item {...buttonItemLayout}>
                <Row justify="end">
                  <Button type="default" onClick={handleReset}>
                    Reset
                  </Button>
                  &nbsp;
                  <Button type="primary" htmlType="submit">
                    Search
                  </Button>
                </Row>
              </Form.Item>
            </Form>
          ),
        },
      ]}
    />
  );
};

export default ListFilter;
