import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { Formats } from 'meteor/idreesia-common/constants';
import { Collapse, Form, Row, Button } from '/imports/ui/controls';
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
    form: PropTypes.object,
    setPageParams: PropTypes.func,
    queryParams: PropTypes.object,

    distinctTeamNamesLoading: PropTypes.bool,
    distinctTeamNames: PropTypes.array,
  };

  handleSubmit = e => {
    e.preventDefault();
    const { form, setPageParams } = this.props;

    form.validateFields((err, { startDate, endDate, teamName }) => {
      if (err) return;
      setPageParams({
        startDate,
        endDate,
        teamName,
        pageIndex: 0,
      });
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
    const { getFieldDecorator } = this.props.form;
    const {
      distinctTeamNames,
      queryParams: { startDate, endDate, teamName },
    } = this.props;

    const mStartDate = moment(startDate, Formats.DATE_FORMAT);
    const mEndDate = moment(endDate, Formats.DATE_FORMAT);

    return (
      <Collapse style={ContainerStyle}>
        <Collapse.Panel header="Filter" key="1">
          <Form layout="horizontal" onSubmit={this.handleSubmit}>
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
            <AutoCompleteField
              fieldName="teamName"
              fieldLabel="Team Name"
              fieldLayout={formItemLayout}
              dataSource={distinctTeamNames}
              initialValue={teamName}
              required={false}
              getFieldDecorator={getFieldDecorator}
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

export default flowRight(
  Form.create(),
  WithDistinctTeamNames()
)(ListFilter);
