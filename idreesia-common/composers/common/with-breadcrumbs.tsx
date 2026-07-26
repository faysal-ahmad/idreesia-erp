import React, { Component, type ComponentType } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import type { Dispatch } from 'redux';

import { setBreadcrumbs as setBreadcrumbsAction } from 'meteor/idreesia-common/action-creators';

type AnyProps = Record<string, unknown>;

interface WithBreadcrumbsProps extends AnyProps {
  setBreadcrumbs(breadcrumbs: unknown[]): void;
}

export default (breadcrumbs: unknown[]) => (
  WrappedComponent: ComponentType<AnyProps>
) => {
  class WithBreadcrumbs extends Component<WithBreadcrumbsProps> {
    static propTypes = {
      setBreadcrumbs: PropTypes.func,
    };

    componentDidMount() {
      const { setBreadcrumbs } = this.props;
      setBreadcrumbs(breadcrumbs);
    }

    render() {
      return <WrappedComponent {...this.props} />;
    }
  }

  const mapDispatchToProps = (dispatch: Dispatch) => ({
    setBreadcrumbs: (bc: unknown[]) => {
      dispatch(setBreadcrumbsAction(bc));
    },
  });

  const enhance = connect(
    null,
    mapDispatchToProps
  ) as unknown as (component: unknown) => ComponentType<AnyProps>;

  return enhance(WithBreadcrumbs);
};
