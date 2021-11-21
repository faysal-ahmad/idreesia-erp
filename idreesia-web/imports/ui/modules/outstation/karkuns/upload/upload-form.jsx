/* eslint "dot-notation": "off" */
/* eslint "no-param-reassign": "off" */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';
import moment from 'moment';
import csv from 'csvtojson';

import { Formats } from 'meteor/idreesia-common/constants';
import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { WithBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import { Button, Descriptions, Form, Row, message } from '/imports/ui/controls';
import {
  CascaderField,
  InputFileField,
} from '/imports/ui/modules/helpers/fields';
import {
  WithAllCities,
  WithAllCityMehfils,
} from '/imports/ui/modules/outstation/common/composers';
import { getCityMehfilCascaderData } from '/imports/ui/modules/common/utilities';

import UploadPreview from './upload-preview';
import { IMPORT_OUTSTATION_KARKUN } from '../gql';

const buttonItemLayout = {
  wrapperCol: { span: 16, offset: 4 },
};

class UploadForm extends Component {
  static propTypes = {
    match: PropTypes.object,
    history: PropTypes.object,
    location: PropTypes.object,
    form: PropTypes.object,

    allCities: PropTypes.array,
    allCitiesLoading: PropTypes.bool,
    allCityMehfils: PropTypes.array,
    allCityMehfilsLoading: PropTypes.bool,
    importOutstationKarkun: PropTypes.func,
  };

  state = {
    csv: null,
    cityIdMehfilId: null,
    importing: false,
    importData: null,
  };

  checkForErrors = jsonArray => {
    jsonArray.forEach((record, index) => {
      const errors = [];
      if (!record['Name']) errors.push('Required field "Name" is missing.');
      if (!record['Father Name'])
        errors.push('Required field "Father Name" is missing.');
      if (!record['CNIC'] && !record['Mobile No.'])
        errors.push('Either "CNIC" or "Mobile No." is required.');
      if (!record['Arsa Ehad'])
        errors.push('Required field "Arsa Ehad" is missing.');
      if (!record['Maarfat'])
        errors.push('Required field "Maarfat" is missing.');

      if (record['Arsa Ehad'] && isNaN(record['Arsa Ehad'])) {
        errors.push('"Arsa Ehad" is not a number value.');
      }

      if (record['Age'] && isNaN(record['Age'])) {
        errors.push('"Age" is not a number value.');
      }

      if (record['Name']) {
        if (record['Name'].indexOf('.') !== -1) {
          errors.push('"Name" should not contain a dot.');
        }
      }

      if (record['Last Wazaif Tarteeb']) {
        const date = moment(record['Last Wazaif Tarteeb'], Formats.DATE_FORMAT);
        if (!date.isValid()) {
          errors.push(
            '"Last Wazaif Tarteeb" is not in the correct date format.'
          );
        }
      }

      if (record['CNIC']) {
        const cnicRegex = new RegExp('^[0-9]{5}-[0-9]{7}-[0-9]{1}$');
        if (!cnicRegex.test(record['CNIC'])) {
          errors.push('"CNIC" is not in the correct format.');
        }
      }

      if (record['Mobile No.']) {
        const mobileRegex = new RegExp('^03[0-9]{2}-[0-9]{7}$');
        if (!mobileRegex.test(record['Mobile No.'])) {
          errors.push('"Mobile No." is not in the correct format.');
        }
      }

      record._id = index;
      record.errors = errors;
    });
  };

  handleCancel = () => {
    const { history } = this.props;
    history.goBack();
  };

  handlePreview = e => {
    e.preventDefault();
    const { form } = this.props;
    form.validateFields((err, { cityIdMehfilId, csvData }) => {
      if (err) return;

      csv()
        .fromString(csvData)
        .then(jsonArray => {
          this.checkForErrors(jsonArray);
          this.setState({
            csv: csvData,
            cityIdMehfilId,
            importData: jsonArray,
          });
        })
        .catch(error => {
          message.error(error.message, 5);
        });
    });
  };

  handleCancelPreview = () => {
    const { form } = this.props;
    form.resetFields();
    this.setState({
      csv: null,
      cityIdMehfilId: null,
      importData: null,
    });
  };

  handleStartImport = () => {
    const { cityIdMehfilId, importData } = this.state;
    const { importOutstationKarkun } = this.props;
    this.setState({
      importing: true,
    });

    const promises = importData.map(record => {
      if (record.errors.length === 0) {
        return importOutstationKarkun({
          variables: {
            name: record['Name'],
            parentName: record['Father Name'],
            cnicNumber: record['CNIC'],
            contactNumber1: record['Mobile No.'],
            cityId: cityIdMehfilId[0],
            cityMehfilId: cityIdMehfilId[1],
            ehadDate: moment().subtract(
              parseInt(record['Arsa Ehad'], 10),
              'years'
            ),
            birthDate: record['Age']
              ? moment().subtract(parseInt(record['Age'], 10), 'years')
              : null,
            referenceName: record['Maarfat'],
            lastTarteebDate: moment(
              record['Last Wazaif Tarteeb'],
              Formats.DATE_FORMAT
            ),
            mehfilRaabta: record['Mehfil Raabta'],
            msRaabta: record['MS Raabta'],
          },
        })
          .then(({ data: { importOutstationKarkun: importMessage } }) => {
            record.imported = true;
            record.importMessage = importMessage;
          })
          .catch(error => {
            record.imported = false;
            record.importMessage = error.message;
          });
      }

      return Promise.resolve();
    });

    Promise.all(promises).then(() => {
      this.setState({
        importing: false,
      });
    });
  };

  render() {
    const {
      allCitiesLoading,
      allCityMehfilsLoading,
      allCities,
      allCityMehfils,
    } = this.props;
    if (allCitiesLoading || allCityMehfilsLoading) return null;

    const { importing, importData } = this.state;
    if (importData) {
      return (
        <UploadPreview
          importing={importing}
          data={importData}
          handleCancel={this.handleCancelPreview}
          handleStartImport={this.handleStartImport}
        />
      );
    }

    return (
      <>
        <Descriptions title="CSV Document Details" column={1} bordered>
          <Descriptions.Item label="Expected Columns">
            <b>Name</b>, <b>Father Name</b>, <b>CNIC</b>, <b>Mobile No.</b>,
            Age, <b>Arsa Ehad</b>, <b>Maarfat</b>, MS Raabta, Mehfil Raabta,
            Last Wazaif Tarteeb.
            <br />
            {
              'Field names in bold are required for importing. Only one of "CNIC" and "Mobile No." is required.'
            }
          </Descriptions.Item>
          <Descriptions.Item label="Column Details">
            Age is in years and should only contain number values
            <br />
            Arsa Ehad is in years and should only contain number values
            <br />
            MS Raabta and Mehfil Raabta can contain any text value
            <br />
            Last Wazaif Tarteeb is a date and need to be in the format
            DD/MM/YYYY
          </Descriptions.Item>
        </Descriptions>
        <br />
        <Form layout="horizontal" onSubmit={this.handlePreview}>
          <CascaderField
            data={getCityMehfilCascaderData(allCities, allCityMehfils)}
            fieldName="cityIdMehfilId"
            fieldLabel="City/Mehfil"
            required
            requiredMessage="Please select a city/mehfil from the list."
          />
          <InputFileField
            accept=".csv"
            fieldName="csvData"
            fieldLabel="Karkuns Data"
            required
            requiredMessage="Select CSV file containing karkuns data for upload."
          />
          <Form.Item {...buttonItemLayout}>
            <Row type="flex" justify="end">
              <Button
                size="large"
                type="default"
                icon="close-circle"
                onClick={this.handleCancel}
              >
                Cancel
              </Button>
              &nbsp;
              <Button
                size="large"
                type="primary"
                icon="table"
                htmlType="submit"
              >
                Preview
              </Button>
            </Row>
          </Form.Item>
        </Form>
      </>
    );
  }
}

export default flowRight(
  Form.create(),
  WithAllCities(),
  WithAllCityMehfils(),
  graphql(IMPORT_OUTSTATION_KARKUN, {
    name: 'importOutstationKarkun',
    options: {
      refetchQueries: ['pagedOutstationKarkuns'],
    },
  }),
  WithBreadcrumbs(['Outstation', 'Karkuns', 'Upload'])
)(UploadForm);
