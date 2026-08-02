import React, { Component, Fragment, type CSSProperties } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import dayjs from 'dayjs';
import { WarningTwoTone } from '@ant-design/icons';

import { find } from 'meteor/idreesia-common/utilities/lodash';
import { SORT_BY } from 'meteor/idreesia-common/constants/security/list-options';
import { StayReasons } from 'meteor/idreesia-common/constants/security';
import type { ReportPagedVisitorStaysQuery } from 'meteor/idreesia-common/types/client-operations';
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
import type { PageParams } from './list-container';

import {
  FIX_CITY_SPELLING,
  FIX_NAME_SPELLING,
  PAGED_VISITOR_STAYS,
} from './gql';

const StatusStyle: CSSProperties = {
  fontSize: 20,
};

const LinkStyle: CSSProperties = {
  width: '100%',
  color: '#1890FF',
  cursor: 'pointer',
};

const StayDetailDivStyle: CSSProperties = {
  width: '100%',
  color: '#1890FF',
  cursor: 'pointer',
};

const SPELLING_TYPE = {
  CITY: 'city',
  NAME: 'name',
};

type VisitorRecord = NonNullable<
  NonNullable<
    NonNullable<
      NonNullable<ReportPagedVisitorStaysQuery['pagedVisitorStays']>['data']
    >[number]
  >['refVisitor']
> & { _id: string; name: string };

type VisitorStay = NonNullable<
  NonNullable<
    NonNullable<ReportPagedVisitorStaysQuery['pagedVisitorStays']>['data']
  >[number]
> & { _id: string; refVisitor: VisitorRecord };

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
  setPageParams(params: PageParams): void;
  handleItemSelected(visitor: { _id: string }): void;
  fixCitySpelling(args: {
    variables: { existingSpelling: string; newSpelling: string };
  }): Promise<unknown>;
  fixNameSpelling(args: {
    variables: { existingSpelling: string; newSpelling: string };
  }): Promise<unknown>;
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

interface ListFilterQueryParams {
  startDate?: string;
  endDate?: string;
  name?: string;
  city?: string;
  stayReason?: string;
  additionalInfo?: string;
}

const emptyPagedVisitorStays: PagedVisitorStays = {
  data: [],
  totalResults: 0,
};

class List extends Component<ListProps, ListState> {
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
          <WarningTwoTone
            style={StatusStyle}
            twoToneColor="red"
          />
        );
      } else if (refVisitor.otherNotes) {
        return (
          <WarningTwoTone
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
        <SortableColumnHeader
          headerKey={SORT_BY.NAME}
          title="Name"
          sortBy={sortBy}
          sortOrder={sortOrder as 'asc' | 'desc' | undefined}
          handleSortChange={this.handleSortChange}
        />
      ),
      dataIndex: ['refVisitor', 'name'],
      key: 'refVisitor.name',
      render: (_text: unknown, record: VisitorStay) => (
        <VisitorName
          visitor={{
            _id: record.refVisitor._id,
            name: record.refVisitor.name,
            imageId: record.refVisitor.imageId ?? undefined,
          }}
          onVisitorNameClicked={(visitor) => this.props.handleItemSelected(visitor)}
        />
      ),
    };
  };

  getCityCountryColumn = () => {
    const { sortBy, sortOrder } = this.props;

    return {
      title: () => (
        <SortableColumnHeader
          headerKey={SORT_BY.CITY}
          title="City / Country"
          sortBy={sortBy}
          sortOrder={sortOrder as 'asc' | 'desc' | undefined}
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
        <SortableColumnHeader
          headerKey={SORT_BY.STAY_DATE}
          title="Stay Details"
          sortBy={sortBy}
          sortOrder={sortOrder as 'asc' | 'desc' | undefined}
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
      const reason = find(StayReasons, ({ _id }) => _id === text);
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

  handleFixSpellingSave = (
    spellingType: string,
    existingSpelling: string,
    newSpelling: string
  ) => {
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
        <ListFilter
          queryParams={queryParams as ListFilterQueryParams}
          setPageParams={setPageParams}
        />
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
        <ViewForm visitorStayId={visitorStayId} />
      ) : null;

    const fixSpellingForm =
      spellingType && existingSpelling && showFixSpellingDialog ? (
        <FixSpelling
          spellingType={spellingType}
          existingSpelling={existingSpelling}
          onSave={this.handleFixSpellingSave}
          onCancel={this.handleFixSpellingClose}
        />
      ) : null;

    return (
      <Fragment>
        <Table
          rowKey="_id"
          dataSource={data}
          columns={this.getColumns() as any[]}
          title={this.getTableHeader}
          bordered
          size="small"
          pagination={false}
          footer={() => (
            <Pagination
              current={numPageIndex}
              pageSize={numPageSize}
              showSizeChanger
              showTotal={(total, range) =>
                `${range[0]}-${range[1]} of ${total} items`
              }
              onChange={this.onChange}
              onShowSizeChange={this.onShowSizeChange}
              total={totalResults}
            />
          )}
        />
        <Modal
          title="Visitor Stay"
          open={showViewDialog}
          onCancel={this.handleStayDetailClose}
          width={400}
          footer={[
            <Button
              key="close"
              type="primary"
              onClick={this.handleStayDetailClose}
            >
              Close
            </Button>,
          ]}
        >
          <div>{viewForm}</div>
        </Modal>
        <Modal
          title="Fix Spelling"
          open={showFixSpellingDialog}
          onCancel={this.handleFixSpellingClose}
          width={600}
          footer={null}
        >
          <div>{fixSpellingForm}</div>
        </Modal>
      </Fragment>
    );
  }
}

interface ListWithDataProps extends Omit<
  ListProps,
  'fixCitySpelling' | 'fixNameSpelling' | 'pagedVisitorStays' | 'loading'
> {}

const ListWithData = (props: ListWithDataProps) => {
  const { queryString = '' } = props;
  const { data, loading } = useQuery(PAGED_VISITOR_STAYS, {
    variables: {
      queryString,
    },
  });
  const [fixCitySpelling] = useMutation(FIX_CITY_SPELLING, {
    refetchQueries: ['pagedSecurityVisitors', 'pagedVisitorStays'],
  });
  const [fixNameSpelling] = useMutation(FIX_NAME_SPELLING, {
    refetchQueries: ['pagedSecurityVisitors', 'pagedVisitorStays'],
  });

  const pagedData = data?.pagedVisitorStays;
  const rows = (pagedData?.data ?? []).filter(
    (row): row is VisitorStay =>
      row != null &&
      row._id != null &&
      row.refVisitor != null &&
      row.refVisitor._id != null &&
      row.refVisitor.name != null
  );
  const pagedVisitorStays: PagedVisitorStays = {
    totalResults: pagedData?.totalResults ?? 0,
    data: rows,
  };

  return (
    <List
      {...props}
      loading={loading}
      pagedVisitorStays={pagedVisitorStays}
      fixCitySpelling={fixCitySpelling}
      fixNameSpelling={fixNameSpelling}
    />
  );
};

export default ListWithData;
