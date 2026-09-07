import React from 'react';
import { CheckCircleFilled, CloseCircleFilled } from '@ant-design/icons';
import { Tooltip } from 'antd';

import { ImageVectorStatus } from 'meteor/idreesia-common/constants';

interface Props {
  status?: string | null;
  children: React.ReactNode;
}

const WrapperStyle: React.CSSProperties = {
  position: 'relative',
  display: 'inline-flex',
  lineHeight: 0,
};

const IconStyle: React.CSSProperties = {
  position: 'absolute',
  top: -6,
  left: -6,
  fontSize: 16,
  background: '#fff',
  borderRadius: '50%',
};

// Overlays a status icon on a person's avatar to reflect the face-vector
// computation used for face-recognition search: no icon when it was never
// computed, a green check when it's usable, a red cross (with the raw status
// in a tooltip) for any other outcome (no_face/multiple_faces/too_small/error).
const ImageVectorStatusBadge = ({ status, children }: Props) => {
  if (!status) return <>{children}</>;

  const isComputed = status === ImageVectorStatus.COMPUTED;
  const icon = isComputed ? (
    <CheckCircleFilled style={{ ...IconStyle, color: '#52c41a' }} />
  ) : (
    <CloseCircleFilled style={{ ...IconStyle, color: '#ff4d4f' }} />
  );

  const node = (
    <span style={WrapperStyle}>
      {children}
      {icon}
    </span>
  );

  if (isComputed) return node;

  return <Tooltip title={status}>{node}</Tooltip>;
};

export default ImageVectorStatusBadge;
