import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { useQuery } from '@apollo/react-hooks';
import { useParams } from 'react-router-dom';
import { Button } from 'antd';
import { PlusCircleOutlined } from '@ant-design/icons';

import { setBreadcrumbs } from 'meteor/idreesia-common/action-creators';
import { toSafeInteger } from 'meteor/idreesia-common/utilities/lodash';
import { useQueryParams } from 'meteor/idreesia-common/hooks/common';
import {
  usePortal,
  usePortalCities,
} from 'meteor/idreesia-common/hooks/portals';
import { PortalsSubModulePaths as paths } from '/imports/ui/modules/portals';
import { VisitorsList, VisitorsListFilter } from '/imports/ui/modules/common';
import { PAGED_PORTAL_MEMBERS } from '../gql';

const List = ({ history, location }) => {
  const dispatch = useDispatch();
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
      'ehadDuration',
      'updatedBetween',
      'pageIndex',
      'pageSize',
    ],
  });

  const { data, loading, refetch } = useQuery(PAGED_PORTAL_MEMBERS, {
    variables: {
      portalId,
      queryString,
    },
  });

  useEffect(() => {
    if (portal) {
      dispatch(
        setBreadcrumbs(['Mehfil Portals', portal.name, 'Members', 'List'])
      );
    } else {
      dispatch(setBreadcrumbs(['Mehfil Portals', 'Members', 'List']));
    }
  }, [location, portal]);

  const handleNewClicked = () => {
    history.push(paths.membersNewFormPath(portalId));
  };

  const handleSelectItem = visitor => {
    history.push(paths.membersEditFormPath(portalId, visitor._id));
  };

  if (loading) return null;
  const { pagedPortalMembers } = data;
  const {
    name,
    cnicNumber,
    phoneNumber,
    city,
    ehadDuration,
    updatedBetween,
    pageIndex,
    pageSize,
  } = queryParams;
  const numPageIndex = pageIndex ? toSafeInteger(pageIndex) : 0;
  const numPageSize = pageSize ? toSafeInteger(pageSize) : 20;

  const cities = portalCities.map(portalCity => portalCity.name);

  const getTableHeader = () => (
    <div className="list-table-header">
      <Button
        type="primary"
        icon={<PlusCircleOutlined />}
        size="large"
        onClick={handleNewClicked}
      >
        New Member
      </Button>
      <VisitorsListFilter
        name={name}
        cnicNumber={cnicNumber}
        phoneNumber={phoneNumber}
        city={city}
        ehadDuration={ehadDuration}
        updatedBetween={updatedBetween}
        showAdditionalInfoFilter={false}
        distinctCities={cities}
        setPageParams={setPageParams}
        refreshData={refetch}
      />
    </div>
  );

  return (
    <VisitorsList
      showCnicColumn
      showPhoneNumbersColumn
      showCityCountryColumn
      showDeleteAction={false}
      listHeader={getTableHeader}
      handleSelectItem={handleSelectItem}
      setPageParams={setPageParams}
      pageIndex={numPageIndex}
      pageSize={numPageSize}
      pagedData={pagedPortalMembers}
    />
  );
};

List.propTypes = {
  history: PropTypes.object,
  location: PropTypes.object,
};

export default List;
