import React from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import {
  Button,
  Divider,
  Empty,
  Image,
  Modal,
  Space,
  Spin,
  Tag,
  Typography,
} from 'antd';
import { CheckOutlined, CloseOutlined, UndoOutlined } from '@ant-design/icons';

import { message } from '/imports/ui/antd-feedback';

import {
  SECURITY_SERVER_ALERT_BY_ID,
  SECURITY_SERVER_PROFILE_BY_ID,
  SET_SECURITY_SERVER_ALERT_REVIEW,
} from '../gql';
import ReviewTag from '../common/review-tag';
import useCanManage from '../common/use-can-manage';
import { formatDateTime, formatScore } from '../common/format';

const { Text } = Typography;

interface Props {
  alertId: string | null;
  onClose: () => void;
}

/**
 * Shows the captured frame above all of the matched profile's saved photos so
 * they can be compared, along with the controls for reviewing the match.
 */
const AlertModal = ({ alertId, onClose }: Props) => {
  const canManage = useCanManage();
  const { data, loading } = useQuery(SECURITY_SERVER_ALERT_BY_ID, {
    variables: { _id: alertId! },
    skip: !alertId,
  });
  const alert = alertId ? data?.securityServerAlertById : null;

  const { data: profileData, loading: profileLoading } = useQuery(
    SECURITY_SERVER_PROFILE_BY_ID,
    {
      variables: { _id: alert?.profileId! },
      skip: !alert?.profileId,
    }
  );
  const profile = alert ? profileData?.securityServerProfileById : null;
  const images = (profile?.images ?? []).filter(image => image?.imageUrl);

  const [setReview, { loading: savingReview }] = useMutation(
    SET_SECURITY_SERVER_ALERT_REVIEW,
    {
      refetchQueries: [
        'pagedSecurityServerAlerts',
        'pagedSecurityServerAlertGroups',
      ],
    }
  );

  const handleReview = (review: string | null) =>
    setReview({ variables: { _id: alertId!, review } })
      .then(() => {
        message.success(review ? 'Review saved' : 'Review cleared', 2);
      })
      .catch((error: Error) => {
        message.error(error.message, 5);
      });

  const getContent = () => {
    if (loading) return <Spin />;
    if (!alert) return <Empty description="Alert not found" />;

    return (
      <>
        <Space orientation="vertical" size="small" style={{ width: '100%' }}>
          <Text strong>Captured frame</Text>
          <Text type="secondary">
            {alert.channelName} · {formatDateTime(alert.timestamp)} ·{' '}
            {formatScore(alert.similarityScore)} confidence
          </Text>
          {alert.imageUrl ? (
            <Image
              className="security-server-alert-snapshot"
              src={alert.imageUrl}
              alt="Alert snapshot"
            />
          ) : null}
          <Space size={12} wrap>
            <ReviewTag review={alert.review} />
            {alert.reviewedAt ? (
              <Text type="secondary">
                Reviewed on {formatDateTime(alert.reviewedAt)}
              </Text>
            ) : null}
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
        </Space>

        <Divider />

        <Space orientation="vertical" size="small" style={{ width: '100%' }}>
          <Text strong>
            Profile photos — {alert.profileName}
            {alert.profileIsTest ? (
              <Tag className="security-server-inline-tag">Test</Tag>
            ) : null}
          </Text>
          {profileLoading ? <Spin /> : null}
          {profile && images.length === 0 ? (
            <Empty description="This profile has no photos" />
          ) : null}
          <Image.PreviewGroup>
            <Space wrap>
              {images.map(image => (
                <Image
                  key={image!._id}
                  src={image!.imageUrl!}
                  width={140}
                  height={140}
                  style={{ objectFit: 'cover' }}
                />
              ))}
            </Space>
          </Image.PreviewGroup>
        </Space>
      </>
    );
  };

  return (
    <Modal
      title={alert ? `Alert — ${alert.profileName}` : 'Alert'}
      open={!!alertId}
      onCancel={onClose}
      footer={null}
      width={720}
      destroyOnHidden
    >
      {getContent()}
    </Modal>
  );
};

export default AlertModal;
