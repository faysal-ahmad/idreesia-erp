import React, { type ReactNode, useState } from 'react';
import { ImageViewer } from 'antd-mobile';
import { UserOutline } from 'antd-mobile-icons';
import { useQuery } from '@apollo/client/react';
import { StayReasons } from 'meteor/idreesia-common/constants/security';
import type { MobileWorkspaceNightStayByIdQuery } from 'meteor/idreesia-common/types/client-operations';
import { toDeviceUrl } from '/imports/startup/backend';

import { formatDate, formatDays } from '../../apps/security/visitors/format';
import { Page, PageEmpty, PageError, PageLoading } from '../../layout';
import { useParams } from '../../router';
import { WorkspacesPaths } from '../paths';
import { MOBILE_WORKSPACE_NIGHT_STAY_BY_ID } from './gql';

interface Field {
  label: string;
  value?: ReactNode;
}

/** Compact label / value rows in one card. Empty values are left out. */
const DetailFields = ({ fields }: { fields: Field[] }) => {
  const shown = fields.filter(field => field.value != null && field.value !== '');
  if (shown.length === 0) return null;

  return (
    <dl className="night-stay-detail-fields">
      {shown.map(field => (
        <div key={field.label} className="night-stay-detail-field">
          <dt>{field.label}</dt>
          <dd>{field.value}</dd>
        </div>
      ))}
    </dl>
  );
};

type Stay = NonNullable<MobileWorkspaceNightStayByIdQuery['workspaceNightStayById']>;
type HistoryItem = NonNullable<NonNullable<Stay['stayHistory']>[number]>;

const stayReasonName = (id?: string | null) => StayReasons.find(item => item._id === id)?.name;

/** "3 days, 01-11-2026 to 03-11-2026", or "1 day, 01-11-2026". */
const formatStaySpan = (stay: Pick<HistoryItem, 'numOfDays' | 'fromDate' | 'toDate'>) => {
  const days = stay.numOfDays ?? 0;
  return days > 1
    ? `${formatDays(days)}, ${formatDate(stay.fromDate)} to ${formatDate(stay.toDate)}`
    : `${formatDays(days)}, ${formatDate(stay.fromDate)}`;
};

/** The visitor's previous stays (not this one), newest first. */
const StayHistory = ({ stays }: { stays: HistoryItem[] }) => (
  <section className="night-stay-history">
    <h3 className="night-stay-history-title">Stay history</h3>
    {stays.length === 0 ? (
      <p className="night-stay-history-empty">No earlier stays.</p>
    ) : (
      <dl className="night-stay-detail-fields">
        {stays.map(stay => (
          <div key={stay._id} className="night-stay-detail-field">
            <dt>{formatDate(stay.fromDate)}</dt>
            <dd>
              {[formatDays(stay.numOfDays ?? 0), stayReasonName(stay.stayReason)]
                .filter(Boolean)
                .join(' · ')}
            </dd>
          </div>
        ))}
      </dl>
    )}
  </section>
);

/**
 * Workspace → Night Stay Report → one stay: the visitor's photo, large enough
 * to match a face, the stay's details and the visitor's latest earlier stays.
 * Read-only.
 */
export const NightStayDetailScreen = () => {
  const { committeeId, stayId } = useParams<{ committeeId: string; stayId: string }>();
  // Declarative rather than ImageViewer.show(), so it closes with the screen.
  const [photoOpen, setPhotoOpen] = useState(false);
  const { data, loading, error, refetch } = useQuery(MOBILE_WORKSPACE_NIGHT_STAY_BY_ID, {
    variables: { committeeId, stayId },
  });

  const stay = data?.workspaceNightStayById;
  const page = (title: string, children: ReactNode) => (
    <Page backTo={WorkspacesPaths.committeeNightStayReport(committeeId)} title={title}>
      {children}
    </Page>
  );

  if (loading && !stay) return page('Visitor', <PageLoading />);
  if (error && !stay) return page('Visitor', <PageError error={error} onRetry={() => refetch()} />);
  if (!stay) {
    return page(
      'Visitor',
      <PageEmpty
        description="This stay may have been cancelled or deleted."
        icon={<UserOutline />}
        title="Stay not found"
      />,
    );
  }

  const name = stay.visitorName ?? 'Unnamed visitor';
  // The full image, not the thumbnail, for matching a face.
  const imageUrl = toDeviceUrl(stay.visitorImageUrl ?? stay.visitorImageThumbnailUrl);
  const place = [stay.city, stay.country].filter(Boolean).join(', ');
  const history = (stay.stayHistory ?? []).filter(
    (item): item is HistoryItem => item?._id != null,
  );

  return page(
    name,
    <>
      <section className="night-stay-detail-summary">
        {imageUrl ? (
          <button
            aria-label="View photo"
            className="night-stay-detail-photo"
            type="button"
            onClick={() => setPhotoOpen(true)}
          >
            <img alt={name} src={imageUrl} />
          </button>
        ) : (
          <div className="night-stay-detail-photo night-stay-detail-no-photo">
            <UserOutline />
          </div>
        )}
        <h2 className="night-stay-detail-name">{name}</h2>
      </section>
      {imageUrl && (
        <ImageViewer image={imageUrl} visible={photoOpen} onClose={() => setPhotoOpen(false)} />
      )}

      <DetailFields
        fields={[
          { label: 'City', value: place },
          { label: 'Stay details', value: formatStaySpan(stay) },
          { label: 'Stay reason', value: stayReasonName(stay.stayReason) },
          { label: 'Allowed by', value: stay.stayAllowedBy },
        ]}
      />
      <StayHistory stays={history} />
    </>,
  );
};
