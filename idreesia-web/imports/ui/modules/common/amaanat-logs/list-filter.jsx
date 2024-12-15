import React from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import { Button, Collapse, Form, Row } from 'antd';

import { Formats } from 'meteor/idreesia-common/constants';
import { CascaderField, DateField } from '/imports/ui/modules/helpers/fields';
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

const ListFilter = props => {
  const { refreshData } = props;

  const handleFinish = ({ cityIdMehfilId, startDate, endDate }) => {
    const { setPageParams } = props;
    setPageParams({
      cityId: cityIdMehfilId[0],
      cityMehfilId: cityIdMehfilId[1],
      startDate: startDate ? startDate.format(Formats.DATE_FORMAT) : null,
      endDate: endDate ? startDate.format(Formats.DATE_FORMAT) : null,
      pageIndex: 0,
    });
  };

  const handleReset = () => {
    const { setPageParams } = props;
    setPageParams({
      cityId: null,
      cityMehfilId: null,
      startDate: null,
      endDate: null,
      pageIndex: 0,
    });
  };

  const refreshButton = () => <RefreshButton refreshData={refreshData} />;

  const {
    cities,
    cityMehfils,
    cityId,
    cityMehfilId,
    startDate,
    endDate,
  } = props;
  const cityMehfilCascaderData = getCityMehfilCascaderData(cities, cityMehfils);

  const mStartDate = dayjs(startDate, Formats.DATE_FORMAT);
  const mEndDate = dayjs(endDate, Formats.DATE_FORMAT);

  return (
    <Collapse style={ContainerStyle}>
      <Collapse.Panel header="Filter" key="1" extra={refreshButton()}>
        <Form layout="horizontal" onFinish={handleFinish}>
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
};

ListFilter.propTypes = {
  cities: PropTypes.array,
  cityMehfils: PropTypes.array,

  cityId: PropTypes.string,
  cityMehfilId: PropTypes.string,
  startDate: PropTypes.string,
  endDate: PropTypes.string,
  setPageParams: PropTypes.func,
  refreshData: PropTypes.func,
};

export default ListFilter;
