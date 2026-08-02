import React, { Component } from 'react';
import { useQuery } from '@apollo/client/react';
import dayjs from 'dayjs';
import { Button, Row, Select, Table, Tooltip } from 'antd';
import { EditOutlined, PrinterOutlined, UsergroupAddOutlined, UsergroupDeleteOutlined } from '@ant-design/icons';
import type { CSSProperties } from 'react';

import { Formats } from 'meteor/idreesia-common/constants';
import { sortBy } from 'meteor/idreesia-common/utilities/lodash';
import type {
  MehfilByIdQuery,
  MehfilKarkunsByMehfilIdQuery,
} from 'meteor/idreesia-common/types/client-operations';
import { PersonName, PeopleSelectionButton } from '/imports/ui/modules/helpers/controls';
import type { SecurityMehfilDuty } from '/imports/ui/modules/security/common/hooks';

import { MEHFIL_KARKUNS_BY_MEHFIL_ID } from './gql';

const SelectStyle: CSSProperties = {
  width: '300px',
};

type MehfilRecord = NonNullable<MehfilByIdQuery['mehfilById']>;

type MehfilKarkun = NonNullable<
  NonNullable<
    MehfilKarkunsByMehfilIdQuery['mehfilKarkunsByMehfilId']
  >[number]
>;

export interface PageParams {
  dutyId?: string;
}

interface ListProps {
  dutyId?: string;
  mehfilId: string;
  mehfilById: MehfilRecord;
  allSecurityMehfilDuties: SecurityMehfilDuty[];
  setPageParams(params: PageParams): void;
  mehfilKarkunsLoading?: boolean;
  mehfilKarkunsByMehfilId?: MehfilKarkun[];
  refetchMehfilKarkuns(): void;
  handleAddMehfilKarkun(karkunId: string, refetchQuery: () => void): void;
  handleEditMehfilKarkun(selectedRows: MehfilKarkun[]): void;
  handleRemoveMehfilKarkun(mehfilKarkunId: string, refetchQuery: () => void): void;
  handleViewPrintCards(selectedRows: MehfilKarkun[]): void;
  handleViewPrintList(selectedRows: MehfilKarkun[]): void;
}

interface ListState {
  selectedRows: MehfilKarkun[];
}

interface ListWithDataProps extends Omit<ListProps, 'mehfilKarkunsByMehfilId' | 'refetchMehfilKarkuns'> {}

export class List extends Component<ListProps, ListState> {
  state = {
    selectedRows: [] as MehfilKarkun[],
  };

  getIsPastMehfil = (mehfilById: MehfilRecord) => {
    const mehfilDate = dayjs(Number(mehfilById.mehfilDate));
    return dayjs().diff(
      dayjs(mehfilDate, Formats.DATE_FORMAT),
      'days'
      ) > 30;
  };

  getColumns = (isPastMehfil: boolean, allSecurityMehfilDuties: SecurityMehfilDuty[]): any[] => {
    const columns: any[] = [
      {
        title: 'Name',
        key: 'karkun.name',
        render: (_text: unknown, record: MehfilKarkun) => {
          const personNameData = {
            _id: record._id ?? '',
            name: record.karkun?.sharedData?.name ?? '',
            imageId: record.karkun?.sharedData?.imageId ?? undefined,
          };

          return (
            <PersonName
              person={personNameData}
              onPersonNameClicked={() => {}}
            />
          );
        },
      },
      {
        title: 'City',
        key: 'cityCountry',
        render: (_text: unknown, record: MehfilKarkun) => {
          if (record.karkun?.isKarkun && record.karkun.karkunData?.city) {
            return record.karkun.karkunData.city.name;
          } else if (record.karkun?.visitorData?.city) {
            return record.karkun.visitorData.city;
          }

          return '';
        },
      },
      {
        title: 'CNIC',
        key: 'cnicNumber',
        render: (_text: unknown, record: MehfilKarkun) => record.karkun?.sharedData?.cnicNumber,
      },
      {
        title: 'Contact No.',
        key: 'contactNumbers',
        render: (_text: unknown, record: MehfilKarkun) => {
          const numbers: React.ReactNode[] = [];
          if (record.karkun?.sharedData?.contactNumber1)
            numbers.push(<Row key="1">{record.karkun.sharedData.contactNumber1}</Row>);
          if (record.karkun?.sharedData?.contactNumber2)
            numbers.push(<Row key="2">{record.karkun.sharedData.contactNumber2}</Row>);

          if (numbers.length === 0) return '';
          return <>{numbers}</>;
        },
      },
      {
        title: 'Duty Name',
        dataIndex: 'dutyId',
        key: 'dutyId',
        render: (text: string | null) => {
          const duty = allSecurityMehfilDuties.find((mehfilDuty) => mehfilDuty._id === text);
          return duty?.name;
        },
      },
      {
        title: 'Duty Detail',
        dataIndex: 'dutyDetail',
        key: 'dutyDetail',
      },
    ];

    if (!isPastMehfil) {
      columns.push({
        key: 'action',
        render: (_text: unknown, record: MehfilKarkun) => (
          <div className="list-actions-column">
            <Tooltip key="delete" title="Remove Karkun">
              <UsergroupDeleteOutlined
                className="list-actions-icon"
                onClick={() => {
                  const {
                    handleRemoveMehfilKarkun,
                    refetchMehfilKarkuns,
                  } = this.props;
                  handleRemoveMehfilKarkun(record._id ?? '', refetchMehfilKarkuns);
                }}
              />
            </Tooltip>
          </div>
        ),
      });
    }
    return columns;
  };

  rowSelection = {
    onChange: (_selectedRowKeys: React.Key[], selectedRows: MehfilKarkun[]) => {
      this.setState({
        selectedRows,
      });
    },
  };

  handleSelectionChange = (value?: string) => {
    const { setPageParams } = this.props;
    setPageParams({
      dutyId: value,
    });
    this.setState({
      selectedRows: [],
    });
  };

  handleEditDutyDetails = () => {
    const { handleEditMehfilKarkun } = this.props;
    const { selectedRows } = this.state;
    if (handleEditMehfilKarkun) {
      handleEditMehfilKarkun(selectedRows);
    }
  };

  handleViewPrintCards = () => {
    const { handleViewPrintCards } = this.props;
    const { selectedRows } = this.state;
    if (handleViewPrintCards) {
      handleViewPrintCards(selectedRows);
    }
  };

  handleViewPrintList = () => {
    const { handleViewPrintList } = this.props;
    const { selectedRows } = this.state;
    if (handleViewPrintList) {
      handleViewPrintList(selectedRows);
    }
  };

  onKarkunSelection = (karkun: { _id: string }) => {
    const { handleAddMehfilKarkun, refetchMehfilKarkuns } = this.props;
    handleAddMehfilKarkun(karkun._id, refetchMehfilKarkuns);
  };

  getTableHeader = () => {
    const { mehfilById, allSecurityMehfilDuties, dutyId } = this.props;
    const { selectedRows } = this.state;
    const isPastMehfil = this.getIsPastMehfil(mehfilById);

    const options = allSecurityMehfilDuties.map(duty => (
      <Select.Option key={duty._id ?? ''} value={duty._id ?? ''}>
        {`${duty.name} - ${duty.mehfilUsedCount}`}
      </Select.Option>
    ));

    const dutySelector = (
      <Select
        defaultValue={dutyId}
        style={SelectStyle}
        onChange={this.handleSelectionChange}
        allowClear
        dropdownMatchSelectWidth
      >
        {options}
      </Select>
    );

    const actions = (
      <div className="list-table-header-section">
        <PeopleSelectionButton
          icon={<UsergroupAddOutlined />}
          label="Add Karkuns"
          onSelection={this.onKarkunSelection}
          disabled={isPastMehfil || !dutyId}
        />
        &nbsp;&nbsp;
        <Button
          disabled={isPastMehfil || !(selectedRows && selectedRows.length > 0)}
          icon={<EditOutlined />}
          size="large"
          onClick={this.handleEditDutyDetails}
        >
          Edit Duty Detail
        </Button>
        &nbsp;&nbsp;
        <Button
          disabled={isPastMehfil}
          icon={<PrinterOutlined />}
          size="large"
          onClick={this.handleViewPrintCards}
        >
          Print Cards
        </Button>
        &nbsp;&nbsp;
        <Button
          disabled={isPastMehfil}
          icon={<PrinterOutlined />}
          size="large"
          onClick={this.handleViewPrintList}
        >
          Print List
        </Button>
      </div>
    );

    return (
      <div className="list-table-header">
        <div>{dutySelector}</div>
        {actions}
      </div>
    );
  };

  render() {
    const {
      mehfilById,
      mehfilKarkunsLoading,
      mehfilKarkunsByMehfilId,
      allSecurityMehfilDuties,
    } = this.props;
    if (mehfilKarkunsLoading) return null;

    const isPastMehfil = this.getIsPastMehfil(mehfilById);
    const sortedMehfilKarkuns = sortBy(mehfilKarkunsByMehfilId ?? [], 'karkun.sharedData.name');

    return (
      <Table
        rowKey="_id"
        size="small"
        title={this.getTableHeader}
        columns={this.getColumns(isPastMehfil, allSecurityMehfilDuties)}
        rowSelection={!isPastMehfil ? this.rowSelection : undefined}
        dataSource={sortedMehfilKarkuns}
        pagination={false}
        bordered
      />
    );
  }
}

const ListWithData = (props: ListWithDataProps) => {
  const { mehfilId, dutyId } = props;
  const { data, loading, refetch } = useQuery(MEHFIL_KARKUNS_BY_MEHFIL_ID, {
    fetchPolicy: 'cache-and-network',
    variables: {
      mehfilId,
      dutyId,
    },
  });

  const mehfilKarkunsByMehfilId = (data?.mehfilKarkunsByMehfilId ?? []).filter(
    (row): row is MehfilKarkun => row != null
  );

  return (
    <List
      {...props}
      mehfilKarkunsByMehfilId={mehfilKarkunsByMehfilId}
      mehfilKarkunsLoading={loading}
      refetchMehfilKarkuns={refetch}
    />
  );
};

export default ListWithData;
