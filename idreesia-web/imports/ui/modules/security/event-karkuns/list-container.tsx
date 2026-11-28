import React, { Component } from 'react';
import { useMutation } from '@apollo/client/react';
import { type History, type Location } from 'history';

import { Modal, Spin } from 'antd';
import { message } from '/imports/ui/antd-feedback';
import { useQueryParams } from 'meteor/idreesia-common/hooks/common';
import type {
  SecurityEventByIdQuery,
  SecurityEventKarkunsByEventIdQuery,
} from 'meteor/idreesia-common/types/client-operations';
import { SecuritySubModulePaths as paths } from '/imports/ui/modules/security';
import {
  useEvent,
  useAllSecurityEventDuties,
  type SecurityEventDuty,
} from '/imports/ui/modules/security/common/hooks';

import List, { type PageParams } from './list';
import EditForm from './edit-form';
import {
  ADD_SECURITY_EVENT_KARKUN,
  SET_DUTY_DETAIL,
  REMOVE_SECURITY_EVENT_KARKUN,
} from './gql';

type EventRecord = NonNullable<SecurityEventByIdQuery['securityEventById']>;

type EventKarkun = NonNullable<
  NonNullable<
    SecurityEventKarkunsByEventIdQuery['securityEventKarkunsByEventId']
  >[number]
>;

interface ListContainerProps {
  addSecurityEventKarkun(options: { variables: { eventId: string; karkunId: string; dutyId?: string } }): Promise<unknown>;
  setDutyDetail(options: { variables: { ids: string[]; dutyDetail: string } }): Promise<unknown>;
  removeSecurityEventKarkun(options: { variables: { _id: string } }): Promise<unknown>;
  eventLoading?: boolean;
  securityEventById?: EventRecord | null;
  allSecurityEventDutiesLoading?: boolean;
  allSecurityEventDuties: SecurityEventDuty[];
  refetchAllSecurityEventDuties(): void;
  eventId: string;
  history: History;
  location: Location;
  queryParams: PageParams;
}

interface ListContainerState {
  showEditForm: boolean;
  eventKarkuns: EventKarkun[];
}

class ListContainer extends Component<ListContainerProps, ListContainerState> {
  state = {
    showEditForm: false,
    eventKarkuns: [] as EventKarkun[],
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

  handleAddEventKarkun = (karkunId: string, refetchQuery: () => void) => {
    const {
      eventId,
      addSecurityEventKarkun,
      refetchAllSecurityEventDuties,
      queryParams: { dutyId },
    } = this.props;

    addSecurityEventKarkun({
      variables: {
        eventId,
        karkunId,
        dutyId,
      },
    })
      .then(() => {
        refetchQuery();
        refetchAllSecurityEventDuties();
      })
      .catch((error: Error) => {
        message.error(error.message, 5);
      });
  };

  handleRemoveEventKarkun = (eventKarkunId: string, refetchQuery: () => void) => {
    const { removeSecurityEventKarkun, refetchAllSecurityEventDuties } = this.props;
    removeSecurityEventKarkun({
      variables: {
        _id: eventKarkunId,
      },
    })
      .then(() => {
        refetchQuery();
        refetchAllSecurityEventDuties();
      })
      .catch((error: Error) => {
        message.error(error.message, 5);
      });
  };

  handleViewPrintCards = (selectedRows: EventKarkun[]) => {
    const {
      history,
      eventId,
      queryParams: { dutyId },
    } = this.props;
    const ids = selectedRows.map((row) => row._id ?? '').filter(Boolean);
    const idsString = ids.join(',');
    const path = `${paths.eventsKarkunPrintCardsPath(
      eventId
    )}?dutyId=${dutyId}&ids=${idsString}`;
    history.push(path);
  };

  handleViewPrintList = (selectedRows: EventKarkun[]) => {
    const {
      history,
      eventId,
      queryParams: { dutyId },
    } = this.props;
    const ids = selectedRows.map((row) => row._id ?? '').filter(Boolean);
    const idsString = ids.join(',');
    const path = `${paths.eventsKarkunPrintListPath(
      eventId
    )}?dutyId=${dutyId}&ids=${idsString}`;
    history.push(path);
  };

  handleEditEventKarkun = (selectedRows: EventKarkun[]) => {
    if (selectedRows.length > 0) {
      this.setState({
        eventKarkuns: selectedRows,
        showEditForm: true,
      });
    }
  };

  handleEditEventKarkunSave = (dutyDetail?: string) => {
    const { eventKarkuns } = this.state;
    const { setDutyDetail } = this.props;

    const ids = eventKarkuns.map(({ _id }) => _id ?? '').filter(Boolean);
    setDutyDetail({
      variables: {
        ids,
        dutyDetail: dutyDetail ?? '',
      },
    }).catch((error: Error) => {
      message.error(error.message, 5);
    });

    this.setState({
      eventKarkuns: [],
      showEditForm: false,
    });
  };

  handleEditEventKarkunClose = () => {
    this.setState({
      eventKarkuns: [],
      showEditForm: false,
    });
  };

  render() {
    const {
      queryParams: { dutyId },
      eventId,
      eventLoading,
      securityEventById,
      allSecurityEventDutiesLoading,
      allSecurityEventDuties,
    } = this.props;

    if (eventLoading || allSecurityEventDutiesLoading) {
      return (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <Spin size="large" />
        </div>
      );
    }

    if (!securityEventById) return null;

    const { showEditForm } = this.state;
    const editForm = showEditForm ? (
      <EditForm
        onSave={this.handleEditEventKarkunSave}
        onCancel={this.handleEditEventKarkunClose}
      />
    ) : null;

    return (
      <>
        <List
          dutyId={dutyId}
          eventId={eventId}
          securityEventById={securityEventById}
          allSecurityEventDuties={allSecurityEventDuties}
          setPageParams={this.setPageParams}
          handleAddEventKarkun={this.handleAddEventKarkun}
          handleEditEventKarkun={this.handleEditEventKarkun}
          handleRemoveEventKarkun={this.handleRemoveEventKarkun}
          handleViewPrintCards={this.handleViewPrintCards}
          handleViewPrintList={this.handleViewPrintList}
        />
        <Modal
          title="Edit Duty Details"
          open={showEditForm}
          onCancel={this.handleEditEventKarkunClose}
          width={600}
          footer={null}
        >
          <div>{editForm}</div>
        </Modal>
      </>
    );
  }
}

interface EventKarkunsProps {
  eventId: string;
  history: History;
  location: Location;
}

const EventKarkuns = ({ eventId, history, location }: EventKarkunsProps) => {
  const { queryParams } = useQueryParams({ history, location });
  const { eventLoading, securityEventById } = useEvent(eventId);
  const {
    allSecurityEventDutiesLoading,
    allSecurityEventDuties,
    refetchAllSecurityEventDuties,
  } = useAllSecurityEventDuties(eventId);

  const [addSecurityEventKarkun] = useMutation(ADD_SECURITY_EVENT_KARKUN);
  const [setDutyDetail] = useMutation(SET_DUTY_DETAIL);
  const [removeSecurityEventKarkun] = useMutation(REMOVE_SECURITY_EVENT_KARKUN);

  return (
    <ListContainer
      addSecurityEventKarkun={addSecurityEventKarkun}
      setDutyDetail={setDutyDetail}
      removeSecurityEventKarkun={removeSecurityEventKarkun}
      eventLoading={eventLoading}
      securityEventById={securityEventById}
      allSecurityEventDutiesLoading={allSecurityEventDutiesLoading}
      allSecurityEventDuties={allSecurityEventDuties}
      refetchAllSecurityEventDuties={refetchAllSecurityEventDuties}
      eventId={eventId}
      history={history}
      location={location}
      queryParams={{ dutyId: String(queryParams.dutyId || '') }}
    />
  );
};

export default EventKarkuns;
