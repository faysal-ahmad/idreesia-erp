import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

import { Formats } from 'meteor/idreesia-common/constants';
import { MessageSource } from 'meteor/idreesia-common/constants/communication';
import { noop } from 'meteor/idreesia-common/utilities/lodash';
import {
  Button,
  Collapse,
  Form,
  Icon,
  Row,
  Tooltip,
} from '/imports/ui/controls';
import { DateField, SelectField } from '/imports/ui/modules/helpers/fields';

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
  const handleSubmit = e => {
    e.preventDefault();
    const {
      setPageParams,
      form: { validateFields },
    } = props;
    validateFields((err, { startDate, endDate, source }) => {
      if (err) return;
      setPageParams({
        startDate: startDate ? startDate.format(Formats.DATE_FORMAT) : null,
        endDate: endDate ? endDate.format(Formats.DATE_FORMAT) : null,
        source,
        pageIndex: 0,
      });
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

  const refreshButton = () => {
    const { refreshData } = props;

    return (
      <Tooltip title="Reload Data">
        <Icon
          type="sync"
          onClick={event => {
            event.stopPropagation();
            if (refreshData) refreshData();
          }}
        />
      </Tooltip>
    );
  };

  const {
    form: { getFieldDecorator },
    startDate,
    endDate,
    source,
    showSourceFilter,
  } = props;

  const mStartDate = moment(startDate, Formats.DATE_FORMAT);
  const mEndDate = moment(endDate, Formats.DATE_FORMAT);

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
          label: 'Communication',
          value: MessageSource.COMMUNICATION,
        },
      ]}
      getDataValue={({ value }) => value}
      getDataText={({ label }) => label}
      initialValue={source}
      fieldLayout={formItemLayout}
      getFieldDecorator={getFieldDecorator}
    />
  ) : null;

  return (
    <Collapse style={ContainerStyle}>
      <Collapse.Panel header="Filter" key="1" extra={refreshButton()}>
        <Form layout="horizontal" onSubmit={handleSubmit}>
          <DateField
            fieldName="startDate"
            fieldLabel="Start Date"
            fieldLayout={formItemLayout}
            required={false}
            initialValue={mStartDate.isValid() ? mStartDate : null}
            getFieldDecorator={getFieldDecorator}
          />
          <DateField
            fieldName="endDate"
            fieldLabel="End Date"
            fieldLayout={formItemLayout}
            required={false}
            initialValue={mEndDate.isValid() ? mEndDate : null}
            getFieldDecorator={getFieldDecorator}
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
  form: PropTypes.object,
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

export default Form.create()(ListFilter);
