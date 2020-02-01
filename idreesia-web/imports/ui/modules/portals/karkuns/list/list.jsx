import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { useDispatch } from 'react-redux';
import { useMutation, useQuery } from '@apollo/react-hooks';
import { useParams } from 'react-router-dom';

import { setBreadcrumbs } from 'meteor/idreesia-common/action-creators';
import { toSafeInteger } from 'meteor/idreesia-common/utilities/lodash';
import { useQueryParams } from 'meteor/idreesia-common/hooks/common';
import { Button, Tooltip, message } from '/imports/ui/controls';
import { KarkunsList } from '/imports/ui/modules/helpers/controls';
import { PortalsSubModulePaths as paths } from '/imports/ui/modules/portals';
import { usePortal } from '/imports/ui/modules/portals/common/hooks';

import ListFilter from './list-filter';

const DELETE_PORTAL_KARKUN = gql`
  mutation deletePortalKarkun($portalId: String!, $_id: String!) {
    deleteOutstationKarkun(portalId: $portalId, _id: $_id)
  }
`;

const PAGED_DATA = gql`
  query pagedPortalKarkuns($portalId: String!, $queryString: String) {
    pagedPortalKarkuns(portalId: $portalId, queryString: $queryString) {
      totalResults
      karkuns {
        _id
        name
        cnicNumber
        contactNumber1
        contactNumber2
        imageId
        duties {
          _id
          dutyId
          dutyName
        }
      }
    }
  }
`;

const List = ({ history, location }) => {
  const dispatch = useDispatch();
  const karkunsList = useRef(null);
  const { portalId } = useParams();
  const { portal } = usePortal();
  const [deletePortalKarkun] = useMutation(DELETE_PORTAL_KARKUN);
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

  const { data, loading, refetch } = useQuery(PAGED_DATA, {
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

  const handleDeleteClicked = record => {
    deletePortalKarkun({
      variables: {
        portalId,
        _id: record._id,
      },
    }).catch(error => {
      message.error(error.message, 5);
    });
  };

  const handleExportSelected = () => {
    const selectedRows = karkunsList.current.getSelectedRows();
    if (selectedRows.length === 0) return;

    const reportArgs = selectedRows.map(row => row._id);
    const url = `${
      window.location.origin
    }/generate-report?reportName=PortalKarkuns&reportArgs=${reportArgs.join(
      ','
    )}`;
    window.open(url, '_blank');
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
      <div className="list-table-header-section">
        <ListFilter
          name={name}
          cnicNumber={cnicNumber}
          phoneNumber={phoneNumber}
          bloodGroup={bloodGroup}
          dutyId={dutyId}
          setPageParams={setPageParams}
          refreshData={refetch}
        />
        &nbsp;&nbsp;
        <Tooltip title="Download Selected Data">
          <Button icon="download" size="large" onClick={handleExportSelected} />
        </Tooltip>
      </div>
    </div>
  );

  return (
    <KarkunsList
      ref={karkunsList}
      showSelectionColumn
      showCnicColumn
      showPhoneNumbersColumn
      showDutiesColumn
      showActionsColumn
      listHeader={getTableHeader}
      handleSelectItem={handleSelectItem}
      handleDeleteItem={handleDeleteClicked}
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
