import React, { Component } from 'react';
import PropTypes from 'prop-types';

import List from '../list/list';

export default class ListContainer extends Component {
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

  setPageParams = pageParams => {
    this.setState(pageParams);
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
