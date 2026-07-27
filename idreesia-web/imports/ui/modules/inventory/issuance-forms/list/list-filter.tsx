import React, { Component } from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import { Button, Collapse, Form, Row } from 'antd';

import { Formats } from 'meteor/idreesia-common/constants';
import {
  TreeSelectField,
  CheckboxGroupField,
  DateField,
} from '/imports/ui/modules/helpers/fields';
import { RefreshButton } from '/imports/ui/modules/helpers/controls';

const ContainerStyle = {
  width: '500px',
};

const formItemLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 12 },
};

const buttonItemLayout = {
  wrapperCol: { span: 12, offset: 4 },
};

const AntButton = Button as any;
const AntCollapse = Collapse as any;
const AntForm = Form as any;
const AntFormItem = Form.Item as any;
const AntRow = Row as any;
const TreeField = TreeSelectField as any;
const CheckboxField = CheckboxGroupField as any;
const FilterDateField = DateField as any;
const RefreshButtonComponent = RefreshButton as any;
interface LocationRecord { _id: string; name: string; }
interface QueryParams {
  startDate?: string;
  endDate?: string;
  locationId?: string;
  showApproved?: string;
  showUnapproved?: string;
}
interface FilterValues {
  approvalStatus?: string[];
  locationId?: string;
  startDate?: dayjs.Dayjs | null;
  endDate?: dayjs.Dayjs | null;
  pageIndex?: number;
}
interface ListFilterProps {
  allLocations?: LocationRecord[];
  refreshPage(params: FilterValues): void;
  queryParams: QueryParams;
  refreshData?(): void;
}

class ListFilter extends Component<ListFilterProps> {
  static propTypes = {
    allLocations: PropTypes.array,
    refreshPage: PropTypes.func,
    queryParams: PropTypes.object,
    refreshData: PropTypes.func,
  };

  handleFinish = ({ approvalStatus, locationId, startDate, endDate }: FilterValues) => {
    const { refreshPage } = this.props;
    refreshPage({
      approvalStatus,
      locationId,
      startDate,
      endDate,
      pageIndex: 0,
    });
  };

  handleReset = () => {
    const { refreshPage } = this.props;
    refreshPage({
      approvalStatus: ['approved', 'unapproved'],
      locationId: '',
      startDate: null,
      endDate: null,
      pageIndex: 0,
    });
  };

  refreshButton = () => <RefreshButtonComponent refreshData={this.props.refreshData} />;

  render() {
    const { allLocations } = this.props;
    const {
      queryParams: {
        startDate,
        endDate,
        locationId,
        showApproved,
        showUnapproved,
      },
    } = this.props;

    const mStartDate = startDate ? dayjs(startDate, Formats.DATE_FORMAT) : null;
    const mEndDate = endDate ? dayjs(endDate, Formats.DATE_FORMAT) : null;
    const status: string[] = [];
    if (!showApproved || showApproved === 'true') status.push('approved');
    if (!showUnapproved || showUnapproved === 'true') status.push('unapproved');

    return (
      <AntCollapse
        style={ContainerStyle}
        items={[
          {
            key: '1',
            label: 'Filter',
            extra: this.refreshButton(),
            children: (
              <AntForm layout="horizontal" onFinish={this.handleFinish}>
                <CheckboxField
                  fieldName="approvalStatus"
                  fieldLabel="Status"
                  fieldLayout={formItemLayout}
                  options={[
                    { label: 'Approved', value: 'approved' },
                    { label: 'Unapproved', value: 'unapproved' },
                  ]}
                  initialValue={status}
                />
                <FilterDateField
                  fieldName="startDate"
                  fieldLabel="Start Date"
                  fieldLayout={formItemLayout}
                  required={false}
                  initialValue={mStartDate?.isValid() ? mStartDate : null}
                />
                <FilterDateField
                  fieldName="endDate"
                  fieldLabel="End Date"
                  fieldLayout={formItemLayout}
                  required={false}
                  initialValue={mEndDate?.isValid() ? mEndDate : null}
                />
                <TreeField
                  data={allLocations ?? []}
                  fieldName="locationId"
                  fieldLabel="Location"
                  fieldLayout={formItemLayout}
                  initialValue={locationId}
                />

                <AntFormItem {...buttonItemLayout}>
                  <AntRow type="flex" justify="end">
                    <AntButton type="default" onClick={this.handleReset}>
                      Reset
                    </AntButton>
                    &nbsp;
                    <AntButton type="primary" htmlType="submit">
                      Search
                    </AntButton>
                  </AntRow>
                </AntFormItem>
              </AntForm>
            ),
          },
        ]}
      />
    );
  }
}

export default ListFilter;
