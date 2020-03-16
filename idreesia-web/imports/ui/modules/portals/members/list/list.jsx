import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { useMutation, useQuery } from '@apollo/react-hooks';
import { useParams } from 'react-router-dom';

import { setBreadcrumbs } from 'meteor/idreesia-common/action-creators';
import { find, toSafeInteger } from 'meteor/idreesia-common/utilities/lodash';
import { useQueryParams } from 'meteor/idreesia-common/hooks/common';
import {
  usePortal,
  usePortalCities,
} from 'meteor/idreesia-common/hooks/portals';
import { Button, Modal, message } from '/imports/ui/controls';
import { PortalsSubModulePaths as paths } from '/imports/ui/modules/portals';
import { VisitorsList } from '/imports/ui/modules/common';
import { CREATE_PORTAL_KARKUN } from '/imports/ui/modules/portals/karkuns/gql';

import ListFilter from './list-filter';
import CreateKarkunForm from './create-karkun-form';
import { PAGED_PORTAL_MEMBERS, LINK_PORTAL_KARKUN } from '../gql';

const List = ({ history, location }) => {
  const dispatch = useDispatch();
  const [showCreateKarkunForm, setShowCreateKarkunForm] = useState(false);
  const [memberForKarkunCreation, setMemberForKarkunCreation] = useState(null);
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
      'pageIndex',
      'pageSize',
    ],
  });

  const [createPortalKarkun] = useMutation(CREATE_PORTAL_KARKUN);
  const [linkPortalKarkun] = useMutation(LINK_PORTAL_KARKUN);
  const { data, loading, refetch } = useQuery(PAGED_PORTAL_MEMBERS, {
    variables: {
      portalId,
      queryString,
    },
  });

  useEffect(() => {
    if (portal) {
      dispatch(
        setBreadcrumbs(['Mehfil Portal', portal.name, 'Members', 'List'])
      );
    } else {
      dispatch(setBreadcrumbs(['Mehfil Portal', 'Members', 'List']));
    }
  }, [location, portal]);

  const handleNewClicked = () => {
    history.push(paths.membersNewFormPath(portalId));
  };

  const handleSelectItem = visitor => {
    history.push(paths.membersEditFormPath(portalId, visitor._id));
  };

  const handleKarkunLinkAction = visitor => {
    history.push(paths.karkunsEditFormPath(portalId, visitor.karkunId));
  };

  const handleCreateKarkunCancelled = () => {
    setShowCreateKarkunForm(false);
    setMemberForKarkunCreation(null);
  };

  const handleKarkunCreateAction = visitor => {
    setShowCreateKarkunForm(true);
    setMemberForKarkunCreation(visitor);
  };

  const handleCreateKarkun = () => {
    const city = find(
      portalCities,
      portalCity => portalCity.name === memberForKarkunCreation.city
    );

    createPortalKarkun({
      variables: {
        portalId,
        memberId: memberForKarkunCreation._id,
        cityId: city._id,
      },
    })
      .then(() => {
        handleCreateKarkunCancelled();
        refetch();
      })
      .catch(error => {
        message.error(error.message, 5);
      });
  };

  const handleLinkKarkun = karkunId => {
    linkPortalKarkun({
      variables: {
        portalId,
        memberId: memberForKarkunCreation._id,
        karkunId,
      },
    })
      .then(() => {
        handleCreateKarkunCancelled();
        refetch();
      })
      .catch(error => {
        message.error(error.message, 5);
      });
  };

  if (loading) return null;
  const { pagedPortalMembers } = data;
  const {
    name,
    cnicNumber,
    phoneNumber,
    city,
    ehadDuration,
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
        New Member
      </Button>
      <ListFilter
        portalId={portalId}
        name={name}
        cnicNumber={cnicNumber}
        phoneNumber={phoneNumber}
        city={city}
        ehadDuration={ehadDuration}
        setPageParams={setPageParams}
        refreshData={refetch}
      />
    </div>
  );

  return (
    <>
      <VisitorsList
        showCnicColumn
        showPhoneNumbersColumn
        showCityCountryColumn
        showDeleteAction={false}
        showKarkunLinkAction
        showKarkunCreateAction
        listHeader={getTableHeader}
        handleSelectItem={handleSelectItem}
        handleKarkunLinkAction={handleKarkunLinkAction}
        handleKarkunCreateAction={handleKarkunCreateAction}
        setPageParams={setPageParams}
        pageIndex={numPageIndex}
        pageSize={numPageSize}
        pagedData={pagedPortalMembers}
      />
      <Modal
        title="Create Karkun"
        visible={showCreateKarkunForm}
        onCancel={handleCreateKarkunCancelled}
        width={600}
        footer={null}
      >
        {showCreateKarkunForm ? (
          <CreateKarkunForm
            portalId={portalId}
            portalCities={portalCities}
            cnicNumber={memberForKarkunCreation.cnicNumber}
            contactNumber={memberForKarkunCreation.contactNumber1}
            handleCreate={handleCreateKarkun}
            handleLink={handleLinkKarkun}
            handleCancel={handleCreateKarkunCancelled}
          />
        ) : null}
      </Modal>
    </>
  );
};

List.propTypes = {
  history: PropTypes.object,
  location: PropTypes.object,
};

export default List;
