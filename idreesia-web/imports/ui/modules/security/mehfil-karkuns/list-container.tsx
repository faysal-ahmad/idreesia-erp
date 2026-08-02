import React, { Component } from 'react';
import { useMutation } from '@apollo/client/react';
import { type History, type Location } from 'history';

import { Modal, Spin, message } from 'antd';
import { useQueryParams } from 'meteor/idreesia-common/hooks/common';
import type {
  MehfilByIdQuery,
  MehfilKarkunsByMehfilIdQuery,
} from 'meteor/idreesia-common/types/client-operations';
import { SecuritySubModulePaths as paths } from '/imports/ui/modules/security';
import {
  useMehfil,
  useAllSecurityMehfilDuties,
  type SecurityMehfilDuty,
} from '/imports/ui/modules/security/common/hooks';

import List, { type PageParams } from './list';
import EditForm from './edit-form';
import {
  ADD_MEHFIL_KARKUN,
  SET_DUTY_DETAIL,
  REMOVE_MEHFIL_KARKUN,
} from './gql';

type MehfilRecord = NonNullable<MehfilByIdQuery['mehfilById']>;

type MehfilKarkun = NonNullable<
  NonNullable<
    MehfilKarkunsByMehfilIdQuery['mehfilKarkunsByMehfilId']
  >[number]
>;

interface ListContainerProps {
  addMehfilKarkun(options: { variables: { mehfilId: string; karkunId: string; dutyId?: string } }): Promise<unknown>;
  setDutyDetail(options: { variables: { ids: string[]; dutyDetail: string } }): Promise<unknown>;
  removeMehfilKarkun(options: { variables: { _id: string } }): Promise<unknown>;
  mehfilLoading?: boolean;
  mehfilById?: MehfilRecord | null;
  allSecurityMehfilDutiesLoading?: boolean;
  allSecurityMehfilDuties: SecurityMehfilDuty[];
  refetchAllSecurityMehfilDuties(): void;
  mehfilId: string;
  history: History;
  location: Location;
  queryParams: PageParams;
}

interface ListContainerState {
  showEditForm: boolean;
  mehfilKarkuns: MehfilKarkun[];
}

class ListContainer extends Component<ListContainerProps, ListContainerState> {
  state = {
    showEditForm: false,
    mehfilKarkuns: [] as MehfilKarkun[],
  };

  setPageParams = (newParams: PageParams) => {
    const { queryParams, history, location } = this.props;
    const { dutyId } = newParams;

    let dutyIdVal;
    if (Object.prototype.hasOwnProperty.call(newParams, 'dutyId')) dutyIdVal = dutyId || '';
    else dutyIdVal = queryParams.dutyId || '';

    const searchParams = new URLSearchParams(location.search);
    searchParams.set('dutyId', dutyIdVal);
    history.push(`${location.pathname}?${searchParams.toString()}`);
  };

  handleAddMehfilKarkun = (karkunId: string, refetchQuery: () => void) => {
    const {
      mehfilId,
      addMehfilKarkun,
      refetchAllSecurityMehfilDuties,
      queryParams: { dutyId },
    } = this.props;

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
      mehfilId,
      queryParams: { dutyId },
    } = this.props;
    const ids = selectedRows.map((row) => row._id ?? '').filter(Boolean);
    const idsString = ids.join(',');
    const path = `${paths.mehfilsKarkunPrintCardsPath(
      mehfilId
    )}?dutyId=${dutyId}&ids=${idsString}`;
    history.push(path);
  };

  handleViewPrintList = (selectedRows: MehfilKarkun[]) => {
    const {
      history,
      mehfilId,
      queryParams: { dutyId },
    } = this.props;
    const ids = selectedRows.map((row) => row._id ?? '').filter(Boolean);
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

    const ids = mehfilKarkuns.map(({ _id }) => _id ?? '').filter(Boolean);
    setDutyDetail({
      variables: {
        ids,
        dutyDetail: dutyDetail ?? '',
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
      mehfilId,
      mehfilLoading,
      mehfilById,
      allSecurityMehfilDutiesLoading,
      allSecurityMehfilDuties,
    } = this.props;

    if (mehfilLoading || allSecurityMehfilDutiesLoading) {
      return (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <Spin size="large" />
        </div>
      );
    }

    if (!mehfilById) return null;

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
          handleViewPrintCards={this.handleViewPrintCards}
          handleViewPrintList={this.handleViewPrintList}
        />
        <Modal
          title="Edit Duty Details"
          open={showEditForm}
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

interface MehfilKarkunsProps {
  mehfilId: string;
  history: History;
  location: Location;
}

const MehfilKarkuns = ({ mehfilId, history, location }: MehfilKarkunsProps) => {
  const { queryParams } = useQueryParams({ history, location });
  const { mehfilLoading, mehfilById } = useMehfil(mehfilId);
  const {
    allSecurityMehfilDutiesLoading,
    allSecurityMehfilDuties,
    refetchAllSecurityMehfilDuties,
  } = useAllSecurityMehfilDuties(mehfilId);

  const [addMehfilKarkun] = useMutation(ADD_MEHFIL_KARKUN);
  const [setDutyDetail] = useMutation(SET_DUTY_DETAIL);
  const [removeMehfilKarkun] = useMutation(REMOVE_MEHFIL_KARKUN);

  return (
    <ListContainer
      addMehfilKarkun={addMehfilKarkun}
      setDutyDetail={setDutyDetail}
      removeMehfilKarkun={removeMehfilKarkun}
      mehfilLoading={mehfilLoading}
      mehfilById={mehfilById}
      allSecurityMehfilDutiesLoading={allSecurityMehfilDutiesLoading}
      allSecurityMehfilDuties={allSecurityMehfilDuties}
      refetchAllSecurityMehfilDuties={refetchAllSecurityMehfilDuties}
      mehfilId={mehfilId}
      history={history}
      location={location}
      queryParams={{ dutyId: String(queryParams.dutyId || '') }}
    />
  );
};

export default MehfilKarkuns;
