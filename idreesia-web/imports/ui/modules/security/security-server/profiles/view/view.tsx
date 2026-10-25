import React, { useState } from 'react';
import { type RouteComponentProps } from 'react-router';
import { useQuery } from '@apollo/client/react';
import { Descriptions, Empty, Image, Spin, Tag, Typography } from 'antd';

import { useDynamicBreadcrumbs } from 'meteor/idreesia-common/hooks/common';
import { AuditInfo } from '/imports/ui/modules/common';

import {
  PAGED_SECURITY_SERVER_ALERTS,
  SECURITY_SERVER_PROFILE_BY_ID,
} from '../../gql';
import AlertsTable, { type AlertRow } from '../../common/alerts-table';
import { formatDateTime } from '../../common/format';

const ALERTS_PAGE_SIZE = 10;

type Props = RouteComponentProps<{ profileId: string }>;

const ProfileAlerts = ({ profileId }: { profileId: string }) => {
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(ALERTS_PAGE_SIZE);
  const { data, loading } = useQuery(PAGED_SECURITY_SERVER_ALERTS, {
    variables: {
      filter: {
        profileId,
        pageIndex: String(pageIndex),
        pageSize: String(pageSize),
      },
    },
  });

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0' }}>
        <Spin />
      </div>
    );
  }

  const pagedAlerts = data?.pagedSecurityServerAlerts;
  const rows = (pagedAlerts?.data ?? []).filter(
    (row): row is AlertRow => row != null
  );

  return (
    <div className="list-container">
      <AlertsTable
        rows={rows}
        totalResults={pagedAlerts?.totalResults ?? 0}
        pageIndex={pageIndex}
        pageSize={pageSize}
        showProfile={false}
        onPageChange={(nextPageIndex, nextPageSize) => {
          setPageIndex(nextPageSize !== pageSize ? 0 : nextPageIndex);
          setPageSize(nextPageSize);
        }}
      />
    </div>
  );
};

const View = ({ match }: Props) => {
  const { profileId } = match.params;
  const { data, loading } = useQuery(SECURITY_SERVER_PROFILE_BY_ID, {
    variables: { _id: profileId },
  });
  const profile = data?.securityServerProfileById;

  useDynamicBreadcrumbs([
    'Security',
    'Security Server',
    'Profiles',
    profile?.name || 'View',
  ]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!profile) {
    return (
      <Empty description="Profile not found" style={{ padding: '80px 0' }} />
    );
  }

  const images = (profile.images ?? []).filter(image => image?.imageUrl);

  return (
    <div className="security-server-view">
      <div className="security-server-view-header">
        <Typography.Title level={4} style={{ margin: 0 }}>
          {profile.name}
        </Typography.Title>
        {profile.isTest ? <Tag>Test</Tag> : null}
        {profile.deletedAt ? <Tag color="red">Deleted</Tag> : null}
      </div>

      <Descriptions bordered size="small" column={2}>
        <Descriptions.Item label="Alerts">{profile.alertsCount}</Descriptions.Item>
        <Descriptions.Item label="Images">{images.length}</Descriptions.Item>
        <Descriptions.Item label="Created on Server">
          {formatDateTime(profile.externalCreatedAt)}
        </Descriptions.Item>
        <Descriptions.Item label="Updated on Server">
          {formatDateTime(profile.externalUpdatedAt)}
        </Descriptions.Item>
        {profile.deletedAt ? (
          <Descriptions.Item label="Deleted on" span={2}>
            {formatDateTime(profile.deletedAt)}
          </Descriptions.Item>
        ) : null}
      </Descriptions>

      <Typography.Title level={5}>Images</Typography.Title>
      {images.length > 0 ? (
        <div className="security-server-profile-gallery">
          <Image.PreviewGroup>
            {images.map(image => (
              <Image
                key={image!.externalId}
                src={image!.imageUrl!}
                alt={profile.name ?? ''}
              />
            ))}
          </Image.PreviewGroup>
        </div>
      ) : (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            profile.deletedAt
              ? 'Images are removed when a profile is deleted'
              : 'No images'
          }
        />
      )}

      <Typography.Title level={5}>Alerts</Typography.Title>
      <ProfileAlerts profileId={profileId} />

      <AuditInfo record={profile} />
    </div>
  );
};

export default View;
