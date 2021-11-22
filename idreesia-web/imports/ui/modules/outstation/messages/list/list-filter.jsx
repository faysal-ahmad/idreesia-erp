import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Button, Collapse, Form, Row } from 'antd';

import { Formats } from 'meteor/idreesia-common/constants';
import { DateField } from '/imports/ui/modules/helpers/fields';
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

  const handleSubmit = e => {
    e.preventDefault();
    const {
      setPageParams,
      form: { validateFields },
    } = props;
    validateFields((err, { startDate, endDate }) => {
      if (err) return;
      setPageParams({
        startDate: startDate ? startDate.format(Formats.DATE_FORMAT) : null,
        endDate: endDate ? startDate.format(Formats.DATE_FORMAT) : null,
        pageIndex: 0,
      });
    });
  };

  const handleReset = () => {
    const { setPageParams } = props;
    setPageParams({
      startDate: null,
      endDate: null,
      pageIndex: 0,
    });
  };

  const refreshButton = () => <RefreshButton refreshData={refreshData} />;

  const {
    startDate,
    endDate,
  } = props;

  const mStartDate = moment(startDate, Formats.DATE_FORMAT);
  const mEndDate = moment(endDate, Formats.DATE_FORMAT);

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
          />
          <DateField
            fieldName="endDate"
            fieldLabel="End Date"
            fieldLayout={formItemLayout}
            required={false}
            initialValue={mEndDate.isValid() ? mEndDate : null}
          />
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
  setPageParams: PropTypes.func,
  refreshData: PropTypes.func,
};

export default ListFilter;
