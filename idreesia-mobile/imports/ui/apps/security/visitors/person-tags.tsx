import React from 'react';
import { Space, Tag } from 'antd-mobile';

export interface PersonTag {
  _id?: string | null;
  name?: string | null;
  color?: string | null;
  textColor?: string | null;
}

interface Props {
  tags?: ReadonlyArray<PersonTag | null> | null;
  className?: string;
}

/** A person's people tags as solid pills in their own colours, like the web list. */
export const PersonTags = ({ tags, className }: Props) => {
  const shown = (tags ?? []).filter((tag): tag is PersonTag => Boolean(tag?._id));
  if (shown.length === 0) return null;

  return (
    <Space className={className} wrap>
      {shown.map(tag => (
        <Tag
          key={tag._id}
          color="primary"
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
  );
};
