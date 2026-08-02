import React, { Component, type CSSProperties } from 'react';
import Barcode from 'react-barcode';
import dayjs from 'dayjs';
import { Checkbox, Col, Divider, InputNumber, Row } from 'antd';

import { getDownloadUrl } from 'meteor/idreesia-common/utilities';
import type { HrKarkunByIdForKarkunsQuery } from 'meteor/idreesia-common/types/client-operations';
import { DisplayItem, EhadDurationDisplay } from '/imports/ui/modules/helpers/controls';

const barcodeOptions = {
  width: 1,
  height: 20,
  format: 'CODE128B',
  displayValue: false,
  background: '#ffffff',
  lineColor: '#000000',
  margin: 5,
};

const DataStyle: CSSProperties = {
  fontSize: 20,
};

const BarcodeView = Barcode as any;

type HrKarkun = NonNullable<HrKarkunByIdForKarkunsQuery['hrKarkunById']>;
type KarkunDuty = NonNullable<NonNullable<HrKarkun['duties']>[number]>;

interface Props {
  hrKarkunById?: HrKarkun | null;
}

export class DetailedForm extends Component<Props> {
  getImageColumn = () => {
    const { hrKarkunById } = this.props;
    if (!hrKarkunById) return null;
    const url = getDownloadUrl(hrKarkunById.imageId);
    return url ? (
      <Col order={2}>
        <img src={url} style={{ width: '200px' }} alt="Karkun" />
      </Col>
    ) : null;
  };

  getJobDetails = (
    job: HrKarkun['job'],
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
      hrKarkunById.job,
      (hrKarkunById.duties ?? []).filter(
        (duty): duty is KarkunDuty => duty != null
      )
    );
    const timestamp = dayjs().format('DD MMM, YYYY');

    return (
      <div className="form-print-view">
        <Row justify="start" gutter={40}>
          <Col order={1}>
            <BarcodeView value={hrKarkunById._id} {...barcodeOptions} />
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
        <Row justify="start" gutter={20}>
          <Col order={1} span={11}>
            <DisplayItem label="Email" value={hrKarkunById.emailAddress} />
          </Col>
          <Col order={2}>
            <DisplayItem label="Blood Group" value={hrKarkunById.bloodGroup} />
          </Col>
        </Row>
        <Row justify="start" gutter={20}>
          <Col order={1} span={11}>
            <DisplayItem label="Ehad Duration">
              <EhadDurationDisplay
                value={
                  hrKarkunById.ehadDate
                    ? dayjs(Number(hrKarkunById.ehadDate))
                    : dayjs()
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
        <Row justify="start" gutter={40}>
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
        <Row justify="start" gutter={20}>
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
        <Row justify="space-between" gutter={20}>
          <DisplayItem label="Men" labelStyle={DataStyle as Record<string, unknown>}>
            <InputNumber />
          </DisplayItem>
          <DisplayItem label="Women" labelStyle={DataStyle as Record<string, unknown>}>
            <InputNumber />
          </DisplayItem>
          <DisplayItem label="Sons" labelStyle={DataStyle as Record<string, unknown>}>
            <InputNumber />
          </DisplayItem>
          <DisplayItem label="Daughters" labelStyle={DataStyle as Record<string, unknown>}>
            <InputNumber />
          </DisplayItem>
        </Row>

        <Divider>Emergency Contact</Divider>
        <Row justify="start" gutter={20}>
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
