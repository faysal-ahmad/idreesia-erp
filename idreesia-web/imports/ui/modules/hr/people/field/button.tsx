import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Button, Drawer } from 'antd';
import ListContainer from './list-container';

const ContainerStyle = {
  display: 'flex',
  flexFlow: 'row nowrap',
  justifyContent: 'flex-start',
  alignItems: 'center',
  width: '100%',
};

const AntButton = Button as any;
const AntDrawer = Drawer as any;
const KarkunListContainer = ListContainer as any;
interface SelectionValue { _id?: string; name?: string; sharedData?: { name?: string }; }
interface SelectionButtonProps { icon?: unknown; label?: string; disabled?: boolean; onSelection?(value: SelectionValue): void; }
interface SelectionButtonState { showSelectionForm: boolean; }

export default class SelectionButton extends Component<SelectionButtonProps, SelectionButtonState> {
  static propTypes = {
    icon: PropTypes.string,
    label: PropTypes.string,
    disabled: PropTypes.bool,
    onSelection: PropTypes.func,
  };

  static defaultProps = {
    icon: 'plus-circle',
    label: 'Select Karkuns',
    disabled: false,
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

  setSelectedValue = (itemType: SelectionValue) => {
    const { onSelection } = this.props;
    if (onSelection) {
      onSelection(itemType);
    }
  };

  render() {
    return (
      <>
        <AntDrawer
          title="Select Karkuns"
          width={720}
          onClose={this.handleClose}
          open={this.state.showSelectionForm}
        >
          <KarkunListContainer setSelectedValue={this.setSelectedValue} />
        </AntDrawer>
        <div style={ContainerStyle as any}>
          <AntButton
            size="large"
            onClick={this.handleClick}
            disabled={this.props.disabled}
            icon={this.props.icon}
          >
            {this.props.label}
          </AntButton>
        </div>
      </>
    );
  }
}
