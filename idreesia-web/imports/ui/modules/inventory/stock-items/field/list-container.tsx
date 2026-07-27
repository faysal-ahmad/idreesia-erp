import React, { Component } from 'react';
import PropTypes from 'prop-types';

import List from '../list/list';

interface StockItem {
  _id: string;
  formattedName?: string;
}

interface ListContainerProps {
  physicalStoreId?: string;
  setSelectedValue?(stockItem: StockItem): void;
}

interface ListContainerState {
  pageIndex: number;
  pageSize: number;
  categoryId: string | null;
  name: string | null;
  verifyDuration: string | null;
  stockLevel: string | null;
}

export default class ListContainer extends Component<
  ListContainerProps,
  ListContainerState
> {
  static propTypes = {
    physicalStoreId: PropTypes.string,
    setSelectedValue: PropTypes.func,
  };

  state = {
    pageIndex: 0,
    pageSize: 20,
    categoryId: null,
    name: null,
    verifyDuration: null,
    stockLevel: null,
  };

  setPageParams = (pageParams: Partial<ListContainerState>) => {
    this.setState(pageParams as Pick<ListContainerState, keyof ListContainerState>);
  };

  render() {
    const { physicalStoreId, setSelectedValue } = this.props;
    const {
      pageIndex,
      pageSize,
      categoryId,
      name,
      verifyDuration,
      stockLevel,
    } = this.state;

    return (
      <List
        pageIndex={pageIndex}
        pageSize={pageSize}
        physicalStoreId={physicalStoreId}
        categoryId={categoryId}
        name={name}
        verifyDuration={verifyDuration}
        stockLevel={stockLevel}
        setPageParams={this.setPageParams}
        handleItemSelected={setSelectedValue}
      />
    );
  }
}
