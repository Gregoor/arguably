import _ from 'lodash';
import {SubmissionError} from 'redux-form';

const genericErrorMessage = 'There was a problem submitting this form. Try again later.';

export const getErrors = (t) => {
  const {source} = t.getError();

  return source ? JSON.parse(source.errors[0].message) : null;
};

export const asSubmissionError = (t, fields) => {
  const errors = getErrors(t);

  if (!errors) return new SubmissionError({_error: genericErrorMessage});

  if (!fields) return new SubmissionError(errors);

  const errorMessages = _(fields).toPairs()
    .map(([field, errorTypesMessage]) => [
      field,
      _(errorTypesMessage).toPairs().map(([errorType, message]) => (
        errors[field] && errors[field].includes(errorType) ? message : null
      )).filter().join(' ')
    ])
    .fromPairs()
    .value();
  return new SubmissionError({
    ...errorMessages,
    _error: errors.message || errorMessages || genericErrorMessage
  });
};