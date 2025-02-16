import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { useQuery, useMutation } from '@apollo/react-hooks';
import { Button, Drawer, message } from 'antd';
import { PlusCircleOutlined } from '@ant-design/icons';

import { setBreadcrumbs } from 'meteor/idreesia-common/action-creators';
import { useQueryParams } from 'meteor/idreesia-common/hooks/common';
import { MessagesList, MessagesListFilter } from '/imports/ui/modules/common';
import { OutstationSubModulePaths as paths } from '/imports/ui/modules/outstation';

import MessageResults from './message-results';
import {
  PAGED_OUTSTATION_MESSAGES,
  APPROVE_OUTSTATION_MESSAGE,
  DELETE_OUTSTATION_MESSAGE,
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

  const [deleteOutstationMessage] = useMutation(DELETE_OUTSTATION_MESSAGE);
  const [approveOutstationMessage] = useMutation(APPROVE_OUTSTATION_MESSAGE);
  const { data, loading, refetch } = useQuery(PAGED_OUTSTATION_MESSAGES, {
    variables: {
      filter: queryParams,
    },
  });

  useEffect(() => {
    dispatch(setBreadcrumbs(['Outstation', 'Messages', 'List']));
  }, [location]);

  const { startDate, endDate, pageIndex, pageSize } = queryParams;

  const handleNewClicked = () => {
    history.push(paths.messagesNewFormPath);
  };

  const handleSelectItem = _message => {
    history.push(paths.messagesEditFormPath(_message._id));
  };

  const handleDeleteItem = _message => {
    deleteOutstationMessage({
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
    approveOutstationMessage({
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
  const { pagedOutstationMessages } = data;

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
        pagedData={pagedOutstationMessages}
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
