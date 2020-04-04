import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useQuery, useMutation } from '@apollo/react-hooks';

import { toSafeInteger } from 'meteor/idreesia-common/utilities/lodash';
import { Button, message } from '/imports/ui/controls';
import { ImdadRequestsList } from '/imports/ui/modules/common';

import {
  CREATE_TELEPHONE_ROOM_IMDAD_REQUEST,
  DELETE_TELEPHONE_ROOM_IMDAD_REQUEST,
  PAGED_TELEPHONE_ROOM_IMDAD_REQUESTS,
} from '../gql';

const List = ({ visitorId }) => {
  const [pageIndex, setPageIndex] = useState('0');
  const [pageSize, setPageSize] = useState('10');

  const [createTelephoneRoomImdadRequest] = useMutation(
    CREATE_TELEPHONE_ROOM_IMDAD_REQUEST
  );
  const [deleteTelephoneRoomImdadRequest] = useMutation(
    DELETE_TELEPHONE_ROOM_IMDAD_REQUEST
  );
  const { data, loading, refetch } = useQuery(
    PAGED_TELEPHONE_ROOM_IMDAD_REQUESTS,
    {
      variables: {
        filter: {
          visitorId,
          pageIndex,
          pageSize,
        },
      },
    }
  );

  const setPageParams = values => {
    if (values.hasOwnProperty('pageIndex')) setPageIndex(values.pageIndex);
    if (values.hasOwnProperty('pageSize')) setPageSize(values.pageSize);
  };

  const handleNewClicked = () => {
    createTelephoneRoomImdadRequest({
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
    deleteTelephoneRoomImdadRequest({
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
  const { pagedTelephoneRoomImdadRequests } = data;
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
      pagedData={pagedTelephoneRoomImdadRequests}
    />
  );
};

List.propTypes = {
  visitorId: PropTypes.string,
};

export default List;
