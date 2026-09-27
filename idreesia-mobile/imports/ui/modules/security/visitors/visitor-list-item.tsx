import React, { type ReactNode } from 'react';
import { Avatar, List } from 'antd-mobile';
import type { MobileVisitorListFieldsFragment } from 'meteor/idreesia-common/types/client-operations';

import { getBackendFileUrl } from '/imports/startup/backend';
import { PersonTags } from './person-tags';

/** Shape of the MobileVisitorListFields fragment (gql/visitor-list-fields.ts). */
export type VisitorListRecord = MobileVisitorListFieldsFragment;

interface Props {
  visitor: VisitorListRecord;
  /** Right-hand content, e.g. a match score. */
  extra?: ReactNode;
  /** Opens the visitor, normally their detail screen. */
  onClick?: () => void;
}

export const VisitorListItem = ({ visitor, extra, onClick }: Props) => {
  const { sharedData, visitorData } = visitor;
  const imageUrl = getBackendFileUrl(sharedData?.imageThumbnailId ?? sharedData?.imageId);
  const place = [visitorData?.city, visitorData?.country].filter(Boolean).join(', ');
  const details = [sharedData?.cnicNumber, sharedData?.contactNumber1, place].filter(Boolean);

  return (
    <List.Item
      arrowIcon={Boolean(onClick)}
      className="visitor-list-item"
      extra={extra}
      onClick={onClick}
      description={
        <>
          {sharedData?.parentName && <div>S/O {sharedData.parentName}</div>}
          {details.length > 0 && <div>{details.join(' · ')}</div>}
          <PersonTags className="visitor-list-tags" tags={sharedData?.tags} />
        </>
      }
      prefix={<Avatar className="visitor-list-avatar" src={imageUrl ?? ''} />}
    >
      {sharedData?.name ?? 'Unnamed visitor'}
    </List.Item>
  );
};
