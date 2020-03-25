import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';
import ReactToPrint from 'react-to-print';
import Barcode from 'react-barcode';
import moment from 'moment';

import { getDownloadUrl } from 'meteor/idreesia-common/utilities';
import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { WithBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import { Button, Col, Divider, Row } from '/imports/ui/controls';
import { DisplayItem } from '/imports/ui/modules/hr/common/controls';

import { HR_KARKUN_BY_ID } from '../gql';

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
    hrKarkunById: PropTypes.object,
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
    const { hrKarkunById } = this.props;
    const url = getDownloadUrl(hrKarkunById.imageId);
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
    const { history, formDataLoading, hrKarkunById } = this.props;
    if (formDataLoading) return null;

    const imageColumn = this.getImageColumn();
    const jobDetails = this.getJobDetails(
      hrKarkunById.job,
      hrKarkunById.duties
    );
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
              <Barcode value={hrKarkunById._id} {...barcodeOptions} />
              <DisplayItem label="Generated On" value={timestamp} />
              <DisplayItem label="Name" value={hrKarkunById.name} />
              <DisplayItem label="S/O" value={hrKarkunById.parentName} />
              <DisplayItem label="CNIC" value={hrKarkunById.cnicNumber} />
              <DisplayItem label="Phone" value={hrKarkunById.contactNumber1} />
              <DisplayItem label="Email" value={hrKarkunById.emailAddress} />
              <DisplayItem
                label="Blood Group"
                value={hrKarkunById.bloodGroup}
              />
              <DisplayItem
                label="Education"
                value={hrKarkunById.educationalQualification}
              />
            </Col>
            {imageColumn}
          </Row>
          <Row type="flex" justify="start" gutter={20}>
            <Col order={1}>
              <DisplayItem
                label="Means of Earning"
                value={hrKarkunById.meansOfEarning}
              />
              <DisplayItem
                label="Current Address"
                value={hrKarkunById.currentAddress}
              />
              <DisplayItem
                label="Permanent Address"
                value={hrKarkunById.permanentAddress}
              />
            </Col>
          </Row>
          <DisplayItem label="Job / Duties" value={jobDetails} />
        </div>
      </>
    );
  }
}

export default flowRight(
  graphql(HR_KARKUN_BY_ID, {
    props: ({ data }) => ({ formDataLoading: data.loading, ...data }),
    options: ({ match }) => {
      const { karkunId } = match.params;
      return { variables: { _id: karkunId } };
    },
  }),
  WithBreadcrumbs(['HR', 'Karkuns', 'Print Karkun'])
)(PrintView);
