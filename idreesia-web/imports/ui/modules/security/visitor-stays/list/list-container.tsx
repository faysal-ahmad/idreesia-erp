import React, { Component } from 'react';

import List from './list';

interface ListContainerProps {
  visitorId: string;
  showNewButton?: boolean;
  showDutyColumn?: boolean;
  showActionsColumn?: boolean;
}

interface ListContainerState {
  pageIndex: number;
  pageSize: number;
}

export default class ListContainer extends Component<ListContainerProps, ListContainerState> {
  state = {
    pageIndex: 0,
    pageSize: 20,
  };

  setPageParams = (pageParams: Partial<ListContainerState>) => {
    this.setState(pageParams as Pick<ListContainerState, keyof ListContainerState>);
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
        setPageParams={this.setPageParams}
      />
    );
  }
}
