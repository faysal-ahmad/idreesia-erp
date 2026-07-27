import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { useQuery, useMutation } from '@apollo/client/react';
import dayjs from 'dayjs';
import { WarningTwoTone } from '@ant-design/icons';

import { find } from 'meteor/idreesia-common/utilities/lodash';
import { SORT_BY } from 'meteor/idreesia-common/constants/security/list-options';
import { StayReasons } from 'meteor/idreesia-common/constants/security';
import {
  Button,
  Pagination,
  Modal,
  Table,
  message,
} from 'antd';
import { VisitorName } from '/imports/ui/modules/security/common/controls';
import { SortableColumnHeader } from '/imports/ui/modules/helpers/controls';

import ListFilter from './list-filter';
import FixSpelling from './fix-spelling';
import ViewForm from '../visitor-stays/view-form';

import {
  FIX_CITY_SPELLING,
  FIX_NAME_SPELLING,
  PAGED_VISITOR_STAYS,
} from './gql';

const StatusStyle = {
  fontSize: 20,
};

const LinkStyle = {
  width: '100%',
  color: '#1890FF',
  cursor: 'pointer',
};

const StayDetailDivStyle = {
  width: '100%',
  color: '#1890FF',
  cursor: 'pointer',
};

const SPELLING_TYPE = {
  CITY: 'city',
  NAME: 'name',
};

const ReactFragment = Fragment as any;
const AntButton = Button as any;
const AntPagination = Pagination as any;
const AntModal = Modal as any;
const AntTable = Table as any;
const AntWarningTwoTone = WarningTwoTone as any;
const VisitorNameComponent = VisitorName as any;
const SortableColumnHeaderComponent = SortableColumnHeader as any;
const ListFilterComponent = ListFilter as any;
const FixSpellingComponent = FixSpelling as any;
const ViewFormComponent = ViewForm as any;

interface VisitorRecord {
  _id: string;
  name: string;
  country?: string;
  city?: string;
  criminalRecord?: string | null;
  otherNotes?: string | null;
}

interface VisitorStay {
  _id: string;
  refVisitor: VisitorRecord;
  fromDate: string | number;
  toDate: string | number;
  numOfDays: number;
  stayReason?: string;
  stayAllowedBy?: string;
}

interface PagedVisitorStays {
  totalResults: number;
  data: VisitorStay[];
}

interface ListProps {
  pageIndex?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: string;
  queryString?: string;
  queryParams?: Record<string, unknown>;
  setPageParams(params: Record<string, unknown>): void;
  handleItemSelected(visitor: VisitorRecord): void;
  fixCitySpelling(args: unknown): Promise<unknown>;
  fixNameSpelling(args: unknown): Promise<unknown>;
  loading?: boolean;
  pagedVisitorStays?: PagedVisitorStays;
}

interface ListState {
  showViewDialog: boolean;
  visitorStayId: string | null;
  showFixSpellingDialog: boolean;
  spellingType: string | null;
  existingSpelling: string | null;
}

const emptyPagedVisitorStays: PagedVisitorStays = {
  data: [],
  totalResults: 0,
};

class List extends Component<ListProps, ListState> {
  static propTypes = {
    pageIndex: PropTypes.number,
    pageSize: PropTypes.number,
    sortBy: PropTypes.string,
    sortOrder: PropTypes.string,
    queryString: PropTypes.string,
    queryParams: PropTypes.object,
    setPageParams: PropTypes.func,
    handleItemSelected: PropTypes.func,
    fixCitySpelling: PropTypes.func,
    fixNameSpelling: PropTypes.func,

    loading: PropTypes.bool,
    pagedVisitorStays: PropTypes.shape({
      totalResults: PropTypes.number,
      data: PropTypes.array,
    }),
  };

  state = {
    showViewDialog: false,
    visitorStayId: null,
    showFixSpellingDialog: false,
    spellingType: null,
    existingSpelling: null,
  };

  statusColumn = {
    title: '',
    key: 'status',
    render: (_text: unknown, record: VisitorStay) => {
      const { refVisitor } = record;
      if (refVisitor.criminalRecord) {
        return (
          <AntWarningTwoTone
            style={StatusStyle}
            twoToneColor="red"
          />
        );
      } else if (refVisitor.otherNotes) {
        return (
          <AntWarningTwoTone
            style={StatusStyle}
            twoToneColor="orange"
          />
        );
      }

      return null;
    },
  };

  getNameColumn = () => {
    const { sortBy, sortOrder } = this.props;

    return {
      title: () => (
        <SortableColumnHeaderComponent
          headerKey={SORT_BY.NAME}
          title="Name"
          sortBy={sortBy}
          sortOrder={sortOrder}
          handleSortChange={this.handleSortChange}
        />
      ),
      dataIndex: ['refVisitor', 'name'],
      key: 'refVisitor.name',
      render: (_text: unknown, record: VisitorStay) => (
        <VisitorNameComponent
          visitor={record.refVisitor}
          onVisitorNameClicked={this.props.handleItemSelected}
        />
      ),
    };
  };

  getCityCountryColumn = () => {
    const { sortBy, sortOrder } = this.props;

    return {
      title: () => (
        <SortableColumnHeaderComponent
          headerKey={SORT_BY.CITY}
          title="City / Country"
          sortBy={sortBy}
          sortOrder={sortOrder}
          handleSortChange={this.handleSortChange}
        />
      ),
      key: 'cityCountry',
      render: (_text: unknown, record: VisitorStay) => {
        const { refVisitor } = record;
        if (refVisitor.city) {
          return (
            <div
              style={LinkStyle}
              onClick={() => {
                this.handleFixSpellingShow(SPELLING_TYPE.CITY, refVisitor.city ?? '');
              }}
            >
              {`${refVisitor.city}, ${refVisitor.country}`}
            </div>
          );
        }
        return refVisitor.country;
      },
    };
  };

  getStayDetailsColumn = () => {
    const { sortBy, sortOrder } = this.props;

    return {
      title: () => (
        <SortableColumnHeaderComponent
          headerKey={SORT_BY.STAY_DATE}
          title="Stay Details"
          sortBy={sortBy}
          sortOrder={sortOrder}
          handleSortChange={this.handleSortChange}
        />
      ),
      key: 'stayDetails',
      render: (_text: unknown, record: VisitorStay) => {
        const fromDate = dayjs(Number(record.fromDate));
        const toDate = dayjs(Number(record.toDate));
        const days = record.numOfDays;

        let detail;
        if (days === 1) {
          detail = `1 day - [${fromDate.format('DD MMM, YYYY')}]`;
        } else {
          detail = `${days} days - [${fromDate.format(
            'DD MMM, YYYY'
          )} - ${toDate.format('DD MMM, YYYY')}]`;
        }

        return (
          <div
            style={StayDetailDivStyle}
            onClick={() => {
              this.handleStayDetailClicked(record._id);
            }}
          >
            {detail}
          </div>
        );
      },
    };
  };

  stayReasonColumn = {
    title: 'Stay Reason',
    key: 'stayReason',
    dataIndex: 'stayReason',
    render: (text: string) => {
      if (!text) return null;
      const reason = find(StayReasons, ({ _id }: { _id: string }) => _id === text) as { name: string } | undefined;
      return reason?.name ?? '';
    },
  };

  stayAllowedByColumn = {
    title: 'Allowed By',
    key: 'stayAllowedBy',
    dataIndex: 'stayAllowedBy',
    render: (text: string) => (
      <div
        style={LinkStyle}
        onClick={() => {
          this.handleFixSpellingShow(SPELLING_TYPE.NAME, text);
        }}
      >
        {text}
      </div>
    ),
  };

  getColumns = () => [
    this.statusColumn,
    this.getNameColumn(),
    this.getCityCountryColumn(),
    this.getStayDetailsColumn(),
    this.stayReasonColumn,
    this.stayAllowedByColumn,
  ];

  handleSortChange = (sortBy: string, sortOrder: string) => {
    const { setPageParams } = this.props;
    setPageParams({
      sortBy,
      sortOrder,
    });
  };

  onChange = (pageIndex: number, pageSize: number) => {
    const { setPageParams } = this.props;
    setPageParams({
      pageIndex: pageIndex - 1,
      pageSize,
    });
  };

  onShowSizeChange = (pageIndex: number, pageSize: number) => {
    const { setPageParams } = this.props;
    setPageParams({
      pageIndex: pageIndex - 1,
      pageSize,
    });
  };

  handleStayDetailClicked = (visitorStayId: string) => {
    this.setState({
      visitorStayId,
      showViewDialog: true,
    });
  };

  handleStayDetailClose = () => {
    this.setState({
      visitorStayId: null,
      showViewDialog: false,
    });
  };

  handleFixSpellingShow = (spellingType: string, existingSpelling: string) => {
    this.setState({
      spellingType,
      existingSpelling,
      showFixSpellingDialog: true,
    });
  };

  handleFixSpellingSave = (spellingType: string, existingSpelling: string, newSpelling: string) => {
    const { fixCitySpelling, fixNameSpelling } = this.props;
    this.setState({
      spellingType: null,
      existingSpelling: null,
      showFixSpellingDialog: false,
    });

    const fixSpellingFunction =
      spellingType === SPELLING_TYPE.CITY ? fixCitySpelling : fixNameSpelling;
    if (existingSpelling !== newSpelling) {
      fixSpellingFunction({
        variables: {
          existingSpelling,
          newSpelling,
        },
      }).catch((error: Error) => {
        message.error(error.message, 5);
      });
    }
  };

  handleFixSpellingClose = () => {
    this.setState({
      spellingType: null,
      existingSpelling: null,
      showFixSpellingDialog: false,
    });
  };

  getTableHeader = () => {
    const { queryParams, setPageParams } = this.props;

    return (
      <div className="list-table-header">
        <ListFilterComponent queryParams={queryParams} setPageParams={setPageParams} />
      </div>
    );
  };

  render() {
    const { loading } = this.props;
    if (loading) return null;

    const {
      visitorStayId,
      showViewDialog,
      spellingType,
      existingSpelling,
      showFixSpellingDialog,
    } = this.state;
    const {
      pageIndex,
      pageSize,
      pagedVisitorStays = emptyPagedVisitorStays,
    } = this.props;
    const { totalResults, data } = pagedVisitorStays;

    const numPageIndex = pageIndex ? pageIndex + 1 : 1;
    const numPageSize = pageSize || 20;

    const viewForm =
      visitorStayId && showViewDialog ? (
        <ViewFormComponent visitorStayId={visitorStayId} />
      ) : null;

    const fixSpellingForm =
      spellingType && existingSpelling && showFixSpellingDialog ? (
        <FixSpellingComponent
          spellingType={spellingType}
          existingSpelling={existingSpelling}
          onSave={this.handleFixSpellingSave}
          onCancel={this.handleFixSpellingClose}
        />
      ) : null;

    return (
      <ReactFragment>
        <AntTable
          rowKey="_id"
          dataSource={data}
          columns={this.getColumns()}
          title={this.getTableHeader}
          bordered
          size="small"
          pagination={false}
          footer={() => (
            <AntPagination
              current={numPageIndex}
              pageSize={numPageSize}
              showSizeChanger
              showTotal={(total: number, range: number[]) =>
                `${range[0]}-${range[1]} of ${total} items`
              }
              onChange={this.onChange}
              onShowSizeChange={this.onShowSizeChange}
              total={totalResults}
            />
          )}
        />
        <AntModal
          title="Visitor Stay"
          open={showViewDialog}
          onCancel={this.handleStayDetailClose}
          width={400}
          footer={[
            <AntButton
              key="close"
              type="primary"
              onClick={this.handleStayDetailClose}
            >
              Close
            </AntButton>,
          ]}
        >
          <div>{viewForm}</div>
        </AntModal>
        <AntModal
          title="Fix Spelling"
          open={showFixSpellingDialog}
          onCancel={this.handleFixSpellingClose}
          width={600}
          footer={null}
        >
          <div>{fixSpellingForm}</div>
        </AntModal>
      </ReactFragment>
    );
  }
}

interface ListWithDataProps extends Omit<ListProps, 'fixCitySpelling' | 'fixNameSpelling' | 'pagedVisitorStays'> {
  queryString?: string;
}

interface VisitorStaysData {
  pagedVisitorStays?: PagedVisitorStays;
}

const ListWithData = (props: ListWithDataProps) => {
  const { queryString } = props;
  const { data = {}, loading, ...queryResult } = useQuery(PAGED_VISITOR_STAYS as any, {
    variables: {
      queryString,
    },
  });
  const [fixCitySpelling] = useMutation(FIX_CITY_SPELLING as any, {
    refetchQueries: ['pagedSecurityVisitors', 'pagedVisitorStays'],
  });
  const [fixNameSpelling] = useMutation(FIX_NAME_SPELLING as any, {
    refetchQueries: ['pagedSecurityVisitors', 'pagedVisitorStays'],
  });

  return (
    <List
      {...props}
      {...queryResult}
      {...(data as VisitorStaysData)}
      loading={loading}
      fixCitySpelling={fixCitySpelling}
      fixNameSpelling={fixNameSpelling}
    />
  );
};

export default ListWithData;
