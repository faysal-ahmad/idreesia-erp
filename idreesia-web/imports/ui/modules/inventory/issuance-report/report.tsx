import React, { Component } from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { withQuery } from '/imports/ui/modules/inventory/common/composers/apollo-hooks';
import dayjs from 'dayjs';
import { Button, DatePicker, Spin, Table } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';

import {
  flowRight,
  keyBy,
  keys,
  reverse,
  sortBy,
} from 'meteor/idreesia-common/utilities/lodash';
import { StockItemName } from '/imports/ui/modules/inventory/common/controls';

const AntButton = Button as any;
const AntDatePickerMonth = DatePicker.MonthPicker as any;
const AntSpin = Spin as any;
const AntTable = Table as any;
const AntLeftOutlined = LeftOutlined as any;
const AntRightOutlined = RightOutlined as any;
const StockItemNameComponent = StockItemName as any;

interface LocationRecord {
  _id: string;
  name: string;
}

interface IssuanceItem {
  stockItemId: string;
  quantity: number;
  isInflow: boolean;
  refStockItem: {
    name: string;
    imageId?: string;
    categoryName?: string;
    unitOfMeasurement?: string;
  };
}

interface IssuanceForm {
  locationId?: string;
  items: IssuanceItem[];
}

interface LocationSummary {
  locationId: string;
  locationName: string;
  quantity: number;
}

interface IssuanceSummaryItem {
  stockItemId: string;
  stockItemName: string;
  stockItemImageId?: string;
  categoryName?: string;
  unitOfMeasurement?: string;
  byLocation: Record<string, LocationSummary>;
  quantity: number;
}

interface ReportProps {
  month: dayjs.Dayjs;
  monthString: string;
  physicalStoreId?: string;
  setPageParams(params: { month: dayjs.Dayjs | null }): void;
  loading?: boolean;
  locations?: LocationRecord[];
  issuanceFormsByMonth?: IssuanceForm[];
}

class Report extends Component<ReportProps> {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,

    month: PropTypes.object,
    monthString: PropTypes.string,
    physicalStoreId: PropTypes.string,
    setPageParams: PropTypes.func,
    loading: PropTypes.bool,
    locations: PropTypes.array,
    issuanceFormsByMonth: PropTypes.array,
  };

  columns: any[] = [
    {
      title: 'Item Name',
      dataIndex: 'stockItemName',
      key: 'stockItemName',
      render: (_text: unknown, record: IssuanceSummaryItem) => {
        const { physicalStoreId } = this.props;
        const stockItem = {
          _id: record.stockItemId,
          physicalStoreId,
          name: record.stockItemName,
          imageId: record.stockItemImageId,
        };
        return <StockItemNameComponent stockItem={stockItem} />;
      },
    },
    {
      title: 'Category',
      dataIndex: 'categoryName',
      key: 'categoryName',
    },
    {
      title: 'Issued',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (text: number, record: IssuanceSummaryItem) => {
        let quantity: number | string = text;
        if (record.unitOfMeasurement !== 'quantity') {
          quantity = `${quantity} ${record.unitOfMeasurement}`;
        }

        return quantity;
      },
    },
    {
      title: 'Issued (By Location)',
      dataIndex: 'byLocation',
      key: 'byLocation',
      render: (
        byLocation: Record<string, LocationSummary>,
        record: IssuanceSummaryItem
      ) => {
        const locationIds = keys(byLocation);
        const locationNodes: React.ReactNode[] = [];
        locationIds.forEach((locationId: string) => {
          const locationObj = byLocation[locationId];
          let nodeText = `${locationObj.locationName} - ${locationObj.quantity}`;
          if (record.unitOfMeasurement !== 'quantity') {
            nodeText = `${nodeText} ${record.unitOfMeasurement}`;
          }

          locationNodes.push(<li key={locationId}>{nodeText}</li>);
        });

        return <ul>{locationNodes}</ul>;
      },
    },
  ];

  handleMonthChange = (value: dayjs.Dayjs | null) => {
    const { setPageParams } = this.props;
    setPageParams({
      month: value,
    });
  };

  handleMonthGoBack = () => {
    const { setPageParams, month } = this.props;
    setPageParams({
      month: dayjs(month).subtract(1, 'months'),
    });
  };

  handleMonthGoForward = () => {
    const { setPageParams, month } = this.props;
    setPageParams({
      month: dayjs(month).add(1, 'months'),
    });
  };

  getTableHeader = () => {
    const { month } = this.props;
    return (
      <div className="list-table-header">
        <div>
          <AntButton
            type="primary"
            shape="circle"
            icon={<AntLeftOutlined />}
            onClick={this.handleMonthGoBack}
          />
          &nbsp;&nbsp;
          <AntDatePickerMonth
            allowClear={false}
            format="MMM, YYYY"
            onChange={this.handleMonthChange}
            value={month}
          />
          &nbsp;&nbsp;
          <AntButton
            type="primary"
            shape="circle"
            icon={<AntRightOutlined />}
            onClick={this.handleMonthGoForward}
          />
        </div>
      </div>
    );
  };

  getIssuanceSummary = () => {
    const { locations = [] } = this.props;
    const locationsMap = keyBy(locations, '_id');
    const issuanceSummary: IssuanceSummaryItem[] = [];
    const issuanceSummaryMap: Record<string, IssuanceSummaryItem> = {};

    const { issuanceFormsByMonth } = this.props;
    if (!issuanceFormsByMonth) return null;
    issuanceFormsByMonth.forEach((issuanceForm: IssuanceForm) => {
      const { locationId, items } = issuanceForm;
      items.forEach((item: IssuanceItem) => {
        let summaryItem = issuanceSummaryMap[item.stockItemId];
        if (!summaryItem) {
          summaryItem = {
            stockItemId: item.stockItemId,
            stockItemName: item.refStockItem.name,
            stockItemImageId: item.refStockItem.imageId,
            categoryName: item.refStockItem.categoryName,
            unitOfMeasurement: item.refStockItem.unitOfMeasurement,
            byLocation: {},
            quantity: 0,
          };

          issuanceSummary.push(summaryItem);
          issuanceSummaryMap[item.stockItemId] = summaryItem;
        }

        if (item.isInflow) {
          summaryItem.quantity -= item.quantity;

          if (locationId && locationsMap[locationId]) {
            if (!summaryItem.byLocation[locationId]) {
              summaryItem.byLocation[locationId] = {
                locationId,
                locationName: locationsMap[locationId].name,
                quantity: -item.quantity,
              };
            } else {
              summaryItem.byLocation[locationId].quantity -= item.quantity;
            }
          }
        } else {
          summaryItem.quantity += item.quantity;

          if (locationId && locationsMap[locationId]) {
            if (!summaryItem.byLocation[locationId]) {
              summaryItem.byLocation[locationId] = {
                locationId,
                locationName: locationsMap[locationId].name,
                quantity: item.quantity,
              };
            } else {
              summaryItem.byLocation[locationId].quantity += item.quantity;
            }
          }
        }
      });
    });

    return reverse(sortBy(issuanceSummary, 'quantity'));
  };

  render() {
    const { loading } = this.props;
    if (loading) {
      return <AntSpin size="large" />;
    }

    return (
      <AntTable
        rowKey="stockItemId"
        title={this.getTableHeader}
        dataSource={this.getIssuanceSummary()}
        columns={this.columns}
        size="small"
        pagination={false}
        bordered
      />
    );
  }
}

const listQuery = gql`
  query issuanceFormsByMonth($physicalStoreId: String!, $month: String!) {
    issuanceFormsByMonth(physicalStoreId: $physicalStoreId, month: $month) {
      _id
      issueDate
      locationId
      items {
        stockItemId
        quantity
        isInflow
        refStockItem {
          _id
          name
          imageId
          categoryName
          unitOfMeasurement
        }
      }
    }
  }
`;

export default flowRight(
  withQuery(listQuery, {
    props: ({ data }: { data: Record<string, unknown> }) => ({ ...data }),
    options: ({
      physicalStoreId,
      monthString,
    }: {
      physicalStoreId?: string;
      monthString?: string;
    }) => ({
      variables: { physicalStoreId, month: monthString },
    }),
  })
)(Report as any);
