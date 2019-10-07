import { combineReducers } from 'redux';
import {
  activeModuleName,
  activeSubModuleName,
  breadcrumbs,
  loggedInUser,
} from './global-reducer';

const combinedReducer = combineReducers({
  activeModuleName,
  activeSubModuleName,
  breadcrumbs,
  loggedInUser,
});

export default combinedReducer;
