import { BrowserApplication } from './BrowserApplication';
import PromisePool from 'es6-promise-pool';
import { BROWSER_ENTITIES_SUBSCRIBER_ID_GQL } from './browser-gql';

export async function fetchBrowserData(
  accountMap,
  gqlAPI,
  tag,
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
      yield options.fetchEntities(gqlAPI, account, tag);
    }
  };

  const pool = new PromisePool(_getEntities(), options.poolMaxConcurreny);

  pool.addEventListener('fulfilled', event => {
    options.poolOnFulfilled(event, accountMap);
  });
  await pool.start();
}

function _onFulFilledHandler(event, accountMap) {
  for (const entity of event.data.result) {
    const { accountId } = entity;
    const account = accountMap.get(accountId);
    const application = new BrowserApplication(entity, account);

    if (!account.browserApps) {
      account.browserApps = new Map();
    }

    account.browserApps.set(application.guid, application);
  }
}
async function _fetchEntitiesWithAcctIdGQL(
  gqlAPI,
  account,
  tag,
  entityArr = [],
  cursor = null
) {
  const accountId = account.id;
  let query = {
    ...BROWSER_ENTITIES_SUBSCRIBER_ID_GQL,
    variables: {
      cursor,
      nrql: `domain IN ('BROWSER') AND type IN ('APPLICATION') and accountId=${accountId}`
    }
  };

  if (tag !== null) {
    let split = tag.split(':');
    const key = split[0];
    const value = split[1];
    query = {
      ...BROWSER_ENTITIES_SUBSCRIBER_ID_GQL,
      variables: {
        cursor,
        nrql: `domain IN ('BROWSER') AND type IN ('APPLICATION') and accountId=${accountId} AND tags.${key} = '${value}'`
      }
    }
  }

  const response = await gqlAPI(query);

  if (
    !response.data.actor.entitySearch ||
    !response.data.actor.entitySearch.results
  ) {
    return entityArr;
  }

  const { entities, nextCursor } = response.data.actor.entitySearch.results;

  entityArr = entityArr.concat(entities);

  if (nextCursor === null || (nextCursor != null && nextCursor.length === 0)) {
    return entityArr;
  } else {
    return _fetchEntitiesWithAcctIdGQL(gqlAPI, account, entityArr, nextCursor);
  }
}

export const BrowserModel = {
  scoreWeights: {
    reportingAppPercentage: 0.1,
    appsWithAlertsPercentage: 0.15,
    browserDTEnabledPercentage: 0.05,
    customApdexPercentage: 0.1,
    browserUsingPageActionsPercentage: 0.15,
    browserAutoInstrumentationUsedPercentage: 0.1,
    browserSpaAgentEnabledPercentage: 0.2
  },
  rowDataEnricher: null
};
