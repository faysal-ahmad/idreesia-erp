import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import {
  Button,
  Collapse,
  Form,
  Icon,
  Row,
  Tooltip,
} from '/imports/ui/controls';
import {
  InputTextField,
  SelectField,
} from '/imports/ui/modules/helpers/fields';
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
    form: PropTypes.object,
    name: PropTypes.string,
    categoryId: PropTypes.string,
    verifyDuration: PropTypes.string,
    stockLevel: PropTypes.string,
    physicalStoreId: PropTypes.string,
    itemCategoriesByPhysicalStoreId: PropTypes.array,
    setPageParams: PropTypes.func,
    refreshData: PropTypes.func,
  };

  handleReset = () => {
    const { form, setPageParams } = this.props;
    form.resetFields();
    setPageParams({
      pageIndex: 0,
      categoryId: null,
      name: null,
      verifyDuration: null,
      stockLevel: null,
    });
  };

  handleSubmit = () => {
    const { form, setPageParams } = this.props;

    form.validateFields(
      (err, { categoryId, name, verifyDuration, stockLevel }) => {
        if (err) return;
        setPageParams({
          pageIndex: 0,
          categoryId,
          name,
          verifyDuration,
          stockLevel,
        });
      }
    );
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
          <Form layout="horizontal">
            <SelectField
              data={itemCategoriesByPhysicalStoreId}
              getDataValue={category => category._id}
              getDataText={category => category.name}
              fieldName="categoryId"
              fieldLabel="Category"
              fieldLayout={formItemLayout}
              initialValue={categoryId}
              getFieldDecorator={getFieldDecorator}
            />
            <InputTextField
              fieldName="name"
              fieldLabel="Name"
              required={false}
              fieldLayout={formItemLayout}
              initialValue={name}
              getFieldDecorator={getFieldDecorator}
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
              getFieldDecorator={getFieldDecorator}
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

export default flowRight(
  Form.create({ name: 'itemTypeListFilter' }),
  WithItemCategoriesByPhysicalStore()
)(ListFilter);
