import React from 'react';
import { useHistory } from 'react-router-dom';
import { Card } from 'antd';
import { UserOutlined } from '@ant-design/icons';

import { getDownloadUrl } from 'meteor/idreesia-common/utilities';
import { SecuritySubModulePaths as paths } from '/imports/ui/modules/security';

export interface CardPerson {
  _id?: string | null;
  sharedData?: {
    name?: string | null;
    parentName?: string | null;
    cnicNumber?: string | null;
    imageId?: string | null;
  } | null;
  visitorData?: {
    city?: string | null;
  } | null;
}

interface Props {
  person: CardPerson;
}

const VisitorCard = ({ person }: Props) => {
  const history = useHistory();
  const { _id, sharedData, visitorData } = person;
  const { name, parentName, cnicNumber, imageId } = sharedData ?? {};
  const { city } = visitorData ?? {};

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
        url ? (
          <img src={url} alt={name ?? 'Visitor'} />
        ) : (
          <div className="visitor-result-card-no-image">
            <UserOutlined />
          </div>
        )
      }
    >
      <div className="visitor-result-card-name">{name}</div>
      <div className="visitor-result-card-field">{cnicNumber}</div>
      {parentName ? (
        <div className="visitor-result-card-field">S/O {parentName}</div>
      ) : null}
      {city ? <div className="visitor-result-card-field">{city}</div> : null}
    </Card>
  );
};

export default VisitorCard;
