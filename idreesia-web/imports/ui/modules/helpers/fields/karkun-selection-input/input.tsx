import React, { Component, Fragment } from 'react';
import { EditOutlined } from '@ant-design/icons';

import { Drawer, Input } from 'antd';
import type { HelperPagedAdminKarkunsQuery } from 'meteor/idreesia-common/types/client-operations';
import KarkunsList from './karkuns-list';

const ContainerStyle: React.CSSProperties = {
  display: 'flex',
  flexFlow: 'row nowrap',
  justifyContent: 'flex-start',
  alignItems: 'center',
  width: '100%',
};

type KarkunRow = NonNullable<
  NonNullable<
    NonNullable<HelperPagedAdminKarkunsQuery['pagedAdminKarkuns']>['data']
  >[number]
>;

interface KarkunValue {
  _id?: string;
  name?: string;
}

interface Props {
  value?: KarkunValue | null;
  disabled?: boolean;
  placeholder?: string;
  onChange?(karkun: KarkunValue): void;
}

interface State {
  showSelectionForm: boolean;
}

export default class CustomInput extends Component<Props, State> {
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

  setSelectedValue = (karkun: KarkunRow) => {
    const { onChange } = this.props;
    this.handleClose();
    if (onChange) {
      onChange({
        _id: karkun._id ?? undefined,
        name: karkun.sharedData?.name ?? undefined,
      });
    }
  };

  render() {
    const { placeholder, value } = this.props;

    return (
      <Fragment>
        <Drawer
          title="Select a Karkun"
          size={800}
          onClose={this.handleClose}
          open={this.state.showSelectionForm}
        >
          <KarkunsList handleSelectItem={this.setSelectedValue} />
        </Drawer>
        <div style={ContainerStyle}>
          <Input
            type="text"
            value={value ? value.name : ''}
            readOnly
            addonAfter={<EditOutlined onClick={this.handleEditClick} />}
            placeholder={placeholder}
          />
        </div>
      </Fragment>
    );
  }
}
