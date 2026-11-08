import React, { type ReactNode, useState } from 'react';
import { ActionSheet, Button, Dialog, Form, ImageViewer, Input, Switch, Toast } from 'antd-mobile';
import { AddOutline, CloseOutline, UserOutline } from 'antd-mobile-icons';
import { useMutation, useQuery } from '@apollo/client/react';
import type { MobileWorkspaceMonitoringProfileByIdQuery } from 'meteor/idreesia-common/types/client-operations';
import { toDeviceUrl } from '/imports/startup/backend';

import { getErrorMessage } from '../../auth/accounts';
import { Page, PageEmpty, PageError, PageLoading } from '../../layout';
import { useParams } from '../../router';
import { capturePhoto, pickPhoto } from '../../utilities';
import { WorkspacesPaths } from '../paths';
import {
  ADD_MOBILE_WORKSPACE_MONITORING_PROFILE_PHOTO,
  MOBILE_WORKSPACE_MONITORING_PROFILE_BY_ID,
  REMOVE_MOBILE_WORKSPACE_MONITORING_PROFILE_PHOTO,
  UPDATE_MOBILE_WORKSPACE_MONITORING_PROFILE,
} from './gql';

type Profile = NonNullable<MobileWorkspaceMonitoringProfileByIdQuery['workspaceMonitoringProfileById']>;
type Photo = NonNullable<NonNullable<Profile['photos']>[number]>;

interface ProfileFormValues {
  name: string;
  isTest: boolean;
}

/**
 * Workspace → Monitoring Profiles → one profile: edit its name and test
 * flag, and add (camera or gallery) or remove its photos. Changes reach the
 * security server through the usual sync.
 */
export const MonitoringProfileScreen = () => {
  const { committeeId, profileId } = useParams<{ committeeId: string; profileId: string }>();
  const [addPhotoOpen, setAddPhotoOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [removingPhotoId, setRemovingPhotoId] = useState<string | null>(null);
  // Declarative rather than ImageViewer.Multi.show(), so it closes with the screen.
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  const { data, loading, error, refetch } = useQuery(MOBILE_WORKSPACE_MONITORING_PROFILE_BY_ID, {
    variables: { committeeId, profileId },
  });
  const [updateProfile, { loading: saving }] = useMutation(UPDATE_MOBILE_WORKSPACE_MONITORING_PROFILE);
  const [addPhoto] = useMutation(ADD_MOBILE_WORKSPACE_MONITORING_PROFILE_PHOTO);
  const [removePhoto] = useMutation(REMOVE_MOBILE_WORKSPACE_MONITORING_PROFILE_PHOTO);

  const profile = data?.workspaceMonitoringProfileById;
  const page = (title: string, children: ReactNode) => (
    <Page backTo={WorkspacesPaths.committeeMonitoringProfiles(committeeId)} title={title}>
      {children}
    </Page>
  );

  if (loading && !profile) return page('Profile', <PageLoading />);
  if (error && !profile) return page('Profile', <PageError error={error} onRetry={() => refetch()} />);
  if (!profile) {
    return page(
      'Profile',
      <PageEmpty
        description="This profile may have been deleted."
        icon={<UserOutline />}
        title="Profile not found"
      />,
    );
  }

  // The default photo is first.
  const photos = (profile.photos ?? []).filter((photo): photo is Photo => !!photo?._id && !!photo.imageUrl);
  const viewerImages = photos.map(photo => toDeviceUrl(photo.imageUrl) ?? '');

  const handleSave = async ({ name, isTest }: ProfileFormValues) => {
    try {
      await updateProfile({ variables: { committeeId, profileId, name: name.trim(), isTest } });
      Toast.show({ icon: 'success', content: 'Profile saved.' });
    } catch (saveError) {
      Toast.show({ icon: 'fail', content: getErrorMessage(saveError, 'Could not save the profile.') });
    }
  };

  const upload = async (getPhoto: () => Promise<string | null>, failure: string) => {
    let imageData: string | null;
    try {
      imageData = await getPhoto();
    } catch (photoError) {
      Toast.show({ icon: 'fail', content: getErrorMessage(photoError, failure) });
      return;
    }
    if (!imageData) return;

    setUploading(true);
    try {
      await addPhoto({ variables: { committeeId, profileId, imageData } });
      Toast.show({ icon: 'success', content: 'Photo added.' });
    } catch (uploadError) {
      // The server says why a photo is unusable ("The face is too small...").
      Toast.show({ icon: 'fail', content: getErrorMessage(uploadError, 'Could not add the photo.') });
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async (photo: Photo) => {
    const confirmed = await Dialog.confirm({
      content: 'Remove this photo from the profile?',
      confirmText: 'Remove',
      cancelText: 'Cancel',
    });
    if (!confirmed) return;

    setRemovingPhotoId(photo._id);
    try {
      await removePhoto({ variables: { committeeId, profileId, photoId: photo._id! } });
      Toast.show({ icon: 'success', content: 'Photo removed.' });
    } catch (removeError) {
      Toast.show({ icon: 'fail', content: getErrorMessage(removeError, 'Could not remove the photo.') });
    } finally {
      setRemovingPhotoId(null);
    }
  };

  return page(
    profile.name ?? 'Profile',
    <>
      <Form
        // Remounted after a save, so the fields show what was stored.
        key={`${profile.name}|${profile.isTest}`}
        initialValues={{ name: profile.name ?? '', isTest: !!profile.isTest }}
        layout="vertical"
        mode="card"
        onFinish={handleSave}
        footer={
          <Button block color="primary" loading={saving} size="large" type="submit">
            Save changes
          </Button>
        }
      >
        <Form.Item
          label="Name"
          name="name"
          rules={[{ required: true, whitespace: true, message: 'Please enter a name.' }]}
        >
          <Input autoCapitalize="words" autoComplete="off" clearable placeholder="Name" />
        </Form.Item>
        <Form.Item
          childElementPosition="right"
          label="Test profile"
          layout="horizontal"
          name="isTest"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>
      </Form>

      <section className="monitoring-profile-photos">
        <h3 className="monitoring-profile-photos-title">Photos</h3>
        {photos.length === 0 ? (
          <p className="monitoring-profile-photos-empty">
            No photos yet. This person can't be recognised until a photo is added.
          </p>
        ) : (
          <div className="monitoring-profile-photo-grid">
            {photos.map((photo, index) => (
              <div key={photo._id} className="monitoring-profile-photo">
                <button
                  aria-label="View photo"
                  className="monitoring-profile-photo-view"
                  type="button"
                  onClick={() => setViewerIndex(index)}
                >
                  <img alt="" src={toDeviceUrl(photo.thumbnailUrl) ?? toDeviceUrl(photo.imageUrl) ?? ''} />
                </button>
                {index === 0 && <span className="monitoring-profile-photo-default">Default</span>}
                <button
                  aria-label="Remove photo"
                  className="monitoring-profile-photo-remove"
                  disabled={removingPhotoId != null}
                  type="button"
                  onClick={() => handleRemove(photo)}
                >
                  <CloseOutline />
                </button>
              </div>
            ))}
          </div>
        )}
        <Button block loading={uploading} onClick={() => setAddPhotoOpen(true)}>
          <AddOutline /> Add photo
        </Button>
        <p className="monitoring-profile-photos-hint">
          Use a clear, front-facing photo with only this person's face.
        </p>
      </section>

      <ActionSheet
        actions={[
          {
            key: 'camera',
            text: 'Take photo',
            onClick: () => upload(capturePhoto, 'Could not open the camera.'),
          },
          {
            key: 'gallery',
            text: 'Choose from gallery',
            // Called straight from the tap, so the browser lets it open the picker.
            onClick: () => upload(pickPhoto, 'Could not open the photo.'),
          },
        ]}
        cancelText="Cancel"
        closeOnAction
        visible={addPhotoOpen}
        onClose={() => setAddPhotoOpen(false)}
      />
      {viewerIndex != null && (
        <ImageViewer.Multi
          defaultIndex={viewerIndex}
          images={viewerImages}
          visible
          onClose={() => setViewerIndex(null)}
        />
      )}
    </>,
  );
};
