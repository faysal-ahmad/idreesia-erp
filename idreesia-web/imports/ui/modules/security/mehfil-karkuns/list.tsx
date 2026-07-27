import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { useQuery } from '@apollo/client/react';
import dayjs from 'dayjs';
import { Button, Row, Select, Table, Tooltip } from 'antd';
import { EditOutlined, PrinterOutlined, UsergroupAddOutlined, UsergroupDeleteOutlined } from '@ant-design/icons';

import { Formats } from 'meteor/idreesia-common/constants';
import { sortBy } from 'meteor/idreesia-common/utilities/lodash';
import { PersonName, PeopleSelectionButton } from '/imports/ui/modules/helpers/controls';

import { MEHFIL_KARKUNS_BY_MEHFIL_ID } from './gql';

const AntButton = Button as any;
const AntRow = Row as any;
const AntSelect = Select as any;
const AntTable = Table as any;
const AntTooltip = Tooltip as any;
const AntEditOutlined = EditOutlined as any;
const AntPrinterOutlined = PrinterOutlined as any;
const AntUsergroupAddOutlined = UsergroupAddOutlined as any;
const AntUsergroupDeleteOutlined = UsergroupDeleteOutlined as any;
const PersonNameComponent = PersonName as any;
const PeopleSelectionButtonComponent = PeopleSelectionButton as any;

const SelectStyle = {
  width: '300px',
};

interface SharedData {
  name?: string;
  imageId?: string;
  image?: unknown;
  cnicNumber?: string;
  contactNumber1?: string;
  contactNumber2?: string;
}

interface KarkunRecord {
  sharedData: SharedData;
  isKarkun?: boolean;
  karkunData?: { city?: { name?: string } };
  visitorData?: { city?: string };
}

interface MehfilKarkun {
  _id: string;
  karkun: KarkunRecord;
  dutyId?: string;
  dutyDetail?: string;
}

interface MehfilDuty {
  _id: string;
  name?: string;
  mehfilUsedCount?: number;
}

interface MehfilRecord {
  mehfilDate: string | number;
}

interface ListProps {
  dutyId?: string;
  mehfilId: string;
  mehfilById: MehfilRecord;
  allSecurityMehfilDuties: MehfilDuty[];
  setPageParams(params: Record<string, unknown>): void;
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
interface MehfilKarkunsData { mehfilKarkunsByMehfilId?: MehfilKarkun[]; }

export class List extends Component<ListProps, ListState> {
  static propTypes = {
    dutyId: PropTypes.string,
    mehfilId: PropTypes.string,
    mehfilById: PropTypes.object,
    allSecurityMehfilDuties: PropTypes.array,
    setPageParams: PropTypes.func,

    mehfilKarkunsLoading: PropTypes.bool,
    mehfilKarkunsByMehfilId: PropTypes.array,
    refetchMehfilKarkuns: PropTypes.func,
    handleAddMehfilKarkun: PropTypes.func,
    handleEditMehfilKarkun: PropTypes.func,
    handleRemoveMehfilKarkun: PropTypes.func,
    handleViewPrintCards: PropTypes.func,
    handleViewPrintList: PropTypes.func,
  };

  state = {
    selectedRows: [],
  };

  getIsPastMehfil = (mehfilById: MehfilRecord) => {
    const mehfilDate = dayjs(Number(mehfilById.mehfilDate));
    return dayjs().diff(
      dayjs(mehfilDate, Formats.DATE_FORMAT),
      'days'
      ) > 30;
  }

  getColumns = (isPastMehfil: boolean, allSecurityMehfilDuties: MehfilDuty[]): any[] => {
    const columns: any[] = [
      {
        title: 'Name',
        key: 'karkun.name',
        render: (_text: unknown, record: MehfilKarkun) => {
          const personNameData = {
            _id: record._id,
            name: record.karkun.sharedData.name,
            imageId: record.karkun.sharedData.imageId,
            image: record.karkun.sharedData.image,
          };
    
          return (
            <PersonNameComponent
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
          if (record.karkun.isKarkun && record.karkun.karkunData?.city) {
            return record.karkun.karkunData.city.name;
          } else if (record.karkun.visitorData?.city) {
            return record.karkun.visitorData?.city;
          }

          return '';
        },
      },
      {
        title: 'CNIC',
        key: 'cnicNumber',
        render: (_text: unknown, record: MehfilKarkun) => record.karkun.sharedData?.cnicNumber,
      },
      {
        title: 'Contact No.',
        key: 'contactNumbers',
        render: (_text: unknown, record: MehfilKarkun) => {
          const numbers: React.ReactNode[] = [];
          if (record.karkun.sharedData?.contactNumber1)
            numbers.push(<AntRow key="1">{record.karkun.sharedData?.contactNumber1}</AntRow>);
          if (record.karkun.sharedData.contactNumber2)
            numbers.push(<AntRow key="2">{record.karkun.sharedData?.contactNumber2}</AntRow>);
    
          if (numbers.length === 0) return '';
          return <>{numbers}</>;
        },
      },
      {
        title: 'Duty Name',
        dataIndex: 'dutyId',
        key: 'dutyId',
        render: (text: string) => {
          const duty = allSecurityMehfilDuties.find((mehfilDuty: MehfilDuty) => mehfilDuty._id === text);
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
            <AntTooltip key="delete" title="Remove Karkun">
              <AntUsergroupDeleteOutlined
                className="list-actions-icon"
                onClick={() => {
                  const {
                    handleRemoveMehfilKarkun,
                    refetchMehfilKarkuns,
                  } = this.props;
                  handleRemoveMehfilKarkun(record._id, refetchMehfilKarkuns);
                }}
              />
            </AntTooltip>
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
      <AntSelect.Option key={duty._id} value={duty._id}>
        {`${duty.name} - ${duty.mehfilUsedCount}`}
      </AntSelect.Option>
    ));

    const dutySelector = (
      <AntSelect
        defaultValue={dutyId}
        style={SelectStyle}
        onChange={this.handleSelectionChange}
        allowClear
        dropdownMatchSelectWidth
      >
        {options}
      </AntSelect>
    );

    const actions = (
      <div className="list-table-header-section">
        <PeopleSelectionButtonComponent
          icon={<AntUsergroupAddOutlined />}
          label="Add Karkuns"
          onSelection={this.onKarkunSelection}
          disabled={isPastMehfil || !dutyId}
        />
        &nbsp;&nbsp;
        <AntButton
          disabled={isPastMehfil || !(selectedRows && selectedRows.length > 0)}
          icon={<AntEditOutlined />}
          size="large"
          onClick={this.handleEditDutyDetails}
        >
          Edit Duty Detail
        </AntButton>
        &nbsp;&nbsp;
        <AntButton
          disabled={isPastMehfil}
          icon={<AntPrinterOutlined />}
          size="large"
          onClick={this.handleViewPrintCards}
        >
          Print Cards
        </AntButton>
        &nbsp;&nbsp;
        <AntButton
          disabled={isPastMehfil}
          icon={<AntPrinterOutlined />}
          size="large"
          onClick={this.handleViewPrintList}
        >
          Print List
        </AntButton>
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
      <AntTable
        rowKey="_id"
        size="small"
        title={this.getTableHeader}
        columns={this.getColumns(isPastMehfil, allSecurityMehfilDuties)}
        rowSelection={!isPastMehfil ? this.rowSelection : null}
        dataSource={sortedMehfilKarkuns}
        pagination={false}
        bordered
      />
    );
  }
}

const ListWithData = (props: ListWithDataProps) => {
  const { mehfilId, dutyId } = props;
  const { data = {}, loading, refetch, ...queryResult } = useQuery(
    MEHFIL_KARKUNS_BY_MEHFIL_ID as any,
    {
      fetchPolicy: "cache-and-network",
      variables: {
        mehfilId,
        dutyId,
      },
    }
  );

  return (
    <List
      {...props}
      {...queryResult}
      {...(data as MehfilKarkunsData)}
      mehfilKarkunsLoading={loading}
      refetchMehfilKarkuns={refetch}
    />
  );
};

export default ListWithData;
