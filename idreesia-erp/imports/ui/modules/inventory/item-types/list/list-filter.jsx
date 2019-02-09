import React, { Component } from "react";
import PropTypes from "prop-types";
import { Collapse, Form, Row, Button } from "antd";
import gql from "graphql-tag";
import { compose, graphql } from "react-apollo";

import {
  InputTextField,
  SelectField,
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
    allItemCategories: PropTypes.array,
    itemCategoryId: PropTypes.string,
    itemTypeName: PropTypes.string,
    setPageParams: PropTypes.func,
  };

  handleReset = () => {
    const { form, setPageParams } = this.props;
    form.resetFields();
    setPageParams({
      pageIndex: 0,
      itemCategoryId: null,
      itemTypeName: null,
    });
  };

  handleSubmit = e => {
    e.preventDefault();
    const { form, setPageParams } = this.props;

    form.validateFields((err, { itemCategoryId, itemTypeName }) => {
      if (err) return;
      setPageParams({
        pageIndex: 0,
        itemCategoryId,
        itemTypeName,
      });
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { itemCategoryId, itemTypeName, allItemCategories } = this.props;

    return (
      <Collapse style={ContainerStyle}>
        <Collapse.Panel header="Filter" key="1">
          <Form layout="horizontal" onSubmit={this.handleSubmit}>
            <SelectField
              data={allItemCategories}
              getDataValue={({ _id }) => _id}
              getDataText={({ name }) => name}
              fieldName="itemCategoryId"
              fieldLabel="Category"
              fieldLayout={formItemLayout}
              required={false}
              initialValue={itemCategoryId}
              getFieldDecorator={getFieldDecorator}
            />
            <InputTextField
              fieldName="itemTypeName"
              fieldLabel="Name"
              fieldLayout={formItemLayout}
              required={false}
              initialValue={itemTypeName}
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

const itemCategoriesListQuery = gql`
  query allItemCategories {
    allItemCategories {
      _id
      name
    }
  }
`;

export default compose(
  Form.create({ name: "itemTypeListFilter" }),
  graphql(itemCategoriesListQuery, {
    props: ({ data }) => ({ ...data }),
  })
)(ListFilter);
