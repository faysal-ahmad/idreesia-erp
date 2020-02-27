import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';

import { Tabs, Drawer, Icon, Input } from '/imports/ui/controls';
import HRKarkunsList from './hr-karkuns-list';
import OutstationKarkunsList from './outstation-karkuns-list';

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

  setSelectedValue = karkun => {
    const { onChange } = this.props;
    this.handleClose();
    if (onChange) {
      onChange(karkun);
    }
  };

  render() {
    const { placeholder, value } = this.props;

    const containersNode = (
      <Tabs>
        <Tabs.TabPane tab="MS Karkuns" key="1">
          <HRKarkunsList handleSelectItem={this.setSelectedValue} />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Outstation Karkuns" key="2">
          <OutstationKarkunsList handleSelectItem={this.setSelectedValue} />
        </Tabs.TabPane>
      </Tabs>
    );

    return (
      <Fragment>
        <Drawer
          title="Select a Karkun"
          width={800}
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
            addonAfter={<Icon type="edit" onClick={this.handleEditClick} />}
            placeholder={placeholder}
          />
        </div>
      </Fragment>
    );
  }
}
