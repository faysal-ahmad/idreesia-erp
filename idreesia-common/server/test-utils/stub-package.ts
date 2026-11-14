// Stands in for packages that are not installed at the repository root (they
// belong to the Meteor apps) and that no unit test actually calls.
const stub = () => {
  throw new Error('This package is not available in unit tests.');
};

export default stub;
