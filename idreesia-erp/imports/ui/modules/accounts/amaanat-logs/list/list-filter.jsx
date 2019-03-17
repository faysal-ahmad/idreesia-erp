import React, { Component } from "react";
import PropTypes from "prop-types";
import { Collapse, Form, Row, Button } from "antd";
import moment from "moment";

import { Formats } from "meteor/idreesia-common/constants";
import { CheckboxField, DateField } from "/imports/ui/modules/helpers/fields";

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
    hasHadiaPortion: PropTypes.bool,
    hasSadqaPortion: PropTypes.bool,
    hasZakaatPortion: PropTypes.bool,
    hasLangarPortion: PropTypes.bool,
    hasOtherPortion: PropTypes.bool,
    startDate: PropTypes.object,
    endDate: PropTypes.object,
    setPageParams: PropTypes.func,
  };

  handleSubmit = e => {
    e.preventDefault();
    const { form, setPageParams } = this.props;

    form.validateFields(
      (err, { fromCity, hasPortions, startDate, endDate }) => {
        if (err) return;
        setPageParams({
          fromCity,
          hasHadiaPortion: hasPortions.indexOf("hasHadiaPortion") !== -1,
          hasSadqaPortion: hasPortions.indexOf("hasSadqaPortion") !== -1,
          hasZakaatPortion: hasPortions.indexOf("hasZakaatPortion") !== -1,
          hasLangarPortion: hasPortions.indexOf("hasLangarPortion") !== -1,
          hasOtherPortion: hasPortions.indexOf("hasOtherPortion") !== -1,
          startDate,
          endDate,
          pageIndex: 0,
        });
      }
    );
  };

  handleReset = () => {
    const { setPageParams } = this.props;
    setPageParams({
      fromCity: null,
      hasHadiaPortion: true,
      hasSadqaPortion: true,
      hasZakaatPortion: true,
      hasLangarPortion: true,
      hasOtherPortion: true,
      startDate: null,
      endDate: null,
      pageIndex: 0,
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const {
      startDate,
      endDate,
      hasHadiaPortion,
      hasSadqaPortion,
      hasZakaatPortion,
      hasLangarPortion,
      hasOtherPortion,
    } = this.props;

    const mStartDate = moment(startDate, Formats.DATE_FORMAT);
    const mEndDate = moment(endDate, Formats.DATE_FORMAT);
    const portions = [];
    if (hasHadiaPortion === true) portions.push("hasHadiaPortion");
    if (hasSadqaPortion === true) portions.push("hasSadqaPortion");
    if (hasZakaatPortion === true) portions.push("hasZakaatPortion");
    if (hasLangarPortion === true) portions.push("hasLangarPortion");
    if (hasOtherPortion === true) portions.push("hasOtherPortion");

    return (
      <Collapse style={ContainerStyle}>
        <Collapse.Panel header="Filter" key="1">
          <Form layout="horizontal" onSubmit={this.handleSubmit}>
            <CheckboxField
              fieldName="hasPortions"
              fieldLabel="Has Portions"
              fieldLayout={formItemLayout}
              options={[
                { label: "Hadia", value: "hasHadiaPortion" },
                { label: "Sadqa", value: "hasSadqaPortion" },
                { label: "Zakaat", value: "hasZakaatPortion" },
                { label: "Langar", value: "hasLangarPortion" },
                { label: "Other", value: "hasOtherPortion" },
              ]}
              initialValue={portions}
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
