import React, { useState } from 'react';
import { CloseOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';

import { PersonName } from '/imports/ui/modules/helpers/controls';

// The element holding the name text: the plain name span, or the name inside
// PersonName when photos are shown.
const nameTextOf = (container: HTMLElement) =>
  (container.querySelector('.duty-roster-person-name-text') as HTMLElement | null) ??
  (container.querySelector(':scope > div > div:last-child') as HTMLElement | null) ??
  container;

/**
 * A person's name on a duty roster row, kept to one line: a name longer than
 * the column is cut short with "..." and shown in full in a tooltip.
 */
const RosterPersonName = ({
  karkunId,
  name,
  imageUrl,
  imageThumbnailUrl,
  showImage,
  showOffMark,
}: {
  karkunId: string;
  name: string;
  imageUrl?: string | null;
  imageThumbnailUrl?: string | null;
  showImage: boolean;
  /** A team member who is off that day gets a cross before the name. */
  showOffMark: boolean;
}) => {
  const [truncated, setTruncated] = useState(false);

  return (
    <Tooltip title={truncated ? name : undefined}>
      <span
        className="duty-roster-calendar-person-name"
        onMouseEnter={event => {
          const text = nameTextOf(event.currentTarget);
          setTruncated(text.scrollWidth > text.clientWidth);
        }}
      >
        {showOffMark ? (
          <CloseOutlined className="duty-roster-off-mark" aria-hidden />
        ) : null}
        {showImage ? (
          <PersonName
            person={{
              _id: karkunId,
              name,
              imageUrl,
              imageThumbnailUrl,
            }}
          />
        ) : (
          <span className="duty-roster-person-name-text">{name}</span>
        )}
      </span>
    </Tooltip>
  );
};

export default RosterPersonName;
