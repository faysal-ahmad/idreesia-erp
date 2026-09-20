import React from 'react';
import { type RouteComponentProps } from 'react-router';
import { useQuery } from '@apollo/client/react';
import { Empty, Spin } from 'antd';

import { useDynamicBreadcrumbs } from 'meteor/idreesia-common/hooks/common';

import GeneralInfo from './general-info';
import { DUPLICATE_PERSON_BY_ID } from '../gql';

type Props = RouteComponentProps<{ personId: string }>;

const EditForm = ({ history, match }: Props) => {
  const personId = match.params.personId;

  const { data, loading } = useQuery(DUPLICATE_PERSON_BY_ID, {
    variables: { _id: personId },
  });

  const duplicatePersonById = data?.duplicatePersonById;
  const personName = duplicatePersonById?.sharedData?.name?.trim();

  useDynamicBreadcrumbs([
    'Admin',
    'Data Management',
    'Duplicate People',
    personName || 'View',
  ]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!duplicatePersonById) {
    return (
      <Empty
        description="Person not found"
        style={{ padding: '80px 0' }}
      />
    );
  }

  return <GeneralInfo history={history} person={duplicatePersonById} />;
};

export default EditForm;
