import React, { Component } from 'react';
import PropTypes from 'prop-types';

import List from './list';

export default class ListContainer extends Component {
  static propTypes = {
    visitorId: PropTypes.string,
    showNewButton: PropTypes.bool,
    showDutyColumn: PropTypes.bool,
    showActionsColumn: PropTypes.bool,
  };

  state = {
    pageIndex: 0,
    pageSize: 20,
  };

  setPageParams = pageParams => {
    this.setState(pageParams);
  };

  render() {
    const {
      visitorId,
      showNewButton,
      showDutyColumn,
      showActionsColumn,
    } = this.props;
    const { pageIndex, pageSize } = this.state;

    return (
      <List
        pageIndex={pageIndex}
        pageSize={pageSize}
        visitorId={visitorId}
        showNewButton={showNewButton}
        showDutyColumn={showDutyColumn}
        showActionsColumn={showActionsColumn}
      />
    );
  }
}
