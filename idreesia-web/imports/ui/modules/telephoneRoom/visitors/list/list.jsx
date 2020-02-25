import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { useMutation, useQuery } from '@apollo/react-hooks';

import { setBreadcrumbs } from 'meteor/idreesia-common/action-creators';
import { useQueryParams } from 'meteor/idreesia-common/hooks/common';
import { useDistinctCities } from 'meteor/idreesia-common/hooks/security';
import { toSafeInteger } from 'meteor/idreesia-common/utilities/lodash';

import { Button, Drawer, message } from '/imports/ui/controls';
import { VisitorsList, VisitorsListFilter } from '/imports/ui/modules/common';
import { VisitorMulakaatsList } from '/imports/ui/modules/security/visitor-mulakaats';
import { TelephoneRoomSubModulePaths as paths } from '/imports/ui/modules/telephoneRoom';

import {
  PAGED_TELEPHONE_ROOM_VISITORS,
  DELETE_TELEPHONE_ROOM_VISITOR,
} from '../gql';

const ButtonGroupStyle = {
  display: 'flex',
  flexFlow: 'row nowrap',
  alignItems: 'center',
};

const List = ({ history, location }) => {
  const dispatch = useDispatch();
  const visitorsList = useRef(null);
  const [showMulakaatList, setShowMulakaatList] = useState(false);
  const [visitorIdForList, setVisitorIdForList] = useState(null);
  const { queryString, queryParams, setPageParams } = useQueryParams({
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

  const [deleteTelephoneRoomVisitor] = useMutation(
    DELETE_TELEPHONE_ROOM_VISITOR
  );
  const { distinctCities } = useDistinctCities();
  const { data, refetch } = useQuery(PAGED_TELEPHONE_ROOM_VISITORS, {
    variables: { queryString },
  });

  useEffect(() => {
    dispatch(setBreadcrumbs(['Telephone Room', 'Visitors', 'List']));
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
    deleteTelephoneRoomVisitor({
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

  const handleMulakaatHistoryAction = visitor => {
    setShowMulakaatList(true);
    setVisitorIdForList(visitor._id);
  };

  const handleMulakaatListClose = () => {
    setShowMulakaatList(false);
    setVisitorIdForList(null);
  };

  const getTableHeader = () => (
    <div className="list-table-header">
      <div style={ButtonGroupStyle}>
        <Button
          type="primary"
          icon="plus-circle-o"
          size="large"
          onClick={handleNewClicked}
        >
          New Visitor
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

  const pagedTelephoneRoomVisitors = data
    ? data.pagedTelephoneRoomVisitors
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
        showMulakaatHistoryAction
        showLookupAction={false}
        showDeleteAction
        listHeader={getTableHeader}
        handleSelectItem={handleSelectItem}
        handleDeleteItem={handleDeleteItem}
        handleMulakaatHistoryAction={handleMulakaatHistoryAction}
        setPageParams={setPageParams}
        pageIndex={numPageIndex}
        pageSize={numPageSize}
        pagedData={pagedTelephoneRoomVisitors}
      />
      <Drawer
        title="Mulakaat History"
        width={400}
        onClose={handleMulakaatListClose}
        visible={showMulakaatList}
      >
        <VisitorMulakaatsList
          showNewButton
          showActionsColumn
          visitorId={visitorIdForList}
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
