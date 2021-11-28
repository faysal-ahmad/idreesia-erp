import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { useQuery, useMutation } from '@apollo/react-hooks';
import { useParams } from 'react-router-dom';

import { setBreadcrumbs } from 'meteor/idreesia-common/action-creators';
import {
  useAllCities,
  useAllCityMehfils,
} from 'meteor/idreesia-common/hooks/outstation';
import { message } from 'antd';
import { AmaanatLogsEditForm } from '/imports/ui/modules/common';

import {
  PAGED_ACCOUNTS_AMAANAT_LOGS,
  ACCOUNTS_AMAANAT_LOG_BY_ID,
  UPDATE_ACCOUNTS_AMAANAT_LOG,
} from './gql';

const EditForm = ({ history, location }) => {
  const dispatch = useDispatch();
  const { logId } = useParams();
  const { allCities, allCitiesLoading } = useAllCities();
  const { allCityMehfils, allCityMehfilsLoading } = useAllCityMehfils();
  const [updateAccountsAmaanatLog] = useMutation(UPDATE_ACCOUNTS_AMAANAT_LOG, {
    refetchQueries: [{ query: PAGED_ACCOUNTS_AMAANAT_LOGS }],
  });

  useEffect(() => {
    dispatch(setBreadcrumbs(['Accounts', 'Amaanat Logs', 'Edit']));
  }, [location]);

  const { data, loading } = useQuery(ACCOUNTS_AMAANAT_LOG_BY_ID, {
    variables: {
      _id: logId,
    },
  });

  if (loading || allCitiesLoading || allCityMehfilsLoading) return null;

  const handleCancel = () => {
    history.goBack();
  };

  const handleFinish = ({
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
    updateAccountsAmaanatLog({
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
      amaanatLog={data.outstationAmaanatLogById}
      cities={allCities}
      cityMehfils={allCityMehfils}
      handleFinish={handleFinish}
      handleCancel={handleCancel}
    />
  );
};

EditForm.propTypes = {
  history: PropTypes.object,
  location: PropTypes.object,
};

export default EditForm;
