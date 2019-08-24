import { combineReducers } from "redux";
import {
  activeModuleName,
  activeSubModuleName,
} from "./global-reducer";

const combinedReducer = combineReducers({
  activeModuleName,
  activeSubModuleName,
});

export default combinedReducer;
