import React, { useState } from 'react';
import { type RouteComponentProps } from 'react-router';
import { useMutation, useQuery } from '@apollo/client/react';
import { Empty, Spin, Tabs } from 'antd';
import { message } from '/imports/ui/antd-feedback';

import {
  OrgLocationTypes,
  type OrgLocationType,
} from 'meteor/idreesia-common/constants/organization';
import {
  useDynamicBreadcrumbs,
  useQueryParams,
} from 'meteor/idreesia-common/hooks/common';
import { AdminSubModulePaths as paths } from '/imports/ui/modules/admin';
import { FormButtonsSaveCancel } from '/imports/ui/modules/helpers/fields';
import AuditInfo from '/imports/ui/modules/common/audit-info/audit-info';

import {
  ALL_ORG_LOCATIONS,
  ORG_LOCATION_BY_ID,
  UPDATE_ORG_LOCATION,
} from './gql';
import LocationCommittees from './location-committees';
import LocationFeaturePermissions from './location-feature-permissions';
import LocationMehfilDetails from './location-mehfil-details';
import LocationObservers from './location-observers';
import LocationUsers from './location-users';
import LocationForm, { type LocationFormValues } from './location-form';
import { toLocationRecords } from './helpers';

type Props = RouteComponentProps<{ orgLocationId: string }>;

const EditForm = ({ match, history, location }: Props) => {
  const { queryParams } = useQueryParams({ history, location });
  const _id = match.params.orgLocationId;
  const [isFieldsTouched, setIsFieldsTouched] = useState(false);

  const { data: allData, loading: allLoading } = useQuery(ALL_ORG_LOCATIONS);
  const { data, loading } = useQuery(ORG_LOCATION_BY_ID, {
    variables: { _id },
  });
  useDynamicBreadcrumbs([
    'Admin',
    'Organization Locations',
    data?.orgLocationById?.name?.trim() || 'Edit',
  ]);
  const [updateOrgLocation] = useMutation(UPDATE_ORG_LOCATION, {
    refetchQueries: ['allOrgLocations', 'orgLocationById'],
  });

  if ((loading && !data) || (allLoading && !allData)) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  const orgLocation = data?.orgLocationById;
  if (!orgLocation) return <Empty description="Location not found" />;

  const type = orgLocation.type as OrgLocationType;

  const handleFinish = (values: LocationFormValues) => {
    updateOrgLocation({
      variables: {
        _id,
        name: values.name,
        parentId: type === OrgLocationTypes.ROOT ? null : values.parentId,
        // Mehfil details are saved from their own tab; omitted here so they
        // stay as they are.
      },
    })
      .then(() => {
        message.success('Location saved', 2);
        setIsFieldsTouched(false);
      })
      .catch((error: Error) => {
        message.error(error.message, 5);
      });
  };

  const generalInfo = (
    <>
      <LocationForm
        locations={toLocationRecords(allData?.allOrgLocations)}
        editingId={_id}
        fixedType={type}
        initialValues={{
          name: orgLocation.name ?? '',
          type,
          parentId: orgLocation.parentId,
        }}
        hideMehfilFields
        onFieldsChange={() => setIsFieldsTouched(true)}
        onFinish={handleFinish}
      >
        <FormButtonsSaveCancel
          handleCancel={() => history.push(paths.orgLocationsPath)}
          isFieldsTouched={isFieldsTouched}
        />
      </LocationForm>
      <AuditInfo record={orgLocation} />
    </>
  );

  return (
    <Tabs
      defaultActiveKey={(queryParams['default-active-tab'] as string) || 'general'}
      items={[
        { key: 'general', label: 'General Info', children: generalInfo },
        ...(type === OrgLocationTypes.MEHFIL
          ? [
              {
                key: 'mehfil-details',
                label: 'Mehfil Details',
                children: (
                  <LocationMehfilDetails
                    key={_id}
                    orgLocation={orgLocation}
                    onCancel={() => history.push(paths.orgLocationsPath)}
                  />
                ),
              },
            ]
          : []),
        {
          key: 'committees',
          label: `Committees (${orgLocation.committees?.length ?? 0})`,
          children: <LocationCommittees locationId={_id} />,
        },
        // The mehfil's users, and who may do what on it, for its features too.
        ...(type === OrgLocationTypes.MEHFIL
          ? [
              {
                key: 'users',
                label: 'Users',
                children: <LocationUsers locationId={_id} />,
              },
              {
                key: 'permissions',
                label: 'Permissions',
                children: <LocationFeaturePermissions locationId={_id} />,
              },
            ]
          : []),
        {
          key: 'observers',
          label: `Observers (${orgLocation.observerKarkunIds?.length ?? 0})`,
          children: <LocationObservers locationId={_id} />,
        },
      ]}
    />
  );
};

export default EditForm;
