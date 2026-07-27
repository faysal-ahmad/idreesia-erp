import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Button, Drawer } from 'antd';
import PeopleList from './people-list';

const ContainerStyle = {
  display: 'flex',
  flexFlow: 'row nowrap',
  justifyContent: 'flex-start',
  alignItems: 'center',
  width: '100%',
};

const AntButton = Button as any;
const AntDrawer = Drawer as any;
const PeopleSelectionList = PeopleList as any;
type SelectionValue = Record<string, any>;
interface Props { icon?: unknown; label?: string; disabled?: boolean; onSelection?(value: SelectionValue): void; }
interface State { showSelectionForm: boolean; }

export default class SelectionButton extends Component<Props, State> {
  static propTypes = {
    icon: PropTypes.any,
    label: PropTypes.string,
    disabled: PropTypes.bool,
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
          <PeopleSelectionList handleSelectItem={this.setSelectedValue} />
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
