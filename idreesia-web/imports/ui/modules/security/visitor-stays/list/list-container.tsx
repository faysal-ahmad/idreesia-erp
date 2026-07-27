import React, { Component } from 'react';
import PropTypes from 'prop-types';

import List from './list';

const VisitorStayList = List as any;
interface ListContainerProps { visitorId: string; showNewButton?: boolean; showDutyColumn?: boolean; showActionsColumn?: boolean; }
interface ListContainerState { pageIndex: number; pageSize: number; }

export default class ListContainer extends Component<ListContainerProps, ListContainerState> {
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
      <VisitorStayList
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
