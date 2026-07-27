import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { EditOutlined } from '@ant-design/icons';

import { Tabs, Drawer, Input } from 'antd';
import ListContainer from './list-container';

const ContainerStyle = {
  display: 'flex',
  flexFlow: 'row nowrap',
  justifyContent: 'flex-start',
  alignItems: 'center',
  width: '100%',
};

const ReactFragment = Fragment as any;
const AntTabs = Tabs as any;
const AntTabPane = (Tabs as any).TabPane;
const AntDrawer = Drawer as any;
const AntInput = Input as any;
const AntEditOutlined = EditOutlined as any;
const KarkunListContainer = ListContainer as any;
interface SelectionValue { _id?: string; name?: string; sharedData?: { name?: string }; }
interface CustomInputProps { value?: SelectionValue | null; disabled?: boolean; placeholder?: string; onChange?(value: SelectionValue): void; predefinedFilterName?: string; predefinedFilterStoreId?: string; }
interface CustomInputState { showSelectionForm: boolean; }

export default class CustomInput extends Component<CustomInputProps, CustomInputState> {
  static propTypes = {
    value: PropTypes.object,
    disabled: PropTypes.bool,
    placeholder: PropTypes.string,
    onChange: PropTypes.func,
    predefinedFilterName: PropTypes.string,
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

  setSelectedValue = (itemType: SelectionValue) => {
    const { onChange } = this.props;
    this.handleClose();
    if (onChange) {
      onChange(itemType);
    }
  };

  setSelectedValueFromQuickSelection = (item: SelectionValue) => {
    const { onChange } = this.props;
    this.handleClose();
    if (onChange) {
      onChange(item);
    }
  };

  render() {
    const { placeholder, value, predefinedFilterName } = this.props;

    let containersNode;
    if (predefinedFilterName) {
      containersNode = (
        <AntTabs>
          <AntTabPane tab="Recently Used" key="1">
            <KarkunListContainer
              setSelectedValue={this.setSelectedValue}
              predefinedFilterName={predefinedFilterName}
            />
          </AntTabPane>
          <AntTabPane tab="All Karkuns" key="2">
            <KarkunListContainer setSelectedValue={this.setSelectedValue} />
          </AntTabPane>
        </AntTabs>
      );
    } else {
      containersNode = (
        <KarkunListContainer setSelectedValue={this.setSelectedValue} />
      );
    }

    return (
      <ReactFragment>
        <AntDrawer
          title="Select a Karkun"
          width={720}
          onClose={this.handleClose}
          open={this.state.showSelectionForm}
        >
          {containersNode}
        </AntDrawer>
        <div style={ContainerStyle as any}>
          <AntInput
            type="text"
            value={value ? value.name : ''}
            readOnly
            addonAfter={<AntEditOutlined onClick={this.handleEditClick} />}
            placeholder={placeholder}
          />
        </div>
      </ReactFragment>
    );
  }
}
