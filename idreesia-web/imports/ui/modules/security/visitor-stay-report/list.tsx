import React, { Component, Fragment, type CSSProperties } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import dayjs from 'dayjs';

import { find } from 'meteor/idreesia-common/utilities/lodash';
import { SORT_BY } from 'meteor/idreesia-common/constants/security/list-options';
import { StayReasons } from 'meteor/idreesia-common/constants/security';
import type { ReportPagedVisitorStaysQuery } from 'meteor/idreesia-common/types/client-operations';
import {
  Button,
  Pagination,
  Modal,
  Spin,
  Table,
} from 'antd';
import { message } from '/imports/ui/antd-feedback';
import { VisitorName } from '/imports/ui/modules/security/common/controls';
import { SortableColumnHeader } from '/imports/ui/modules/helpers/controls';

import ListFilter, { StayReportFilterChips } from './list-filter';
import FixSpelling from './fix-spelling';
import ViewForm from '../visitor-stays/view-form';
import type { PageParams } from './list-container';

import {
  FIX_CITY_SPELLING,
  FIX_NAME_SPELLING,
  PAGED_VISITOR_STAYS,
} from './gql';

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

const TABLE_HEADER_ROW_HEIGHT = 55;
const VIEWPORT_BOTTOM_GAP = 16;

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
  refreshData?: () => Promise<unknown>;
  loading?: boolean;
  pagedVisitorStays?: PagedVisitorStays;
}

interface ListState {
  showViewDialog: boolean;
  visitorStayId: string | null;
  showFixSpellingDialog: boolean;
  spellingType: string | null;
  existingSpelling: string | null;
  scrollY: number;
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
  containerRef = React.createRef<HTMLDivElement>();

  state: ListState = {
    showViewDialog: false,
    visitorStayId: null,
    showFixSpellingDialog: false,
    spellingType: null,
    existingSpelling: null,
    scrollY: 360,
  };

  componentDidMount() {
    this.updateScrollY();
    window.addEventListener('resize', this.updateScrollY);
  }

  componentDidUpdate() {
    this.updateScrollY();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateScrollY);
  }

  updateScrollY = () => {
    // Measure after layout so filter chips in the table title are included.
    requestAnimationFrame(() => {
      const container = this.containerRef.current;
      if (!container) return;

      const table = container.querySelector('.list-table');
      if (!table) return;

      const title = table.querySelector('.ant-table-title');
      const footer = table.querySelector('.ant-table-footer');
      const thead = table.querySelector('.ant-table-thead');
      const titleBottom = title
        ? title.getBoundingClientRect().bottom
        : table.getBoundingClientRect().top;
      const theadHeight = thead
        ? Math.ceil((thead as HTMLElement).getBoundingClientRect().height)
        : TABLE_HEADER_ROW_HEIGHT;
      const footerHeight = footer
        ? Math.ceil((footer as HTMLElement).getBoundingClientRect().height)
        : 64;

      // Stay inside Layout.Content's padding box (padding: 24), not the
      // window edge — otherwise chips grow the title and clip pagination.
      const contentEl = container.closest(
        '.ant-layout-content'
      ) as HTMLElement | null;
      let bottomLimit = window.innerHeight;
      if (contentEl) {
        const paddingBottom =
          Number.parseFloat(getComputedStyle(contentEl).paddingBottom) || 0;
        bottomLimit =
          contentEl.getBoundingClientRect().bottom - paddingBottom;
      }

      const nextScrollY = Math.max(
        200,
        Math.floor(
          bottomLimit -
            titleBottom -
            theadHeight -
            footerHeight -
            VIEWPORT_BOTTOM_GAP
        )
      );

      if (Math.abs(nextScrollY - this.state.scrollY) > 2) {
        this.setState({ scrollY: nextScrollY });
      }
    });
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
      width: 220,
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
      width: 280,
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
    width: 160,
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
    width: 160,
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
    this.getNameColumn(),
    this.getCityCountryColumn(),
    this.getStayDetailsColumn(),
    this.stayReasonColumn,
    this.stayAllowedByColumn,
  ];

  getRowClassName = (record: VisitorStay) => {
    if (record.refVisitor.criminalRecord) return 'visitors-list-row-alert';
    if (record.refVisitor.otherNotes) return 'visitors-list-row-warning';
    return '';
  };

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
    const { queryParams, setPageParams, refreshData } = this.props;
    const filterProps = {
      queryParams: queryParams as ListFilterQueryParams,
      setPageParams,
      refreshData,
    };

    return (
      <div className="list-table-header">
        <div />
        <div className="list-table-header-utilities">
          <ListFilter {...filterProps} />
          <StayReportFilterChips {...filterProps} />
        </div>
      </div>
    );
  };

  render() {
    const { loading } = this.props;
    if (loading) {
      return (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <Spin size="large" />
        </div>
      );
    }

    const {
      visitorStayId,
      showViewDialog,
      spellingType,
      existingSpelling,
      showFixSpellingDialog,
      scrollY,
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
        <div className="list-container" ref={this.containerRef}>
          <Table
            className="list-table"
            rowKey="_id"
            dataSource={data}
            columns={this.getColumns() as any[]}
            title={this.getTableHeader}
            rowClassName={this.getRowClassName}
            bordered
            size="medium"
            tableLayout="fixed"
            pagination={false}
            scroll={{ y: scrollY }}
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
        </div>
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
  | 'fixCitySpelling'
  | 'fixNameSpelling'
  | 'pagedVisitorStays'
  | 'loading'
  | 'refreshData'
> {}

const ListWithData = (props: ListWithDataProps) => {
  const { queryString = '' } = props;
  const { data, loading, refetch } = useQuery(PAGED_VISITOR_STAYS, {
    variables: {
      queryString,
    },
  });
  const [fixCitySpelling] = useMutation(FIX_CITY_SPELLING, {
    refetchQueries: ['pagedSecurityVisitors', 'reportPagedVisitorStays'],
  });
  const [fixNameSpelling] = useMutation(FIX_NAME_SPELLING, {
    refetchQueries: ['pagedSecurityVisitors', 'reportPagedVisitorStays'],
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
      refreshData={refetch}
    />
  );
};

export default ListWithData;
