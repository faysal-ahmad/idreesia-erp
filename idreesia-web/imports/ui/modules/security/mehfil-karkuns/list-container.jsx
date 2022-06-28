import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';

import { Modal, message } from 'antd';
import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import {
  WithDynamicBreadcrumbs,
  WithQueryParams,
} from 'meteor/idreesia-common/composers/common';
import { SecuritySubModulePaths as paths } from '/imports/ui/modules/security';
import {
  WithMehfilId,
  WithMehfil,
  WithAllMehfilDuties,
} from '/imports/ui/modules/security/common/composers';

import List from './list';
import EditForm from './edit-form';
import {
  ADD_MEHFIL_KARKUN,
  SET_DUTY_DETAIL,
  REMOVE_MEHFIL_KARKUN,
} from './gql';

class ListContainer extends Component {
  static propTypes = {
    addMehfilKarkun: PropTypes.func,
    setDutyDetail: PropTypes.func,
    removeMehfilKarkun: PropTypes.func,
    mehfilLoading: PropTypes.bool,
    mehfilById: PropTypes.object,
    allSecurityMehfilDutiesLoading: PropTypes.bool,
    allSecurityMehfilDuties: PropTypes.array,
    refetchAllSecurityMehfilDuties: PropTypes.func,

    match: PropTypes.object,
    history: PropTypes.object,
    location: PropTypes.object,
    queryString: PropTypes.string,
    queryParams: PropTypes.object,
  };

  state = {
    showEditForm: false,
    mehfilKarkuns: [],
  };

  setPageParams = newParams => {
    const { queryParams, history, location } = this.props;
    const { dutyId } = newParams;

    let dutyIdVal;
    if (newParams.hasOwnProperty('dutyId')) dutyIdVal = dutyId || '';
    else dutyIdVal = queryParams.dutyId || '';

    const path = `${location.pathname}?dutyId=${dutyIdVal}`;
    history.push(path);
  };

  handleAddMehfilKarkun = (karkunId, refetchQuery) => {
    const {
      match,
      addMehfilKarkun,
      refetchAllSecurityMehfilDuties,
      queryParams: { dutyId },
    } = this.props;

    const { mehfilId } = match.params;

    addMehfilKarkun({
      variables: {
        mehfilId,
        karkunId,
        dutyId,
      },
    })
      .then(() => {
        refetchQuery();
        refetchAllSecurityMehfilDuties();
      })
      .catch(error => {
        message.error(error.message, 5);
      });
  };

  handleRemoveMehfilKarkun = (mehfilKarkunId, refetchQuery) => {
    const { removeMehfilKarkun, refetchAllSecurityMehfilDuties } = this.props;
    removeMehfilKarkun({
      variables: {
        _id: mehfilKarkunId,
      },
    })
      .then(() => {
        refetchQuery();
        refetchAllSecurityMehfilDuties();
      })
      .catch(error => {
        message.error(error.message, 5);
      });
  };

  handleViewMehfilCards = selectedRows => {
    const {
      history,
      match,
      queryParams: { dutyId },
    } = this.props;
    const { mehfilId } = match.params;
    const ids = selectedRows.map(row => row._id);
    const idsString = ids.join(',');
    const path = `${paths.mehfilsKarkunCardsPath(
      mehfilId
    )}?dutyId=${dutyId}&ids=${idsString}`;
    history.push(path);
  };

  handleEditMehfilKarkun = selectedRows => {
    if (selectedRows.length > 0) {
      this.setState({
        mehfilKarkuns: selectedRows,
        showEditForm: true,
      });
    }
  };

  handleEditMehfilKarkunSave = dutyDetail => {
    const { mehfilKarkuns } = this.state;
    const { setDutyDetail } = this.props;

    const ids = mehfilKarkuns.map(({ _id }) => _id);
    setDutyDetail({
      variables: {
        ids,
        dutyDetail,
      },
    }).catch(error => {
      message.error(error.message, 5);
    });

    this.setState({
      mehfilKarkuns: [],
      showEditForm: false,
    });
  };

  handleEditMehfilKarkunClose = () => {
    this.setState({
      mehfilKarkuns: [],
      showEditForm: false,
    });
  };

  render() {
    const {
      queryParams: { dutyId },
      match,
      mehfilLoading,
      mehfilById,
      allSecurityMehfilDutiesLoading,
      allSecurityMehfilDuties,
    } = this.props;
    const { mehfilId } = match.params;

    if (mehfilLoading || allSecurityMehfilDutiesLoading) return null;

    const { showEditForm } = this.state;
    const editForm = showEditForm ? (
      <EditForm
        onSave={this.handleEditMehfilKarkunSave}
        onCancel={this.handleEditMehfilKarkunClose}
      />
    ) : null;

    return (
      <>
        <List
          dutyId={dutyId}
          mehfilId={mehfilId}
          mehfilById={mehfilById}
          allSecurityMehfilDuties={allSecurityMehfilDuties}
          setPageParams={this.setPageParams}
          handleAddMehfilKarkun={this.handleAddMehfilKarkun}
          handleEditMehfilKarkun={this.handleEditMehfilKarkun}
          handleRemoveMehfilKarkun={this.handleRemoveMehfilKarkun}
          handleViewMehfilCards={this.handleViewMehfilCards}
        />
        <Modal
          title="Edit Duty Details"
          visible={showEditForm}
          onCancel={this.handleEditMehfilKarkunClose}
          width={600}
          footer={null}
        >
          <div>{editForm}</div>
        </Modal>
      </>
    );
  }
}

export default flowRight(
  graphql(ADD_MEHFIL_KARKUN, { name: 'addMehfilKarkun' }),
  graphql(SET_DUTY_DETAIL, { name: 'setDutyDetail' }),
  graphql(REMOVE_MEHFIL_KARKUN, { name: 'removeMehfilKarkun' }),
  WithQueryParams(),
  WithMehfilId(),
  WithMehfil(),
  WithAllMehfilDuties(),
  WithDynamicBreadcrumbs(({ mehfilById }) => {
    if (mehfilById) {
      return `Security, Mehfils, ${mehfilById.name}, Karkun Duties`;
    }
    return `Security, Mehfils, Karkun Duties`;
  })
)(ListContainer);
