import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { useQuery, useMutation } from '@apollo/client/react';
import dayjs from 'dayjs';
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

import { find } from 'meteor/idreesia-common/utilities/lodash';
import { StayReasons } from 'meteor/idreesia-common/constants/security';

import NewForm from '../new-form';
import EditForm from '../edit-form';
import CardContainer from '../card/card-container';

const ReactFragment = Fragment as any;
const AntButton = Button as any;
const AntPagination = Pagination as any;
const AntPopconfirm = Popconfirm as any;
const AntTable = Table as any;
const AntTooltip = Tooltip as any;
const AntModal = Modal as any;
const AntEditOutlined = EditOutlined as any;
const AntIdcardOutlined = IdcardOutlined as any;
const AntPlusCircleOutlined = PlusCircleOutlined as any;
const AntSolutionOutlined = SolutionOutlined as any;
const AntStopOutlined = StopOutlined as any;
const NewFormComponent = NewForm as any;
const EditFormComponent = EditForm as any;
const CardContainerComponent = CardContainer as any;

interface VisitorStay {
  _id: string;
  visitorId: string;
  fromDate: string | number;
  toDate: string | number;
  numOfDays: number;
  stayReason?: string;
  dutyShiftName?: string;
  cancelledDate?: string | number | null;
}

interface PagedVisitorStays {
  totalResults: number;
  data: VisitorStay[];
}

interface ListProps {
  pageIndex?: number;
  pageSize?: number;
  visitorId: string;
  showNewButton?: boolean;
  showDutyColumn?: boolean;
  showActionsColumn?: boolean;
  setPageParams(params: Record<string, unknown>): void;
  cancelVisitorStay(args: unknown): Promise<unknown>;
  loading?: boolean;
  pagedVisitorStays?: PagedVisitorStays;
}

interface ListState {
  showNewFormModal: boolean;
  showEditFormModal: boolean;
  showCard: boolean;
  cardType: string | null;
  visitorStayId: string | null;
}

interface ListWithDataProps extends Omit<ListProps, 'cancelVisitorStay' | 'pagedVisitorStays'> {}

interface VisitorStaysData {
  pagedVisitorStays?: PagedVisitorStays;
}

const emptyPagedVisitorStays: PagedVisitorStays = {
  data: [],
  totalResults: 0,
};

class List extends Component<ListProps, ListState> {
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
    render: (_text: unknown, record: VisitorStay) => {
      const fromDate = dayjs(Number(record.fromDate));
      const toDate = dayjs(Number(record.toDate));
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
    render: (text: string) => {
      if (!text) return null;
      const reason = find(StayReasons, ({ _id }: { _id: string }) => _id === text) as { name?: string } | undefined;
      return reason?.name ?? '';
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
    render: (_text: unknown, record: VisitorStay) => {
      if (record.cancelledDate) {
        const title = `Cancelled on ${dayjs(
          Number(record.cancelledDate)
        ).format('DD MMM, YYYY')}`;
        return <AntTooltip title={title}>Cancelled</AntTooltip>;
      }

      const editAction = (
        <AntTooltip title="Edit stay">
          <AntEditOutlined
            className="list-actions-icon"
            onClick={() => {
              this.handleEditClicked(record);
            }}
          />
        </AntTooltip>
      );

      const cancelAction = (
        <AntPopconfirm
          title="Are you sure you want to cancel this stay entry?"
          onConfirm={() => {
            this.handleCancelClicked(record);
          }}
          okText="Yes"
          cancelText="No"
        >
          <AntTooltip title="Cancel">
            <AntStopOutlined className="list-actions-icon" />
          </AntTooltip>
        </AntPopconfirm>
      );

      const dutyCardAction = record.stayReason ? (
        <AntTooltip title="Duty Card">
          <AntIdcardOutlined
            className="list-actions-icon"
            onClick={() => {
              this.handleDutyCardClicked(record);
            }}
          />
        </AntTooltip>
      ) : null;

      return (
        <div className="list-actions-column">
          <AntTooltip title="Night Stay Card">
            <AntSolutionOutlined
              className="list-actions-icon"
              onClick={() => {
                this.handleNightStayCardClicked(record);
              }}
            />
          </AntTooltip>
          {editAction}
          {cancelAction}
          {dutyCardAction}
        </div>
      );
    },
  };

  getColumns = (): any[] => {
    const { showDutyColumn, showActionsColumn } = this.props;
    const columns: any[] = [this.stayDetailsColumn, this.stayReasonColumn];

    if (showDutyColumn) {
      columns.push(this.dutyShiftNameColumn);
    }

    if (showActionsColumn) {
      columns.push(this.actionsColumn);
    }

    return columns;
  };

  onPaginationChange = (pageIndex: number, pageSize: number) => {
    const { setPageParams } = this.props;
    setPageParams({
      pageIndex: pageIndex - 1,
      pageSize,
    });
  };

  handleCancelClicked = (record: VisitorStay) => {
    const { cancelVisitorStay } = this.props;
    cancelVisitorStay({
      variables: {
        _id: record._id,
      },
    }).catch((error: Error) => {
      message.error(error.message, 5);
    });
  };

  handleNightStayCardClicked = (record: VisitorStay) => {
    this.setState({
      showCard: true,
      cardType: 'stay-card',
      visitorStayId: record._id,
    });
  };

  handleDutyCardClicked = (record: VisitorStay) => {
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

  handleCloseNewForm = (newVisitorStay?: VisitorStay) => {
    this.setState({
      showNewFormModal: false,
      showCard: Boolean(newVisitorStay),
      cardType: 'stay-card',
      visitorStayId: newVisitorStay?._id ?? null,
    });
  };

  handleEditClicked = (record: VisitorStay) => {
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
        <AntButton
          type="primary"
          icon={<AntPlusCircleOutlined />}
          onClick={this.handleNewClicked}
        >
          Add New Stay
        </AntButton>
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
      pagedVisitorStays = emptyPagedVisitorStays,
    } = this.props;
    const { totalResults, data } = pagedVisitorStays;
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
        <AntModal
          closable={false}
          open={showCard}
          width={cardType === 'stay-card' ? 400 : 265}
          footer={null}
        >
          <CardContainerComponent
            visitorId={visitorId}
            visitorStayId={visitorStayId}
            cardType={cardType}
            onCloseCard={this.handleCloseViewCard}
          />
        </AntModal>
      ) : null;

    const newForm = showNewFormModal ? (
      <AntModal
        title="New Stay"
        open={showNewFormModal}
        width={600}
        footer={null}
        onCancel={this.handleCloseNewForm}
      >
        <NewFormComponent
          visitorId={visitorId}
          handleAddItem={this.handleCloseNewForm}
        />
      </AntModal>
    ) : null;

    const editForm =
      showEditFormModal && visitorStayId ? (
        <AntModal
          title="Edit Stay"
          open={showEditFormModal}
          width={600}
          footer={null}
          onCancel={this.handleCloseEditForm}
        >
          <EditFormComponent
            visitorStayId={visitorStayId}
            handleSaveItem={this.handleCloseEditForm}
          />
        </AntModal>
      ) : null;

    return (
      <ReactFragment>
        <AntTable
          rowKey="_id"
          dataSource={data}
          columns={this.getColumns()}
          title={this.getTableHeader}
          bordered
          size="small"
          pagination={false}
          footer={() => (
            <AntPagination
              current={numPageIndex}
              pageSize={numPageSize}
              showSizeChanger
              showTotal={(total: number, range: number[]) =>
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
      </ReactFragment>
    );
  }
}

const listQuery = gql`
  query visitorStaysPagedVisitorStays($queryString: String!) {
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

const ListWithData = (props: ListWithDataProps) => {
  const { visitorId, pageIndex, pageSize } = props;
  const [cancelVisitorStay] = useMutation(formMutation as any, {
    refetchQueries: ['pagedVisitorStays'],
  });
  const { data = {}, loading, ...queryResult } = useQuery(listQuery as any, {
    variables: {
      queryString: `?visitorId=${visitorId ||
        ''}&pageIndex=${pageIndex}&pageSize=${pageSize}`,
    },
  });

  return (
    <List
      {...props}
      {...queryResult}
      {...(data as VisitorStaysData)}
      loading={loading}
      cancelVisitorStay={cancelVisitorStay}
    />
  );
};

export default ListWithData;
