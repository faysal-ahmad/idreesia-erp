import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { EditOutlined } from '@ant-design/icons';

import { Tabs, Drawer, Input } from 'antd';
import MSKarkunsList from './ms-karkuns-list';

const ContainerStyle = {
  display: 'flex',
  flexFlow: 'row nowrap',
  justifyContent: 'flex-start',
  alignItems: 'center',
  width: '100%',
};

const ReactFragment = Fragment as any;
const AntDrawer = Drawer as any;
const TextInput = Input as any;
const AntTabs = Tabs as any;
const TabPane = (Tabs as any).TabPane;
const AntEditOutlined = EditOutlined as any;
const MSKarkunsSelectionList = MSKarkunsList as any;
interface KarkunValue { _id?: string; name?: string; }
interface Props { value?: KarkunValue | null; disabled?: boolean; placeholder?: string; onChange?(karkun: KarkunValue): void; showMsKarkunsList?: boolean; }
interface State { showSelectionForm: boolean; }

export default class CustomInput extends Component<Props, State> {
  static propTypes = {
    value: PropTypes.object,
    disabled: PropTypes.bool,
    placeholder: PropTypes.string,
    onChange: PropTypes.func,

    showMsKarkunsList: PropTypes.bool,
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

  setSelectedValue = (karkun: KarkunValue) => {
    const { onChange } = this.props;
    this.handleClose();
    if (onChange) {
      onChange(karkun);
    }
  };

  render() {
    const { placeholder, value, showMsKarkunsList } = this.props;

    const containersNode: React.ReactNode[] = [];

    if (showMsKarkunsList) {
      containersNode.push(
        <TabPane tab="MS Karkuns" key="1">
          <MSKarkunsSelectionList handleSelectItem={this.setSelectedValue} />
        </TabPane>
      );
    }

    return (
      <ReactFragment>
        <AntDrawer
          title="Select a Karkun"
          width={800}
          onClose={this.handleClose}
          open={this.state.showSelectionForm}
        >
          <AntTabs>{containersNode}</AntTabs>
        </AntDrawer>
        <div style={ContainerStyle as any}>
          <TextInput
            type="text"
            value={value ? value.name : ''}
            readOnly
            addonAfter={<AntEditOutlined onClick={this.handleEditClick} />}
            placeholder={placeholder}
          />
        </div>
      </ReactFragment>
    );
  }
}
