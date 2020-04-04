import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';

import { Drawer, Icon, Input } from '/imports/ui/controls';
import VisitorsList from './visitors-list';

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

    return (
      <Fragment>
        <Drawer
          title="Select Person"
          width={800}
          onClose={this.handleClose}
          visible={this.state.showSelectionForm}
        >
          <VisitorsList handleSelectItem={this.setSelectedValue} />
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
