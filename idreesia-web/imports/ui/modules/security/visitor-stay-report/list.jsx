import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Avatar, Button, Pagination, Icon, Modal, Table, message } from 'antd';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import moment from 'moment';
import { find, flowRight } from 'lodash';

import { getDownloadUrl } from '/imports/ui/modules/helpers/misc';
import StayReasons from '/imports/ui/modules/security/common/constants/stay-reasons';

import ListFilter from './list-filter';
import FixSpelling from './fix-spelling';
import ViewForm from '../visitor-stays/view-form';

const StatusStyle = {
  fontSize: 20,
};

const ToolbarStyle = {
  display: 'flex',
  flexFlow: 'row nowrap',
  justifyContent: 'space-between',
  alignItems: 'right',
  width: '100%',
};

const NameDivStyle = {
  display: 'flex',
  flexFlow: 'row nowrap',
  justifyContent: 'flex-start',
  alignItems: 'center',
  width: '100%',
  color: '#1890FF',
  cursor: 'pointer',
};

const CityDivStyle = {
  width: '100%',
  color: '#1890FF',
  cursor: 'pointer',
};

const StayDetailDivStyle = {
  width: '100%',
  color: '#1890FF',
  cursor: 'pointer',
};

class List extends Component {
  static propTypes = {
    pageIndex: PropTypes.number,
    pageSize: PropTypes.number,
    queryString: PropTypes.string,
    queryParams: PropTypes.object,
    setPageParams: PropTypes.func,
    handleItemSelected: PropTypes.func,
    fixCitySpelling: PropTypes.func,

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
    existingSpelling: null,
  };

  statusColumn = {
    title: '',
    key: 'status',
    render: (text, record) => {
      const { refVisitor } = record;
      if (refVisitor.criminalRecord) {
        return (
          <Icon
            type="warning"
            style={StatusStyle}
            theme="twoTone"
            twoToneColor="red"
          />
        );
      } else if (refVisitor.otherNotes) {
        return (
          <Icon
            type="warning"
            style={StatusStyle}
            theme="twoTone"
            twoToneColor="orange"
          />
        );
      }

      return null;
    },
  };

  nameColumn = {
    title: 'Name',
    dataIndex: 'refVisitor.name',
    key: 'refVisitor.name',
    render: (text, record) => {
      const { refVisitor } = record;
      const onClickHandler = () => {
        const { handleItemSelected } = this.props;
        handleItemSelected(refVisitor);
      };

      if (refVisitor.imageId) {
        const url = getDownloadUrl(refVisitor.imageId);
        return (
          <div style={NameDivStyle} onClick={onClickHandler}>
            <Avatar shape="square" size="large" src={url} />
            &nbsp;&nbsp;
            {text}
          </div>
        );
      }

      return (
        <div style={NameDivStyle} onClick={onClickHandler}>
          <Avatar shape="square" size="large" icon="picture" />
          &nbsp;&nbsp;
          {text}
        </div>
      );
    },
  };

  cityCountryColumn = {
    title: 'City / Country',
    key: 'cityCountry',
    render: (text, record) => {
      const { refVisitor } = record;
      if (refVisitor.city) {
        return (
          <div
            style={CityDivStyle}
            onClick={() => {
              this.handleFixSpellingShow(refVisitor.city);
            }}
          >
            {`${refVisitor.city}, ${refVisitor.country}`}
          </div>
        );
      }
      return refVisitor.country;
    },
  };

  stayDetailsColumn = {
    title: 'Stay Details',
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

  dutyShiftNameColumn = {
    title: 'Duty / Shift',
    key: 'dutyShiftName',
    dataIndex: 'dutyShiftName',
  };

  getColumns = () => [
    this.statusColumn,
    this.nameColumn,
    this.cityCountryColumn,
    this.stayDetailsColumn,
    this.stayReasonColumn,
    this.dutyShiftNameColumn,
  ];

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

  handleFixSpellingShow = existingSpelling => {
    this.setState({
      existingSpelling,
      showFixSpellingDialog: true,
    });
  };

  handleFixSpellingSave = (existingSpelling, newSpelling) => {
    const { fixCitySpelling } = this.props;
    this.setState({
      existingSpelling: null,
      showFixSpellingDialog: false,
    });

    if (existingSpelling !== newSpelling) {
      fixCitySpelling({
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
      existingSpelling: null,
      showFixSpellingDialog: false,
    });
  };

  getTableHeader = () => {
    const { queryParams, setPageParams } = this.props;

    return (
      <div style={ToolbarStyle}>
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
      existingSpelling && showFixSpellingDialog ? (
        <FixSpelling
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

const listQuery = gql`
  query pagedVisitorStays($queryString: String!) {
    pagedVisitorStays(queryString: $queryString) {
      totalResults
      data {
        _id
        visitorId
        fromDate
        toDate
        numOfDays
        stayReason
        dutyShiftName
        refVisitor {
          _id
          name
          cnicNumber
          contactNumber1
          contactNumber2
          city
          country
          imageId
          criminalRecord
          otherNotes
        }
      }
    }
  }
`;

const formMutation = gql`
  mutation fixCitySpelling($existingSpelling: String!, $newSpelling: String!) {
    fixCitySpelling(
      existingSpelling: $existingSpelling
      newSpelling: $newSpelling
    )
  }
`;

export default flowRight(
  graphql(listQuery, {
    props: ({ data }) => ({ ...data }),
    options: ({ queryString }) => ({
      variables: {
        queryString,
      },
    }),
  }),
  graphql(formMutation, {
    name: 'fixCitySpelling',
    options: {
      refetchQueries: ['pagedVisitors', 'pagedVisitorStays'],
    },
  })
)(List);
