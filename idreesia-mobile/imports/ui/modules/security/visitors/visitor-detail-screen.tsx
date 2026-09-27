import React, { type ReactNode, useState } from 'react';
import { ImageViewer } from 'antd-mobile';
import { UserOutline } from 'antd-mobile-icons';
import { useQuery } from '@apollo/client/react';

import { getBackendFileUrl } from '/imports/startup/backend';
import { Page, PageEmpty, PageError, PageLoading } from '../../../layout';
import { useParams } from '../../../router';
import { SecurityPaths } from '../paths';
import { MOBILE_SECURITY_VISITOR_BY_ID } from './gql';
import { formatAge, formatDuration } from './format';
import { PersonTags } from './person-tags';
import { VisitorStayHistory } from './visitor-stay-history';

interface Field {
  label: string;
  value?: ReactNode;
  className?: string;
}

/** Compact label / value rows in one card. Empty values are left out. */
const DetailFields = ({ fields }: { fields: Field[] }) => {
  const shown = fields.filter(field => field.value != null && field.value !== '');
  if (shown.length === 0) return null;

  return (
    <dl className="visitor-detail-fields">
      {shown.map(field => (
        <div key={field.label} className={['visitor-detail-field', field.className].filter(Boolean).join(' ')}>
          <dt>{field.label}</dt>
          <dd>{field.value}</dd>
        </div>
      ))}
    </dl>
  );
};

/** Security → Visitors → a visitor. Read-only. */
export const VisitorDetailScreen = () => {
  const { visitorId } = useParams<{ visitorId: string }>();
  // Declarative rather than ImageViewer.show(), so it closes with the screen.
  const [photoOpen, setPhotoOpen] = useState(false);
  const { data, loading, error, refetch } = useQuery(MOBILE_SECURITY_VISITOR_BY_ID, {
    variables: { _id: visitorId },
  });

  const visitor = data?.securityVisitorById;
  const page = (title: string, children: ReactNode) => (
    <Page backTo={SecurityPaths.visitors} title={title}>
      {children}
    </Page>
  );

  if (loading && !visitor) return page('Visitor', <PageLoading />);
  if (error && !visitor) return page('Visitor', <PageError error={error} onRetry={() => refetch()} />);
  // The by-id query also returns soft-deleted people.
  if (!visitor || visitor.deletedAt) {
    return page(
      'Visitor',
      <PageEmpty
        description="This visitor may have been deleted."
        icon={<UserOutline />}
        title="Visitor not found"
      />
    );
  }

  const { sharedData, visitorData } = visitor;
  const name = sharedData?.name ?? 'Unnamed visitor';
  // The full image, not the 160×160 thumbnail: this is for matching a face
  // against the person standing there.
  const imageUrl = getBackendFileUrl(sharedData?.imageId ?? sharedData?.imageThumbnailId);
  const place = [visitorData?.city, visitorData?.country].filter(Boolean).join(', ');

  return page(
    name,
    <>
      <section className="visitor-detail-summary">
        {imageUrl ? (
          <button
            aria-label="View photo"
            className="visitor-detail-photo"
            type="button"
            onClick={() => setPhotoOpen(true)}
          >
            <img alt={name} src={imageUrl} />
          </button>
        ) : (
          <div className="visitor-detail-photo visitor-detail-no-photo">
            <UserOutline />
          </div>
        )}
        <div className="visitor-detail-heading">
          <h2 className="visitor-detail-name">{name}</h2>
          {sharedData?.parentName && <p className="visitor-detail-parent">S/O {sharedData.parentName}</p>}
          <PersonTags className="visitor-detail-tags" tags={sharedData?.tags} />
        </div>
      </section>
      {imageUrl && (
        <ImageViewer image={imageUrl} visible={photoOpen} onClose={() => setPhotoOpen(false)} />
      )}

      <DetailFields
        fields={[
          { label: 'CNIC', className: 'visitor-detail-nowrap', value: sharedData?.cnicNumber },
          { label: 'Age', value: formatAge(sharedData?.birthDate) },
          { label: 'Mobile', className: 'visitor-detail-nowrap', value: sharedData?.contactNumber1 },
          { label: 'Home number', className: 'visitor-detail-nowrap', value: sharedData?.contactNumber2 },
          { label: 'City', value: place },
          { label: 'Current address', value: sharedData?.currentAddress },
          { label: 'Permanent address', value: sharedData?.permanentAddress },
          { label: 'Ehad duration', value: formatDuration(sharedData?.ehadDate) },
          { label: 'R/O', value: sharedData?.referenceName },
          { label: 'Education', value: sharedData?.educationalQualification },
          { label: 'Means of earning', value: sharedData?.meansOfEarning },
          {
            label: 'Criminal record',
            value: visitorData?.criminalRecord?.trim(),
            className: 'visitor-detail-criminal-record',
          },
          { label: 'Other notes', value: visitorData?.otherNotes?.trim() },
        ]}
      />
      <VisitorStayHistory visitorId={visitor._id ?? visitorId} />
    </>
  );
};
