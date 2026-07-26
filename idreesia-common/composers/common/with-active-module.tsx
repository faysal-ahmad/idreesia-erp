import React, { type ComponentType } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import type { Dispatch } from 'redux';

import {
  setActiveModuleName as setActiveModuleNameAction,
  setActiveSubModuleName as setActiveSubModuleNameAction,
} from 'meteor/idreesia-common/action-creators';

type AnyProps = Record<string, unknown>;

interface ActiveModuleState {
  activeModuleName?: string | null;
  activeSubModuleName?: string | null;
}

export default () => (WrappedComponent: ComponentType<AnyProps>) => {
  const WithActiveModule = (props: AnyProps): React.ReactElement => (
    <WrappedComponent {...props} />
  );

  WithActiveModule.propTypes = {
    activeModuleName: PropTypes.string,
    activeSubModuleName: PropTypes.string,
    setActiveModuleName: PropTypes.func,
    setActiveSubModuleName: PropTypes.func,
  };

  const mapStateToProps = (state: ActiveModuleState) => ({
    activeModuleName: state.activeModuleName,
    activeSubModuleName: state.activeSubModuleName,
  });

  const mapDispatchToProps = (dispatch: Dispatch) => ({
    setActiveModuleName: (moduleName: string | null) => {
      dispatch(setActiveModuleNameAction(moduleName));
    },
    setActiveSubModuleName: (subModuleName: string | null) => {
      dispatch(setActiveSubModuleNameAction(subModuleName));
    },
  });

  const enhance = connect(
    mapStateToProps,
    mapDispatchToProps
  ) as unknown as (component: unknown) => ComponentType<AnyProps>;

  return enhance(WithActiveModule);
};
