import React from 'react';
import { useHistory } from 'react-router-dom';
import { Card } from 'antd';
import { UserOutlined } from '@ant-design/icons';

import { getDownloadUrl } from 'meteor/idreesia-common/utilities';
import { SecuritySubModulePaths as paths } from '/imports/ui/modules/security';

export interface CardPerson {
  _id?: string | null;
  // Only set for photo-search results - the CNIC lookup has no notion of a match score.
  score?: number | null;
  sharedData?: {
    name?: string | null;
    parentName?: string | null;
    cnicNumber?: string | null;
    contactNumber1?: string | null;
    contactNumber2?: string | null;
    imageId?: string | null;
  } | null;
  visitorData?: {
    city?: string | null;
    country?: string | null;
  } | null;
}

interface Props {
  person: CardPerson;
}

const VisitorCard = ({ person }: Props) => {
  const history = useHistory();
  const { _id, score, sharedData, visitorData } = person;
  const {
    name,
    parentName,
    cnicNumber,
    contactNumber1,
    contactNumber2,
    imageId,
  } = sharedData ?? {};
  const { city, country } = visitorData ?? {};

  // Either half can be missing, so join rather than assuming a "City, Country" pair.
  const location = [city, country].filter(Boolean).join(', ');

  // The full image rather than imageThumbnailId: thumbnails are a 160x160 centre crop, and this
  // card exists so the operator can match a face against the person standing in front of them.
  const url = getDownloadUrl(imageId);

  const handleClick = () => {
    if (!_id) return;
    history.push(paths.visitorRegistrationEditFormPath(_id));
  };

  return (
    <Card
      hoverable
      onClick={handleClick}
      className="visitor-result-card"
      cover={
        <div className="visitor-result-card-cover">
          {url ? (
            <img src={url} alt={name ?? 'Visitor'} />
          ) : (
            <div className="visitor-result-card-no-image">
              <UserOutlined />
            </div>
          )}
          {score != null ? (
            <div className="visitor-result-card-match-banner">
              {Math.round(score * 100)}% match
            </div>
          ) : null}
        </div>
      }
    >
      <div className="visitor-result-card-name">{name}</div>
      <div className="visitor-result-card-field">{cnicNumber}</div>
      {parentName ? (
        <div className="visitor-result-card-field">S/O {parentName}</div>
      ) : null}
      {/* One per line - two numbers side by side overflow the card at narrow widths. */}
      {contactNumber1 ? (
        <div className="visitor-result-card-field">{contactNumber1}</div>
      ) : null}
      {contactNumber2 ? (
        <div className="visitor-result-card-field">{contactNumber2}</div>
      ) : null}
      {location ? (
        <div className="visitor-result-card-field">{location}</div>
      ) : null}
    </Card>
  );
};

export default VisitorCard;
