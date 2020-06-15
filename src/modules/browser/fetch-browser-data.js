import { BrowserApplication } from './BrowserApplication';
import PromisePool from 'es6-promise-pool';
import { BROWSER_ENTITIES_SUBSCRIBER_ID_GQL } from './browser-gql';

export async function fetchBrowserData(
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

function _onFulFilledHandler(event, accountMap) {
  const { entityArr, hasErrors } = event.data.result;
  for (const entity of entityArr) {
    const { accountId } = entity;
    const account = accountMap.get(accountId);
    const application = new BrowserApplication(entity, account);

    if (!account.browserApps) {
      account.browserApps = new Map();
    }

    account.browserApps.set(application.guid, application);
  }
  return hasErrors;
}
async function _fetchEntitiesWithAcctIdGQL(
  gqlAPI,
  account,
  entityArr = [],
  cursor = null,
  hasErrors = false
) {
  const accountId = account.id;
  const query = {
    ...BROWSER_ENTITIES_SUBSCRIBER_ID_GQL,
    variables: {
      cursor,
      nrql: `domain IN ('BROWSER') AND type IN ('APPLICATION') and accountId=${accountId}`
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
    return { entityArr, hasErrors };
  }

  const { entities, nextCursor } = response.data.actor.entitySearch.results;

  entityArr = entityArr.concat(entities);

  if (nextCursor === null || (nextCursor != null && nextCursor.length === 0)) {
    return { entityArr, hasErrors };
  } else {
    return _fetchEntitiesWithAcctIdGQL(
      gqlAPI,
      account,
      entityArr,
      nextCursor,
      hasErrors
    );
  }
}

export const BrowserModel = {
  scoreWeights: {
    reportingAppPercentage: 0.01,
    appsWithAlertsPercentage: 0.15,
    browserDTEnabledPercentage: 0.05,
    customApdexPercentage: 0.1,
    browserUsingPageActionsPercentage: 0.15,
    browserAutoInstrumentationUsedPercentage: 0.1,
    browserSpaAgentEnabledPercentage: 0.2
  },
  rowDataEnricher: null
};
