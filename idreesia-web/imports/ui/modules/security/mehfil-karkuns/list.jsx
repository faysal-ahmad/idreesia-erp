import React, { Component } from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

import { Button, Select, Icon, Table, Tooltip } from '/imports/ui/controls';
import { flowRight, sortBy } from 'meteor/idreesia-common/utilities/lodash';
import { MehfilDuties } from 'meteor/idreesia-common/constants/security';
import { KarkunName } from '/imports/ui/modules/hr/common/controls';
import { KarkunSelectionButton } from '/imports/ui/modules/hr/karkuns/field';

const SelectStyle = {
  width: '300px',
};

export class List extends Component {
  static propTypes = {
    dutyName: PropTypes.string,
    setPageParams: PropTypes.func,

    karkunsLoading: PropTypes.bool,
    mehfilKarkunsByMehfilId: PropTypes.array,
    handleAddMehfilKarkun: PropTypes.func,
    handleEditMehfilKarkun: PropTypes.func,
    handleRemoveMehfilKarkun: PropTypes.func,
    handleViewMehfilCards: PropTypes.func,
  };

  state = {
    selectedRows: [],
  };

  columns = [
    {
      title: 'Name',
      dataIndex: 'karkun.name',
      key: 'karkun.name',
      render: (text, record) => (
        <KarkunName karkun={record.karkun} onKarkunNameClicked={() => {}} />
      ),
    },
    {
      title: 'CNIC',
      dataIndex: 'karkun.cnicNumber',
      key: 'karkun.cnicNumber',
    },
    {
      title: 'Mobile No.',
      dataIndex: 'karkun.contactNumber1',
      key: 'karkun.contactNumber1',
    },
    {
      title: 'Duty Detail',
      dataIndex: 'dutyDetail',
      key: 'dutyDetail',
    },
    {
      key: 'action',
      render: (text, record) => (
        <div className="list-actions-column">
          <Tooltip key="edit" title="Edit Duty Detail">
            <Icon
              type="edit"
              className="list-actions-icon"
              onClick={() => {
                const { handleEditMehfilKarkun } = this.props;
                handleEditMehfilKarkun(record);
              }}
            />
          </Tooltip>
          <Tooltip key="delete" title="Remove Karkun">
            <Icon
              type="delete"
              className="list-actions-icon"
              onClick={() => {
                const { handleRemoveMehfilKarkun } = this.props;
                handleRemoveMehfilKarkun(record._id);
              }}
            />
          </Tooltip>
        </div>
      ),
    },
  ];

  rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      this.setState({
        selectedRows,
      });
    },
  };

  handleSelectionChange = value => {
    const { setPageParams } = this.props;
    setPageParams({
      dutyName: value,
    });
  };

  handleViewMehfilCards = () => {
    const { handleViewMehfilCards } = this.props;
    const { selectedRows } = this.state;
    if (handleViewMehfilCards) {
      handleViewMehfilCards(selectedRows);
    }
  };

  onKarkunSelection = karkun => {
    const { handleAddMehfilKarkun } = this.props;
    handleAddMehfilKarkun(karkun._id);
  };

  getTableHeader = () => {
    const { dutyName } = this.props;

    const options = MehfilDuties.map(duty => (
      <Select.Option key={duty._id} value={duty._id}>
        {duty.name}
      </Select.Option>
    ));

    const dutySelector = (
      <Select
        defaultValue={dutyName}
        style={SelectStyle}
        onChange={this.handleSelectionChange}
        allowClear
        dropdownMatchSelectWidth
      >
        {options}
      </Select>
    );

    return (
      <div className="list-table-header">
        <div>{dutySelector}</div>
        <div className="list-table-header-section">
          <KarkunSelectionButton
            label="Add Karkuns"
            onSelection={this.onKarkunSelection}
            disabled={!dutyName}
          />
          &nbsp;&nbsp;
          <Button
            disabled={!dutyName}
            icon="printer"
            size="large"
            onClick={this.handleViewMehfilCards}
          >
            Print Cards
          </Button>
        </div>
      </div>
    );
  };

  render() {
    const { karkunsLoading, mehfilKarkunsByMehfilId } = this.props;
    if (karkunsLoading) return null;

    const sortedMehfilKarkuns = sortBy(mehfilKarkunsByMehfilId, 'karkun.name');

    return (
      <Table
        rowKey="_id"
        size="small"
        title={this.getTableHeader}
        columns={this.columns}
        rowSelection={this.rowSelection}
        dataSource={sortedMehfilKarkuns}
        pagination={false}
        bordered
      />
    );
  }
}

const mehfilKarkunsByMehfilIdQuery = gql`
  query mehfilKarkunsByMehfilId($mehfilId: String!, $dutyName: String) {
    mehfilKarkunsByMehfilId(mehfilId: $mehfilId, dutyName: $dutyName) {
      _id
      mehfilId
      karkunId
      dutyName
      dutyDetail
      dutyCardBarcodeId
      karkun {
        _id
        name
        imageId
        cnicNumber
        contactNumber1
      }
    }
  }
`;

export default flowRight(
  graphql(mehfilKarkunsByMehfilIdQuery, {
    props: ({ data }) => ({ karkunsLoading: data.loading, ...data }),
    options: ({ mehfilId, dutyName }) => ({
      variables: {
        mehfilId,
        dutyName,
      },
    }),
  })
)(List);
