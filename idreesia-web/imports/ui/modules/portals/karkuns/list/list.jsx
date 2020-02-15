import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { useQuery } from '@apollo/react-hooks';
import { useParams } from 'react-router-dom';

import { setBreadcrumbs } from 'meteor/idreesia-common/action-creators';
import { toSafeInteger } from 'meteor/idreesia-common/utilities/lodash';
import { useQueryParams } from 'meteor/idreesia-common/hooks/common';
import { Button } from '/imports/ui/controls';
import { KarkunsList } from '/imports/ui/modules/common';
import { PortalsSubModulePaths as paths } from '/imports/ui/modules/portals';
import { usePortal } from '/imports/ui/modules/portals/common/hooks';

import ListFilter from './list-filter';
import { PAGED_PORTAL_KARKUNS } from '../gql';

const List = ({ history, location }) => {
  const dispatch = useDispatch();
  const karkunsList = useRef(null);
  const { portalId } = useParams();
  const { portal } = usePortal();
  const { queryString, queryParams, setPageParams } = useQueryParams({
    history,
    location,
    paramNames: [
      'name',
      'cnicNumber',
      'phoneNumber',
      'bloodGroup',
      'dutyId',
      'pageIndex',
      'pageSize',
    ],
  });

  const { data, loading, refetch } = useQuery(PAGED_PORTAL_KARKUNS, {
    variables: {
      portalId,
      queryString,
    },
  });

  useEffect(() => {
    if (portal) {
      dispatch(
        setBreadcrumbs(['Mehfil Portal', portal.name, 'Karkuns', 'List'])
      );
    } else {
      dispatch(setBreadcrumbs(['Mehfil Portal', 'Karkuns', 'List']));
    }
  }, [location, portal]);

  const handleNewClicked = () => {
    history.push(paths.karkunsNewFormPath(portalId));
  };

  const handleSelectItem = karkun => {
    history.push(paths.karkunsEditFormPath(portalId, karkun._id));
  };

  if (loading) return null;
  const { pagedPortalKarkuns } = data;
  const {
    name,
    cnicNumber,
    phoneNumber,
    bloodGroup,
    dutyId,
    pageIndex,
    pageSize,
  } = queryParams;
  const numPageIndex = pageIndex ? toSafeInteger(pageIndex) : 0;
  const numPageSize = pageSize ? toSafeInteger(pageSize) : 20;

  const getTableHeader = () => (
    <div className="list-table-header">
      <div>
        <Button
          size="large"
          type="primary"
          icon="plus-circle-o"
          onClick={handleNewClicked}
        >
          New Karkun
        </Button>
      </div>
      <ListFilter
        name={name}
        cnicNumber={cnicNumber}
        phoneNumber={phoneNumber}
        bloodGroup={bloodGroup}
        dutyId={dutyId}
        setPageParams={setPageParams}
        refreshData={refetch}
      />
    </div>
  );

  return (
    <KarkunsList
      ref={karkunsList}
      showSelectionColumn={false}
      showCnicColumn
      showPhoneNumbersColumn
      showMehfilCityColumn
      showDutiesColumn
      showDeleteAction={false}
      listHeader={getTableHeader}
      handleSelectItem={handleSelectItem}
      setPageParams={setPageParams}
      pageIndex={numPageIndex}
      pageSize={numPageSize}
      pagedData={pagedPortalKarkuns}
    />
  );
};

List.propTypes = {
  history: PropTypes.object,
  location: PropTypes.object,
};

export default List;
