import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { useMutation, useQuery } from '@apollo/react-hooks';
import { useParams } from 'react-router-dom';
import moment from 'moment';

import { setBreadcrumbs } from 'meteor/idreesia-common/action-creators';
import { find, toSafeInteger } from 'meteor/idreesia-common/utilities/lodash';
import { useQueryParams } from 'meteor/idreesia-common/hooks/common';
import {
  usePortal,
  usePortalCities,
} from 'meteor/idreesia-common/hooks/portals';
import { Button, Drawer, message } from '/imports/ui/controls';
import { PortalsSubModulePaths as paths } from '/imports/ui/modules/portals';
import { VisitorsList } from '/imports/ui/modules/common';
import { VisitorStaysList } from '/imports/ui/modules/security/visitor-stays';
import { CREATE_PORTAL_KARKUN } from '/imports/ui/modules/portals/karkuns/gql';

import ListFilter from './list-filter';
import KarkunsLookupList from './karkuns-lookup-list';
import { PAGED_PORTAL_VISITORS } from '../gql';

const List = ({ history, location }) => {
  const dispatch = useDispatch();
  const [showStayList, setShowStayList] = useState(false);
  const [showKarkunsList, setShowKarkunsList] = useState(false);
  const [visitorIdForStayList, setVisitorIdForStayList] = useState(null);
  const [visitorForKarkunsList, setVisitorForKarkunsList] = useState(null);
  const visitorsList = useRef(null);
  const { portalId } = useParams();
  const { portal } = usePortal();
  const { portalCities } = usePortalCities();
  const { queryString, queryParams, setPageParams } = useQueryParams({
    history,
    location,
    paramNames: [
      'name',
      'cnicNumber',
      'phoneNumber',
      'city',
      'pageIndex',
      'pageSize',
    ],
  });

  const [createPortalKarkun] = useMutation(CREATE_PORTAL_KARKUN);
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

  const handleStayHistoryAction = visitor => {
    setShowStayList(true);
    setVisitorIdForStayList(visitor._id);
  };

  const handleStayListClose = () => {
    setShowStayList(false);
    setVisitorIdForStayList(null);
  };

  const handleLookupAction = visitor => {
    setVisitorForKarkunsList(visitor);
    setShowKarkunsList(true);
  };

  const handleKarkunsListClose = () => {
    setVisitorForKarkunsList(null);
    setShowKarkunsList(false);
  };

  const handleKarkunSelected = karkun => {
    setVisitorForKarkunsList(null);
    setShowKarkunsList(false);
    history.push(paths.karkunsEditFormPath(portalId, karkun._id));
  };

  const handleCreateKarkunClicked = refreshKarkunsList => {
    const visitor = visitorForKarkunsList;
    const city = find(
      portalCities,
      portalCity => portalCity.name === visitor.city
    );

    createPortalKarkun({
      variables: {
        portalId,
        name: visitor.name,
        parentName: visitor.parentName,
        cnicNumber: visitor.cnicNumber,
        contactNumber1: visitor.contactNumber1,
        contactNumber2: visitor.contactNumber2,
        ehadDate: moment(Number(visitor.ehadDate)),
        referenceName: visitor.referenceName,
        imageId: visitor.imageId,
        cityId: city._id,
      },
    })
      .then(() => {
        refreshKarkunsList();
      })
      .catch(error => {
        message.error(error.message, 5);
      });
  };

  if (loading) return null;
  const { pagedPortalVisitors } = data;
  const {
    name,
    cnicNumber,
    phoneNumber,
    city,
    pageIndex,
    pageSize,
  } = queryParams;
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
        portalId={portalId}
        name={name}
        cnicNumber={cnicNumber}
        phoneNumber={phoneNumber}
        city={city}
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
        showLookupAction
        listHeader={getTableHeader}
        handleSelectItem={handleSelectItem}
        handleStayHistoryAction={handleStayHistoryAction}
        handleLookupAction={handleLookupAction}
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
        {showStayList ? (
          <VisitorStaysList
            showNewButton={false}
            showDutyColumn={false}
            showActionsColumn={false}
            visitorId={visitorIdForStayList}
          />
        ) : null}
      </Drawer>
      <Drawer
        title="Karkuns Lookup"
        width={600}
        onClose={handleKarkunsListClose}
        visible={showKarkunsList}
      >
        {showKarkunsList ? (
          <KarkunsLookupList
            portalId={portalId}
            visitor={visitorForKarkunsList}
            handleKarkunSelected={handleKarkunSelected}
            handleCreateKarkunClicked={handleCreateKarkunClicked}
          />
        ) : null}
      </Drawer>
    </>
  );
};

List.propTypes = {
  history: PropTypes.object,
  location: PropTypes.object,
};

export default List;
