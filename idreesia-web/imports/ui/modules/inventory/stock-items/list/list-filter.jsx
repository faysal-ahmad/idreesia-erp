import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Collapse, Form, Icon, Row, Tooltip } from 'antd';
import { flowRight } from 'lodash';

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
    });
  };

  handleSubmit = () => {
    const { form, setPageParams } = this.props;

    form.validateFields((err, { categoryId, name }) => {
      if (err) return;
      setPageParams({
        pageIndex: 0,
        categoryId,
        name,
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
    const { categoryId, name, itemCategoriesByPhysicalStoreId } = this.props;

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
