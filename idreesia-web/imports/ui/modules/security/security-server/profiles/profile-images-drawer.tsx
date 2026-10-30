import React from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import {
  Button,
  Drawer,
  Empty,
  Image,
  Popconfirm,
  Space,
  Tag,
  Typography,
  Upload,
} from 'antd';
import type { UploadProps } from 'antd';
import { InboxOutlined } from '@ant-design/icons';

import { message } from '/imports/ui/antd-feedback';

import {
  ADD_SECURITY_SERVER_PROFILE_IMAGE,
  REMOVE_SECURITY_SERVER_PROFILE_IMAGE,
  SECURITY_SERVER_PROFILE_BY_ID,
  SET_SECURITY_SERVER_PROFILE_DEFAULT_IMAGE,
} from '../gql';

const ACCEPTED_FILE_TYPES = 'image/jpeg,image/png,image/webp';
const refetchQueries = [
  'securityServerProfileById',
  'pagedSecurityServerProfiles',
];

const readAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('The file could not be read.'));
    reader.readAsDataURL(file);
  });

interface Props {
  profileId: string | null;
  canManage: boolean;
  onClose: () => void;
}

/**
 * Enrollment photos for a profile. Every upload is checked on the server and
 * rejected, with the reason shown, unless it has exactly one usable face.
 */
const ProfileImagesDrawer = ({ profileId, canManage, onClose }: Props) => {
  const { data } = useQuery(SECURITY_SERVER_PROFILE_BY_ID, {
    variables: { _id: profileId! },
    skip: !profileId,
  });
  const [addImage, { loading: adding }] = useMutation(
    ADD_SECURITY_SERVER_PROFILE_IMAGE,
    { refetchQueries }
  );
  const [removeImage] = useMutation(REMOVE_SECURITY_SERVER_PROFILE_IMAGE, {
    refetchQueries,
  });
  const [setDefaultImage, { loading: settingDefault }] = useMutation(
    SET_SECURITY_SERVER_PROFILE_DEFAULT_IMAGE,
    { refetchQueries }
  );

  const profile = profileId ? data?.securityServerProfileById : null;
  const images = (profile?.images ?? []).filter(image => image?.imageUrl);

  const uploadProps: UploadProps = {
    accept: ACCEPTED_FILE_TYPES,
    multiple: false,
    showUploadList: false,
    disabled: adding,
    beforeUpload: file => {
      readAsDataUrl(file)
        .then(imageData =>
          addImage({ variables: { profileId: profileId!, imageData } })
        )
        .then(() => {
          message.success('Image added', 2);
        })
        .catch((error: Error) => {
          message.error(error.message, 5);
        });
      // Uploaded through the mutation above, not antd's own request.
      return false;
    },
  };

  const handleSetDefault = (imageId: string) =>
    setDefaultImage({ variables: { profileId: profileId!, imageId } }).catch(
      (error: Error) => {
        message.error(error.message, 5);
      }
    );

  const handleRemove = (imageId: string) =>
    removeImage({ variables: { profileId: profileId!, imageId } }).catch(
      (error: Error) => {
        message.error(error.message, 5);
      }
    );

  return (
    <Drawer
      title={profile ? `Photos — ${profile.name}` : 'Photos'}
      open={!!profileId}
      onClose={onClose}
      size={480}
    >
      <Space orientation="vertical" style={{ width: '100%' }} size="middle">
        {canManage ? (
          <Upload.Dragger {...uploadProps}>
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">Click or drag a photo to add it</p>
            <p className="ant-upload-hint">
              Use a clear, close-up photo showing only this person. No group
              shots.
            </p>
          </Upload.Dragger>
        ) : null}

        {adding ? (
          <Typography.Text type="secondary">Analyzing photo…</Typography.Text>
        ) : null}

        {profile && images.length === 0 ? (
          <Empty description="No photos yet" />
        ) : null}

        <Image.PreviewGroup>
          <Space wrap>
            {images.map(image => (
              <div key={image!._id} className="security-server-photo">
                <Image src={image!.imageUrl!} width={140} height={140} />
                {image!._id === profile?.defaultImageId ? (
                  <Tag
                    variant="solid"
                    color="blue"
                    className="security-server-photo-default"
                  >
                    Default
                  </Tag>
                ) : null}
                {image!._id !== profile?.defaultImageId && canManage ? (
                  <Button
                    size="small"
                    disabled={settingDefault}
                    className="security-server-photo-default"
                    onClick={() => handleSetDefault(image!._id!)}
                  >
                    Set as default
                  </Button>
                ) : null}
                {canManage ? (
                  <Popconfirm
                    title="Remove this photo?"
                    onConfirm={() => handleRemove(image!._id!)}
                  >
                    <Button
                      size="small"
                      danger
                      className="security-server-photo-remove"
                    >
                      Remove
                    </Button>
                  </Popconfirm>
                ) : null}
              </div>
            ))}
          </Space>
        </Image.PreviewGroup>
      </Space>
    </Drawer>
  );
};

export default ProfileImagesDrawer;
