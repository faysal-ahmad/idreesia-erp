import React, { Component, Fragment } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import dayjs from 'dayjs';
import { EditOutlined, IdcardOutlined, PlusCircleOutlined, SolutionOutlined, StopOutlined } from '@ant-design/icons';
import {
  Button,
  Pagination,
  Popconfirm,
  Spin,
  Table,
  Tooltip,
  Modal,
} from 'antd';
import { message } from '/imports/ui/antd-feedback';
import { find } from 'meteor/idreesia-common/utilities/lodash';
import { StayReasons } from 'meteor/idreesia-common/constants/security';
import type { VisitorStaysPagedVisitorStaysQuery } from 'meteor/idreesia-common/types/client-operations';

import NewForm from '../new-form';
import EditForm from '../edit-form';
import CardContainer from '../card/card-container';
import { CANCEL_VISITOR_STAY, PAGED_VISITOR_STAYS } from '../gql';

type VisitorStay = NonNullable<
  NonNullable<
    NonNullable<VisitorStaysPagedVisitorStaysQuery['pagedVisitorStays']>['data']
  >[number]
> & { _id: string; visitorId: string };

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
  cancelVisitorStay(args: { variables: { _id: string } }): Promise<unknown>;
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

interface ListWithDataProps extends Omit<ListProps, 'cancelVisitorStay' | 'pagedVisitorStays' | 'loading'> {}

const emptyPagedVisitorStays: PagedVisitorStays = {
  data: [],
  totalResults: 0,
};

class List extends Component<ListProps, ListState> {
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
      const reason = find(StayReasons, ({ _id }) => _id === text);
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

  handleCloseNewForm = (newVisitorStay?: { _id?: string | null }) => {
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
    if (!showNewButton) return null;

    return (
      <div className="list-table-header">
        <div className="list-table-header-section">
          <Button
            type="primary"
            icon={<PlusCircleOutlined />}
            onClick={this.handleNewClicked}
          >
            Add New Stay
          </Button>
        </div>
      </div>
    );
  };

  render() {
    const { loading } = this.props;
    if (loading) {
      return (
        <div style={{ textAlign: 'center', padding: '48px 0' }}>
          <Spin />
        </div>
      );
    }

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
        <Modal
          closable={false}
          open={showCard}
          width={cardType === 'stay-card' ? 400 : 265}
          footer={null}
        >
          <CardContainer
            visitorId={visitorId}
            visitorStayId={visitorStayId}
            cardType={cardType ?? 'stay-card'}
            onCloseCard={this.handleCloseViewCard}
          />
        </Modal>
      ) : null;

    const newForm = showNewFormModal ? (
      <Modal
        title="New Stay"
        open={showNewFormModal}
        width={600}
        footer={null}
        onCancel={() => this.handleCloseNewForm()}
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
          open={showEditFormModal}
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
        <div className="list-container">
          <Table
            className="list-table"
            rowKey="_id"
            dataSource={data}
            columns={this.getColumns()}
            title={this.getTableHeader}
            bordered
            size="medium"
            tableLayout="fixed"
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
        </div>
        {newForm}
        {editForm}
        {card}
      </Fragment>
    );
  }
}

const ListWithData = (props: ListWithDataProps) => {
  const { visitorId, pageIndex, pageSize } = props;
  const [cancelVisitorStay] = useMutation(CANCEL_VISITOR_STAY, {
    refetchQueries: ['pagedVisitorStays'],
  });
  const { data, loading } = useQuery(PAGED_VISITOR_STAYS, {
    variables: {
      queryString: `?visitorId=${visitorId || ''}&pageIndex=${pageIndex}&pageSize=${pageSize}`,
    },
  });

  const pagedData = data?.pagedVisitorStays;
  const pagedVisitorStays: PagedVisitorStays = {
    totalResults: pagedData?.totalResults ?? 0,
    data: (pagedData?.data ?? []).filter(
      (row): row is VisitorStay => row != null && row._id != null && row.visitorId != null
    ),
  };

  return (
    <List
      {...props}
      loading={loading}
      pagedVisitorStays={pagedVisitorStays}
      cancelVisitorStay={cancelVisitorStay}
    />
  );
};

export default ListWithData;
