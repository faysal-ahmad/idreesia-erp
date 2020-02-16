import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { useMutation } from '@apollo/react-hooks';

import { setBreadcrumbs } from 'meteor/idreesia-common/action-creators';
import {
  useAllCities,
  useAllCityMehfils,
} from 'meteor/idreesia-common/hooks/outstation';
import { message } from '/imports/ui/controls';
import { AmaanatLogsNewForm } from '/imports/ui/modules/common';

import {
  PAGED_OUTSTATION_AMAANAT_LOGS,
  CREATE_OUTSTATION_AMAANAT_LOG,
} from './gql';

const NewForm = ({ history, location }) => {
  const dispatch = useDispatch();
  const { allCities, allCitiesLoading } = useAllCities();
  const { allCityMehfils, allCityMehfilsLoading } = useAllCityMehfils();
  const [createOutstationAmaanatLog] = useMutation(
    CREATE_OUTSTATION_AMAANAT_LOG,
    {
      refetchQueries: [
        {
          query: PAGED_OUTSTATION_AMAANAT_LOGS,
        },
      ],
    }
  );

  useEffect(() => {
    dispatch(setBreadcrumbs(['Outstation', 'Amaanat Logs', 'New']));
  }, [location]);

  if (allCitiesLoading || allCityMehfilsLoading) return null;

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
    createOutstationAmaanatLog({
      variables: {
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
      cities={allCities}
      cityMehfils={allCityMehfils}
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
