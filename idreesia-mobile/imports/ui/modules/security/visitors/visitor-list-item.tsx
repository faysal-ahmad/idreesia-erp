import React, { type ReactNode } from 'react';
import { Avatar, List, Space, Tag } from 'antd-mobile';
import type { MobileVisitorListFieldsFragment } from 'meteor/idreesia-common/types/client-operations';

import { getBackendFileUrl } from '/imports/startup/backend';

/** Shape of the MobileVisitorListFields fragment (gql/visitor-list-fields.ts). */
export type VisitorListRecord = MobileVisitorListFieldsFragment;

type PersonTag = NonNullable<
  NonNullable<NonNullable<VisitorListRecord['sharedData']>['tags']>[number]
>;

interface Props {
  visitor: VisitorListRecord;
  /** Right-hand content, e.g. a match score. */
  extra?: ReactNode;
}

export const VisitorListItem = ({ visitor, extra }: Props) => {
  const { sharedData, visitorData, isKarkun } = visitor;
  const imageUrl = getBackendFileUrl(sharedData?.imageThumbnailId ?? sharedData?.imageId);
  const place = [visitorData?.city, visitorData?.country].filter(Boolean).join(', ');
  const details = [sharedData?.cnicNumber, sharedData?.contactNumber1, place].filter(Boolean);
  const tags = (sharedData?.tags ?? []).filter(
    (tag): tag is PersonTag => Boolean(tag?._id)
  );

  const hasBadges = Boolean(visitorData?.criminalRecord || visitorData?.otherNotes || isKarkun || tags.length);

  return (
    <List.Item
      arrowIcon={false}
      className="visitor-list-item"
      extra={extra}
      description={
        <>
          {sharedData?.parentName && <div>S/O {sharedData.parentName}</div>}
          {details.length > 0 && <div>{details.join(' · ')}</div>}
          {hasBadges && (
            <Space className="visitor-list-badges" wrap>
              {visitorData?.criminalRecord && (
                <Tag color="danger" fill="outline">
                  Criminal record
                </Tag>
              )}
              {visitorData?.otherNotes && (
                <Tag color="warning" fill="outline">
                  Notes
                </Tag>
              )}
              {isKarkun && (
                <Tag color="primary" fill="outline">
                  Karkun
                </Tag>
              )}
              {tags.map(tag => (
                <Tag
                  key={tag._id}
                  style={
                    tag.color
                      ? {
                          // People tag colours are data set by admins in the web app.
                          '--background-color': tag.color,
                          '--border-color': tag.color,
                          '--text-color': tag.textColor ?? undefined,
                        }
                      : undefined
                  }
                >
                  {tag.name}
                </Tag>
              ))}
            </Space>
          )}
        </>
      }
      prefix={<Avatar className="visitor-list-avatar" src={imageUrl ?? ''} />}
    >
      {sharedData?.name ?? 'Unnamed visitor'}
    </List.Item>
  );
};
