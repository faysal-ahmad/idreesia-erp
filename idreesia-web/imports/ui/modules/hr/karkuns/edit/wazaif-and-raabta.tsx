import React from 'react';
import { message } from '/imports/ui/antd-feedback';
import { type History } from 'history';
import { useMutation, useQuery } from '@apollo/client/react';

import { KarkunsWazaifAndRaabta } from '/imports/ui/modules/common';
import type { KarkunWazaifFormValues } from '/imports/ui/modules/common/karkuns/wazaif-and-raabta';

import { HR_KARKUN_BY_ID, SET_HR_KARKUN_WAZAIF_AND_RAABTA } from '../gql';

interface Props { history: History; karkunId: string; }

const WazaifAndRaabta = ({ history, karkunId }: Props) => {
  const { data, loading: formDataLoading } = useQuery(HR_KARKUN_BY_ID, {
    variables: { _id: karkunId },
  });
  const [setHrKarkunWazaifAndRaabta] = useMutation(
    SET_HR_KARKUN_WAZAIF_AND_RAABTA,
    {
      refetchQueries: ['pagedHrKarkuns'],
    }
  );

  const handleCancel = () => {
    history.goBack();
  };

  const handleFinish = ({ lastTarteebDate, mehfilRaabta, msRaabta }: KarkunWazaifFormValues) => {
    setHrKarkunWazaifAndRaabta({
      variables: {
        _id: karkunId,
        lastTarteebDate: lastTarteebDate
          ? (lastTarteebDate.startOf('day') as unknown as string)
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
    <KarkunsWazaifAndRaabta
      karkun={data?.hrKarkunById ?? {}}
      handleFinish={handleFinish}
      handleCancel={handleCancel}
    />
  );
};

export default WazaifAndRaabta;
