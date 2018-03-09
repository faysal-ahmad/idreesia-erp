import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { get } from 'lodash';

import { ListActionsCreator } from '/imports/ui/action-creators';

export default (listName, finderMethod) => WrappedComponent => {
  class WithListData extends Component {
    static propTypes = {
      // Criteria passed to the finder method to get the data
      pageNumber: PropTypes.number,
      itemsCount: PropTypes.number,
      filterCriteria: PropTypes.object,
      // Values returned by the finder method
      data: PropTypes.array,
      pageCount: PropTypes.number,
      // Function to call the finder method using updated criteria
      setListParams: PropTypes.func
    };

    componentWillMount() {
      const { pageNumber, itemsCount, filterCriteria, setListParams } = this.props;
      setListParams(pageNumber, itemsCount, filterCriteria);
    }

    render() {
      return <WrappedComponent {...this.props} />;
    }
  }

  const mapStateToProps = state => {
    const listData = get(state, ['listData', listName], {
      pageNumber: 1,
      itemsCount: 10,
      filterCriteria: {},
      data: [],
      pageCount: 0
    });

    return {
      pageNumber: listData.pageNumber,
      itemsCount: listData.itemsCount,
      filterCriteria: listData.filterCriteria,
      data: listData.data,
      pageCount: listData.pageCount
    };
  };

  const mapDispatchToProps = dispatch => {
    return {
      setListParams: (pageNumber, itemsCount, filterCriteria) => {
        dispatch(
          ListActionsCreator.setListParams({
            listName,
            pageNumber,
            itemsCount,
            filterCriteria,
            finderMethod
          })
        );
      }
    };
  };

  return connect(mapStateToProps, mapDispatchToProps)(WithListData);
};
