import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/client/react';
import { CloseCircleTwoTone } from '@ant-design/icons';

import { getDownloadUrl } from 'meteor/idreesia-common/utilities';
import { Row, Col, Spin } from 'antd';
import { SecuritySubModulePaths as paths } from '/imports/ui/modules/security';
import StayCard from '../card/stay-card';

const ErrorStatusStyle = {
  color: 'red',
  fontSize: 36,
};

const SuccessStatusStyle = {
  color: 'green',
  fontSize: 40,
};

const ColumnStyle = {
  display: 'flex',
  flexFlow: 'column nowrap',
  alignItems: 'center',
};

const ReactFragment = Fragment as any;
const RouterLink = Link as any;
const AntCloseCircleTwoTone = CloseCircleTwoTone as any;
const AntRow = Row as any;
const AntCol = Col as any;
const AntSpin = Spin as any;
const StayCardComponent = StayCard as any;

interface ScanStatusProps {
  message: string;
  isError: boolean;
}

const ScanStatus = ({ message, isError }: ScanStatusProps) => {
  const statusStyle = isError ? ErrorStatusStyle : SuccessStatusStyle;
  return (
    <AntRow type="flex" justify="start" align="middle" gutter={16}>
      <AntCol>
        <AntCloseCircleTwoTone
          style={statusStyle}
          twoToneColor={statusStyle.color}
        />
      </AntCol>
      <AntCol>
        <div style={statusStyle}>{message}</div>
      </AntCol>
    </AntRow>
  );
};

ScanStatus.propTypes = {
  message: PropTypes.string,
  isError: PropTypes.bool,
};

interface Visitor {
  _id: string;
  name: string;
  imageId?: string;
}

interface VisitorStay {
  _id: string;
  cancelledDate?: string | number | null;
  isValid?: boolean;
  refVisitor: Visitor;
}

interface VisitorStayData {
  visitorStayById?: VisitorStay | null;
}

interface SearchResultProps {
  barcode?: string;
}

const SearchResult = (props: SearchResultProps) => {
  const { barcode } = props;
  const { data = {}, loading } = useQuery(formQuery as any, {
    variables: { _id: barcode },
    fetchPolicy: 'network-only',
  });
  const { visitorStayById } = data as VisitorStayData;
  if (!barcode) return null;
  if (loading) return <AntSpin size="large" />;

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

  const visitor = visitorStayById.refVisitor;
  const url = getDownloadUrl(visitor.imageId);
  const imageNode = url ? <img src={url} style={{ width: '250px' }} alt={visitor.name} /> : null;
  const registerationUrl = paths.visitorRegistrationEditFormPath(visitor._id);

  return (
    <ReactFragment>
      {statusRow}
      <AntRow type="flex" gutter={16}>
        <AntCol order={1}>
          <StayCardComponent visitor={visitor} visitorStay={visitorStayById} />
        </AntCol>
        <AntCol order={2}>
          <div style={ColumnStyle}>
            <RouterLink to={registerationUrl}>Open Registeration</RouterLink>
            {imageNode}
          </div>
        </AntCol>
      </AntRow>
    </ReactFragment>
  );
};

SearchResult.propTypes = {
  loading: PropTypes.bool,
  barcode: PropTypes.string,
  visitorStayById: PropTypes.object,
};

const formQuery = gql`
  query visitorStayById($_id: String!) {
    visitorStayById(_id: $_id) {
      _id
      visitorId
      fromDate
      toDate
      numOfDays
      stayReason
      stayAllowedBy
      dutyName
      shiftName
      cancelledDate
      isValid
      refVisitor {
        _id
        name
        parentName
        referenceName
        cnicNumber
        contactNumber1
        contactNumber2
        city
        country
        imageId
        criminalRecord
        otherNotes
      }
    }
  }
`;

export default SearchResult;
