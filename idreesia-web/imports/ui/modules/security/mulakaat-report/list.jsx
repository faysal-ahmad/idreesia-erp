import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useQuery, useMutation } from '@apollo/react-hooks';
import { useDispatch } from 'react-redux';
import moment from 'moment';
import {
  Button,
  DatePicker,
  Modal,
  Pagination,
  Table,
  Tooltip,
  message,
} from 'antd';
import { DeleteOutlined, InfoCircleOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';

import { Formats } from 'meteor/idreesia-common/constants';
import { setBreadcrumbs } from 'meteor/idreesia-common/action-creators';
import { useQueryParams } from 'meteor/idreesia-common/hooks/common';
import { toSafeInteger } from 'meteor/idreesia-common/utilities/lodash';

import { VisitorName } from '/imports/ui/modules/security/common/controls';

import {
  CANCEL_SECURITY_VISITOR_MULAKAATS,
  PAGED_SECURITY_VISITOR_MULAKAATS,
} from './gql';

const List = ({ history, location }) => {
  const dispatch = useDispatch();
  const { queryParams, setPageParams } = useQueryParams({
    history,
    location,
    paramNames: ['mulakaatDate', 'pageIndex', 'pageSize'],
    paramDefaultValues: {
      mulakaatDate: moment().format(Formats.DATE_FORMAT),
    },
  });

  const [cancelSecurityVisitorMulakaats] = useMutation(
    CANCEL_SECURITY_VISITOR_MULAKAATS
  );
  const { data, loading, refetch } = useQuery(
    PAGED_SECURITY_VISITOR_MULAKAATS,
    {
      variables: {
        filter: queryParams,
      },
    }
  );

  useEffect(() => {
    dispatch(setBreadcrumbs(['Security', 'Mulakaat Report']));
  }, [location]);

  const handleCancelMulakaats = () => {
    const _mulakaatDate = moment(queryParams.mulakaatDate, Formats.DATE_FORMAT);
    Modal.confirm({
      title: 'Are you sure you want to cancel all Mulakaats for this day?',
      onOk() {
        cancelSecurityVisitorMulakaats({
          variables: { mulakaatDate: _mulakaatDate },
        })
          .then(() => {
            refetch();
          })
          .catch(error => {
            message.error(error.message, 5);
          });
      },
      onCancel() {},
    });
  };

  const { mulakaatDate, pageIndex, pageSize } = queryParams;

  const onPaginationChange = (index, size) => {
    setPageParams({
      pageIndex: index - 1,
      pageSize: size,
    });
  };

  const handleDayChange = value => {
    setPageParams({
      mulakaatDate: value.format(Formats.DATE_FORMAT),
    });
  };

  const handleDayGoBack = () => {
    const mMulakaatDate = moment(mulakaatDate, Formats.DATE_FORMAT);
    setPageParams({
      mulakaatDate: mMulakaatDate
        .subtract(1, 'day')
        .format(Formats.DATE_FORMAT),
    });
  };

  const handleDayGoForward = () => {
    const mMulakaatDate = moment(mulakaatDate, Formats.DATE_FORMAT);
    setPageParams({
      mulakaatDate: mMulakaatDate.add(1, 'day').format(Formats.DATE_FORMAT),
    });
  };

  const getColumns = () => {
    const columns = [
      {
        title: 'Name',
        key: 'visitor.name',
        render: (text, record) => <VisitorName visitor={record.visitor} />,
      },
      {
        title: 'CNIC Number',
        key: 'visitor.cnicNumber',
        dataIndex: 'visitor.cnicNumber',
      },
      {
        title: 'Mobile No.',
        key: 'visitor.contactNumber1',
        dataIndex: 'visitor.contactNumber1',
      },
      {
        title: 'City / Country',
        key: 'cityCountry',
        render: (text, record) => {
          const { visitor } = record;
          return `${visitor.city}, ${visitor.country}`;
        },
      },
      {
        key: 'cancelled',
        width: 80,
        render: (text, record) => {
          const { cancelledDate, cancelledByName, createdByName } = record;
          if (cancelledDate) {
            return (
              <Tooltip
                title={
                  cancelledByName
                    ? `Cancelled by ${cancelledByName}`
                    : 'Cancelled'
                }
              >
                Cancelled
              </Tooltip>
            );
          }

          if (createdByName) {
            return (
              <div className="list-actions-column">
                <Tooltip title={`Created by ${createdByName}`}>
                  <InfoCircleOutlined className="list-actions-icon" />
                </Tooltip>
              </div>
            );
          }

          return null;
        },
      },
    ];

    return columns;
  };

  const getTableHeader = () => (
    <div className="list-table-header">
      <div className="list-table-header-section">
        <Button
          type="primary"
          shape="circle"
          icon={<LeftOutlined />}
          onClick={handleDayGoBack}
        />
        &nbsp;&nbsp;
        <DatePicker
          allowClear={false}
          format="DD MMM, YYYY"
          onChange={handleDayChange}
          value={moment(mulakaatDate, Formats.DATE_FORMAT)}
        />
        &nbsp;&nbsp;
        <Button
          type="primary"
          shape="circle"
          icon={<RightOutlined />}
          onClick={handleDayGoForward}
        />
      </div>
      <div>
        <Button
          size="large"
          type="primary"
          icon={<DeleteOutlined />}
          onClick={handleCancelMulakaats}
        >
          Cancel Mulakaats
        </Button>
      </div>
    </div>
  );

  if (loading) return null;
  const { pagedSecurityVisitorMulakaats } = data;
  const numPageIndex = pageIndex ? toSafeInteger(pageIndex) + 1 : 1;
  const numPageSize = pageSize ? toSafeInteger(pageSize) : 20;

  return (
    <Table
      rowKey="_id"
      dataSource={pagedSecurityVisitorMulakaats.data}
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
          total={pagedSecurityVisitorMulakaats.totalResults}
        />
      )}
    />
  );
};

List.propTypes = {
  history: PropTypes.object,
  location: PropTypes.object,
};

export default List;
