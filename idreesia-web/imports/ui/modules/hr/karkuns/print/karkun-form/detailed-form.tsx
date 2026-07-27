import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Barcode from 'react-barcode';
import dayjs from 'dayjs';
import { Checkbox, Col, Divider, InputNumber, Row } from 'antd';

import { getDownloadUrl } from 'meteor/idreesia-common/utilities';
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

const DataStyle = {
  fontSize: 20,
};

const BarcodeView = Barcode as any;
const AntCol = Col as any;
const AntCheckbox = Checkbox as any;
const NumberInput = InputNumber as any;
const EhadDurationDisplayControl = EhadDurationDisplay as any;
const AntDivider = Divider as any;
const AntRow = Row as any;
const DisplayItemControl = DisplayItem as any;
type AnyRecord = Record<string, any>;
interface Props { hrKarkunById: AnyRecord; }

export class DetailedForm extends Component<Props> {
  static propTypes = {
    hrKarkunById: PropTypes.object,
  };

  getImageColumn = () => {
    const { hrKarkunById } = this.props;
    const url = getDownloadUrl(hrKarkunById.imageId);
    return url ? (
      <AntCol order={2}>
        <img src={url} style={{ width: '200px' }} alt="Karkun" />
      </AntCol>
    ) : null;
  };

  getJobDetails = (job: AnyRecord | null | undefined, duties: AnyRecord[] = []) => {
    let jobName: React.ReactNode[] = [];
    let dutyNames: React.ReactNode[] = [];

    if (job) {
      jobName = [job.name];
    }

    if (duties.length > 0) {
      dutyNames = duties.map((duty: AnyRecord) => {
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
      hrKarkunById.duties ?? []
    );
    const timestamp = dayjs().format('DD MMM, YYYY');

    return (
      <div className="form-print-view">
        <AntRow type="flex" justify="start" gutter={40}>
          <AntCol order={1}>
            <BarcodeView value={hrKarkunById._id} {...barcodeOptions} />
            <DisplayItemControl label="Generated On" value={timestamp} />
            <DisplayItemControl label="Name" value={hrKarkunById.name} />
            <DisplayItemControl label="S/O" value={hrKarkunById.parentName} />
            <DisplayItemControl label="CNIC" value={hrKarkunById.cnicNumber} />
            <DisplayItemControl
              label="Mobile No."
              value={`${hrKarkunById.contactNumber1} - ${
                hrKarkunById.contactNumber1Subscribed
                  ? '(Subscribed)'
                  : 'Not Subscribed'
              }`}
            />
            {hrKarkunById.contactNumber2 ? (
              <DisplayItemControl
                label="Other Contact No."
                value={`${hrKarkunById.contactNumber2} - ${
                  hrKarkunById.contactNumber2Subscribed
                    ? '(Subscribed)'
                    : 'Not Subscribed'
                }`}
              />
            ) : (
              <DisplayItemControl label="Other Contact No." value="" />
            )}
          </AntCol>
          {imageColumn}
        </AntRow>
        <AntRow type="flex" justify="start" gutter={20}>
          <AntCol order={1} span={11}>
            <DisplayItemControl label="Email" value={hrKarkunById.emailAddress} />
          </AntCol>
          <AntCol order={2}>
            <DisplayItemControl label="Blood Group" value={hrKarkunById.bloodGroup} />
          </AntCol>
        </AntRow>
        <AntRow type="flex" justify="start" gutter={20}>
          <AntCol order={1} span={11}>
            <DisplayItemControl label="Ehad Duration">
              <EhadDurationDisplayControl
                value={
                  hrKarkunById.ehadDate
                    ? dayjs(Number(hrKarkunById.ehadDate))
                    : dayjs()
                }
              />
            </DisplayItemControl>
          </AntCol>
          <AntCol order={2}>
            <DisplayItemControl
              label="Ehad Reference"
              value={hrKarkunById.referenceName}
            />
          </AntCol>
        </AntRow>
        <AntRow type="flex" justify="start" gutter={40}>
          <AntCol order={1}>
            <DisplayItemControl
              label="Current Address"
              value={hrKarkunById.currentAddress}
            />
            <DisplayItemControl
              label="Permanent Address"
              value={hrKarkunById.permanentAddress}
            />
            <DisplayItemControl label="381-A Job / Duties" value={jobDetails} />
          </AntCol>
        </AntRow>
        <AntDivider>Education / Means of Earning</AntDivider>
        <AntRow type="flex" justify="start" gutter={20}>
          <AntCol order={1}>
            <DisplayItemControl
              label="Education"
              value={hrKarkunById.educationalQualification}
            />
            <DisplayItemControl label="Means of Earning">
              <AntCheckbox style={DataStyle as any}>Job</AntCheckbox>
              <AntCheckbox style={DataStyle as any}>Business</AntCheckbox>
            </DisplayItemControl>
            <DisplayItemControl label="Job / Business Details" value="" />
          </AntCol>
        </AntRow>
        <AntDivider>Family Details</AntDivider>
        <DisplayItemControl label="Marital Status">
          <AntCheckbox style={DataStyle as any}>Single</AntCheckbox>
          <AntCheckbox style={DataStyle as any}>Married</AntCheckbox>
        </DisplayItemControl>
        <DisplayItemControl label="Dependent Family Members" value="" />
        <AntRow type="flex" justify="space-between" gutter={20}>
          <DisplayItemControl label="Men" labelStyle={DataStyle as any}>
            <NumberInput />
          </DisplayItemControl>
          <DisplayItemControl label="Women" labelStyle={DataStyle as any}>
            <NumberInput />
          </DisplayItemControl>
          <DisplayItemControl label="Sons" labelStyle={DataStyle as any}>
            <NumberInput />
          </DisplayItemControl>
          <DisplayItemControl label="Daughters" labelStyle={DataStyle as any}>
            <NumberInput />
          </DisplayItemControl>
        </AntRow>

        <AntDivider>Emergency Contact</AntDivider>
        <AntRow type="flex" justify="start" gutter={20}>
          <AntCol order={1}>
            <DisplayItemControl label="Name" value="" />
            <DisplayItemControl label="Relationship" value="" />
          </AntCol>
          <AntCol order={2} offset={8}>
            <DisplayItemControl label="Phone" value="" />
          </AntCol>
        </AntRow>
        <AntDivider>If not originally from Multan</AntDivider>
        <DisplayItemControl label="Date Shifted to Multan" value="" />
        <DisplayItemControl label="Permission Received Through" value="" />
        <DisplayItemControl label="Address before Shifting" value="" />
      </div>
    );
  }
}
