import React, { Component, type ComponentType } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import type { Dispatch } from 'redux';

import { setBreadcrumbs as setBreadcrumbsAction } from 'meteor/idreesia-common/action-creators';

type AnyProps = Record<string, unknown>;

interface WithDynamicBreadcrumbsProps extends AnyProps {
  setBreadcrumbs(breadcrumbs: string[]): void;
}

export default (getBreadcrumbs: (props: AnyProps) => string) => (
  WrappedComponent: ComponentType<AnyProps>
) => {
  class WithDynamicBreadcrumbs extends Component<WithDynamicBreadcrumbsProps> {
    static propTypes = {
      setBreadcrumbs: PropTypes.func,
    };

    componentDidMount() {
      const { setBreadcrumbs } = this.props;
      const breadcrumbs = getBreadcrumbs(this.props)
        .split(',')
        .map(str => str.trim());
      setBreadcrumbs(breadcrumbs);
    }

    componentDidUpdate(prevProps: WithDynamicBreadcrumbsProps) {
      const { setBreadcrumbs } = this.props;
      const prevBreadcrumbs = getBreadcrumbs(prevProps);
      const newBreadcrumbs = getBreadcrumbs(this.props);
      if (prevBreadcrumbs !== newBreadcrumbs) {
        const breadcrumbs = newBreadcrumbs.split(',').map(str => str.trim());
        setBreadcrumbs(breadcrumbs);
      }
    }

    render() {
      return React.createElement(WrappedComponent as any, this.props);
    }
  }

  const mapDispatchToProps = (dispatch: Dispatch) => ({
    setBreadcrumbs: (bc: string[]) => {
      dispatch(setBreadcrumbsAction(bc));
    },
  });

  const enhance = connect(
    null,
    mapDispatchToProps
  ) as unknown as (component: unknown) => ComponentType<AnyProps>;

  return enhance(WithDynamicBreadcrumbs);
};
