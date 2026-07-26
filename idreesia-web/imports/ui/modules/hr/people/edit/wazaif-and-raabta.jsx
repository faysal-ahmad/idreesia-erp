import React from 'react';
import PropTypes from 'prop-types';
import { useMutation, useQuery } from '@apollo/client/react';

import { message } from 'antd';
import { KarkunsWazaifAndRaabta } from '/imports/ui/modules/common';

import { HR_KARKUN_BY_ID, SET_HR_KARKUN_WAZAIF_AND_RAABTA } from '../gql';

const WazaifAndRaabta = ({ history, karkunId }) => {
  const { data, loading: formDataLoading } = useQuery(HR_KARKUN_BY_ID, {
    variables: { _id: karkunId },
  });
  const [setHrKarkunWazaifAndRaabta] = useMutation(
    SET_HR_KARKUN_WAZAIF_AND_RAABTA,
    {
      refetchQueries: ['pagedHrKarkuns'],
    }
  );
  const { hrKarkunById } = data || {};

  const handleCancel = () => {
    history.goBack();
  };

  const handleFinish = ({ lastTarteebDate, mehfilRaabta, msRaabta }) => {
    setHrKarkunWazaifAndRaabta({
      variables: {
        _id: karkunId,
        lastTarteebDate: lastTarteebDate
          ? lastTarteebDate.startOf('day')
          : null,
        mehfilRaabta,
        msRaabta,
      },
    })
      .then(() => {
        history.goBack();
      })
      .catch(error => {
        message.error(error.message, 5);
      });
  };

  if (formDataLoading) return null;

  return (
    <KarkunsWazaifAndRaabta
      karkun={hrKarkunById}
      handleFinish={handleFinish}
      handleCancel={handleCancel}
    />
  );
};

WazaifAndRaabta.propTypes = {
  match: PropTypes.object,
  history: PropTypes.object,
  location: PropTypes.object,
  karkunId: PropTypes.string,
};

export default WazaifAndRaabta;
