import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Button, Drawer } from '/imports/ui/controls';
import ListContainer from './list-container';

const ContainerStyle = {
  display: 'flex',
  flexFlow: 'row nowrap',
  justifyContent: 'flex-start',
  alignItems: 'center',
  width: '100%',
};

export default class SelectionButton extends Component {
  static propTypes = {
    disabled: PropTypes.bool,
    onSelection: PropTypes.func,
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
    return (
      <>
        <Drawer
          title="Select Karkuns"
          width={720}
          onClose={this.handleClose}
          visible={this.state.showSelectionForm}
        >
          <ListContainer setSelectedValue={this.setSelectedValue} />
        </Drawer>
        <div style={ContainerStyle}>
          <Button onClick={this.handleClick} disabled={this.props.disabled}>
            Select Karkuns
          </Button>
        </div>
      </>
    );
  }
}
