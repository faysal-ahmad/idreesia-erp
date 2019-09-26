import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Button, Collapse, Form, Icon, Row, Tooltip } from '/imports/ui/controls';
import { InputTextField } from '/imports/ui/modules/helpers/fields';

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
    address: PropTypes.string,
    karkunName: PropTypes.string,
    setPageParams: PropTypes.func,
    refreshData: PropTypes.func,
  };

  handleReset = () => {
    const { form, setPageParams } = this.props;
    form.resetFields();
    setPageParams({
      pageIndex: 0,
      address: null,
      karkunName: null,
    });
  };

  handleSubmit = () => {
    const { form, setPageParams } = this.props;

    form.validateFields((err, { address, karkunName }) => {
      if (err) return;
      setPageParams({
        pageIndex: 0,
        address,
        karkunName,
      });
    });
  };

  refreshButton = () => {
    const { refreshData } = this.props;

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

  render() {
    const { getFieldDecorator } = this.props.form;
    const { address, karkunName } = this.props;

    return (
      <Collapse style={ContainerStyle}>
        <Collapse.Panel header="Filter" key="1" extra={this.refreshButton()}>
          <Form layout="horizontal">
            <InputTextField
              fieldName="address"
              fieldLabel="Address"
              required={false}
              fieldLayout={formItemLayout}
              initialValue={address}
              getFieldDecorator={getFieldDecorator}
            />
            <InputTextField
              fieldName="karkunName"
              fieldLabel="Karkun Name"
              required={false}
              fieldLayout={formItemLayout}
              initialValue={karkunName}
              getFieldDecorator={getFieldDecorator}
            />
            <Form.Item {...buttonItemLayout}>
              <Row type="flex" justify="end">
                <Button type="default" onClick={this.handleReset}>
                  Reset
                </Button>
                &nbsp;
                <Button type="primary" onClick={this.handleSubmit}>
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

export default Form.create({ name: 'sharedResidencesListFilter' })(ListFilter);
