import React, { Component } from 'react';
import { type CSSProperties } from 'react';

import { Button, Drawer } from 'antd';
import type { PagedPeopleQuery } from 'meteor/idreesia-common/types/client-operations';
import PeopleList from './people-list';

const ContainerStyle: CSSProperties = {
  display: 'flex',
  flexFlow: 'row nowrap',
  justifyContent: 'flex-start',
  alignItems: 'center',
  width: '100%',
};

type PersonRow = NonNullable<
  NonNullable<NonNullable<PagedPeopleQuery['pagedPeople']>['data']>[number]
>;

interface SelectedPerson {
  _id: string;
}

interface Props {
  icon?: React.ReactNode;
  label?: string;
  disabled?: boolean;
  onSelection?(value: SelectedPerson): void;
}

interface State {
  showSelectionForm: boolean;
}

export default class SelectionButton extends Component<Props, State> {
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

  setSelectedValue = (item: PersonRow) => {
    const { onSelection } = this.props;
    if (!item._id) return;
    onSelection?.({ _id: item._id });
  };

  render() {
    const { icon = 'plus-circle', label = 'Select Karkuns', disabled = false } = this.props;

    return (
      <>
        <Drawer
          title="Select Karkuns"
          width={720}
          onClose={this.handleClose}
          open={this.state.showSelectionForm}
        >
          <PeopleList handleSelectItem={this.setSelectedValue} />
        </Drawer>
        <div style={ContainerStyle}>
          <Button
            size="large"
            onClick={this.handleClick}
            disabled={disabled}
            icon={icon}
          >
            {label}
          </Button>
        </div>
      </>
    );
  }
}
