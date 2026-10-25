import React from 'react';
import { type RouteComponentProps } from 'react-router';
import { Link } from 'react-router-dom';
import { useQuery } from '@apollo/client/react';
import { Descriptions, Empty, Image, Spin, Tag } from 'antd';

import { useDynamicBreadcrumbs } from 'meteor/idreesia-common/hooks/common';

import paths from '../../../submodule-paths';
import { SECURITY_SERVER_ALERT_BY_ID } from '../../gql';
import ReviewTag from '../../common/review-tag';
import { formatDateTime, formatScore } from '../../common/format';

type Props = RouteComponentProps<{ alertId: string }>;

const View = ({ match }: Props) => {
  const { alertId } = match.params;
  const { data, loading } = useQuery(SECURITY_SERVER_ALERT_BY_ID, {
    variables: { _id: alertId },
  });
  const alert = data?.securityServerAlertById;

  useDynamicBreadcrumbs([
    'Security',
    'Security Server',
    'Alerts',
    alert ? `${alert.profileName} - ${formatDateTime(alert.timestamp)}` : 'View',
  ]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!alert) {
    return <Empty description="Alert not found" style={{ padding: '80px 0' }} />;
  }

  return (
    <div className="security-server-view">
      <Descriptions bordered size="small" column={2}>
        <Descriptions.Item label="Profile">
          <Link to={paths.securityServerProfileViewPath(alert.profileId!)}>
            {alert.profileName}
          </Link>
          {alert.profileIsTest ? (
            <Tag className="security-server-inline-tag">Test</Tag>
          ) : null}
        </Descriptions.Item>
        <Descriptions.Item label="Channel">
          <Link to={`${paths.securityServerAlertsPath}?channelId=${alert.channelId}`}>
            {alert.channelName}
          </Link>
        </Descriptions.Item>
        <Descriptions.Item label="Time">
          {formatDateTime(alert.timestamp)}
        </Descriptions.Item>
        <Descriptions.Item label="Similarity Score">
          {formatScore(alert.similarityScore)}
        </Descriptions.Item>
        <Descriptions.Item label="Review">
          <ReviewTag review={alert.review} />
        </Descriptions.Item>
        <Descriptions.Item label="Reviewed on">
          {formatDateTime(alert.reviewedAt)}
        </Descriptions.Item>
      </Descriptions>

      {alert.imageUrl ? (
        <Image
          className="security-server-alert-snapshot"
          src={alert.imageUrl}
          alt="Alert snapshot"
        />
      ) : null}
    </div>
  );
};

export default View;
