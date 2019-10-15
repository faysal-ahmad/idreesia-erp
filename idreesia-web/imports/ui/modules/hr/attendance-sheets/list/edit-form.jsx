import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Button, Col, Form, Row } from '/imports/ui/controls';
import { InputNumberField } from '/imports/ui/modules/helpers/fields';

class EditForm extends Component {
  static propTypes = {
    form: PropTypes.object,
    attendance: PropTypes.object,
    handleSave: PropTypes.func,
    handleCancel: PropTypes.func,
  };

  handleSubmit = e => {
    e.preventDefault();
    const { attendance, form, handleSave } = this.props;
    form.validateFields((err, { totalCount, presentCount, absentCount }) => {
      if (err) return;

      handleSave({
        _id: attendance._id,
        totalCount,
        presentCount,
        absentCount,
      });
    });
  };

  render() {
    const {
      attendance,
      form: { getFieldDecorator },
    } = this.props;

    return (
      <Form layout="horizontal" onSubmit={this.handleSubmit}>
        <InputNumberField
          fieldName="totalCount"
          fieldLabel="Total Days"
          initialValue={attendance.totalCount}
          minValue={0}
          maxValue={31}
          getFieldDecorator={getFieldDecorator}
        />
        <InputNumberField
          fieldName="presentCount"
          fieldLabel="Present Days"
          initialValue={attendance.presentCount}
          minValue={0}
          maxValue={31}
          getFieldDecorator={getFieldDecorator}
        />
        <InputNumberField
          fieldName="absentCount"
          fieldLabel="Absent Days"
          initialValue={attendance.absentCount}
          minValue={0}
          maxValue={31}
          getFieldDecorator={getFieldDecorator}
        />

        <Row type="flex" justify="start">
          <Col offset={5}>
            <Button
              size="large"
              type="default"
              icon="close-circle"
              onClick={this.props.handleCancel}
            >
              Cancel
            </Button>
            &nbsp;
            <Button size="large" type="primary" icon="save" htmlType="submit">
              Save
            </Button>
          </Col>
        </Row>
      </Form>
    );
  }
}

export default Form.create()(EditForm);
