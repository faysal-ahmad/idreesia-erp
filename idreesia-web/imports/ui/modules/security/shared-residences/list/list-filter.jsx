import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Collapse, Form, Row } from 'antd';

import { InputTextField } from '/imports/ui/modules/helpers/fields';
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

class ListFilter extends Component {
  static propTypes = {
    address: PropTypes.string,
    residentName: PropTypes.string,
    setPageParams: PropTypes.func,
    refreshData: PropTypes.func,
  };

  formRef = React.createRef();

  handleReset = () => {
    const { setPageParams } = this.props;
    this.formRef.current.resetFields();
    setPageParams({
      pageIndex: 0,
      address: null,
      residentName: null,
    });
  };

  handleFinish = ({ address, residentName }) => {
    const { setPageParams } = this.props;
    setPageParams({
      pageIndex: 0,
      address,
      residentName,
    });
  };

  refreshButton = () => <RefreshButton refreshData={this.props.refreshData} />;

  render() {
    const { address, residentName } = this.props;

    return (
      <Collapse style={ContainerStyle}>
        <Collapse.Panel header="Filter" key="1" extra={this.refreshButton()}>
          <Form ref={this.formRef} layout="horizontal" onFinish={this.handleFinish}>
            <InputTextField
              fieldName="address"
              fieldLabel="Address"
              required={false}
              fieldLayout={formItemLayout}
              initialValue={address}
            />
            <InputTextField
              fieldName="residentName"
              fieldLabel="Resident Name"
              required={false}
              fieldLayout={formItemLayout}
              initialValue={residentName}
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

export default ListFilter;
