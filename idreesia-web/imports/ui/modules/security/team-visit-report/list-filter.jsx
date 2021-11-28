import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Collapse, Form, Row, Button } from 'antd';

import { Formats } from 'meteor/idreesia-common/constants';
import {
  AutoCompleteField,
  DateField,
} from '/imports/ui/modules/helpers/fields';

import { WithDistinctTeamNames } from 'meteor/idreesia-common/composers/security';

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

class ListFilter extends Component {
  static propTypes = {
    setPageParams: PropTypes.func,
    queryParams: PropTypes.object,

    distinctTeamNamesLoading: PropTypes.bool,
    distinctTeamNames: PropTypes.array,
  };

  handleFinish = ({ startDate, endDate, teamName }) => {
    const { setPageParams } = this.props;
    setPageParams({
      startDate,
      endDate,
      teamName,
      pageIndex: 0,
    });
  };

  handleReset = () => {
    const { setPageParams } = this.props;
    setPageParams({
      startDate: null,
      endDate: null,
      teamName: null,
      pageIndex: 0,
    });
  };

  render() {
    const {
      distinctTeamNames,
      queryParams: { startDate, endDate, teamName },
    } = this.props;

    const mStartDate = moment(startDate, Formats.DATE_FORMAT);
    const mEndDate = moment(endDate, Formats.DATE_FORMAT);

    return (
      <Collapse style={ContainerStyle}>
        <Collapse.Panel header="Filter" key="1">
          <Form layout="horizontal" onFinish={this.handleFinish}>
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
            <AutoCompleteField
              fieldName="teamName"
              fieldLabel="Team Name"
              fieldLayout={formItemLayout}
              dataSource={distinctTeamNames}
              initialValue={teamName}
              required={false}
            />

            <Form.Item {...buttonItemLayout}>
              <Row type="flex" justify="end">
                <Button type="default" onClick={this.handleReset}>
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
}

export default WithDistinctTeamNames()(ListFilter);
