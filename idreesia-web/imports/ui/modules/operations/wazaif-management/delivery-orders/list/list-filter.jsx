import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Button, Collapse, Form, Row } from 'antd';

import { Formats } from 'meteor/idreesia-common/constants';
import {
  CascaderField,
  CheckboxGroupField,
  DateField,
} from '/imports/ui/modules/helpers/fields';
import { RefreshButton } from '/imports/ui/modules/helpers/controls';
import { getCityMehfilCascaderData } from '/imports/ui/modules/common/utilities';

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

const ListFilter = ({
  allCities,
  allCityMehfils,
  refreshPage,
  queryParams,
  refreshData,
}) => {
  const cityMehfilCascaderData = getCityMehfilCascaderData(allCities, allCityMehfils);

  const handleFinish = ({ completedStatus, cityIdMehfilId, startDate, endDate }) => {
    refreshPage({
      completedStatus,
      cityId: cityIdMehfilId[0],
      cityMehfilId: cityIdMehfilId[1],
      startDate,
      endDate,
      pageIndex: 0,
    });
  };

  const handleReset = () => {
    refreshPage({
      completedStatus: ['pending', 'completed'],
      cityId: null,
      cityMehfilId: null,
      startDate: null,
      endDate: null,
      pageIndex: 0,
    });
  };

  const refreshButton = () => <RefreshButton refreshData={refreshData} />;

  const {
    startDate,
    endDate,
    cityId,
    cityMehfilId,
    showPending,
    showCompleted,
  } = queryParams;

  const mStartDate = moment(startDate, Formats.DATE_FORMAT);
  const mEndDate = moment(endDate, Formats.DATE_FORMAT);
  const status = [];
  if (!showPending || showPending === 'true') status.push('pending');
  if (!showCompleted || showCompleted === 'true') status.push('completed');

  return (
    <Collapse style={ContainerStyle}>
      <Collapse.Panel header="Filter" key="1" extra={refreshButton()}>
        <Form layout="horizontal" onFinish={handleFinish}>
          <CheckboxGroupField
            fieldName="completedStatus"
            fieldLabel="Status"
            fieldLayout={formItemLayout}
            options={[
              { label: 'Pending', value: 'pending' },
              { label: 'Completed', value: 'completed' },
            ]}
            initialValue={status}
          />
          <CascaderField
            data={cityMehfilCascaderData}
            fieldName="cityIdMehfilId"
            fieldLabel="City/Mehfil"
            fieldLayout={formItemLayout}
            initialValue={[cityId, cityMehfilId]}
          />
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
}

ListFilter.propTypes = {
  allCities: PropTypes.array,
  allCityMehfils: PropTypes.array,
  refreshPage: PropTypes.func,
  queryParams: PropTypes.object,
  refreshData: PropTypes.func,
};

export default ListFilter;
