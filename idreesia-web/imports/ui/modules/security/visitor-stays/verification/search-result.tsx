import React, { Fragment, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@apollo/client/react';
import { CloseCircleTwoTone } from '@ant-design/icons';

import { getDownloadUrl } from 'meteor/idreesia-common/utilities';
import { Row, Col, Spin } from 'antd';
import { SecuritySubModulePaths as paths } from '/imports/ui/modules/security';
import StayCard from '../card/stay-card';

import { VERIFICATION_VISITOR_STAY_BY_ID } from '../gql';

const RouterLink = Link as any;

const ErrorStatusStyle: CSSProperties = {
  color: 'red',
  fontSize: 36,
};

const SuccessStatusStyle: CSSProperties = {
  color: 'green',
  fontSize: 40,
};

const ColumnStyle: CSSProperties = {
  display: 'flex',
  flexFlow: 'column nowrap',
  alignItems: 'center',
};

interface ScanStatusProps {
  message: string;
  isError: boolean;
}

const ScanStatus = ({ message, isError }: ScanStatusProps) => {
  const statusStyle = isError ? ErrorStatusStyle : SuccessStatusStyle;
  return (
    <Row justify="start" align="middle" gutter={16}>
      <Col>
        <CloseCircleTwoTone
          style={statusStyle}
          twoToneColor={statusStyle.color}
        />
      </Col>
      <Col>
        <div style={statusStyle}>{message}</div>
      </Col>
    </Row>
  );
};

interface SearchResultProps {
  barcode?: string;
}

const SearchResult = ({ barcode }: SearchResultProps) => {
  const { data, loading } = useQuery(VERIFICATION_VISITOR_STAY_BY_ID, {
    variables: { _id: barcode ?? '' },
    fetchPolicy: 'network-only',
    skip: !barcode,
  });
  const visitorStayById = data?.visitorStayById;

  if (!barcode) return null;
  if (loading) return <Spin size="large" />;

  if (!visitorStayById) {
    return <ScanStatus isError message="Card Not Found" />;
  }

  let statusRow;
  if (visitorStayById.cancelledDate) {
    statusRow = <ScanStatus isError message="Card Cancelled" />;
  } else if (visitorStayById.isValid) {
    statusRow = <ScanStatus isError={false} message="Card Valid" />;
  } else {
    statusRow = <ScanStatus isError message="Card Expired" />;
  }

  const refVisitor = visitorStayById.refVisitor;
  if (!refVisitor) return null;

  const visitor = {
    name: refVisitor.sharedData?.name,
    parentName: refVisitor.sharedData?.parentName,
    referenceName: refVisitor.sharedData?.referenceName,
    cnicNumber: refVisitor.sharedData?.cnicNumber,
    contactNumber1: refVisitor.sharedData?.contactNumber1,
    city: refVisitor.visitorData?.city,
    criminalRecord: refVisitor.visitorData?.criminalRecord,
  };

  const url = getDownloadUrl(refVisitor.sharedData?.imageId);
  const imageNode = url ? (
    <img src={url} style={{ width: '250px' }} alt={visitor.name ?? 'Visitor'} />
  ) : null;
  const registerationUrl = paths.visitorRegistrationEditFormPath(refVisitor._id ?? '');

  return (
    <Fragment>
      {statusRow}
      <Row gutter={16}>
        <Col order={1}>
          <StayCard
            visitor={visitor}
            visitorStay={visitorStayById}
          />
        </Col>
        <Col order={2}>
          <div style={ColumnStyle}>
            <RouterLink to={registerationUrl}>Open Registeration</RouterLink>
            {imageNode}
          </div>
        </Col>
      </Row>
    </Fragment>
  );
};

export default SearchResult;
