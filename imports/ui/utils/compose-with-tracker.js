import { Tracker } from 'meteor/tracker';
import { compose } from 'react-komposer';

function getTrackerLoader(reactiveMapper) {
  return (props, onData, env) => {
    if (!reactiveMapper) throw new Error('reactiveMapper must be a function');
    let trackerCleanup = null;
    const handler = Tracker.nonreactive(() =>
      Tracker.autorun(() => {
        trackerCleanup = reactiveMapper(props, onData, env);
      })
    );

    return () => {
      if (typeof trackerCleanup === 'function') trackerCleanup();
      return handler ? handler.stop() : null;
    };
  };
}

export default (fn, options) => compose(getTrackerLoader(fn), options);
