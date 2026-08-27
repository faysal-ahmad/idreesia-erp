import React, { Component } from 'react';
import Barcode from 'react-barcode';
import { Col, Divider, Row } from 'antd';

import { formatDate } from 'meteor/idreesia-common/utilities/date-fns';
import { getDownloadUrl } from 'meteor/idreesia-common/utilities';
import type { HrKarkunByIdForKarkunsQuery } from 'meteor/idreesia-common/types/client-operations';
import { DisplayItem } from '/imports/ui/modules/helpers/controls';

const barcodeOptions = {
  width: 1,
  height: 20,
  format: 'CODE128B',
  displayValue: false,
  background: '#ffffff',
  lineColor: '#000000',
  margin: 5,
};

const BarcodeView = Barcode as any;

type HrKarkun = NonNullable<HrKarkunByIdForKarkunsQuery['hrKarkunById']>;
type KarkunDuty = NonNullable<
  NonNullable<NonNullable<HrKarkun['karkunData']>['duties']>[number]
>;
type HrKarkunJob = NonNullable<HrKarkun['employeeData']>['job'] | undefined;

interface Props {
  hrKarkunById?: HrKarkun | null;
}

export class NonDetailedForm extends Component<Props> {
  getImageColumn = () => {
    const { hrKarkunById } = this.props;
    if (!hrKarkunById) return null;
    const url = getDownloadUrl(hrKarkunById.sharedData?.imageId);
    return url ? (
      <Col order={2}>
        <img src={url} style={{ width: '200px' }} alt="Karkun" />
      </Col>
    ) : null;
  };

  getJobDetails = (
    job: HrKarkunJob,
    duties: KarkunDuty[] = []
  ) => {
    let jobName: React.ReactNode[] = [];
    let dutyNames: React.ReactNode[] = [];

    if (job) {
      jobName = [job.name];
    }

    if (duties.length > 0) {
      dutyNames = duties.map((duty) => {
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
    if (!hrKarkunById) return null;

    const imageColumn = this.getImageColumn();
    const jobDetails = this.getJobDetails(
      hrKarkunById.employeeData?.job,
      (hrKarkunById.karkunData?.duties ?? []).filter(
        (duty): duty is KarkunDuty => duty != null
      )
    );
    const timestamp = formatDate(new Date(), 'DD MMM, YYYY');
    const sharedData = hrKarkunById.sharedData ?? ({} as NonNullable<typeof hrKarkunById.sharedData>);

    return (
      <div className="form-print-view">
        <Row justify="start" gutter={40}>
          <Col order={1}>
            <BarcodeView value={hrKarkunById._id} {...barcodeOptions} />
            <DisplayItem label="Generated On" value={timestamp} />
            <DisplayItem label="Name" value={sharedData.name} />
            <DisplayItem label="S/O" value={sharedData.parentName} />
            <DisplayItem label="CNIC" value={sharedData.cnicNumber} />
            <DisplayItem
              label="Mobile No."
              value={`${sharedData.contactNumber1} - ${
                sharedData.contactNumber1Subscribed
                  ? '(Subscribed)'
                  : 'Not Subscribed'
              }`}
            />
            {sharedData.contactNumber2 ? (
              <DisplayItem
                label="Home No."
                value={`${sharedData.contactNumber2} - ${
                  sharedData.contactNumber2Subscribed
                    ? '(Subscribed)'
                    : 'Not Subscribed'
                }`}
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
