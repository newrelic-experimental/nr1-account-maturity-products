import PromisePool from 'es6-promise-pool';
import { GET_INSIGHTS_ENTITIES_SUBSCRIBER_ID_GQL } from './insights-gql';

export async function fetchInsightsData(
  accountMap,
  gqlAPI,
  overrides = {
    fetchEntities: _fetchEntitiesWithAcctIdGQL,
    poolOnFulfilled: _onFulFilledHandler,
    poolMaxConcurreny: 50
  }
) {
  let hasErrors = false;
  const options = {
    fetchEntities: overrides.fetchEntities || _fetchEntitiesWithAcctIdGQL,
    poolOnFulfilled: overrides.poolOnFulfilled || _onFulFilledHandler,
    poolMaxConcurreny: overrides.poolMaxConcurreny || 50
  };

  const _getEntities = function*() {
    for (const account of accountMap.values()) {
      yield options.fetchEntities(gqlAPI, account);
    }
  };

  const pool = new PromisePool(_getEntities(), options.poolMaxConcurreny);
  pool.addEventListener('fulfilled', event => {
    const acctErrors = options.poolOnFulfilled(event, accountMap);
    if (!hasErrors) {
      hasErrors = acctErrors;
    }
  });
  await pool.start();
  return hasErrors;
}

// eslint-disable-next-line no-unused-vars
function _onFulFilledHandler(event, accountMap) {
  const { hasErrors } = event.data.result;
  return hasErrors;
}
async function _fetchEntitiesWithAcctIdGQL(
  gqlAPI,
  account,
  cursor = null,
  hasErrors = false
) {
  const { id } = account;
  const query = {
    ...GET_INSIGHTS_ENTITIES_SUBSCRIBER_ID_GQL,
    variables: {
      cursor,
      nrql: `type IN ('DASHBOARD') and accountId=${id}`
    }
  };

  const response = await gqlAPI(query);
  if (!hasErrors) {
    const { errors } = response;
    hasErrors = errors != null;
  }

  if (
    !response.data.actor.entitySearch ||
    !response.data.actor.entitySearch.results
  ) {
    return { account, hasErrors };
  }
  const { entities, nextCursor } = response.data.actor.entitySearch.results;
  account.insightsDashboards.push(entities);

  if (nextCursor === null || (nextCursor != null && nextCursor.length === 0)) {
    return { account, hasErrors };
  } else {
    return _fetchEntitiesWithAcctIdGQL(gqlAPI, account, nextCursor, hasErrors);
  }
}

export const InsightsModel = {
  scoreWeights: {
    insightsUsingCustomEvents: 0.2,
    insightsHasDashboards: 0.2
  },
  rowDataEnricher: null
};
