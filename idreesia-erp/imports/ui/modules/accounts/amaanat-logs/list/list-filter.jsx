import React, { Component } from "react";
import PropTypes from "prop-types";
import { Collapse, Form, Row, Button } from "antd";
import moment from "moment";

import { Formats } from "meteor/idreesia-common/constants";
import {
  InputTextField,
  SelectField,
  DateField,
} from "/imports/ui/modules/helpers/fields";

const ContainerStyle = {
  width: "500px",
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

    fromCity: PropTypes.string,
    hasPortion: PropTypes.string,
    startDate: PropTypes.object,
    endDate: PropTypes.object,
    setPageParams: PropTypes.func,
  };

  handleSubmit = e => {
    e.preventDefault();
    const { form, setPageParams } = this.props;

    form.validateFields((err, { fromCity, hasPortion, startDate, endDate }) => {
      if (err) return;
      setPageParams({
        fromCity,
        hasPortion,
        startDate,
        endDate,
        pageIndex: 0,
      });
    });
  };

  handleReset = () => {
    const { setPageParams } = this.props;
    setPageParams({
      fromCity: null,
      hasPortion: null,
      startDate: null,
      endDate: null,
      pageIndex: 0,
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { startDate, endDate, fromCity, hasPortion } = this.props;

    const mStartDate = moment(startDate, Formats.DATE_FORMAT);
    const mEndDate = moment(endDate, Formats.DATE_FORMAT);

    return (
      <Collapse style={ContainerStyle}>
        <Collapse.Panel header="Filter" key="1">
          <Form layout="horizontal" onSubmit={this.handleSubmit}>
            <SelectField
              data={[
                {
                  value: "hasHadiaPortion",
                  text: "Has Hadia Portion",
                },
                {
                  value: "hasSadqaPortion",
                  text: "Has Sadqa Portion",
                },
                {
                  value: "hasZakaatPortion",
                  text: "Has Zakaat Portion",
                },
                {
                  value: "hasLangarPortion",
                  text: "Has Langar Portion",
                },
                {
                  value: "hasOtherPortion",
                  text: "Has Other Portion",
                },
              ]}
              getDataValue={({ value }) => value}
              getDataText={({ text }) => text}
              initialValue={hasPortion}
              fieldName="hasPortion"
              fieldLabel="Breakup"
              fieldLayout={formItemLayout}
              getFieldDecorator={getFieldDecorator}
            />
            <InputTextField
              fieldName="fromCity"
              fieldLabel="From City"
              fieldLayout={formItemLayout}
              initialValue={fromCity}
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

export default Form.create()(ListFilter);
