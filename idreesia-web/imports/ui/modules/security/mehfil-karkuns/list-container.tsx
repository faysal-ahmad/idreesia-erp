import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { useMutation } from '@apollo/client/react';

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

const AntModal = Modal as any;
const KarkunsList = List as any;

interface HistoryLike { push(path: string): void; }
interface LocationLike { pathname: string; }
interface MatchLike { params: { mehfilId: string }; }
interface QueryParams { dutyId?: string; }
interface MehfilKarkun { _id: string; }
interface MehfilRecord { name?: string; }
type MutationFn = (args: unknown) => Promise<unknown>;

interface ListContainerProps {
  addMehfilKarkun: MutationFn;
  setDutyDetail: MutationFn;
  removeMehfilKarkun: MutationFn;
  mehfilLoading?: boolean;
  mehfilById?: MehfilRecord | null;
  allSecurityMehfilDutiesLoading?: boolean;
  allSecurityMehfilDuties?: unknown[];
  refetchAllSecurityMehfilDuties(): void;
  match: MatchLike;
  history: HistoryLike;
  location: LocationLike;
  queryString?: string;
  queryParams: QueryParams;
}

interface ListContainerState {
  showEditForm: boolean;
  mehfilKarkuns: MehfilKarkun[];
}

class ListContainer extends Component<ListContainerProps, ListContainerState> {
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

  setPageParams = (newParams: QueryParams) => {
    const { queryParams, history, location } = this.props;
    const { dutyId } = newParams;

    let dutyIdVal;
    if (Object.prototype.hasOwnProperty.call(newParams, 'dutyId')) dutyIdVal = dutyId || '';
    else dutyIdVal = queryParams.dutyId || '';

    const path = `${location.pathname}?dutyId=${dutyIdVal}`;
    history.push(path);
  };

  handleAddMehfilKarkun = (karkunId: string, refetchQuery: () => void) => {
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
      .catch((error: Error) => {
        message.error(error.message, 5);
      });
  };

  handleRemoveMehfilKarkun = (mehfilKarkunId: string, refetchQuery: () => void) => {
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
      .catch((error: Error) => {
        message.error(error.message, 5);
      });
  };

  handleViewPrintCards = (selectedRows: MehfilKarkun[]) => {
    const {
      history,
      match,
      queryParams: { dutyId },
    } = this.props;
    const { mehfilId } = match.params;
    const ids = selectedRows.map((row: MehfilKarkun) => row._id);
    const idsString = ids.join(',');
    const path = `${paths.mehfilsKarkunPrintCardsPath(
      mehfilId
    )}?dutyId=${dutyId}&ids=${idsString}`;
    history.push(path);
  };

  handleViewPrintList = (selectedRows: MehfilKarkun[]) => {
    const {
      history,
      match,
      queryParams: { dutyId },
    } = this.props;
    const { mehfilId } = match.params;
    const ids = selectedRows.map((row: MehfilKarkun) => row._id);
    const idsString = ids.join(',');
    const path = `${paths.mehfilsKarkunPrintListPath(
      mehfilId
    )}?dutyId=${dutyId}&ids=${idsString}`;
    history.push(path);
  };

  handleEditMehfilKarkun = (selectedRows: MehfilKarkun[]) => {
    if (selectedRows.length > 0) {
      this.setState({
        mehfilKarkuns: selectedRows,
        showEditForm: true,
      });
    }
  };

  handleEditMehfilKarkunSave = (dutyDetail?: string) => {
    const { mehfilKarkuns } = this.state;
    const { setDutyDetail } = this.props;

    const ids = mehfilKarkuns.map(({ _id }: MehfilKarkun) => _id);
    setDutyDetail({
      variables: {
        ids,
        dutyDetail,
      },
    }).catch((error: Error) => {
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
        <KarkunsList
          dutyId={dutyId}
          mehfilId={mehfilId}
          mehfilById={mehfilById}
          allSecurityMehfilDuties={allSecurityMehfilDuties}
          setPageParams={this.setPageParams}
          handleAddMehfilKarkun={this.handleAddMehfilKarkun}
          handleEditMehfilKarkun={this.handleEditMehfilKarkun}
          handleRemoveMehfilKarkun={this.handleRemoveMehfilKarkun}
          handleViewPrintCards={this.handleViewPrintCards}
          handleViewPrintList={this.handleViewPrintList}
        />
        <AntModal
          title="Edit Duty Details"
          open={showEditForm}
          onCancel={this.handleEditMehfilKarkunClose}
          width={600}
          footer={null}
        >
          <div>{editForm}</div>
        </AntModal>
      </>
    );
  }
}

const ListContainerWithData = (props: any) => {
  const [addMehfilKarkun] = useMutation(ADD_MEHFIL_KARKUN as any);
  const [setDutyDetail] = useMutation(SET_DUTY_DETAIL as any);
  const [removeMehfilKarkun] = useMutation(REMOVE_MEHFIL_KARKUN as any);

  return (
    <ListContainer
      {...props}
      addMehfilKarkun={addMehfilKarkun}
      setDutyDetail={setDutyDetail}
      removeMehfilKarkun={removeMehfilKarkun}
    />
  );
};

export default flowRight(
  WithQueryParams(),
  WithMehfilId(),
  WithMehfil(),
  WithAllMehfilDuties(),
  WithDynamicBreadcrumbs(({ mehfilById }: { mehfilById?: MehfilRecord }) => {
    if (mehfilById) {
      return `Security, Mehfils, ${mehfilById.name}, Karkun Duties`;
    }
    return `Security, Mehfils, Karkun Duties`;
  })
)(ListContainerWithData as any);
