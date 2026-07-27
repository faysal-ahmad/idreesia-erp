import React, { Component } from 'react';
import PropTypes from 'prop-types';

import {
  flowRight,
  toSafeInteger,
} from 'meteor/idreesia-common/utilities/lodash';
import {
  WithBreadcrumbs,
  WithQueryParams,
} from 'meteor/idreesia-common/composers/common';
import { HRSubModulePaths as paths } from '/imports/ui/modules/hr';

import List from './list';

type AnyRecord = Record<string, any>;
interface HistoryLike { push(path: string): void; }
interface LocationLike { pathname: string; }
interface Props { history: HistoryLike; location: LocationLike; queryString?: string; queryParams: AnyRecord; }
const KarkunList = List as any;

class ListContainer extends Component<Props> {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    queryString: PropTypes.string,
    queryParams: PropTypes.object,
  };

  setPageParams = (newParams: AnyRecord) => {
    const {
      name,
      cnicNumber,
      phoneNumber,
      bloodGroup,
      lastTarteeb,
      jobId,
      dutyId,
      dutyShiftId,
      karkunType,
      pageIndex,
      pageSize,
    } = newParams;
    const { queryParams, history, location } = this.props;

    let showVolunteersVal;
    let showEmployeesVal;
    if (Object.prototype.hasOwnProperty.call(newParams, 'karkunType')) {
      showVolunteersVal =
        karkunType.indexOf('volunteers') !== -1 ? 'true' : 'false';
      showEmployeesVal =
        karkunType.indexOf('employees') !== -1 ? 'true' : 'false';
    } else {
      showVolunteersVal = queryParams.showVolunteers || 'true';
      showEmployeesVal = queryParams.showEmployees || 'true';
    }

    let nameVal;
    if (Object.prototype.hasOwnProperty.call(newParams, 'name')) nameVal = name || '';
    else nameVal = queryParams.name || '';

    let cnicNumberVal;
    if (Object.prototype.hasOwnProperty.call(newParams, 'cnicNumber'))
      cnicNumberVal = cnicNumber || '';
    else cnicNumberVal = queryParams.cnicNumber || '';

    let phoneNumberVal;
    if (Object.prototype.hasOwnProperty.call(newParams, 'phoneNumber'))
      phoneNumberVal = phoneNumber || '';
    else phoneNumberVal = queryParams.phoneNumber || '';

    let bloodGroupVal;
    if (Object.prototype.hasOwnProperty.call(newParams, 'bloodGroup'))
      bloodGroupVal = bloodGroup || '';
    else bloodGroupVal = queryParams.bloodGroup || '';

    let lastTarteebVal;
    if (Object.prototype.hasOwnProperty.call(newParams, 'lastTarteeb'))
      lastTarteebVal = lastTarteeb || '';
    else lastTarteebVal = queryParams.lastTarteeb || '';

    let jobIdVal;
    if (Object.prototype.hasOwnProperty.call(newParams, 'jobId')) jobIdVal = jobId || '';
    else jobIdVal = queryParams.jobId || '';

    let dutyIdVal;
    if (Object.prototype.hasOwnProperty.call(newParams, 'dutyId')) dutyIdVal = dutyId || '';
    else dutyIdVal = queryParams.dutyId || '';

    let dutyShiftIdVal;
    if (Object.prototype.hasOwnProperty.call(newParams, 'dutyShiftId'))
      dutyShiftIdVal = dutyShiftId || '';
    else dutyShiftIdVal = queryParams.dutyShiftId || '';

    let pageIndexVal;
    if (Object.prototype.hasOwnProperty.call(newParams, 'pageIndex')) pageIndexVal = pageIndex || 0;
    else pageIndexVal = queryParams.pageIndex || 0;

    let pageSizeVal;
    if (Object.prototype.hasOwnProperty.call(newParams, 'pageSize')) pageSizeVal = pageSize || 20;
    else pageSizeVal = queryParams.pageSize || 20;

    const path = `${location.pathname}?name=${nameVal}&cnicNumber=${cnicNumberVal}&phoneNumber=${phoneNumberVal}&bloodGroup=${bloodGroupVal}&lastTarteeb=${lastTarteebVal}&jobId=${jobIdVal}&dutyId=${dutyIdVal}&dutyShiftId=${dutyShiftIdVal}&showVolunteers=${showVolunteersVal}&showEmployees=${showEmployeesVal}&pageIndex=${pageIndexVal}&pageSize=${pageSizeVal}`;
    history.push(path);
  };

  handleNewClicked = () => {
    const { history } = this.props;
    history.push(paths.karkunsNewFormPath);
  };

  handleScanClicked = () => {
    const { history } = this.props;
    history.push(paths.karkunsScanCardPath);
  };

  handlePrintClicked = (karkun: AnyRecord) => {
    const { history } = this.props;
    history.push(paths.karkunsPrintPath(karkun._id));
  };

  handleAuditLogClicked = (karkun: AnyRecord) => {
    const { history } = this.props;
    history.push(`${paths.auditLogsPath}?entityId=${karkun._id}`);
  };

  handleItemSelected = (karkun: AnyRecord) => {
    const { history } = this.props;
    history.push(`${paths.karkunsPath}/${karkun._id}`);
  };

  handlePrintSelected = (karkuns: AnyRecord[]) => {
    const { history } = this.props;
    const karkunIds = karkuns.map((karkun: AnyRecord) => karkun._id);
    history.push(
      `${paths.karkunsPrintListPath}?karkunIds=${karkunIds.join(',')}`
    );
  };

  render() {
    const {
      queryParams: {
        pageIndex,
        pageSize,
        name,
        cnicNumber,
        phoneNumber,
        bloodGroup,
        lastTarteeb,
        jobId,
        dutyId,
        dutyShiftId,
        showVolunteers,
        showEmployees,
      },
    } = this.props;

    const numPageIndex = pageIndex ? toSafeInteger(pageIndex) : 0;
    const numPageSize = pageSize ? toSafeInteger(pageSize) : 20;

    return (
      <KarkunList
        pageIndex={numPageIndex}
        pageSize={numPageSize}
        name={name}
        cnicNumber={cnicNumber}
        phoneNumber={phoneNumber}
        bloodGroup={bloodGroup}
        lastTarteeb={lastTarteeb}
        jobId={jobId}
        dutyId={dutyId}
        dutyShiftId={dutyShiftId}
        showVolunteers={showVolunteers || 'true'}
        showEmployees={showEmployees || 'true'}
        setPageParams={this.setPageParams}
        handleItemSelected={this.handleItemSelected}
        showNewButton
        showDownloadButton
        showSelectionColumn
        showPhoneNumbersColumn
        showDutiesColumn
        showActionsColumn
        handleNewClicked={this.handleNewClicked}
        handleScanClicked={this.handleScanClicked}
        handlePrintClicked={this.handlePrintClicked}
        handleAuditLogClicked={this.handleAuditLogClicked}
        handlePrintSelected={this.handlePrintSelected}
      />
    );
  }
}

export default flowRight(
  WithQueryParams(),
  WithBreadcrumbs(['HR', 'Karkuns', 'List'])
)(ListContainer as any);
