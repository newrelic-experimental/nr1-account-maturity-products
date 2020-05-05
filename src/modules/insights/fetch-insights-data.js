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
    options.poolOnFulfilled(event, accountMap);
  });
  await pool.start();
}

// eslint-disable-next-line no-unused-vars
function _onFulFilledHandler(event, accountMap) {
  return null;
}
async function _fetchEntitiesWithAcctIdGQL(gqlAPI, account, cursor = null) {
  const { id } = account;
  const query = {
    ...GET_INSIGHTS_ENTITIES_SUBSCRIBER_ID_GQL,
    variables: {
      cursor,
      nrql: `type IN ('DASHBOARD') and accountId=${id}`
    }
  };

  const response = await gqlAPI(query);

  if (
    !response.data.actor.entitySearch ||
    !response.data.actor.entitySearch.results
  ) {
    return account;
  }
  const { entities, nextCursor } = response.data.actor.entitySearch.results;
  account.insightsDashboards.push(entities);

  if (nextCursor === null || (nextCursor != null && nextCursor.length === 0)) {
    return account;
  } else {
    return _fetchEntitiesWithAcctIdGQL(gqlAPI, account, nextCursor);
  }
}

export const InsightsModel = {
  scoreWeights: {
    insightsUsingCustomEvents: 0.2,
    insightsHasDashboards: 0.2
  },
  rowDataEnricher: null
};
