import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Barcode from 'react-barcode';
import moment from 'moment';

import { getDownloadUrl } from 'meteor/idreesia-common/utilities';
import { Col, Divider, Row } from '/imports/ui/controls';
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

export class DataDisplayForm extends Component {
  static propTypes = {
    hrKarkunById: PropTypes.object,
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
    const { hrKarkunById } = this.props;

    const imageColumn = this.getImageColumn();
    const jobDetails = this.getJobDetails(
      hrKarkunById.job,
      hrKarkunById.duties
    );
    const timestamp = moment().format('DD MMM, YYYY');

    return (
      <div className="karkun-print-view" ref={this.printViewRef}>
        <Row type="flex" justify="start" gutter={40}>
          <Col order={1}>
            <Barcode value={hrKarkunById._id} {...barcodeOptions} />
            <DisplayItem label="Generated On" value={timestamp} />
            <DisplayItem label="Name" value={hrKarkunById.name} />
            <DisplayItem label="S/O" value={hrKarkunById.parentName} />
            <DisplayItem label="CNIC" value={hrKarkunById.cnicNumber} />
            <DisplayItem
              label="Mobile No."
              value={`${hrKarkunById.contactNumber1} - ${
                hrKarkunById.contactNumber1Subscribed
                  ? '(Subscribed)'
                  : 'Not Subscribed'
              }`}
            />
            {hrKarkunById.contactNumber2 ? (
              <DisplayItem
                label="Home No."
                value={`${hrKarkunById.contactNumber2} - ${
                  hrKarkunById.contactNumber2Subscribed
                    ? '(Subscribed)'
                    : 'Not Subscribed'
                }`}
              />
            ) : (
              <DisplayItem label="Home No." value="" />
            )}
            <DisplayItem label="Email" value={hrKarkunById.emailAddress} />
            <DisplayItem label="Blood Group" value={hrKarkunById.bloodGroup} />
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
        <Divider>Family Details</Divider>
        <DisplayItem label="Married/Single" value="" />
        <DisplayItem label="Dependent Family Members" value="" />
        <Divider>Emergency Contact</Divider>
        <DisplayItem label="Name" value="" />
        <DisplayItem label="Phone" value="" />
        <DisplayItem label="Relationship" value="" />
        <Divider>If not originally from Multan</Divider>
        <DisplayItem label="Date Shifted to Multan" value="" />
        <DisplayItem label="Permission Granted By" value="" />
        <DisplayItem label="Address before Shifting" value="" />
      </div>
    );
  }
}
