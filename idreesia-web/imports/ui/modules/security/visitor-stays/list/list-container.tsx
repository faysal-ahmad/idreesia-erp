import React, { Component } from 'react';

import List from './list';
import { type CardVisitor } from '../card/card-container';

interface ListContainerProps {
  visitorId: string;
  showNewButton?: boolean;
  showDutyColumn?: boolean;
  showActionsColumn?: boolean;
  visitor: CardVisitor;
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
      visitor,
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
        visitor={visitor}
        setPageParams={this.setPageParams}
      />
    );
  }
}
