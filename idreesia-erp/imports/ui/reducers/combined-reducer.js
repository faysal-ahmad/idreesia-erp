import { combineReducers } from "redux";
import {
  activeModuleName,
  activeSubModuleName,
  breadcrumbs,
} from "./global-reducer";

const combinedReducer = combineReducers({
  activeModuleName,
  activeSubModuleName,
  breadcrumbs,
});

export default combinedReducer;
