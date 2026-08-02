import React, { Component, type CSSProperties } from 'react';

import { Button, Drawer } from 'antd';
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

interface SelectionButtonProps {
  icon?: React.ReactNode;
  label?: string;
  disabled?: boolean;
  onSelection?(value: SelectionValue): void;
}

interface SelectionButtonState {
  showSelectionForm: boolean;
}

export default class SelectionButton extends Component<
  SelectionButtonProps,
  SelectionButtonState
> {
  static defaultProps = {
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
        <Drawer
          title="Select Karkuns"
          width={720}
          onClose={this.handleClose}
          open={this.state.showSelectionForm}
        >
          <ListContainer setSelectedValue={this.setSelectedValue} />
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
