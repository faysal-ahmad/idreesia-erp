import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

import { Formats } from 'meteor/idreesia-common/constants';
import {
  Button,
  Collapse,
  Form,
  Icon,
  Row,
  Tooltip,
} from '/imports/ui/controls';
import { CascaderField, DateField } from '/imports/ui/modules/helpers/fields';
import { getCityMehfilCascaderData } from '/imports/ui/modules/outstation/common/utilities';

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
    validateFields((err, { cityIdMehfilId, startDate, endDate }) => {
      if (err) return;
      setPageParams({
        cityId: cityIdMehfilId[0],
        cityMehfilId: cityIdMehfilId[1],
        startDate: startDate ? startDate.format(Formats.DATE_FORMAT) : null,
        endDate: endDate ? startDate.format(Formats.DATE_FORMAT) : null,
        pageIndex: 0,
      });
    });
  };

  const handleReset = () => {
    const { setPageParams } = props;
    setPageParams({
      cityId: null,
      cityMehfilId: null,
      month: null,
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
    cities,
    cityMehfils,
    cityId,
    cityMehfilId,
    startDate,
    endDate,
  } = props;
  const cityMehfilCascaderData = getCityMehfilCascaderData(cities, cityMehfils);

  const mStartDate = moment(startDate, Formats.DATE_FORMAT);
  const mEndDate = moment(endDate, Formats.DATE_FORMAT);

  return (
    <Collapse style={ContainerStyle}>
      <Collapse.Panel header="Filter" key="1" extra={refreshButton()}>
        <Form layout="horizontal" onSubmit={handleSubmit}>
          <CascaderField
            data={cityMehfilCascaderData}
            fieldName="cityIdMehfilId"
            fieldLabel="City/Mehfil"
            fieldLayout={formItemLayout}
            initialValue={[cityId, cityMehfilId]}
            getFieldDecorator={getFieldDecorator}
          />
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
  cities: PropTypes.array,
  cityMehfils: PropTypes.array,

  cityId: PropTypes.string,
  cityMehfilId: PropTypes.string,
  startDate: PropTypes.string,
  endDate: PropTypes.string,
  setPageParams: PropTypes.func,
  refreshData: PropTypes.func,
};

export default Form.create()(ListFilter);
