import { combineReducers } from 'redux';
import {
  activeModuleName,
  activeSubModuleName,
  loggedInUser,
} from './global-reducer';

const combinedReducer = combineReducers({
  activeModuleName,
  activeSubModuleName,
  loggedInUser,
});

export default combinedReducer;
