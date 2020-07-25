import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useQuery, useMutation } from '@apollo/react-hooks';
import { useDispatch } from 'react-redux';

import { setBreadcrumbs } from 'meteor/idreesia-common/action-creators';
import { toSafeInteger } from 'meteor/idreesia-common/utilities/lodash';
import { useQueryParams } from 'meteor/idreesia-common/hooks/common';
import { Button, message } from '/imports/ui/controls';
import {
  ImdadRequestsList,
  ImdadRequestsListFilter,
} from '/imports/ui/modules/common';
import { OperationsSubModulePaths as paths } from '/imports/ui/modules/operations';

import {
  DELETE_OPERATIONS_IMDAD_REQUEST,
  PAGED_OPERATIONS_IMDAD_REQUESTS,
} from '../gql';

const List = ({ history, location }) => {
  const dispatch = useDispatch();
  const { queryParams, setPageParams } = useQueryParams({
    history,
    location,
    paramNames: [
      'cnicNumber',
      'status',
      'updatedBetween',
      'pageIndex',
      'pageSize',
    ],
  });

  const [deleteOperationsImdadRequest] = useMutation(
    DELETE_OPERATIONS_IMDAD_REQUEST
  );
  const { data, loading, refetch } = useQuery(PAGED_OPERATIONS_IMDAD_REQUESTS, {
    variables: {
      filter: queryParams,
    },
  });

  useEffect(() => {
    dispatch(setBreadcrumbs(['Operations', 'Imdad Requests', 'List']));
  }, [location]);

  const {
    cnicNumber,
    status,
    updatedBetween,
    pageIndex,
    pageSize,
  } = queryParams;

  const handleSelectItem = imdadRequest => {
    history.push(paths.imdadRequestsEditFormPath(imdadRequest._id));
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

  const handleNewClicked = () => {
    history.push(paths.imdadRequestsNewFormPath);
  };

  const getTableHeader = () => {
    const newButton = (
      <Button
        type="primary"
        size="large"
        icon="plus-circle-o"
        onClick={handleNewClicked}
      >
        New Imdad Request
      </Button>
    );

    return (
      <div className="list-table-header">
        {newButton}
        <div className="list-table-header-section">
          <ImdadRequestsListFilter
            cnicNumber={cnicNumber}
            status={status}
            updatedBetween={updatedBetween}
            setPageParams={setPageParams}
            refreshData={refetch}
          />
        </div>
      </div>
    );
  };

  if (loading) return null;
  const { pagedOperationsImdadRequests } = data;
  const numPageIndex = pageIndex ? toSafeInteger(pageIndex) : 0;
  const numPageSize = pageSize ? toSafeInteger(pageSize) : 20;

  return (
    <ImdadRequestsList
      showRequestDateColumn
      showNameColumn
      showCnicNumberColumn
      showStatusColumn
      showEditAction
      showDeleteAction
      listHeader={getTableHeader}
      handleSelectItem={handleSelectItem}
      handleDeleteItem={handleDeleteItem}
      setPageParams={setPageParams}
      pageIndex={numPageIndex}
      pageSize={numPageSize}
      pagedData={pagedOperationsImdadRequests}
    />
  );
};

List.propTypes = {
  history: PropTypes.object,
  location: PropTypes.object,
};

export default List;
