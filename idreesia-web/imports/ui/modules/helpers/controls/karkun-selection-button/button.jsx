import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Button, Tabs, Drawer } from 'antd';
import MSKarkunsList from './ms-karkuns-list';
import OutstationKarkunsList from './outstation-karkuns-list';

const ContainerStyle = {
  display: 'flex',
  flexFlow: 'row nowrap',
  justifyContent: 'flex-start',
  alignItems: 'center',
  width: '100%',
};

export default class SelectionButton extends Component {
  static propTypes = {
    icon: PropTypes.any,
    label: PropTypes.string,
    disabled: PropTypes.bool,
    showMsKarkunsList: PropTypes.bool,
    showOutstationKarkunsList: PropTypes.bool,
    onSelection: PropTypes.func,
  };

  static defaultProps = {
    icon: 'plus-circle',
    label: 'Select Karkuns',
    disabled: false,
    showMsKarkunsList: true,
    showOutstationKarkunsList: true,
  };

  state = {
    showSelectionForm: false,
  };

  handleClick = () => {
    this.setState({
      showSelectionForm: true,
    });
  };

  handleClose = () => {
    this.setState({
      showSelectionForm: false,
    });
  };

  setSelectedValue = itemType => {
    const { onSelection } = this.props;
    if (onSelection) {
      onSelection(itemType);
    }
  };

  render() {
    const { showMsKarkunsList, showOutstationKarkunsList } = this.props;

    const containersNode = [];

    if (showMsKarkunsList) {
      containersNode.push(
        <Tabs.TabPane tab="MS Karkuns" key="1">
          <MSKarkunsList handleSelectItem={this.setSelectedValue} />
        </Tabs.TabPane>
      );
    }

    if (showOutstationKarkunsList) {
      containersNode.push(
        <Tabs.TabPane tab="Outstation Karkuns" key="2">
          <OutstationKarkunsList handleSelectItem={this.setSelectedValue} />
        </Tabs.TabPane>
      );
    }

    return (
      <>
        <Drawer
          title="Select Karkuns"
          width={720}
          onClose={this.handleClose}
          open={this.state.showSelectionForm}
        >
          <Tabs>{containersNode}</Tabs>
        </Drawer>
        <div style={ContainerStyle}>
          <Button
            size="large"
            onClick={this.handleClick}
            disabled={this.props.disabled}
            icon={this.props.icon}
          >
            {this.props.label}
          </Button>
        </div>
      </>
    );
  }
}
