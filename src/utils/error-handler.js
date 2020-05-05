export function handleGqlError({ response, error = null }, queryObj) {
  const { data, errors } = response;
  const { query, variables } = queryObj;
  let { id: accountId, nrql } = variables || {};

  // check if nrql has the accountId
  if (!accountId) {
    const nrqlVar = 'accountId=';
    const index = nrql ? nrql.indexOf(nrqlVar) : 0;
    if (index > 0) {
      accountId = parseInt(nrql.substring(index + nrqlVar.length));
    }
  }

  let responseTmp = {
    accountId: accountId,
    query: query,
    variables: variables
  };

  if (error && error instanceof Error) {
    // eslint-disable-next-line no-console
    console.error(`Unexpected Exception:  ${error}`);
    // eslint-disable-next-line no-console
    console.warn(`Query:  ${query}`);

    responseTmp = {
      ...responseTmp,
      data: stubData,
      errors: [{ message: `Unexpected Exception:  ${error.message}` }]
    };
  } else {
    // eslint-disable-next-line no-console
    console.error(
      `Errors returned from GraphQL ${
        !accountId || accountId.length === 0 ? '' : `for Account=${accountId}`
      }:  ${JSON.stringify(errors)}`
    );
    // eslint-disable-next-line no-console
    console.warn(`Query:  ${query}`);

    responseTmp = {
      ...responseTmp,
      data:
        typeof data === 'undefined' || (data && !data.actor) ? stubData : data,
      errors: errors.map(e => ({
        message: e.message,
        path: e.path ? e.path.join('.') : ''
      }))
    };
  }
  // console.log('RESPONSE', responseTmp);
  return responseTmp;
}

// graphql endpoints that we call
export const stubData = {
  actor: {
    account: {},
    accounts: [],
    cloud: {}
  }
};
