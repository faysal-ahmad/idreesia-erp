import { remoteCall } from "./remote-call";

export default (args, callback) => remoteCall("jobs.cancel", args, callback);
