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

const AntButton = Button as any;
const AntCollapse = Collapse as any;
const AntForm = Form as any;
const AntFormItem = Form.Item as any;
const AntRow = Row as any;
const TextField = InputTextField as any;
const SelectInputField = SelectField as any;
const RefreshButtonComponent = RefreshButton as any;

interface ItemCategory {
  _id: string;
  name: string;
}

interface SelectOption {
  label: string;
  value: string;
}

interface PageParams {
  pageIndex?: number;
  categoryId?: string | null;
  name?: string | null;
  verifyDuration?: string | null;
  stockLevel?: string | null;
}

interface ListFilterProps {
  name?: string | null;
  categoryId?: string | null;
  verifyDuration?: string | null;
  stockLevel?: string | null;
  physicalStoreId?: string;
  itemCategoriesByPhysicalStoreId?: ItemCategory[];
  setPageParams(params: PageParams): void;
  refreshData?(): void;
}

class ListFilter extends Component<ListFilterProps> {
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

  formRef = React.createRef<any>();

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

  handleFinish = ({ categoryId, name, verifyDuration, stockLevel }: PageParams) => {
    const { setPageParams } = this.props;
    setPageParams({
      pageIndex: 0,
      categoryId,
      name,
      verifyDuration,
      stockLevel,
    });
  };

  refreshButton = () => (
    <RefreshButtonComponent refreshData={this.props.refreshData} />
  );

  render() {
    const {
      categoryId,
      name,
      stockLevel,
      verifyDuration,
      itemCategoriesByPhysicalStoreId,
    } = this.props;

    return (
      <AntCollapse
        style={ContainerStyle}
        items={[
          {
            key: '1',
            label: 'Filter',
            extra: this.refreshButton(),
            children: (
              <AntForm ref={this.formRef} layout="horizontal" onFinish={this.handleFinish}>
                <SelectInputField
                  data={itemCategoriesByPhysicalStoreId ?? []}
                  getDataValue={(category: ItemCategory) => category._id}
                  getDataText={(category: ItemCategory) => category.name}
                  fieldName="categoryId"
                  fieldLabel="Category"
                  fieldLayout={formItemLayout}
                  initialValue={categoryId}
                />
                <TextField
                  fieldName="name"
                  fieldLabel="Name"
                  required={false}
                  fieldLayout={formItemLayout}
                  initialValue={name}
                />
                <SelectInputField
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
                  getDataValue={({ value }: SelectOption) => value}
                  getDataText={({ label }: SelectOption) => label}
                  fieldLayout={formItemLayout}
                  initialValue={stockLevel}
                />
                <SelectInputField
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
                  getDataValue={({ value }: SelectOption) => value}
                  getDataText={({ label }: SelectOption) => label}
                  fieldLayout={formItemLayout}
                  initialValue={verifyDuration}
                />
                <AntFormItem {...buttonItemLayout}>
                  <AntRow type="flex" justify="end">
                    <AntButton type="default" onClick={this.handleReset}>
                      Reset
                    </AntButton>
                    &nbsp;
                    <AntButton type="primary" htmlType="submit">
                      Search
                    </AntButton>
                  </AntRow>
                </AntFormItem>
              </AntForm>
            ),
          },
        ]}
      />
    );
  }
}

export default WithItemCategoriesByPhysicalStore()(ListFilter as any);
