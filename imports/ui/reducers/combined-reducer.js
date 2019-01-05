import { combineReducers } from "redux";
import {
  activeModuleName,
  activeSubModuleName,
  breadcrumbs,
} from "./global-reducer";
import { listData } from "./list-reducer";

const combinedReducer = combineReducers({
  activeModuleName,
  activeSubModuleName,
  breadcrumbs,

  listData,
});

export default combinedReducer;
