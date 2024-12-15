import React from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import { Button, Collapse, Form, Row } from 'antd';

import { Formats } from 'meteor/idreesia-common/constants';
import { MessageSource } from 'meteor/idreesia-common/constants/communication';
import { noop } from 'meteor/idreesia-common/utilities/lodash';
import { DateField, SelectField } from '/imports/ui/modules/helpers/fields';
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

const ListFilter = props => {
  const { refreshData } = props;

  const handleFinish = ({ startDate, endDate, source }) => {
    const { setPageParams } = props;
    setPageParams({
      startDate: startDate ? startDate.format(Formats.DATE_FORMAT) : null,
      endDate: endDate ? endDate.format(Formats.DATE_FORMAT) : null,
      source,
      pageIndex: 0,
    });
  };

  const handleReset = () => {
    const { setPageParams } = props;
    setPageParams({
      startDate: null,
      endDate: null,
      source: null,
      pageIndex: 0,
    });
  };

  const refreshButton = () => <RefreshButton refreshData={refreshData} />;

  const {
    startDate,
    endDate,
    source,
    showSourceFilter,
  } = props;

  const mStartDate = dayjs(startDate, Formats.DATE_FORMAT);
  const mEndDate = dayjs(endDate, Formats.DATE_FORMAT);

  const sourceFilter = showSourceFilter ? (
    <SelectField
      fieldName="source"
      fieldLabel="Source"
      required={false}
      data={[
        {
          label: 'HR',
          value: MessageSource.HR,
        },
        {
          label: 'Outstation',
          value: MessageSource.OUTSTATION,
        },
        {
          label: 'Operations',
          value: MessageSource.OPERATIONS,
        },
      ]}
      getDataValue={({ value }) => value}
      getDataText={({ label }) => label}
      initialValue={source}
      fieldLayout={formItemLayout}
    />
  ) : null;

  return (
    <Collapse style={ContainerStyle}>
      <Collapse.Panel header="Filter" key="1" extra={refreshButton()}>
        <Form layout="horizontal" onFinish={handleFinish}>
          <DateField
            fieldName="startDate"
            fieldLabel="Start Date"
            fieldLayout={formItemLayout}
            required={false}
            initialValue={mStartDate.isValid() ? mStartDate : null}
          />
          <DateField
            fieldName="endDate"
            fieldLabel="End Date"
            fieldLayout={formItemLayout}
            required={false}
            initialValue={mEndDate.isValid() ? mEndDate : null}
          />
          {sourceFilter}
          <Form.Item {...buttonItemLayout}>
            <Row type="flex" justify="end">
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
      </Collapse.Panel>
    </Collapse>
  );
};

ListFilter.propTypes = {
  startDate: PropTypes.string,
  endDate: PropTypes.string,
  source: PropTypes.string,
  showSourceFilter: PropTypes.bool,
  setPageParams: PropTypes.func,
  refreshData: PropTypes.func,
};

ListFilter.defaultProps = {
  showSourceFilter: false,
  setPageParams: noop,
  refreshData: noop,
};

export default ListFilter;
