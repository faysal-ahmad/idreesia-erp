import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import ReactToPrint from 'react-to-print';
import { PrinterOutlined } from '@ant-design/icons';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { Button } from 'antd';
import DutyCard from './duty-card';
import StayCard from './stay-card';

class StayCardContainer extends Component {
  static propTypes = {
    cardType: PropTypes.string,
    visitorId: PropTypes.string,
    visitorStayId: PropTypes.string,
    visitorLoading: PropTypes.bool,
    securityVisitorById: PropTypes.object,
    visitorStayLoading: PropTypes.bool,
    visitorStayById: PropTypes.object,
    onCloseCard: PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.cardRef = React.createRef();
  }

  getCardMarkup() {
    const { cardType, securityVisitorById, visitorStayById } = this.props;
    const card =
      cardType === 'stay-card' ? (
        <StayCard
          ref={this.cardRef}
          visitor={securityVisitorById}
          visitorStay={visitorStayById}
        />
      ) : (
        <DutyCard
          ref={this.cardRef}
          visitor={securityVisitorById}
          visitorStay={visitorStayById}
        />
      );

    return (
      <Fragment>
        {card}
        <div style={{ paddingTop: '5px' }}>
          <ReactToPrint
            trigger={() => (
              <Button type="primary" size="large">
                <PrinterOutlined />
                Print
              </Button>
            )}
            content={() => this.cardRef.current}
          />
          &nbsp;
          <Button
            size="large"
            type="default"
            onClick={() => this.props.onCloseCard()}
          >
            Close
          </Button>
        </div>
      </Fragment>
    );
  }

  render() {
    const { visitorLoading, visitorStayLoading } = this.props;
    if (visitorLoading || visitorStayLoading) return null;
    return this.getCardMarkup();
  }
}

const formQueryVisitor = gql`
  query securityVisitorById($_id: String!) {
    securityVisitorById(_id: $_id) {
      _id
      name
      parentName
      cnicNumber
      referenceName
      contactNumber1
      city
      country
      criminalRecord
      image {
        _id
        data
      }
    }
  }
`;

const formQueryVisitorStay = gql`
  query visitorStayById($_id: String!) {
    visitorStayById(_id: $_id) {
      _id
      fromDate
      toDate
      stayReason
      dutyName
      shiftName
    }
  }
`;

export default flowRight(
  graphql(formQueryVisitor, {
    props: ({ data }) => ({ visitorLoading: data.loading, ...data }),
    options: ({ visitorId }) => ({ variables: { _id: visitorId } }),
  }),
  graphql(formQueryVisitorStay, {
    props: ({ data }) => ({ visitorStayLoading: data.loading, ...data }),
    options: ({ visitorStayId }) => ({ variables: { _id: visitorStayId } }),
  })
)(StayCardContainer);
