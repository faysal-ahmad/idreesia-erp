import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { DeleteOutlined } from '@ant-design/icons';

import { filter, find } from 'meteor/idreesia-common/utilities/lodash';
import { Table, Tooltip, message } from 'antd';
import { default as ItemForm } from './item-form';

class ItemsList extends Component {
  static propTypes = {
    readOnly: PropTypes.bool,
    value: PropTypes.array,
    onChange: PropTypes.func,
    refForm: PropTypes.object,
  };

  static defaultProps = {
    readOnly: false,
  };

  constructor(props) {
    super(props);
    this.state = {
      wazaif: props.value ? [...props.value] : [],
    };
  }

  handleAddItem = () => {
    const { refForm } = this.props;
    const fieldValues = refForm.getFieldsValue();
    const { wazeefa, packets } = fieldValues;
    if (!wazeefa || !packets) {
      message.info(
        'You need to select a wazeefa, and specify the number of packets.',
        5
      );
      return;
    }

    const { wazeefaDetail } = wazeefa;
    const packetCount = wazeefaDetail?.packetCount || 100;

    const { wazaif } = this.state;
    // If we have an existing item against this wazeefaId, then add the
    // count to the existing item instead of adding a new item.
    const existingItem = find(wazaif, {
      wazeefaId: wazeefa._id,
    });
    if (!existingItem) {
      wazaif.push({
        wazeefaId: wazeefa._id,
        formattedName: wazeefa.formattedName,
        packets,
        wazaifCount: packets * packetCount,
      });
    } else {
      existingItem.packets += packets;
      existingItem.totalCount += packets * packetCount;
    }

    const updatedWazaif = [...wazaif];
    this.setState({ wazaif: updatedWazaif });
    const { onChange } = this.props;
    if (onChange) {
      onChange(updatedWazaif);
    }

    refForm.resetFields(['wazeefa', 'packets']);
  };

  handleDeleteClicked = ({ wazeefaId }) => {
    const { wazaif } = this.state;
    const updatedWazaif = filter(
      wazaif,
      item => item.wazeefaId !== wazeefaId
    );
    this.setState({
      wazaif: updatedWazaif,
    });

    const { onChange } = this.props;
    if (onChange) {
      onChange(updatedWazaif);
    }
  };

  getColumns = () => {
    const { readOnly } = this.props;
    const columns = [
      {
        title: 'Wazeefa Name',
        dataIndex: 'formattedName',
        key: 'formattedName',
      },
      {
        title: 'Packets',
        dataIndex: 'packets',
        key: 'packets',
      },
      {
        title: 'Count',
        dataIndex: 'wazaifCount',
        key: 'wazaifCount',
      },
    ];

    if (!readOnly) {
      columns.push({
        key: 'actions',
        render: (text, record) => (
          <Tooltip title="Delete">
            <DeleteOutlined
              className="list-actions-icon"
              onClick={() => {
                this.handleDeleteClicked(record);
              }}
            />
          </Tooltip>
        ),
      });
    }
    return columns;
  };

  getTableHeader = () => {
    const {
      refForm,
      readOnly,
    } = this.props;

    if (readOnly) return null;
    return (
      <ItemForm
        refForm={refForm}
        handleAddItem={this.handleAddItem}
      />
    );
  };

  render() {
    return (
      <Table
        rowKey={item => item.wazeefaId}
        columns={this.getColumns()}
        bordered
        pagination={false}
        dataSource={this.state.wazaif}
        title={this.getTableHeader}
      />
    );
  }
}

export default ItemsList;
