import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { useQuery, useMutation } from '@apollo/react-hooks';
import { Button, Drawer, message } from 'antd';
import { PlusCircleOutlined } from '@ant-design/icons';

import { setBreadcrumbs } from 'meteor/idreesia-common/action-creators';
import { useQueryParams } from 'meteor/idreesia-common/hooks/common';
import { MessagesList, MessagesListFilter } from '/imports/ui/modules/common';
import { HRSubModulePaths as paths } from '/imports/ui/modules/hr';

import MessageResults from './message-results';
import {
  PAGED_HR_MESSAGES,
  APPROVE_HR_MESSAGE,
  DELETE_HR_MESSAGE,
} from '../gql';

const List = ({ history, location }) => {
  const dispatch = useDispatch();
  const [messageIdForResults, setMessageIdForResults] = useState(null);
  const [succeededForResults, setSucceededForResults] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const { queryParams, setPageParams } = useQueryParams({
    history,
    location,
    paramNames: ['startDate', 'endDate', 'pageIndex', 'pageSize'],
  });

  const [deleteHrMessage] = useMutation(DELETE_HR_MESSAGE);
  const [approveHrMessage] = useMutation(APPROVE_HR_MESSAGE);
  const { data, loading, refetch } = useQuery(PAGED_HR_MESSAGES, {
    variables: {
      filter: queryParams,
    },
  });

  useEffect(() => {
    dispatch(setBreadcrumbs(['HR', 'Messages', 'List']));
  }, [location]);

  const { startDate, endDate, pageIndex, pageSize } = queryParams;

  const handleNewClicked = () => {
    history.push(paths.messagesNewFormPath);
  };

  const handleSelectItem = _message => {
    history.push(paths.messagesEditFormPath(_message._id));
  };

  const handleDeleteItem = _message => {
    deleteHrMessage({
      variables: { _id: _message._id },
    })
      .then(() => {
        refetch();
      })
      .catch(error => {
        message.error(error.message, 5);
      });
  };

  const handleApproveItem = _message => {
    approveHrMessage({
      variables: { _id: _message._id },
    })
      .then(() => {
        refetch();
      })
      .catch(error => {
        message.error(error.message, 5);
      });
  };

  const showResultForMessage = (messageId, succeeded) => {
    setMessageIdForResults(messageId);
    setSucceededForResults(succeeded);
    setShowResults(true);
  };

  const getTableHeader = () => (
    <div className="list-table-header">
      <Button
        size="large"
        type="primary"
        icon={<PlusCircleOutlined />}
        onClick={handleNewClicked}
      >
        New Message
      </Button>
      <MessagesListFilter
        startDate={startDate}
        endDate={endDate}
        setPageParams={setPageParams}
        refreshData={refetch}
      />
    </div>
  );

  if (loading) return null;
  const { pagedHrMessages } = data;

  return (
    <>
      <MessagesList
        listHeader={getTableHeader}
        handleSelectItem={handleSelectItem}
        handleDeleteItem={handleDeleteItem}
        handleApproveItem={handleApproveItem}
        showResultForMessage={showResultForMessage}
        setPageParams={setPageParams}
        pageIndex={pageIndex}
        pageSize={pageSize}
        pagedData={pagedHrMessages}
      />
      <Drawer
        title={
          succeededForResults
            ? 'Message Results - Sent'
            : 'Message Results - Failed'
        }
        width={720}
        onClose={() => {
          setShowResults(false);
        }}
        open={showResults}
      >
        <MessageResults
          messageId={messageIdForResults}
          succeeded={succeededForResults}
        />
      </Drawer>
    </>
  );
};

List.propTypes = {
  history: PropTypes.object,
  location: PropTypes.object,
};

export default List;
