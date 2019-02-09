import { Meteor } from "meteor/meteor";
import React, { Component } from "react";
import PropTypes from "prop-types";
import { Avatar, Pagination, Table } from "antd";
import gql from "graphql-tag";
import { compose, graphql } from "react-apollo";

import ListFilter from "./list-filter";

const ToolbarStyle = {
  display: "flex",
  flexFlow: "row nowrap",
  justifyContent: "space-between",
  alignItems: "center",
  width: "100%",
};

const NameDivStyle = {
  display: "flex",
  flexFlow: "row nowrap",
  justifyContent: "flex-start",
  alignItems: "center",
  width: "100%",
  cursor: "pointer",
};

class List extends Component {
  static propTypes = {
    pageIndex: PropTypes.number,
    pageSize: PropTypes.number,
    physicalStoreId: PropTypes.string,
    itemCategoryId: PropTypes.string,
    itemTypeName: PropTypes.string,
    setPageParams: PropTypes.func,
    handleItemSelected: PropTypes.func,

    loading: PropTypes.bool,
    pagedItemTypes: PropTypes.shape({
      totalResults: PropTypes.number,
      itemTypes: PropTypes.array,
    }),
  };

  columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text, record) => {
        const onClickHandler = () => {
          const { handleItemSelected } = this.props;
          handleItemSelected(record);
        };

        if (record.imageId) {
          const url = `${
            Meteor.settings.public.expressServerUrl
          }/download-file?attachmentId=${record.imageId}`;
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
    },
    {
      title: "Company",
      dataIndex: "company",
      key: "company",
    },
    {
      title: "Details",
      dataIndex: "details",
      key: "details",
    },
    {
      title: "Measurement Unit",
      dataIndex: "formattedUOM",
      key: "formattedUOM",
    },
    {
      title: "Category",
      dataIndex: "itemCategoryName",
      key: "itemCategoryName",
    },
  ];

  onSelect = itemTypeId => {
    const { handleItemSelected } = this.props;
    handleItemSelected(itemTypeId);
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

  getTableHeader = () => {
    const { itemCategoryId, itemTypeName, setPageParams } = this.props;
    return (
      <div style={ToolbarStyle}>
        <ListFilter
          itemCategoryId={itemCategoryId}
          itemTypeName={itemTypeName}
          setPageParams={setPageParams}
        />
      </div>
    );
  };
  render() {
    const { loading } = this.props;
    if (loading) return null;

    const {
      pageIndex,
      pageSize,
      pagedItemTypes: { totalResults, itemTypes },
    } = this.props;

    const numPageIndex = pageIndex ? pageIndex + 1 : 1;
    const numPageSize = pageSize || 10;

    return (
      <Table
        rowKey="_id"
        dataSource={itemTypes}
        columns={this.columns}
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
    );
  }
}

const listQuery = gql`
  query pagedItemTypes($queryString: String) {
    pagedItemTypes(queryString: $queryString) {
      totalResults
      itemTypes {
        _id
        name
        formattedName
        company
        details
        formattedUOM
        itemCategoryName
        imageId
      }
    }
  }
`;

export default compose(
  graphql(listQuery, {
    props: ({ data }) => ({ ...data }),
    options: ({
      physicalStoreId,
      itemCategoryId,
      itemTypeName,
      pageIndex,
      pageSize,
    }) => ({
      variables: {
        queryString: `?itemCategoryId=${itemCategoryId ||
          ""}&itemTypeName=${itemTypeName ||
          ""}&pageIndex=${pageIndex}&pageSize=${pageSize}&unstockedInPhysicalStoreId=${physicalStoreId}`,
      },
    }),
  })
)(List);
