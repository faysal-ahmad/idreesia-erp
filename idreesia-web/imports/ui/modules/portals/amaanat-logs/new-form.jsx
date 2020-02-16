import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { useMutation } from '@apollo/react-hooks';
import { useParams } from 'react-router-dom';

import { setBreadcrumbs } from 'meteor/idreesia-common/action-creators';
import {
  usePortal,
  usePortalCities,
  usePortalCityMehfils,
} from 'meteor/idreesia-common/hooks/portals';
import { message } from '/imports/ui/controls';
import { AmaanatLogsNewForm } from '/imports/ui/modules/common';

import { PAGED_PORTAL_AMAANAT_LOGS, CREATE_PORTAL_AMAANAT_LOG } from './gql';

const NewForm = ({ history, location }) => {
  const dispatch = useDispatch();
  const { portalId } = useParams();
  const { portal } = usePortal();
  const { portalCities, portalCitiesLoading } = usePortalCities();
  const {
    portalCityMehfils,
    portalCityMehfilsLoading,
  } = usePortalCityMehfils();
  const [createPortalAmaanatLog] = useMutation(CREATE_PORTAL_AMAANAT_LOG, {
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
        setBreadcrumbs(['Mehfil Portal', portal.name, 'Amaanat Logs', 'New'])
      );
    } else {
      dispatch(setBreadcrumbs(['Mehfil Portal', 'Amaanat Logs', 'New']));
    }
  }, [location, portalId]);

  if (portalCitiesLoading || portalCityMehfilsLoading) return null;

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
    createPortalAmaanatLog({
      variables: {
        portalId,
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
    <AmaanatLogsNewForm
      cities={portalCities}
      cityMehfils={portalCityMehfils}
      handleSubmit={handleSubmit}
      handleCancel={handleCancel}
    />
  );
};

NewForm.propTypes = {
  history: PropTypes.object,
  location: PropTypes.object,
};

export default NewForm;
