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

export default class CustomInput extends Component {
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

  setSelectedValue = itemType => {
    const { onChange } = this.props;
    this.handleClose();
    if (onChange) {
      onChange(itemType);
    }
  };

  setSelectedValueFromQuickSelection = item => {
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
        <Tabs>
          <Tabs.TabPane tab="Recently Used" key="1">
            <ListContainer
              setSelectedValue={this.setSelectedValue}
              predefinedFilterName={predefinedFilterName}
            />
          </Tabs.TabPane>
          <Tabs.TabPane tab="All Karkuns" key="2">
            <ListContainer setSelectedValue={this.setSelectedValue} />
          </Tabs.TabPane>
        </Tabs>
      );
    } else {
      containersNode = (
        <ListContainer setSelectedValue={this.setSelectedValue} />
      );
    }

    return (
      <Fragment>
        <Drawer
          title="Select a Karkun"
          width={720}
          onClose={this.handleClose}
          visible={this.state.showSelectionForm}
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
      </Fragment>
    );
  }
}
