import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Collapse, Form, Row } from 'antd';

import {
  InputTextField,
  SelectField,
} from '/imports/ui/modules/helpers/fields';
import { RefreshButton } from '/imports/ui/modules/helpers/controls';
import { WithItemCategoriesByPhysicalStore } from '/imports/ui/modules/inventory/common/composers';

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
    name: PropTypes.string,
    categoryId: PropTypes.string,
    verifyDuration: PropTypes.string,
    stockLevel: PropTypes.string,
    physicalStoreId: PropTypes.string,
    itemCategoriesByPhysicalStoreId: PropTypes.array,
    setPageParams: PropTypes.func,
    refreshData: PropTypes.func,
  };

  formRef = React.createRef();

  handleReset = () => {
    const { setPageParams } = this.props;
    this.formRef.current.resetFields();
    setPageParams({
      pageIndex: 0,
      categoryId: null,
      name: null,
      verifyDuration: null,
      stockLevel: null,
    });
  };

  handleFinish = ({ categoryId, name, verifyDuration, stockLevel }) => {
    const { setPageParams } = this.props;
    setPageParams({
      pageIndex: 0,
      categoryId,
      name,
      verifyDuration,
      stockLevel,
    });
  };

  refreshButton = () => <RefreshButton refreshData={this.props.refreshData} />;

  render() {
    const {
      categoryId,
      name,
      stockLevel,
      verifyDuration,
      itemCategoriesByPhysicalStoreId,
    } = this.props;

    return (
      <Collapse style={ContainerStyle}>
        <Collapse.Panel header="Filter" key="1" extra={this.refreshButton()}>
          <Form ref={this.formRef} layout="horizontal" onFinish={this.handleFinish}>
            <SelectField
              data={itemCategoriesByPhysicalStoreId}
              getDataValue={category => category._id}
              getDataText={category => category.name}
              fieldName="categoryId"
              fieldLabel="Category"
              fieldLayout={formItemLayout}
              initialValue={categoryId}
            />
            <InputTextField
              fieldName="name"
              fieldLabel="Name"
              required={false}
              fieldLayout={formItemLayout}
              initialValue={name}
            />
            <SelectField
              fieldName="stockLevel"
              fieldLabel="Stock Level"
              required={false}
              data={[
                {
                  label: 'Negative Stock Level',
                  value: 'negative-stock-level',
                },
                {
                  label: 'Less than Min Stock Level',
                  value: 'less-than-min-stock-level',
                },
              ]}
              getDataValue={({ value }) => value}
              getDataText={({ label }) => label}
              fieldLayout={formItemLayout}
              initialValue={stockLevel}
            />
            <SelectField
              fieldName="verifyDuration"
              fieldLabel="Stock Verified"
              required={false}
              data={[
                {
                  label: 'Less than 3 months ago',
                  value: 'less-than-3-months-ago',
                },
                {
                  label: 'Between 3 to 6 months ago',
                  value: 'between-3-to-6-months-ago',
                },
                {
                  label: 'More than 6 months ago',
                  value: 'more-than-6-months-ago',
                },
              ]}
              getDataValue={({ value }) => value}
              getDataText={({ label }) => label}
              fieldLayout={formItemLayout}
              initialValue={verifyDuration}
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

export default WithItemCategoriesByPhysicalStore()(ListFilter);
