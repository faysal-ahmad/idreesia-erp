import React, { Component, Fragment } from 'react';
import { EditOutlined } from '@ant-design/icons';

import { Tabs, Drawer, Input } from 'antd';
import type { TabsProps } from 'antd';
import type { HelperPagedHrKarkunsQuery } from 'meteor/idreesia-common/types/client-operations';
import MSKarkunsList from './ms-karkuns-list';

const ContainerStyle: React.CSSProperties = {
  display: 'flex',
  flexFlow: 'row nowrap',
  justifyContent: 'flex-start',
  alignItems: 'center',
  width: '100%',
};

type HrKarkunRow = NonNullable<
  NonNullable<
    NonNullable<HelperPagedHrKarkunsQuery['pagedHrKarkuns']>['karkuns']
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
  showMsKarkunsList?: boolean;
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

  setSelectedValue = (karkun: HrKarkunRow) => {
    const { onChange } = this.props;
    this.handleClose();
    if (onChange) {
      onChange({
        _id: karkun._id ?? undefined,
        name: karkun.name ?? undefined,
      });
    }
  };

  render() {
    const { placeholder, value, showMsKarkunsList } = this.props;

    const items: TabsProps['items'] = [];

    if (showMsKarkunsList) {
      items.push({
        key: '1',
        label: 'MS Karkuns',
        children: <MSKarkunsList handleSelectItem={this.setSelectedValue} />,
      });
    }

    return (
      <Fragment>
        <Drawer
          title="Select a Karkun"
          size={800}
          onClose={this.handleClose}
          open={this.state.showSelectionForm}
        >
          <Tabs items={items} />
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
