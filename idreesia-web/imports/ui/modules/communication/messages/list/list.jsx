import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { useQuery, useMutation } from '@apollo/react-hooks';

import { setBreadcrumbs } from 'meteor/idreesia-common/action-creators';
import { useQueryParams } from 'meteor/idreesia-common/hooks/common';
import { Button, Drawer, message } from '/imports/ui/controls';
import { MessagesList } from '/imports/ui/modules/common';
import { CommunicationSubModulePaths as paths } from '/imports/ui/modules/communication';

import ListFilter from './list-filter';
import MessageResults from './message-results';
import {
  PAGED_COMM_MESSAGES,
  APPROVE_COMM_MESSAGE,
  DELETE_COMM_MESSAGE,
} from '../gql';

const List = ({ history, location }) => {
  const dispatch = useDispatch();
  const [messageIdForResults, setMessageIdForResults] = useState(null);
  const [succeededForResults, setSucceededForResults] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const { queryParams, setPageParams } = useQueryParams({
    history,
    location,
    paramNames: ['startDate', 'endDate', 'source', 'pageIndex', 'pageSize'],
  });

  const [deleteCommMessage] = useMutation(DELETE_COMM_MESSAGE);
  const [approveCommMessage] = useMutation(APPROVE_COMM_MESSAGE);
  const { data, loading, refetch } = useQuery(PAGED_COMM_MESSAGES, {
    variables: {
      filter: queryParams,
    },
  });

  useEffect(() => {
    dispatch(setBreadcrumbs(['Communication', 'Messages', 'List']));
  }, [location]);

  const { startDate, endDate, source, pageIndex, pageSize } = queryParams;

  const handleNewClicked = () => {
    history.push(paths.messagesNewFormPath);
  };

  const handleSelectItem = _message => {
    history.push(paths.messagesEditFormPath(_message._id));
  };

  const handleDeleteItem = _message => {
    deleteCommMessage({
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
    approveCommMessage({
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
        icon="plus-circle-o"
        onClick={handleNewClicked}
      >
        New Message
      </Button>
      <ListFilter
        startDate={startDate}
        endDate={endDate}
        source={source}
        setPageParams={setPageParams}
        refreshData={refetch}
      />
    </div>
  );

  if (loading) return null;
  const { pagedCommMessages } = data;

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
        pagedData={pagedCommMessages}
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
        visible={showResults}
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
