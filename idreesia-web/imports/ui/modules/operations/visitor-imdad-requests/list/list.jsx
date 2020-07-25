import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useQuery, useMutation } from '@apollo/react-hooks';

import { toSafeInteger } from 'meteor/idreesia-common/utilities/lodash';
import { Button, message } from '/imports/ui/controls';
import { ImdadRequestsList } from '/imports/ui/modules/common';

import {
  CREATE_OPERATIONS_VISITOR_IMDAD_REQUEST,
  DELETE_OPERATIONS_IMDAD_REQUEST,
  PAGED_OPERATIONS_IMDAD_REQUESTS,
} from '../gql';

const List = ({ visitorId }) => {
  const [pageIndex, setPageIndex] = useState('0');
  const [pageSize, setPageSize] = useState('10');

  const [createOperationsVisitorImdadRequest] = useMutation(
    CREATE_OPERATIONS_VISITOR_IMDAD_REQUEST
  );
  const [deleteOperationsImdadRequest] = useMutation(
    DELETE_OPERATIONS_IMDAD_REQUEST
  );
  const { data, loading, refetch } = useQuery(PAGED_OPERATIONS_IMDAD_REQUESTS, {
    variables: {
      filter: {
        visitorId,
        pageIndex,
        pageSize,
      },
    },
  });

  const setPageParams = values => {
    if (values.hasOwnProperty('pageIndex')) setPageIndex(values.pageIndex);
    if (values.hasOwnProperty('pageSize')) setPageSize(values.pageSize);
  };

  const handleNewClicked = () => {
    createOperationsVisitorImdadRequest({
      variables: {
        visitorId,
      },
    })
      .then(() => {
        refetch();
      })
      .catch(error => {
        message.error(error.message, 5);
      });
  };

  const handleDeleteItem = ({ _id }) => {
    deleteOperationsImdadRequest({
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

  const getTableHeader = () => (
    <div className="list-table-header">
      <div className="list-table-header-section">
        <Button type="primary" icon="plus-circle-o" onClick={handleNewClicked}>
          Create Imdad Request
        </Button>
      </div>
    </div>
  );

  if (loading) return null;
  const { pagedOperationsImdadRequests } = data;
  const numPageIndex = toSafeInteger(pageIndex);
  const numPageSize = toSafeInteger(pageSize);

  return (
    <ImdadRequestsList
      showRequestDateColumn
      showStatusColumn
      showDeleteAction
      listHeader={getTableHeader}
      handleDeleteItem={handleDeleteItem}
      setPageParams={setPageParams}
      pageIndex={numPageIndex}
      pageSize={numPageSize}
      pagedData={pagedOperationsImdadRequests}
    />
  );
};

List.propTypes = {
  visitorId: PropTypes.string,
};

export default List;
