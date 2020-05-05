import PromisePool from 'es6-promise-pool';
import { GET_MOBILE_APP_SUBSCRIBER_ID_GQL } from './mobile-gql';

export async function fetchMobileData(
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
    ...GET_MOBILE_APP_SUBSCRIBER_ID_GQL,
    variables: {
      cursor,
      nrql: `domain IN ('MOBILE') AND type IN ('APPLICATION') and accountId=${id}`
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

  // eslint-disable-next-line require-atomic-updates
  account.mobileApps = account.mobileApps.concat(entities);

  if (nextCursor === null || (nextCursor != null && nextCursor.length === 0)) {
    return { account, hasErrors };
  } else {
    return _fetchEntitiesWithAcctIdGQL(gqlAPI, account, nextCursor, hasErrors);
  }
}

export const MobileModel = {
  scoreWeights: {
    mobileTotalAppPercentage: 0.05,
    mobileLatestAgentPercentage: 0.15,
    mobileUsingBreadcrumbsPercentage: 0.15,
    mobileUsingHandledExceptionsPercentage: 0.15,
    mobileAppsActivePercentage: 0.05,
    appsWithAlertsPercentage: 0.2,
    mobileAppLaunch: 0.05
  },

  rowDataEnricher: null
};
