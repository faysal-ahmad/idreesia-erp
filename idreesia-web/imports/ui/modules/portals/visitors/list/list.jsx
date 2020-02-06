import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { useQuery } from '@apollo/react-hooks';
import { useParams } from 'react-router-dom';

import { setBreadcrumbs } from 'meteor/idreesia-common/action-creators';
import { toSafeInteger } from 'meteor/idreesia-common/utilities/lodash';
import { useQueryParams } from 'meteor/idreesia-common/hooks/common';
import { Button, Drawer } from '/imports/ui/controls';
import { PortalsSubModulePaths as paths } from '/imports/ui/modules/portals';
import { usePortal } from '/imports/ui/modules/portals/common/hooks';
import { VisitorsList } from '/imports/ui/modules/helpers/controls';
import { VisitorStaysList } from '/imports/ui/modules/security/visitor-stays';

import ListFilter from './list-filter';
import { PAGED_PORTAL_VISITORS } from '../gql';

const List = ({ history, location }) => {
  const dispatch = useDispatch();
  const [showStayList, setShowStayList] = useState(false);
  const [visitorIdForStayList, setVisitorIdForStayList] = useState(null);
  const visitorsList = useRef(null);
  const { portalId } = useParams();
  const { portal } = usePortal();
  const { queryString, queryParams, setPageParams } = useQueryParams({
    history,
    location,
    paramNames: ['name', 'cnicNumber', 'phoneNumber', 'pageIndex', 'pageSize'],
  });

  const { data, loading, refetch } = useQuery(PAGED_PORTAL_VISITORS, {
    variables: {
      portalId,
      queryString,
    },
  });

  useEffect(() => {
    if (portal) {
      dispatch(
        setBreadcrumbs(['Mehfil Portal', portal.name, 'Visitors', 'List'])
      );
    } else {
      dispatch(setBreadcrumbs(['Mehfil Portal', 'Visitors', 'List']));
    }
  }, [location, portal]);

  const handleNewClicked = () => {
    history.push(paths.visitorsNewFormPath(portalId));
  };

  const handleSelectItem = visitor => {
    history.push(paths.visitorsEditFormPath(portalId, visitor._id));
  };

  const handleStayHistoryClicked = visitor => {
    setShowStayList(true);
    setVisitorIdForStayList(visitor._id);
  };

  const handleStayListClose = () => {
    setShowStayList(false);
    setVisitorIdForStayList(null);
  };

  if (loading) return null;
  const { pagedPortalVisitors } = data;
  const { name, cnicNumber, phoneNumber, pageIndex, pageSize } = queryParams;
  const numPageIndex = pageIndex ? toSafeInteger(pageIndex) : 0;
  const numPageSize = pageSize ? toSafeInteger(pageSize) : 20;

  const getTableHeader = () => (
    <div className="list-table-header">
      <Button
        type="primary"
        icon="plus-circle-o"
        size="large"
        onClick={handleNewClicked}
      >
        New Visitor
      </Button>
      <ListFilter
        name={name}
        cnicNumber={cnicNumber}
        phoneNumber={phoneNumber}
        setPageParams={setPageParams}
        refreshData={refetch}
      />
    </div>
  );

  return (
    <>
      <VisitorsList
        ref={visitorsList}
        showSelectionColumn={false}
        showStatusColumn={false}
        showCnicColumn
        showPhoneNumbersColumn
        showCityCountryColumn
        showDeleteAction={false}
        showStayHistoryAction
        listHeader={getTableHeader}
        handleSelectItem={handleSelectItem}
        handleShowStayHistory={handleStayHistoryClicked}
        setPageParams={setPageParams}
        pageIndex={numPageIndex}
        pageSize={numPageSize}
        pagedData={pagedPortalVisitors}
      />
      <Drawer
        title="Stay History"
        width={600}
        onClose={handleStayListClose}
        visible={showStayList}
      >
        <VisitorStaysList
          showNewButton={false}
          showDutyColumn={false}
          showActionsColumn={false}
          visitorId={visitorIdForStayList}
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
