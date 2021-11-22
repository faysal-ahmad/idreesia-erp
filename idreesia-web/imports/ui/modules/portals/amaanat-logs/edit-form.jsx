import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { useQuery, useMutation } from '@apollo/react-hooks';
import { useParams } from 'react-router-dom';

import { setBreadcrumbs } from 'meteor/idreesia-common/action-creators';
import { message } from 'antd';
import { AmaanatLogsEditForm } from '/imports/ui/modules/common';
import {
  usePortal,
  usePortalCities,
  usePortalCityMehfils,
} from 'meteor/idreesia-common/hooks/portals';

import {
  PAGED_PORTAL_AMAANAT_LOGS,
  PORTAL_AMAANAT_LOG_BY_ID,
  UPDATE_PORTAL_AMAANAT_LOG,
} from './gql';

const EditForm = ({ history, location }) => {
  const dispatch = useDispatch();
  const { portalId, logId } = useParams();
  const { portal } = usePortal();
  const { portalCities, portalCitiesLoading } = usePortalCities();
  const {
    portalCityMehfils,
    portalCityMehfilsLoading,
  } = usePortalCityMehfils();
  const [updatePortalAmaanatLog] = useMutation(UPDATE_PORTAL_AMAANAT_LOG, {
    refetchQueries: [
      {
        query: PAGED_PORTAL_AMAANAT_LOGS,
        variables: { portalId },
      },
    ],
  });

  useEffect(() => {
    if (portal) {
      dispatch(
        setBreadcrumbs(['Mehfil Portal', portal.name, 'Amaanat Logs', 'Edit'])
      );
    } else {
      dispatch(setBreadcrumbs(['Mehfil Portal', 'Amaanat Logs', 'Edit']));
    }
  }, [location, portalId]);

  const { data, loading } = useQuery(PORTAL_AMAANAT_LOG_BY_ID, {
    variables: {
      portalId,
      _id: logId,
    },
  });

  if (loading || portalCitiesLoading || portalCityMehfilsLoading) return null;

  const handleCancel = () => {
    history.goBack();
  };

  const handleSubmit = ({
    cityIdMehfilId,
    sentDate,
    totalAmount,
    hadiaPortion,
    sadqaPortion,
    zakaatPortion,
    langarPortion,
    otherPortion,
    otherPortionDescription,
  }) => {
    updatePortalAmaanatLog({
      variables: {
        portalId,
        _id: logId,
        cityId: cityIdMehfilId[0],
        cityMehfilId: cityIdMehfilId[1],
        sentDate,
        totalAmount,
        hadiaPortion: hadiaPortion || null,
        sadqaPortion: sadqaPortion || null,
        zakaatPortion: zakaatPortion || null,
        langarPortion: langarPortion || null,
        otherPortion: otherPortion || null,
        otherPortionDescription,
      },
    })
      .then(() => {
        history.goBack();
      })
      .catch(error => {
        message.error(error.message, 5);
      });
  };

  return (
    <AmaanatLogsEditForm
      amaanatLog={data.portalAmaanatLogById}
      cities={portalCities}
      cityMehfils={portalCityMehfils}
      handleSubmit={handleSubmit}
      handleCancel={handleCancel}
    />
  );
};

EditForm.propTypes = {
  history: PropTypes.object,
  location: PropTypes.object,
};

export default EditForm;
