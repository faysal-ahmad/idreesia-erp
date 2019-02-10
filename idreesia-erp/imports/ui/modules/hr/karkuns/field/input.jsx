import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";
import { Drawer, Icon, Input } from "antd";

import ListContainer from "./list-container";

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

  setSelectedValue = itemType => {
    const { onChange } = this.props;
    this.handleClose();
    if (onChange) {
      onChange(itemType);
    }
  };

  render() {
    const { placeholder, value } = this.props;
    return (
      <Fragment>
        <Drawer
          title="Select a Karkun"
          width={720}
          onClose={this.handleClose}
          visible={this.state.showSelectionForm}
          style={{
            overflow: "auto",
            height: "calc(100% - 108px)",
            paddingBottom: "108px",
          }}
        >
          <ListContainer setSelectedValue={this.setSelectedValue} />
        </Drawer>
        <Input
          type="text"
          value={value ? value.name : ""}
          readOnly
          addonAfter={<Icon type="edit" onClick={this.handleEditClick} />}
          placeholder={placeholder}
        />
      </Fragment>
    );
  }
}
