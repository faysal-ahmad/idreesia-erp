import React from 'react';
import { type RouteComponentProps } from 'react-router';
import { Link } from 'react-router-dom';
import { useMutation, useQuery } from '@apollo/client/react';
import { Button, Descriptions, Empty, Image, Space, Spin, Tag } from 'antd';
import { CheckOutlined, CloseOutlined, UndoOutlined } from '@ant-design/icons';

import { useDynamicBreadcrumbs } from 'meteor/idreesia-common/hooks/common';
import { message } from '/imports/ui/antd-feedback';

import paths from '../../../submodule-paths';
import {
  SECURITY_SERVER_ALERT_BY_ID,
  SET_SECURITY_SERVER_ALERT_REVIEW,
} from '../../gql';
import ReviewTag from '../../common/review-tag';
import useCanManage from '../../common/use-can-manage';
import { formatDateTime, formatScore } from '../../common/format';

type Props = RouteComponentProps<{ alertId: string }>;

const View = ({ match }: Props) => {
  const { alertId } = match.params;
  const { data, loading } = useQuery(SECURITY_SERVER_ALERT_BY_ID, {
    variables: { _id: alertId },
  });
  const alert = data?.securityServerAlertById;
  const canManage = useCanManage();
  const [setReview, { loading: savingReview }] = useMutation(
    SET_SECURITY_SERVER_ALERT_REVIEW,
    { refetchQueries: ['pagedSecurityServerAlerts'] }
  );

  const handleReview = (review: string | null) =>
    setReview({ variables: { _id: alertId, review } })
      .then(() => {
        message.success(review ? 'Review saved' : 'Review cleared', 2);
      })
      .catch((error: Error) => {
        message.error(error.message, 5);
      });

  useDynamicBreadcrumbs([
    'Security',
    'Security Server',
    'Alerts',
    alert
      ? `${alert.profileName} - ${formatDateTime(alert.timestamp)}`
      : 'View',
  ]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!alert) {
    return (
      <Empty description="Alert not found" style={{ padding: '80px 0' }} />
    );
  }

  return (
    <div className="security-server-view">
      <Descriptions bordered size="small" column={2}>
        <Descriptions.Item label="Profile">
          <Link
            to={`${paths.securityServerAlertsPath}?profileId=${alert.profileId}`}
          >
            {alert.profileName}
          </Link>
          {alert.profileIsTest ? (
            <Tag className="security-server-inline-tag">Test</Tag>
          ) : null}
        </Descriptions.Item>
        <Descriptions.Item label="Channel">
          <Link
            to={`${paths.securityServerAlertsPath}?channelId=${alert.channelId}`}
          >
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
          <Space size={12} wrap>
            <ReviewTag review={alert.review} />
            {canManage ? (
              <Space size={8}>
                <Button
                  size="small"
                  icon={<CheckOutlined />}
                  disabled={savingReview || alert.review === 'CORRECT'}
                  onClick={() => handleReview('CORRECT')}
                >
                  Correct
                </Button>
                <Button
                  size="small"
                  icon={<CloseOutlined />}
                  disabled={savingReview || alert.review === 'FALSE_POSITIVE'}
                  onClick={() => handleReview('FALSE_POSITIVE')}
                >
                  False Positive
                </Button>
                {alert.review ? (
                  <Button
                    size="small"
                    type="link"
                    icon={<UndoOutlined />}
                    disabled={savingReview}
                    onClick={() => handleReview(null)}
                  >
                    Clear
                  </Button>
                ) : null}
              </Space>
            ) : null}
          </Space>
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
