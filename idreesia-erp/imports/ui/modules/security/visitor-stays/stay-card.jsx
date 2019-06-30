import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";
import Barcode from "react-barcode";
import moment from "moment";
import gql from "graphql-tag";
import { compose, graphql } from "react-apollo";
import ReactToPrint from "react-to-print";
import { Button, Card, Icon } from "antd";

const barcodeOptions = {
  width: 1,
  height: 20,
  format: "CODE128B",
  displayValue: false,
  background: "#ffffff",
  lineColor: "#000000",
  margin: 5,
};

const ConatinerStyle = {
  display: "flex",
  flexFlow: "column nowrap",
  justifyContent: "flex-start",
  width: "100%",
};

class StayCard extends Component {
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
    const title = visitorById.criminalRecord
      ? "Night Stay Card - (D)"
      : "Night Stay Card";

    return (
      <Fragment>
        <Card ref={this.cardRef} title={title} style={ConatinerStyle}>
          <h2>Personal Information</h2>
          <div>
            <b>Name:</b> {visitorById.name}
          </div>
          <div>
            <b>S/O:</b> {visitorById.parentName}
          </div>
          <div>
            <b>R/O:</b> {visitorById.referenceName}
          </div>
          <div>
            <b>City:</b> {visitorById.city}
          </div>
          <div>
            <b>CNIC:</b> {visitorById.cnicNumber}
          </div>
          <div>
            <b>Phone:</b> {visitorById.contactNumber1}
          </div>
          <h2>Stay Time</h2>
          <div>
            <b>From:</b>{" "}
            {moment(Number(visitorStayById.fromDate)).format("DD MMMM, YYYY")}
          </div>
          <div>
            <b>To:</b>{" "}
            {moment(Number(visitorStayById.toDate)).format("DD MMMM, YYYY")}
          </div>
          <div>
            <Barcode value={visitorStayById._id} {...barcodeOptions} />
          </div>
        </Card>
        <div style={{ paddingTop: "5px" }}>
          <ReactToPrint
            trigger={() => (
              <Button type="default">
                <Icon type="printer" />Print
              </Button>
            )}
            content={() => this.cardRef.current}
          />
          &nbsp;
          <Button type="default" onClick={() => this.props.onCloseCard()}>
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
    }
  }
`;

export default compose(
  graphql(formQueryVisitor, {
    props: ({ data }) => ({ visitorLoading: data.loading, ...data }),
    options: ({ visitorId }) => ({ variables: { _id: visitorId } }),
  }),
  graphql(formQueryVisitorStay, {
    props: ({ data }) => ({ visitorStayLoading: data.loading, ...data }),
    options: ({ visitorStayId }) => ({ variables: { _id: visitorStayId } }),
  })
)(StayCard);
