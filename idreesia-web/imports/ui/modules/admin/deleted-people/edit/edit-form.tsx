import React from 'react';
import { type RouteComponentProps } from 'react-router';
import { useQuery } from '@apollo/client/react';
import { Empty, Spin } from 'antd';

import { useDynamicBreadcrumbs } from 'meteor/idreesia-common/hooks/common';

import GeneralInfo from './general-info';
import { DELETED_PERSON_BY_ID } from '../gql';

type Props = RouteComponentProps<{ personId: string }>;

const EditForm = ({ history, match }: Props) => {
  const personId = match.params.personId;

  const { data, loading } = useQuery(DELETED_PERSON_BY_ID, {
    variables: { _id: personId },
  });

  const deletedPersonById = data?.deletedPersonById;
  const personName = deletedPersonById?.sharedData?.name?.trim();

  useDynamicBreadcrumbs([
    'Admin',
    'Deleted Data',
    'People',
    personName || 'View',
  ]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!deletedPersonById) {
    return (
      <Empty
        description="Person not found"
        style={{ padding: '80px 0' }}
      />
    );
  }

  return <GeneralInfo history={history} person={deletedPersonById} />;
};

export default EditForm;
