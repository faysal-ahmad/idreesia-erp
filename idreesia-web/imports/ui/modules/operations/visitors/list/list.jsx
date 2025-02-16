import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { useMutation, useQuery } from '@apollo/react-hooks';
import { Button, Drawer, message } from 'antd';
import { ScanOutlined, PlusCircleOutlined } from '@ant-design/icons';

import { setBreadcrumbs } from 'meteor/idreesia-common/action-creators';
import { useQueryParams } from 'meteor/idreesia-common/hooks/common';
import { useDistinctCities } from 'meteor/idreesia-common/hooks/security';
import { toSafeInteger } from 'meteor/idreesia-common/utilities/lodash';

import { VisitorsList, VisitorsListFilter } from '/imports/ui/modules/common';
import { VisitorImdadRequestsList } from '/imports/ui/modules/operations/visitor-imdad-requests';
import { OperationsSubModulePaths as paths } from '/imports/ui/modules/operations';

import { PAGED_OPERATIONS_VISITORS, DELETE_OPERATIONS_VISITOR } from '../gql';

const ButtonGroupStyle = {
  display: 'flex',
  flexFlow: 'row nowrap',
  alignItems: 'center',
};

const List = ({ history, location }) => {
  const dispatch = useDispatch();
  const visitorsList = useRef(null);
  const [showImdadRequests, setShowImdadRequests] = useState(false);
  const [visitorIdForList, setVisitorIdForList] = useState(null);
  const { queryParams, setPageParams } = useQueryParams({
    history,
    location,
    paramNames: [
      'name',
      'cnicNumber',
      'phoneNumber',
      'city',
      'ehadDuration',
      'pageIndex',
      'pageSize',
    ],
  });

  const [deleteOperationsVisitor] = useMutation(DELETE_OPERATIONS_VISITOR);
  const { distinctCities } = useDistinctCities();
  const { data, refetch } = useQuery(PAGED_OPERATIONS_VISITORS, {
    variables: { filter: queryParams },
  });

  useEffect(() => {
    dispatch(setBreadcrumbs(['Operations', 'Visitors', 'List']));
  }, [location]);

  const {
    name,
    cnicNumber,
    phoneNumber,
    city,
    ehadDuration,
    pageIndex,
    pageSize,
  } = queryParams;

  const handleSelectItem = visitor => {
    history.push(paths.visitorsEditFormPath(visitor._id));
  };

  const handleDeleteItem = record => {
    deleteOperationsVisitor({
      variables: {
        _id: record._id,
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
    history.push(paths.visitorsNewFormPath);
  };

  const handleScanClicked = () => {
    history.push(paths.visitorsScanFormPath);
  };

  const handleImdadRequestsAction = visitor => {
    setShowImdadRequests(true);
    setVisitorIdForList(visitor._id);
  };

  const handleImdadRequestsListClose = () => {
    setShowImdadRequests(false);
    setVisitorIdForList(null);
  };

  const getTableHeader = () => (
    <div className="list-table-header">
      <div style={ButtonGroupStyle}>
        <Button
          type="primary"
          icon={<PlusCircleOutlined />}
          size="large"
          onClick={handleNewClicked}
        >
          New Visitor
        </Button>
        &nbsp;&nbsp;
        <Button icon={<ScanOutlined />} size="large" onClick={handleScanClicked}>
          Scan CNIC
        </Button>
      </div>
      <div className="list-table-header-section">
        <VisitorsListFilter
          name={name}
          cnicNumber={cnicNumber}
          phoneNumber={phoneNumber}
          city={city}
          ehadDuration={ehadDuration}
          showAdditionalInfoFilter={false}
          distinctCities={distinctCities}
          setPageParams={setPageParams}
          refreshData={refetch}
        />
      </div>
    </div>
  );

  const pagedOperationsVisitors = data
    ? data.pagedOperationsVisitors
    : {
        data: [],
        totalResults: 0,
      };
  const numPageIndex = pageIndex ? toSafeInteger(pageIndex) : 0;
  const numPageSize = pageSize ? toSafeInteger(pageSize) : 20;

  return (
    <>
      <VisitorsList
        ref={visitorsList}
        showCnicColumn
        showPhoneNumbersColumn
        showCityCountryColumn
        showImdadRequestsAction
        showLookupAction={false}
        showDeleteAction
        listHeader={getTableHeader}
        handleSelectItem={handleSelectItem}
        handleDeleteItem={handleDeleteItem}
        handleImdadRequestsAction={handleImdadRequestsAction}
        setPageParams={setPageParams}
        pageIndex={numPageIndex}
        pageSize={numPageSize}
        pagedData={pagedOperationsVisitors}
      />
      <Drawer
        title="Imdad Requests"
        width={400}
        onClose={handleImdadRequestsListClose}
        open={showImdadRequests}
      >
        <VisitorImdadRequestsList visitorId={visitorIdForList} />
      </Drawer>
    </>
  );
};

List.propTypes = {
  history: PropTypes.object,
  location: PropTypes.object,
};

export default List;
