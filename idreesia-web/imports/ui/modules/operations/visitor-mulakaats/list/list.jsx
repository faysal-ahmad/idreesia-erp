import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useQuery, useMutation } from '@apollo/react-hooks';
import moment from 'moment';
import { DeleteOutlined, SolutionOutlined, StopOutlined } from '@ant-design/icons';

import {
  Button,
  DatePicker,
  Pagination,
  Popconfirm,
  Table,
  Tooltip,
  Modal,
  message,
} from '/imports/ui/controls';

import CardContainer from '../card/card-container';
import {
  CREATE_OPERATIONS_VISITOR_MULAKAAT,
  CANCEL_OPERATIONS_VISITOR_MULAKAAT,
  DELETE_OPERATIONS_VISITOR_MULAKAAT,
  PAGED_OPERATIONS_VISITOR_MULAKAATS,
} from '../gql';

const getMulakaatDefaultDate = () => {
  const date = moment();
  // If the time is after 2pm, switch to tomorrow's date
  if (date.hour() >= 14) {
    date.add(1, 'day');
  }

  return date;
};

const List = ({ visitorId, showNewButton, showActionsColumn }) => {
  const [showCard, setShowCard] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [visitorMulakaatId, setVisitorMulakaatId] = useState(null);
  const [selectedMulakaatDate, setSelectedMulakaatDate] = useState(
    getMulakaatDefaultDate()
  );

  const [createOperationsVisitorMulakaat] = useMutation(
    CREATE_OPERATIONS_VISITOR_MULAKAAT
  );
  const [cancelOperationsVisitorMulakaat] = useMutation(
    CANCEL_OPERATIONS_VISITOR_MULAKAAT
  );
  const [deleteOperationsVisitorMulakaat] = useMutation(
    DELETE_OPERATIONS_VISITOR_MULAKAAT
  );
  const { data, loading, refetch } = useQuery(
    PAGED_OPERATIONS_VISITOR_MULAKAATS,
    {
      variables: {
        filter: {
          visitorId,
          pageIndex: pageIndex.toString(),
          pageSize: pageSize.toString(),
        },
      },
    }
  );

  const onPaginationChange = (index, size) => {
    setPageIndex(index - 1);
    setPageSize(size);
  };

  const handleNewClicked = () => {
    createOperationsVisitorMulakaat({
      variables: {
        visitorId,
        mulakaatDate: selectedMulakaatDate,
      },
    })
      .then(() => {
        refetch();
      })
      .catch(error => {
        message.error(error.message, 5);
      });
  };

  const handleCancelClicked = ({ _id }) => {
    cancelOperationsVisitorMulakaat({
      variables: {
        _id,
      },
    })
      .then(() => {
        refetch();
      })
      .catch(error => {
        message.error(error.message, 5);
      });
  };

  const handleDeleteClicked = ({ _id }) => {
    deleteOperationsVisitorMulakaat({
      variables: {
        _id,
      },
    })
      .then(() => {
        refetch();
      })
      .catch(error => {
        message.error(error.message, 5);
      });
  };

  const handleCardClicked = record => {
    setShowCard(true);
    setVisitorMulakaatId(record._id);
  };

  const handleCloseViewCard = () => {
    setShowCard(false);
    setVisitorMulakaatId(null);
  };

  const getColumns = () => {
    const columns = [
      {
        title: 'Mulakaat Date',
        key: 'mulakaatDate',
        dataIndex: 'mulakaatDate',
        render: text => {
          const mulakaatDate = moment(Number(text));
          return mulakaatDate.format('DD MMM, YYYY');
        },
      },
    ];

    if (showActionsColumn) {
      columns.push({
        key: 'action',
        width: 100,
        render: (text, record) => {
          if (record.cancelledDate) {
            const title = `Cancelled on ${moment(
              Number(record.cancelledDate)
            ).format('DD MMM, YYYY')}`;
            return <Tooltip title={title}>Cancelled</Tooltip>;
          }

          return (
            <div className="list-actions-column">
              <Tooltip title="Mulakaat Card">
                <SolutionOutlined
                  className="list-actions-icon"
                  onClick={() => {
                    handleCardClicked(record);
                  }}
                />
              </Tooltip>
              <Popconfirm
                title="Are you sure you want to cancel this mulakaat entry?"
                onConfirm={() => {
                  handleCancelClicked(record);
                }}
                okText="Yes"
                cancelText="No"
              >
                <Tooltip title="Cancel">
                  <StopOutlined className="list-actions-icon" />
                </Tooltip>
              </Popconfirm>
              <Popconfirm
                title="Are you sure you want to delete this mulakaat entry?"
                onConfirm={() => {
                  handleDeleteClicked(record);
                }}
                okText="Yes"
                cancelText="No"
              >
                <Tooltip title="Delete">
                  <DeleteOutlined className="list-actions-icon" />
                </Tooltip>
              </Popconfirm>
            </div>
          );
        },
      });
    }

    return columns;
  };

  const getTableHeader = () => {
    if (showNewButton) {
      return (
        <div className="list-table-header">
          <div className="list-table-header-section">
            <DatePicker
              allowClear={false}
              defaultValue={selectedMulakaatDate}
              format="DD MMM, YYYY"
              onChange={value => {
                setSelectedMulakaatDate(value);
              }}
            />
            &nbsp;&nbsp;
            <Button
              type="primary"
              icon="plus-circle-o"
              onClick={handleNewClicked}
            >
              Add Mulakaat
            </Button>
          </div>
        </div>
      );
    }

    return null;
  };

  if (loading) return null;
  const { pagedOperationsVisitorMulakaats } = data;
  const numPageIndex = pageIndex ? pageIndex + 1 : 1;
  const numPageSize = pageSize || 10;

  const card =
    showCard && visitorMulakaatId ? (
      <Modal closable={false} visible={showCard} width={400} footer={null}>
        <CardContainer
          visitorId={visitorId}
          visitorMulakaatId={visitorMulakaatId}
          onCloseCard={handleCloseViewCard}
        />
      </Modal>
    ) : null;

  return (
    <>
      <Table
        rowKey="_id"
        dataSource={pagedOperationsVisitorMulakaats.data}
        columns={getColumns()}
        title={getTableHeader}
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
            onChange={onPaginationChange}
            onShowSizeChange={onPaginationChange}
            total={pagedOperationsVisitorMulakaats.totalResults}
          />
        )}
      />
      {card}
    </>
  );
};

List.propTypes = {
  visitorId: PropTypes.string,
  showNewButton: PropTypes.bool,
  showActionsColumn: PropTypes.bool,
};

export default List;
