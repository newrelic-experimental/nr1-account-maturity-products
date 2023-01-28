import { Application } from './Application';
import PromisePool from 'es6-promise-pool';
import {
  APM_ENTITIES_SUBSCRIBER_ID_GQL,
  APM_ENTITIES_LOG_ATTRIBUTES_GQL
} from './apm-gql';

export async function fetchAPMData(
  accountMap,
  gqlAPI,
  overrides = {
    fetchEntities: _fetchEntitiesAndLogAttributes,
    poolOnFulfilled: _onFulFilledHandler,
    poolMaxConcurreny: 50
  }
) {
  const options = {
    fetchEntities: overrides.fetchEntities || _fetchEntitiesAndLogAttributes,
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

function _onFulFilledHandler(event, accountMap) {
  if (event.data.result.entityArr.length > 0) {
    const { accountId } = event.data.result.entityArr[0];
    const account = accountMap.get(accountId);
    if (!account.apmApps) account.apmApps = new Map();

    for (const entity of event.data.result.entityArr) {
      const logAttr = event.data.result.logAttributes.find(
        e => e.applicationGuids[0] === entity.guid); // eslint-disable-line prettier/prettier

      entity.appLoggingEnabled =
        logAttr && logAttr.attributes.length
          ? JSON.parse(logAttr.attributes[0].value.toLowerCase())
          : false;

      const application = new Application(entity, account);
      account.apmApps.set(application.guid, application);
    }
  }
}

async function _fetchEntitiesAndLogAttributes(gqlAPI, account) {
  const entityArr = await _fetchEntitiesWithAcctIdGQL(gqlAPI, account);
  const logAttributes = await _fetchEntitiesLogAttributes(gqlAPI, account);

  return {
    entityArr,
    logAttributes
  };
}

async function _fetchEntitiesWithAcctIdGQL(
  gqlAPI,
  account,
  entityArr = [],
  cursor = null
) {
  const accountId = account.id;
  const query = {
    ...APM_ENTITIES_SUBSCRIBER_ID_GQL,
    variables: {
      cursor,
      nrql: `domain IN ('APM') AND type IN ('APPLICATION') and accountId=${accountId}`
    }
  };

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

async function _fetchEntitiesLogAttributes(
  gqlAPI,
  account,
  logAttributes = [],
  cursor = ''
) {
  const accountId = account.id;
  const query = {
    ...APM_ENTITIES_LOG_ATTRIBUTES_GQL,
    variables: {
      cursor,
      accountId,
      filter: {
        equals: 'newrelic.application_logging.enabled'
      }
    }
  };
  const response = await gqlAPI(query);

  if (
    !response.data.actor.account ||
    !response.data.actor.account.dataManagement ||
    !response.data.actor.account.agentEnvironment.agentSettingsAttributes.results // eslint-disable-line prettier/prettier
  ) {
    return logAttributes;
  }

  const { results, nextCursor } = response.data.actor.account.agentEnvironment.agentSettingsAttributes; // eslint-disable-line prettier/prettier

  logAttributes = logAttributes.concat(results);

  if (nextCursor === null || (nextCursor != null && nextCursor.length === 0)) {
    return logAttributes;
  } else {
    return _fetchEntitiesLogAttributes(
      gqlAPI,
      account,
      logAttributes,
      nextCursor
    );
  }
}

export const ApmModel = {
  scoreWeights: {
    reportingAppPercentage: 0.1,
    appsWithAlertsPercentage: 0.2,
    customApdexPercentage: 0.1,
    usingLabelsPercentage: 0.12,
    apmDistributedTracingEnabledPercentage: 0.13,
    apmDeploymentMarkersPercentage: 0.15,
    apmLatestAgentPercentage: 0.1,
    apmAppLoggingEnabledPercentage: 0.1
  },
  rowDataEnricher: null
};
