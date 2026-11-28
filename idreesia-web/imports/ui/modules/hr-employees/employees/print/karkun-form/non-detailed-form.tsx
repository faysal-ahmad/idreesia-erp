import React, { Component } from 'react';
import Barcode from 'react-barcode';
import { Col, Divider, Row } from 'antd';

import type { HrEmployeeByIdQuery } from 'meteor/idreesia-common/types/client-operations';
import { formatDate } from 'meteor/idreesia-common/utilities/date-fns';
import { DisplayItem } from '/imports/ui/modules/helpers/controls';

import {
  employmentStartText,
  jobText,
  shiftText,
  statusText,
} from '../employment-details';

const barcodeOptions = {
  width: 1,
  height: 20,
  format: 'CODE128B' as const,
  displayValue: false,
  background: '#ffffff',
  lineColor: '#000000',
  margin: 5,
};

type HrKarkun = NonNullable<HrEmployeeByIdQuery['hrEmployeeById']>;

interface Props {
  hrEmployeeById: HrKarkun;
}

export class NonDetailedForm extends Component<Props> {
  getImageColumn = () => {
    const { hrEmployeeById } = this.props;
    const url = hrEmployeeById.sharedData?.imageUrl;
    return url ? (
      <Col order={2}>
        <img src={url} style={{ width: '200px' }} alt="Karkun" />
      </Col>
    ) : null;
  };

  render() {
    const { hrEmployeeById } = this.props;

    const imageColumn = this.getImageColumn();
    const { employeeData } = hrEmployeeById;
    const timestamp = formatDate(new Date(), 'DD MMM, YYYY');
    const sharedData = hrEmployeeById.sharedData ?? ({} as NonNullable<typeof hrEmployeeById.sharedData>);

    return (
      <div className="form-print-view">
        <Row justify="start" gutter={40}>
          <Col order={1}>
            <Barcode value={hrEmployeeById._id ?? ''} {...barcodeOptions} />
            <DisplayItem label="Generated On" value={timestamp} />
            <DisplayItem label="Name" value={sharedData.name} />
            <DisplayItem label="S/O" value={sharedData.parentName} />
            <DisplayItem label="CNIC" value={sharedData.cnicNumber} />
            <DisplayItem
              label="Mobile No."
              value={sharedData.contactNumber1}
            />
            {sharedData.contactNumber2 ? (
              <DisplayItem
                label="Home No."
                value={sharedData.contactNumber2}
              />
            ) : (
              <DisplayItem label="Home No." value="" />
            )}
            <DisplayItem label="Email" value={sharedData.emailAddress} />
            <DisplayItem label="Blood Group" value={sharedData.bloodGroup} />
            <DisplayItem
              label="Education"
              value={sharedData.educationalQualification}
            />
          </Col>
          {imageColumn}
        </Row>
        <Row justify="start" gutter={20}>
          <Col order={1}>
            <DisplayItem
              label="Means of Earning"
              value={sharedData.meansOfEarning}
            />
            <DisplayItem
              label="Current Address"
              value={sharedData.currentAddress}
            />
            <DisplayItem
              label="Permanent Address"
              value={sharedData.permanentAddress}
            />
          </Col>
        </Row>
        <DisplayItem label="Job" value={jobText(employeeData)} />
        <DisplayItem label="Shift" value={shiftText(employeeData)} />
        <DisplayItem label="Status" value={statusText(employeeData)} />
        <DisplayItem
          label="Employment Start"
          value={employmentStartText(employeeData)}
        />
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
