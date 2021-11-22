import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import moment from 'moment';
import { EditOutlined, IdcardOutlined, PlusCircleOutlined, SolutionOutlined, StopOutlined } from '@ant-design/icons';
import {
  Button,
  Pagination,
  Popconfirm,
  Table,
  Tooltip,
  Modal,
  message,
} from 'antd';

import { find, flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { StayReasons } from 'meteor/idreesia-common/constants/security';

import NewForm from '../new-form';
import EditForm from '../edit-form';
import CardContainer from '../card/card-container';

class List extends Component {
  static propTypes = {
    pageIndex: PropTypes.number,
    pageSize: PropTypes.number,
    visitorId: PropTypes.string,
    showNewButton: PropTypes.bool,
    showDutyColumn: PropTypes.bool,
    showActionsColumn: PropTypes.bool,
    setPageParams: PropTypes.func,

    cancelVisitorStay: PropTypes.func,
    loading: PropTypes.bool,
    pagedVisitorStays: PropTypes.shape({
      totalResults: PropTypes.number,
      data: PropTypes.array,
    }),
  };

  state = {
    showNewFormModal: false,
    showEditFormModal: false,
    showCard: false,
    cardType: null,
    visitorStayId: null,
  };

  stayDetailsColumn = {
    title: 'Stay Details',
    key: 'stayDetails',
    render: (text, record) => {
      const fromDate = moment(Number(record.fromDate));
      const toDate = moment(Number(record.toDate));
      const days = record.numOfDays;
      if (days === 1) {
        return `1 day - [${fromDate.format('DD MMM, YYYY')}]`;
      }
      return `${days} days - [${fromDate.format(
        'DD MMM, YYYY'
      )} - ${toDate.format('DD MMM, YYYY')}]`;
    },
  };

  stayReasonColumn = {
    title: 'Stay Reason',
    key: 'stayReason',
    dataIndex: 'stayReason',
    render: text => {
      if (!text) return null;
      const reason = find(StayReasons, ({ _id }) => _id === text);
      return reason.name;
    },
  };

  dutyShiftNameColumn = {
    title: 'Duty / Shift',
    key: 'dutyShiftName',
    dataIndex: 'dutyShiftName',
  };

  actionsColumn = {
    key: 'action',
    width: 100,
    render: (text, record) => {
      if (record.cancelledDate) {
        const title = `Cancelled on ${moment(
          Number(record.cancelledDate)
        ).format('DD MMM, YYYY')}`;
        return <Tooltip title={title}>Cancelled</Tooltip>;
      }

      const editAction = (
        <Tooltip title="Edit stay">
          <EditOutlined
            className="list-actions-icon"
            onClick={() => {
              this.handleEditClicked(record);
            }}
          />
        </Tooltip>
      );

      const cancelAction = (
        <Popconfirm
          title="Are you sure you want to cancel this stay entry?"
          onConfirm={() => {
            this.handleCancelClicked(record);
          }}
          okText="Yes"
          cancelText="No"
        >
          <Tooltip title="Cancel">
            <StopOutlined className="list-actions-icon" />
          </Tooltip>
        </Popconfirm>
      );

      const dutyCardAction = record.stayReason ? (
        <Tooltip title="Duty Card">
          <IdcardOutlined
            className="list-actions-icon"
            onClick={() => {
              this.handleDutyCardClicked(record);
            }}
          />
        </Tooltip>
      ) : null;

      return (
        <div className="list-actions-column">
          <Tooltip title="Night Stay Card">
            <SolutionOutlined
              className="list-actions-icon"
              onClick={() => {
                this.handleNightStayCardClicked(record);
              }}
            />
          </Tooltip>
          {editAction}
          {cancelAction}
          {dutyCardAction}
        </div>
      );
    },
  };

  getColumns = () => {
    const { showDutyColumn, showActionsColumn } = this.props;
    const columns = [this.stayDetailsColumn, this.stayReasonColumn];

    if (showDutyColumn) {
      columns.push(this.dutyShiftNameColumn);
    }

    if (showActionsColumn) {
      columns.push(this.actionsColumn);
    }

    return columns;
  };

  onPaginationChange = (pageIndex, pageSize) => {
    const { setPageParams } = this.props;
    setPageParams({
      pageIndex: pageIndex - 1,
      pageSize,
    });
  };

  handleCancelClicked = record => {
    const { cancelVisitorStay } = this.props;
    cancelVisitorStay({
      variables: {
        _id: record._id,
      },
    }).catch(error => {
      message.error(error.message, 5);
    });
  };

  handleNightStayCardClicked = record => {
    this.setState({
      showCard: true,
      cardType: 'stay-card',
      visitorStayId: record._id,
    });
  };

  handleDutyCardClicked = record => {
    this.setState({
      showCard: true,
      cardType: 'duty-card',
      visitorStayId: record._id,
    });
  };

  handleCloseViewCard = () => {
    this.setState({
      showCard: false,
      cardType: null,
      visitorStayId: null,
    });
  };

  handleNewClicked = () => {
    this.setState({
      showNewFormModal: true,
    });
  };

  handleCloseNewForm = newVisitorStay => {
    this.setState({
      showNewFormModal: false,
      showCard: true,
      cardType: 'stay-card',
      visitorStayId: newVisitorStay._id,
    });
  };

  handleEditClicked = record => {
    this.setState({
      showEditFormModal: true,
      visitorStayId: record._id,
    });
  };

  handleCloseEditForm = () => {
    this.setState({
      showEditFormModal: false,
      visitorStayId: null,
    });
  };

  getTableHeader = () => {
    const { showNewButton } = this.props;
    if (showNewButton) {
      return (
        <Button
          type="primary"
          icon={<PlusCircleOutlined />}
          onClick={this.handleNewClicked}
        >
          Add New Stay
        </Button>
      );
    }

    return null;
  };

  render() {
    const { loading } = this.props;
    if (loading) return null;

    const {
      pageIndex,
      pageSize,
      visitorId,
      pagedVisitorStays: { totalResults, data },
    } = this.props;
    const {
      showNewFormModal,
      showEditFormModal,
      showCard,
      cardType,
      visitorStayId,
    } = this.state;

    const numPageIndex = pageIndex ? pageIndex + 1 : 1;
    const numPageSize = pageSize || 20;

    const card =
      showCard && visitorStayId ? (
        <Modal
          closable={false}
          visible={showCard}
          width={cardType === 'stay-card' ? 400 : 265}
          footer={null}
        >
          <CardContainer
            visitorId={visitorId}
            visitorStayId={visitorStayId}
            cardType={cardType}
            onCloseCard={this.handleCloseViewCard}
          />
        </Modal>
      ) : null;

    const newForm = showNewFormModal ? (
      <Modal
        title="New Stay"
        visible={showNewFormModal}
        width={600}
        footer={null}
        onCancel={this.handleCloseNewForm}
      >
        <NewForm
          visitorId={visitorId}
          handleAddItem={this.handleCloseNewForm}
        />
      </Modal>
    ) : null;

    const editForm =
      showEditFormModal && visitorStayId ? (
        <Modal
          title="Edit Stay"
          visible={showEditFormModal}
          width={600}
          footer={null}
          onCancel={this.handleCloseEditForm}
        >
          <EditForm
            visitorStayId={visitorStayId}
            handleSaveItem={this.handleCloseEditForm}
          />
        </Modal>
      ) : null;

    return (
      <Fragment>
        <Table
          rowKey="_id"
          dataSource={data}
          columns={this.getColumns()}
          title={this.getTableHeader}
          bordered
          size="small"
          pagination={false}
          footer={() => (
            <Pagination
              current={numPageIndex}
              pageSize={numPageSize}
              showSizeChanger
              showTotal={(total, range) =>
                `${range[0]}-${range[1]} of ${total} items`
              }
              onChange={this.onPaginationChange}
              onShowSizeChange={this.onPaginationChange}
              total={totalResults}
            />
          )}
        />
        {newForm}
        {editForm}
        {card}
      </Fragment>
    );
  }
}

const listQuery = gql`
  query pagedVisitorStays($queryString: String!) {
    pagedVisitorStays(queryString: $queryString) {
      totalResults
      data {
        _id
        visitorId
        fromDate
        toDate
        numOfDays
        stayReason
        dutyShiftName
        cancelledDate
      }
    }
  }
`;

const formMutation = gql`
  mutation cancelVisitorStay($_id: String!) {
    cancelVisitorStay(_id: $_id) {
      _id
      visitorId
      fromDate
      toDate
      numOfDays
      stayReason
      cancelledDate
    }
  }
`;

export default flowRight(
  graphql(formMutation, {
    name: 'cancelVisitorStay',
    options: {
      refetchQueries: ['pagedVisitorStays'],
    },
  }),
  graphql(listQuery, {
    props: ({ data }) => ({ ...data }),
    options: ({ visitorId, pageIndex, pageSize }) => ({
      variables: {
        queryString: `?visitorId=${visitorId ||
          ''}&pageIndex=${pageIndex}&pageSize=${pageSize}`,
      },
    }),
  })
)(List);
