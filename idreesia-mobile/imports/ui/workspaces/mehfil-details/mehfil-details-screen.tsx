import React, { useEffect, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import { Button, Form, Input, Switch, TextArea } from 'antd-mobile';
import { EnvironmentOutline } from 'antd-mobile-icons';

import { MehfilDetailsPermissions } from 'meteor/idreesia-common/constants/mehfil-details';
import { useOnlineStatus } from '../../hooks';
import { Page, PageEmpty, PageError, PageLoading, showError, showSuccess, useNavigateBack } from '../../layout';
import { useParams } from '../../router';
import { openExternalUrl } from '../../utilities/open-external-url';
import { WorkspacesPaths } from '../paths';
import { MehfilDetailsMap } from './mehfil-details-map';
import { MehfilLocationPopup } from './mehfil-location-popup';
import { MOBILE_MEHFIL_DETAILS, MOBILE_UPDATE_MEHFIL_DETAILS } from './gql';

interface FormValues {
  address?: string;
  mehfilStartYear?: string;
  timingDetails?: string;
  lcdAvailability?: boolean;
  tabAvailability?: boolean;
  otherMehfilDetails?: string;
}

const mapsUrl = (latitude: number, longitude: number) =>
  `https://www.google.com/maps?q=${latitude},${longitude}`;

/** The mehfil's pin: its coordinates, with buttons to set it (when allowed) and to open it in the phone's maps. */
const CoordinatesRow = ({
  latitude,
  longitude,
  onSet,
}: {
  latitude?: number | null;
  longitude?: number | null;
  onSet?: () => void;
}) => (
  <div className="mehfil-details-coordinates">
    <span>{latitude != null && longitude != null ? `${latitude.toFixed(6)}, ${longitude.toFixed(6)}` : 'Not set'}</span>
    <span className="mehfil-details-coordinates-actions">
      {onSet && (
        <Button fill="outline" size="small" onClick={onSet}>
          <EnvironmentOutline /> Set location
        </Button>
      )}
      {latitude != null && longitude != null && (
        <Button fill="outline" size="small" onClick={() => openExternalUrl(mapsUrl(latitude, longitude))}>
          Open in maps
        </Button>
      )}
    </span>
  </div>
);

/**
 * Workspace → a mehfil → Mehfil Details. Those holding Update Mehfil Details
 * edit the details, including the map pin; the others see them as they are.
 */
export const MehfilDetailsScreen = () => {
  const { locationId } = useParams<{ locationId: string }>();
  const online = useOnlineStatus();
  const navigateBack = useNavigateBack(WorkspacesPaths.root);
  const [form] = Form.useForm<FormValues>();
  const { data, loading, error, refetch } = useQuery(MOBILE_MEHFIL_DETAILS, {
    variables: { locationId },
    fetchPolicy: 'cache-and-network',
  });
  const [updateDetails, { loading: saving }] = useMutation(MOBILE_UPDATE_MEHFIL_DETAILS);

  const workspace = data?.workspaceMehfilDetails;
  const details = workspace?.mehfilDetails;
  const canUpdate = (workspace?.permissions ?? []).includes(MehfilDetailsPermissions.UPDATE);
  const hasPin = details?.latitude != null && details?.longitude != null;

  // The location in the form: set from the location sheet, stored by Save
  // with the other fields.
  const [location, setLocation] = useState<{ latitude: number | null; longitude: number | null }>({
    latitude: null,
    longitude: null,
  });
  const [locationOpen, setLocationOpen] = useState(false);

  // Fill the form once the details arrive (and again if they change).
  const [filledFor, setFilledFor] = useState<string | null>(null);
  useEffect(() => {
    if (!workspace || filledFor === JSON.stringify(details)) return;
    form.setFieldsValue({
      address: details?.address ?? '',
      mehfilStartYear: details?.mehfilStartYear ?? '',
      timingDetails: details?.timingDetails ?? '',
      lcdAvailability: details?.lcdAvailability ?? false,
      tabAvailability: details?.tabAvailability ?? false,
      otherMehfilDetails: details?.otherMehfilDetails ?? '',
    });
    setLocation({ latitude: details?.latitude ?? null, longitude: details?.longitude ?? null });
    setFilledFor(JSON.stringify(details));
  }, [workspace, details, filledFor, form]);

  const save = async (values: FormValues) => {
    try {
      await updateDetails({
        variables: {
          locationId,
          mehfilDetails: {
            address: values.address,
            mehfilStartYear: values.mehfilStartYear,
            timingDetails: values.timingDetails,
            lcdAvailability: Boolean(values.lcdAvailability),
            tabAvailability: Boolean(values.tabAvailability),
            otherMehfilDetails: values.otherMehfilDetails,
            latitude: location.latitude ?? undefined,
            longitude: location.longitude ?? undefined,
          },
        },
      });
      showSuccess('Mehfil details saved.');
      navigateBack();
    } catch (failure) {
      showError(failure, 'Could not save the mehfil details.');
    }
  };

  let content;
  if (loading && !data) {
    content = <PageLoading />;
  } else if (error && !data) {
    content = <PageError error={error} onRetry={() => refetch().then(() => undefined, () => undefined)} />;
  } else if (!workspace) {
    content = <PageEmpty title="Mehfil not found" />;
  } else if (canUpdate) {
    content = (
      <Form
        form={form}
        layout="vertical"
        mode="card"
        footer={
          <Button block color="primary" disabled={!online} loading={saving} type="submit">
            Save details
          </Button>
        }
        onFinish={save}
      >
        <Form.Item label="Address" name="address">
          <TextArea autoSize={{ minRows: 2, maxRows: 5 }} placeholder="Address" />
        </Form.Item>
        <Form.Item label="Start year" name="mehfilStartYear">
          <Input inputMode="numeric" placeholder="Start year" />
        </Form.Item>
        <Form.Item label="Timing details" name="timingDetails">
          <TextArea autoSize={{ minRows: 2, maxRows: 5 }} placeholder="Timing details" />
        </Form.Item>
        <Form.Item childElementPosition="right" label="LCD available" layout="horizontal" name="lcdAvailability" valuePropName="checked">
          <Switch />
        </Form.Item>
        <Form.Item childElementPosition="right" label="Tab available" layout="horizontal" name="tabAvailability" valuePropName="checked">
          <Switch />
        </Form.Item>
        <Form.Item label="Other details" name="otherMehfilDetails">
          <TextArea autoSize={{ minRows: 2, maxRows: 6 }} placeholder="Other details" />
        </Form.Item>
        <Form.Item label="Coordinates">
          <CoordinatesRow
            latitude={location.latitude}
            longitude={location.longitude}
            onSet={() => setLocationOpen(true)}
          />
        </Form.Item>
      </Form>
    );
  } else {
    const fields = [
      { label: 'Address', value: details?.address },
      { label: 'Start year', value: details?.mehfilStartYear },
      { label: 'Timing details', value: details?.timingDetails },
      { label: 'LCD available', value: details?.lcdAvailability ? 'Yes' : 'No' },
      { label: 'Tab available', value: details?.tabAvailability ? 'Yes' : 'No' },
      { label: 'Other details', value: details?.otherMehfilDetails },
    ].filter(field => field.value);
    content = (
      <>
      <dl className="visitor-detail-fields">
        {fields.map(field => (
          <div key={field.label} className="visitor-detail-field">
            <dt>{field.label}</dt>
            <dd>{field.value}</dd>
          </div>
        ))}
        {hasPin && (
          <div className="visitor-detail-field">
            <dt>Coordinates</dt>
            <dd>
              <CoordinatesRow latitude={details!.latitude} longitude={details!.longitude} />
            </dd>
          </div>
        )}
      </dl>
      {hasPin && (
        <div className="mehfil-details-map-block">
          <MehfilDetailsMap latitude={details!.latitude} longitude={details!.longitude} />
        </div>
      )}
      </>
    );
  }

  return (
    <Page backTo={WorkspacesPaths.root} title={workspace?.name ? `${workspace.name} details` : 'Mehfil details'}>
      {content}
      {canUpdate && (
        <MehfilLocationPopup
          address={form.getFieldValue('address')}
          latitude={location.latitude}
          longitude={location.longitude}
          visible={locationOpen}
          onClose={() => setLocationOpen(false)}
          onOk={(latitude, longitude) => setLocation({ latitude, longitude })}
        />
      )}
    </Page>
  );
};
