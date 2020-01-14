import React, { Component } from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

import { Modal, message } from '/imports/ui/controls';
import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import {
  WithBreadcrumbs,
  WithQueryParams,
} from 'meteor/idreesia-common/composers/common';
import { SecuritySubModulePaths as paths } from '/imports/ui/modules/security';

import List from './list';
import EditForm from './edit-form';

class ListContainer extends Component {
  static propTypes = {
    addMehfilKarkun: PropTypes.func,
    updateMehfilKarkun: PropTypes.func,
    removeMehfilKarkun: PropTypes.func,

    match: PropTypes.object,
    history: PropTypes.object,
    location: PropTypes.object,
    queryString: PropTypes.string,
    queryParams: PropTypes.object,
  };

  state = {
    showEditForm: false,
    mehfilKarkun: null,
  };

  setPageParams = newParams => {
    const { queryParams, history, location } = this.props;
    const { dutyName } = newParams;

    let dutyNameVal;
    if (newParams.hasOwnProperty('dutyName')) dutyNameVal = dutyName || '';
    else dutyNameVal = queryParams.dutyName || '';

    const path = `${location.pathname}?dutyName=${dutyNameVal}`;
    history.push(path);
  };

  handleAddMehfilKarkun = karkunId => {
    const {
      match,
      addMehfilKarkun,
      queryParams: { dutyName },
    } = this.props;

    const { mehfilId } = match.params;

    addMehfilKarkun({
      variables: {
        mehfilId,
        karkunId,
        dutyName,
      },
    }).catch(error => {
      message.error(error.message, 5);
    });
  };

  handleRemoveMehfilKarkun = mehfilKarkunId => {
    const { removeMehfilKarkun } = this.props;
    removeMehfilKarkun({
      variables: {
        _id: mehfilKarkunId,
      },
    }).catch(error => {
      message.error(error.message, 5);
    });
  };

  handleViewMehfilCards = selectedRows => {
    if (!selectedRows || selectedRows.length === 0) return;

    const { history, match } = this.props;
    const { mehfilId } = match.params;
    const ids = selectedRows.map(row => row._id);
    const idsString = ids.join(',');
    const path = `${paths.mehfilsKarkunCardsPath(mehfilId)}?ids=${idsString}`;
    history.push(path);
  };

  handleEditMehfilKarkun = mehfilKarkun => {
    this.setState({
      mehfilKarkun,
      showEditForm: true,
    });
  };

  handleEditMehfilKarkunSave = dutyDetail => {
    const { mehfilKarkun } = this.state;
    const { updateMehfilKarkun } = this.props;

    if (dutyDetail !== mehfilKarkun.dutyDetail) {
      updateMehfilKarkun({
        variables: {
          _id: mehfilKarkun._id,
          dutyDetail,
        },
      }).catch(error => {
        message.error(error.message, 5);
      });
    }

    this.setState({
      mehfilKarkun: null,
      showEditForm: false,
    });
  };

  handleEditMehfilKarkunClose = () => {
    this.setState({
      mehfilKarkun: null,
      showEditForm: false,
    });
  };

  render() {
    const {
      match,
      queryParams: { dutyName },
    } = this.props;

    const { mehfilId } = match.params;
    const { showEditForm, mehfilKarkun } = this.state;

    const editForm = showEditForm ? (
      <EditForm
        mehfilKarkun={mehfilKarkun}
        onSave={this.handleEditMehfilKarkunSave}
        onCancel={this.handleEditMehfilKarkunClose}
      />
    ) : null;

    return (
      <>
        <List
          mehfilId={mehfilId}
          dutyName={dutyName}
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

const addMutation = gql`
  mutation addMehfilKarkun(
    $mehfilId: String!
    $karkunId: String!
    $dutyName: String!
  ) {
    addMehfilKarkun(
      mehfilId: $mehfilId
      karkunId: $karkunId
      dutyName: $dutyName
    ) {
      _id
      mehfilId
      karkunId
      dutyName
      dutyDetail
      dutyCardBarcodeId
    }
  }
`;

const editMutation = gql`
  mutation updateMehfilKarkun($_id: String!, $dutyDetail: String!) {
    updateMehfilKarkun(_id: $_id, dutyDetail: $dutyDetail) {
      _id
      mehfilId
      karkunId
      dutyName
      dutyDetail
      dutyCardBarcodeId
    }
  }
`;

const removeMutation = gql`
  mutation removeMehfilKarkun($_id: String!) {
    removeMehfilKarkun(_id: $_id)
  }
`;

export default flowRight(
  graphql(addMutation, {
    name: 'addMehfilKarkun',
    options: {
      refetchQueries: ['mehfilKarkunsByMehfilId'],
    },
  }),
  graphql(editMutation, {
    name: 'updateMehfilKarkun',
    options: {
      refetchQueries: ['mehfilKarkunsByMehfilId'],
    },
  }),
  graphql(removeMutation, {
    name: 'removeMehfilKarkun',
    options: {
      refetchQueries: ['mehfilKarkunsByMehfilId'],
    },
  }),
  WithQueryParams(),
  WithBreadcrumbs(['Security', 'Mehfils', 'Karkuns'])
)(ListContainer);
