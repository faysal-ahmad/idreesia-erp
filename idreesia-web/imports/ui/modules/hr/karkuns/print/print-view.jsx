import React, { Component } from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import ReactToPrint from 'react-to-print';
import Barcode from 'react-barcode';
import moment from 'moment';

import { getDownloadUrl } from 'meteor/idreesia-common/utilities';
import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { Button, Col, Divider, Row } from '/imports/ui/controls';
import { DisplayItem } from '/imports/ui/modules/hr/common/controls';

const barcodeOptions = {
  width: 1,
  height: 20,
  format: 'CODE128B',
  displayValue: false,
  background: '#ffffff',
  lineColor: '#000000',
  margin: 5,
};

class PrintView extends Component {
  static propTypes = {
    match: PropTypes.object,
    history: PropTypes.object,
    location: PropTypes.object,
    form: PropTypes.object,

    formDataLoading: PropTypes.bool,
    karkunId: PropTypes.string,
    karkunById: PropTypes.object,
  };

  constructor(props) {
    super(props);
    this.printViewRef = React.createRef();
  }

  handleBack = () => {
    const { history } = this.props;
    history.goBack();
  };

  handlePrint = e => {
    e.preventDefault();
  };

  getImageColumn = () => {
    const { karkunById } = this.props;
    const url = getDownloadUrl(karkunById.imageId);
    return url ? (
      <Col order={2}>
        <img src={url} style={{ width: '200px' }} />
      </Col>
    ) : null;
  };

  getJobDetails = (job, duties) => {
    let jobName = [];
    let dutyNames = [];

    if (job) {
      jobName = [job.name];
    }

    if (duties.length > 0) {
      dutyNames = duties.map(duty => {
        let dutyName = duty.dutyName;
        if (duty.shiftName) {
          dutyName = `${dutyName} - ${duty.shiftName}`;
        }
        if (duty.locationName) {
          dutyName = `${dutyName} - ${duty.locationName}`;
        }

        return dutyName;
      });
    }

    return jobName.concat(dutyNames);
  };

  render() {
    const { history, formDataLoading, karkunById } = this.props;
    if (formDataLoading) return null;

    const imageColumn = this.getImageColumn();
    const jobDetails = this.getJobDetails(karkunById.job, karkunById.duties);
    const timestamp = moment().format('DD MMM, YYYY');

    return (
      <>
        <ReactToPrint
          content={() => this.printViewRef.current}
          trigger={() => (
            <Button size="large" type="primary" icon="printer">
              Print
            </Button>
          )}
        />
        &nbsp;
        <Button
          size="large"
          type="primary"
          onClick={() => {
            history.goBack();
          }}
        >
          Back
        </Button>
        <Divider />
        <div className="karkun-print-view" ref={this.printViewRef}>
          <Row type="flex" justify="start" gutter={40}>
            <Col order={2}>
              <Barcode value={karkunById._id} {...barcodeOptions} />
              <DisplayItem label="Generated On" value={timestamp} />
              <DisplayItem label="Name" value={karkunById.name} />
              <DisplayItem label="S/O" value={karkunById.parentName} />
              <DisplayItem label="CNIC" value={karkunById.cnicNumber} />
              <DisplayItem label="Phone" value={karkunById.contactNumber1} />
              <DisplayItem label="Email" value={karkunById.emailAddress} />
              <DisplayItem label="Blood Group" value={karkunById.bloodGroup} />
              <DisplayItem
                label="Education"
                value={karkunById.educationalQualification}
              />
            </Col>
            {imageColumn}
          </Row>
          <Row type="flex" justify="start" gutter={20}>
            <Col order={1}>
              <DisplayItem
                label="Means of Earning"
                value={karkunById.meansOfEarning}
              />
              <DisplayItem
                label="Current Address"
                value={karkunById.currentAddress}
              />
              <DisplayItem
                label="Permanent Address"
                value={karkunById.permanentAddress}
              />
            </Col>
          </Row>
          <DisplayItem label="Job / Duties" value={jobDetails} />
        </div>
      </>
    );
  }
}

const formQuery = gql`
  query karkunById($_id: String!) {
    karkunById(_id: $_id) {
      _id
      name
      parentName
      cnicNumber
      imageId
      contactNumber1
      contactNumber2
      emailAddress
      currentAddress
      permanentAddress
      bloodGroup
      educationalQualification
      meansOfEarning
      job {
        _id
        name
      }
      duties {
        _id
        dutyName
        shiftName
        locationName
      }
    }
  }
`;

export default flowRight(
  graphql(formQuery, {
    props: ({ data }) => ({ formDataLoading: data.loading, ...data }),
    options: ({ match }) => {
      const { karkunId } = match.params;
      return { variables: { _id: karkunId } };
    },
  })
)(PrintView);
