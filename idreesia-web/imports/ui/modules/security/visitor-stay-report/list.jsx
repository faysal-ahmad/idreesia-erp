import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';
import moment from 'moment';
import { WarningTwoTone } from '@ant-design/icons';

import { find, flowRight } from 'meteor/idreesia-common/utilities/lodash';
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

class List extends Component {
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
    render: (text, record) => {
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
          sortOrder={sortOrder}
          handleSortChange={this.handleSortChange}
        />
      ),
      dataIndex: ['refVisitor', 'name'],
      key: 'refVisitor.name',
      render: (text, record) => (
        <VisitorName
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
        <SortableColumnHeader
          headerKey={SORT_BY.CITY}
          title="City / Country"
          sortBy={sortBy}
          sortOrder={sortOrder}
          handleSortChange={this.handleSortChange}
        />
      ),
      key: 'cityCountry',
      render: (text, record) => {
        const { refVisitor } = record;
        if (refVisitor.city) {
          return (
            <div
              style={LinkStyle}
              onClick={() => {
                this.handleFixSpellingShow(SPELLING_TYPE.CITY, refVisitor.city);
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
          sortOrder={sortOrder}
          handleSortChange={this.handleSortChange}
        />
      ),
      key: 'stayDetails',
      render: (text, record) => {
        const fromDate = moment(Number(record.fromDate));
        const toDate = moment(Number(record.toDate));
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
    render: text => {
      if (!text) return null;
      const reason = find(StayReasons, ({ _id }) => _id === text);
      return reason.name;
    },
  };

  stayAllowedByColumn = {
    title: 'Allowed By',
    key: 'stayAllowedBy',
    dataIndex: 'stayAllowedBy',
    render: text => (
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

  handleSortChange = (sortBy, sortOrder) => {
    const { setPageParams } = this.props;
    setPageParams({
      sortBy,
      sortOrder,
    });
  };

  onChange = (pageIndex, pageSize) => {
    const { setPageParams } = this.props;
    setPageParams({
      pageIndex: pageIndex - 1,
      pageSize,
    });
  };

  onShowSizeChange = (pageIndex, pageSize) => {
    const { setPageParams } = this.props;
    setPageParams({
      pageIndex: pageIndex - 1,
      pageSize,
    });
  };

  handleStayDetailClicked = visitorStayId => {
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

  handleFixSpellingShow = (spellingType, existingSpelling) => {
    this.setState({
      spellingType,
      existingSpelling,
      showFixSpellingDialog: true,
    });
  };

  handleFixSpellingSave = (spellingType, existingSpelling, newSpelling) => {
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
      }).catch(error => {
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
        <ListFilter queryParams={queryParams} setPageParams={setPageParams} />
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
      pagedVisitorStays: { totalResults, data },
    } = this.props;

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
          columns={this.getColumns()}
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
          visible={showViewDialog}
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
          visible={showFixSpellingDialog}
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

export default flowRight(
  graphql(PAGED_VISITOR_STAYS, {
    props: ({ data }) => ({ ...data }),
    options: ({ queryString }) => ({
      variables: {
        queryString,
      },
    }),
  }),
  graphql(FIX_CITY_SPELLING, {
    name: 'fixCitySpelling',
    options: {
      refetchQueries: ['pagedSecurityVisitors', 'pagedVisitorStays'],
    },
  }),
  graphql(FIX_NAME_SPELLING, {
    name: 'fixNameSpelling',
    options: {
      refetchQueries: ['pagedSecurityVisitors', 'pagedVisitorStays'],
    },
  })
)(List);
