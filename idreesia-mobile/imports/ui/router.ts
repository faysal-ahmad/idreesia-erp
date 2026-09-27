import type { ComponentType } from 'react';
import {
  HashRouter as RouterHashRouter,
  Link as RouterLink,
  Redirect as RouterRedirect,
  Route as RouterRoute,
  Switch as RouterSwitch,
  type HashRouterProps,
  type LinkProps,
  type RedirectProps,
  type RouteProps,
  type SwitchProps,
} from 'react-router-dom';

export { useHistory } from 'react-router-dom';

// @types/react-router ships a nested @types/react 19, so its components don't
// type-check as JSX against the workspace's React 18 types (idreesia-web casts
// them to any for the same reason). Re-typed here once, keeping their props.
export const HashRouter = RouterHashRouter as unknown as ComponentType<HashRouterProps>;
export const Link = RouterLink as unknown as ComponentType<LinkProps>;
export const Redirect = RouterRedirect as unknown as ComponentType<RedirectProps>;
export const Route = RouterRoute as unknown as ComponentType<RouteProps>;
export const Switch = RouterSwitch as unknown as ComponentType<SwitchProps>;

export { matchPath, useLocation, useParams } from 'react-router-dom';
