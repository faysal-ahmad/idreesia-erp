import React, { Component } from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import { Button, Collapse, Form, Row } from 'antd';

import { RefreshButton } from '/imports/ui/modules/helpers/controls';
import { Formats } from 'meteor/idreesia-common/constants';
import {
  CheckboxGroupField,
  DateField,
} from '/imports/ui/modules/helpers/fields';

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
const CheckboxField = CheckboxGroupField as any;
const FilterDateField = DateField as any;
const RefreshButtonComponent = RefreshButton as any;

interface QueryParams {
  startDate?: string;
  endDate?: string;
  showApproved?: string;
  showUnapproved?: string;
}

interface RefreshParams {
  approvalStatus?: string[];
  startDate?: dayjs.Dayjs | null;
  endDate?: dayjs.Dayjs | null;
  pageIndex?: number;
}

interface ListFilterProps {
  refreshPage(params: RefreshParams): void;
  refreshData?(): void;
  queryParams: QueryParams;
}

class ListFilter extends Component<ListFilterProps> {
  static propTypes = {
    refreshPage: PropTypes.func,
    refreshData: PropTypes.func,
    queryParams: PropTypes.object,
  };

  handleFinish = ({ approvalStatus, startDate, endDate }: RefreshParams) => {
    const { refreshPage } = this.props;
    refreshPage({
      approvalStatus,
      startDate,
      endDate,
      pageIndex: 0,
    });
  };

  handleReset = () => {
    const { refreshPage } = this.props;
    refreshPage({
      approvalStatus: ['approved', 'unapproved'],
      startDate: null,
      endDate: null,
      pageIndex: 0,
    });
  };

  refreshButton = () => (
    <RefreshButtonComponent refreshData={this.props.refreshData} />
  );

  render() {
    const {
      queryParams: { startDate, endDate, showApproved, showUnapproved },
    } = this.props;

    const mStartDate = startDate ? dayjs(startDate, Formats.DATE_FORMAT) : null;
    const mEndDate = endDate ? dayjs(endDate, Formats.DATE_FORMAT) : null;
    const status = [];
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
                  initialValue={mStartDate}
                />
                <FilterDateField
                  fieldName="endDate"
                  fieldLabel="End Date"
                  fieldLayout={formItemLayout}
                  required={false}
                  initialValue={mEndDate}
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
