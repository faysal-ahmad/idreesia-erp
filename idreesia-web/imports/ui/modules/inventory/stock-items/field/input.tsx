import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { EditOutlined } from '@ant-design/icons';

import { Drawer, Input } from 'antd';
import ListContainer from './list-container';

const AntDrawer = Drawer as any;
const AntInput = Input as any;
const AntEditOutlined = EditOutlined as any;
const ReactFragment = Fragment as any;
const StockItemListContainer = ListContainer as any;

interface StockItem {
  _id: string;
  formattedName?: string;
}

interface CustomInputProps {
  value?: StockItem | null;
  disabled?: boolean;
  placeholder?: string;
  onChange?(stockItem: StockItem): void;
  physicalStoreId?: string;
}

interface CustomInputState {
  showSelectionForm: boolean;
}

export default class CustomInput extends Component<
  CustomInputProps,
  CustomInputState
> {
  static propTypes = {
    value: PropTypes.object,
    disabled: PropTypes.bool,
    placeholder: PropTypes.string,
    onChange: PropTypes.func,

    physicalStoreId: PropTypes.string,
  };

  state = {
    showSelectionForm: false,
  };

  handleEditClick = () => {
    const { disabled } = this.props;
    if (!disabled) {
      this.setState({
        showSelectionForm: true,
      });
    }
  };

  handleClose = () => {
    this.setState({
      showSelectionForm: false,
    });
  };

  setSelectedValue = (stockItem: StockItem) => {
    const { onChange } = this.props;
    this.handleClose();
    if (onChange) {
      onChange(stockItem);
    }
  };

  render() {
    const { placeholder, value, physicalStoreId } = this.props;
    return (
      <ReactFragment>
        <AntDrawer
          title="Select a Stock Item"
          width={720}
          onClose={this.handleClose}
          open={this.state.showSelectionForm}
        >
          <StockItemListContainer
            setSelectedValue={this.setSelectedValue}
            physicalStoreId={physicalStoreId}
          />
        </AntDrawer>
        <AntInput
          type="text"
          value={value ? value.formattedName : ''}
          readOnly
          addonAfter={<AntEditOutlined onClick={this.handleEditClick} />}
          placeholder={placeholder}
        />
      </ReactFragment>
    );
  }
}
