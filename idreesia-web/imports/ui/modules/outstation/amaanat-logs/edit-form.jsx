import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { useQuery, useMutation } from '@apollo/react-hooks';
import { useParams } from 'react-router-dom';

import { setBreadcrumbs } from 'meteor/idreesia-common/action-creators';
import { message } from '/imports/ui/controls';
import { AmaanatLogsEditForm } from '/imports/ui/modules/common';
import {
  useAllCities,
  useAllCityMehfils,
} from '/imports/ui/modules/outstation/common/hooks';

import {
  PAGED_OUTSTATION_AMAANAT_LOGS,
  OUTSTATION_AMAANAT_LOG_BY_ID,
  UPDATE_OUTSTATION_AMAANAT_LOG,
} from './gql';

const EditForm = ({ history, location }) => {
  const dispatch = useDispatch();
  const { logId } = useParams();
  const { allCities, allCitiesLoading } = useAllCities();
  const { allCityMehfils, allCityMehfilsLoading } = useAllCityMehfils();
  const [updateOutstationAmaanatLog] = useMutation(
    UPDATE_OUTSTATION_AMAANAT_LOG,
    {
      refetchQueries: [{ query: PAGED_OUTSTATION_AMAANAT_LOGS }],
    }
  );

  useEffect(() => {
    dispatch(setBreadcrumbs(['Outstation', 'Amaanat Logs', 'Edit']));
  }, [location]);

  const { data, loading } = useQuery(OUTSTATION_AMAANAT_LOG_BY_ID, {
    variables: {
      _id: logId,
    },
  });

  if (loading || allCitiesLoading || allCityMehfilsLoading) return null;

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
    updateOutstationAmaanatLog({
      variables: {
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
      cities={allCities}
      cityMehfils={allCityMehfils}
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
