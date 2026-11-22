import React from 'react';
import { useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@apollo/client/react';
import { Empty, Spin } from 'antd';

import { MehfilDetailsPermissions } from 'meteor/idreesia-common/constants/mehfil-details';

import {
  WORKSPACE_MEHFIL_DETAILS,
  WORKSPACE_UPDATE_MEHFIL_DETAILS,
} from './gql';
import MehfilDetailsForm from './mehfil-details-form';

// The details of a mehfil. Those holding Update Mehfil Details can change
// them; the others (View only) see them as they are.
const MehfilDetailsPage = () => {
  const { locationId } = useParams<{ locationId: string }>();
  const { data, loading } = useQuery(WORKSPACE_MEHFIL_DETAILS, {
    variables: { locationId },
    fetchPolicy: 'cache-and-network',
  });
  const [updateMehfilDetails] = useMutation(WORKSPACE_UPDATE_MEHFIL_DETAILS);

  if (loading && !data) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  const workspace = data?.workspaceMehfilDetails;
  if (!workspace) return <Empty description="Mehfil not found" />;

  const canUpdate = workspace.permissions.includes(
    MehfilDetailsPermissions.UPDATE
  );

  return (
    <div style={{ padding: 16 }}>
      <MehfilDetailsForm
        key={locationId}
        details={workspace.mehfilDetails}
        readOnly={!canUpdate}
        onSubmit={mehfilDetails =>
          updateMehfilDetails({ variables: { locationId, mehfilDetails } })
        }
      />
    </div>
  );
};

export default MehfilDetailsPage;
