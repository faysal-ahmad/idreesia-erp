import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";
import gql from "graphql-tag";
import { graphql } from "react-apollo";
import { flowRight } from "lodash";
import ReactToPrint from "react-to-print";

import { Button, Icon } from "/imports/ui/controls";
import StayCard from "./stay-card";

class StayCardContainer extends Component {
  static propTypes = {
    visitorId: PropTypes.string,
    visitorStayId: PropTypes.string,
    visitorLoading: PropTypes.bool,
    visitorById: PropTypes.object,
    visitorStayLoading: PropTypes.bool,
    visitorStayById: PropTypes.object,
    onCloseCard: PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.cardRef = React.createRef();
  }

  getCardMarkup() {
    const { visitorById, visitorStayById } = this.props;
    return (
      <Fragment>
        <StayCard
          ref={this.cardRef}
          visitor={visitorById}
          visitorStay={visitorStayById}
        />
        <div style={{ paddingTop: "5px" }}>
          <ReactToPrint
            trigger={() => (
              <Button type="primary" size="large">
                <Icon type="printer" />Print
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
  query visitorById($_id: String!) {
    visitorById(_id: $_id) {
      _id
      name
      parentName
      cnicNumber
      referenceName
      contactNumber1
      city
      criminalRecord
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
