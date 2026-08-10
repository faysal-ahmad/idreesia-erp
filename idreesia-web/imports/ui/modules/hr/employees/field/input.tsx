import React, { Component, type CSSProperties } from 'react';
import { EditOutlined } from '@ant-design/icons';
import { Tabs, Drawer, Input } from 'antd';

import ListContainer from './list-container';

const ContainerStyle: CSSProperties = {
  display: 'flex',
  flexFlow: 'row nowrap',
  justifyContent: 'flex-start',
  alignItems: 'center',
  width: '100%',
};

interface SelectionValue {
  _id?: string;
  name?: string;
  sharedData?: { name?: string };
}

interface CustomInputProps {
  value?: SelectionValue | null;
  disabled?: boolean;
  placeholder?: string;
  onChange?(value: SelectionValue): void;
  predefinedFilterName?: string;
  predefinedFilterStoreId?: string;
}

interface CustomInputState {
  showSelectionForm: boolean;
}

export default class CustomInput extends Component<
  CustomInputProps,
  CustomInputState
> {
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

  setSelectedValue = (itemType: SelectionValue) => {
    const { onChange } = this.props;
    this.handleClose();
    if (onChange) {
      onChange(itemType);
    }
  };

  render() {
    const { placeholder, value, predefinedFilterName } = this.props;

    let containersNode;
    if (predefinedFilterName) {
      containersNode = (
        <Tabs
          items={[
            {
              key: '1',
              label: 'Recently Used',
              children: (
                <ListContainer
                  setSelectedValue={this.setSelectedValue}
                  predefinedFilterName={predefinedFilterName}
                />
              ),
            },
            {
              key: '2',
              label: 'All Employees',
              children: (
                <ListContainer setSelectedValue={this.setSelectedValue} />
              ),
            },
          ]}
        />
      );
    } else {
      containersNode = (
        <ListContainer setSelectedValue={this.setSelectedValue} />
      );
    }

    return (
      <>
        <Drawer
          title="Select a Karkun"
          size={720}
          onClose={this.handleClose}
          open={this.state.showSelectionForm}
        >
          {containersNode}
        </Drawer>
        <div style={ContainerStyle}>
          <Input
            type="text"
            value={value ? value.name : ''}
            readOnly
            addonAfter={<EditOutlined onClick={this.handleEditClick} />}
            placeholder={placeholder}
          />
        </div>
      </>
    );
  }
}
