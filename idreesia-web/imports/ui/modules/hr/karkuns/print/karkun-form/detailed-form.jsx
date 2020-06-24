import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Barcode from 'react-barcode';
import moment from 'moment';

import { getDownloadUrl } from 'meteor/idreesia-common/utilities';
import { Checkbox, Col, Divider, InputNumber, Row } from '/imports/ui/controls';
import { EhadDurationDisplay } from '/imports/ui/modules/helpers/controls';
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

const DataStyle = {
  fontSize: 20,
};

export class DetailedForm extends Component {
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
                label="Other Contact No."
                value={`${hrKarkunById.contactNumber2} - ${
                  hrKarkunById.contactNumber2Subscribed
                    ? '(Subscribed)'
                    : 'Not Subscribed'
                }`}
              />
            ) : (
              <DisplayItem label="Other Contact No." value="" />
            )}
          </Col>
          {imageColumn}
        </Row>
        <Row type="flex" justify="start" gutter={20}>
          <Col order={1} span={11}>
            <DisplayItem label="Email" value={hrKarkunById.emailAddress} />
          </Col>
          <Col order={2}>
            <DisplayItem label="Blood Group" value={hrKarkunById.bloodGroup} />
          </Col>
        </Row>
        <Row type="flex" justify="start" gutter={20}>
          <Col order={1} span={11}>
            <DisplayItem label="Ehad Duration">
              <EhadDurationDisplay
                value={
                  hrKarkunById.ehadDate
                    ? moment(Number(hrKarkunById.ehadDate))
                    : moment()
                }
              />
            </DisplayItem>
          </Col>
          <Col order={2}>
            <DisplayItem
              label="Ehad Reference"
              value={hrKarkunById.referenceName}
            />
          </Col>
        </Row>
        <Row type="flex" justify="start" gutter={40}>
          <Col order={1}>
            <DisplayItem
              label="Current Address"
              value={hrKarkunById.currentAddress}
            />
            <DisplayItem
              label="Permanent Address"
              value={hrKarkunById.permanentAddress}
            />
            <DisplayItem label="381-A Job / Duties" value={jobDetails} />
          </Col>
        </Row>
        <Divider>Education / Means of Earning</Divider>
        <Row type="flex" justify="start" gutter={20}>
          <Col order={1}>
            <DisplayItem
              label="Education"
              value={hrKarkunById.educationalQualification}
            />
            <DisplayItem label="Means of Earning">
              <Checkbox style={DataStyle}>Job</Checkbox>
              <Checkbox style={DataStyle}>Business</Checkbox>
            </DisplayItem>
            <DisplayItem label="Job / Business Details" value="" />
          </Col>
        </Row>
        <Divider>Family Details</Divider>
        <DisplayItem label="Marital Status">
          <Checkbox style={DataStyle}>Single</Checkbox>
          <Checkbox style={DataStyle}>Married</Checkbox>
        </DisplayItem>
        <DisplayItem label="Dependent Family Members" value="" />
        <Row type="flex" justify="space-between" gutter={20}>
          <DisplayItem label="Men" labelStyle={DataStyle}>
            <InputNumber />
          </DisplayItem>
          <DisplayItem label="Women" labelStyle={DataStyle}>
            <InputNumber />
          </DisplayItem>
          <DisplayItem label="Sons" labelStyle={DataStyle}>
            <InputNumber />
          </DisplayItem>
          <DisplayItem label="Daughters" labelStyle={DataStyle}>
            <InputNumber />
          </DisplayItem>
        </Row>

        <Divider>Emergency Contact</Divider>
        <Row type="flex" justify="start" gutter={20}>
          <Col order={1}>
            <DisplayItem label="Name" value="" />
            <DisplayItem label="Relationship" value="" />
          </Col>
          <Col order={2} offset={8}>
            <DisplayItem label="Phone" value="" />
          </Col>
        </Row>
        <Divider>If not originally from Multan</Divider>
        <DisplayItem label="Date Shifted to Multan" value="" />
        <DisplayItem label="Permission Received Through" value="" />
        <DisplayItem label="Address before Shifting" value="" />
      </div>
    );
  }
}
