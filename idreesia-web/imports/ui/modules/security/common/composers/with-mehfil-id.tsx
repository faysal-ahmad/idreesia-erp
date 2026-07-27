import React, { ComponentType } from "react";
import PropTypes from "prop-types";
import { get } from "lodash";

type AnyProps = Record<string, any>;

export default () => (WrappedComponent: ComponentType<AnyProps>) => {
  const WithMehfilId = (props: AnyProps) => {
    const { match } = props;
    const mehfilId = get(match, ["params", "mehfilId"], null);
    return React.createElement(WrappedComponent as any, { mehfilId, ...props });
  };

  WithMehfilId.propTypes = {
    location: PropTypes.object,
    history: PropTypes.object,
    match: PropTypes.object,
  };

  return WithMehfilId;
};
