import React from 'react';
import PropTypes from 'prop-types';
import { useMutation, useQuery } from '@apollo/client/react';

import { message } from 'antd';
import { KarkunsWazaifAndRaabta } from '/imports/ui/modules/common';

import { HR_KARKUN_BY_ID, SET_HR_KARKUN_WAZAIF_AND_RAABTA } from '../gql';

const KarkunsWazaifAndRaabtaForm = KarkunsWazaifAndRaabta as any;
type AnyRecord = Record<string, any>;
interface HistoryLike { goBack(): void; }
interface QueryData { hrKarkunById?: AnyRecord | null; }
interface Props { history: HistoryLike; karkunId?: string | null; }

const WazaifAndRaabta = ({ history, karkunId }: Props) => {
  const { data, loading: formDataLoading } = useQuery(HR_KARKUN_BY_ID as any, {
    variables: { _id: karkunId },
  });
  const [setHrKarkunWazaifAndRaabta] = useMutation(
    SET_HR_KARKUN_WAZAIF_AND_RAABTA as any,
    {
      refetchQueries: ['pagedHrKarkuns'],
    }
  );
  const { hrKarkunById } = (data ?? {}) as QueryData;

  const handleCancel = () => {
    history.goBack();
  };

  const handleFinish = ({ lastTarteebDate, mehfilRaabta, msRaabta }: AnyRecord) => {
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
      .catch((error: Error) => {
        message.error(error.message, 5);
      });
  };

  if (formDataLoading) return null;

  return (
    <KarkunsWazaifAndRaabtaForm
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
