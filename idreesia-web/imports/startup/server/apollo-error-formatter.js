export const apolloErrorFormatter = error => {
  const originalError = error.originalError;
  const errorToReport = originalError || error;

  // eslint-disable-next-line no-console
  console.log(errorToReport);
  return error;
};
