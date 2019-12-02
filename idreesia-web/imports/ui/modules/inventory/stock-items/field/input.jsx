import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';

import { Drawer, Icon, Input } from '/imports/ui/controls';
import ListContainer from './list-container';

export default class CustomInput extends Component {
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

  setSelectedValue = stockItem => {
    const { onChange } = this.props;
    this.handleClose();
    if (onChange) {
      onChange(stockItem);
    }
  };

  render() {
    const { placeholder, value, physicalStoreId } = this.props;
    return (
      <Fragment>
        <Drawer
          title="Select a Stock Item"
          width={720}
          onClose={this.handleClose}
          visible={this.state.showSelectionForm}
        >
          <ListContainer
            setSelectedValue={this.setSelectedValue}
            physicalStoreId={physicalStoreId}
          />
        </Drawer>
        <Input
          type="text"
          value={value ? value.formattedName : ''}
          readOnly
          addonAfter={<Icon type="edit" onClick={this.handleEditClick} />}
          placeholder={placeholder}
        />
      </Fragment>
    );
  }
}
