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
    fetchEntities: _fetchEntitiesWithAcctIdGQL,
    poolOnFulfilled: _onFulFilledHandler,
    poolMaxConcurreny: 50
  }
) {
  const options = {
    fetchEntities: overrides.fetchEntities || _fetchEntitiesWithAcctIdGQL,
    poolOnFulfilled: overrides.poolOnFulfilled || _onFulFilledHandler,
    poolMaxConcurreny: overrides.poolMaxConcurreny || 50,
    fetchLogAttributes: _fetchEntitiesLogAttributes,
    logAttributePoolOnFulfilled: _onLogAttributeFulFilledHandler
  };

  const _getEntities = function*() {
    for (const account of accountMap.values()) {
      yield options.fetchEntities(gqlAPI, account);
    }
  };

  const _getLogForwardingAttribute = function*() {
    for (const account of accountMap.values()) {
      yield options.fetchLogAttributes(gqlAPI, account);
    }
  };

  const pool = new PromisePool(_getEntities(), options.poolMaxConcurreny);
  const logAttributePool = new PromisePool(
    _getLogForwardingAttribute(),
    options.poolMaxConcurreny
  );

  pool.addEventListener('fulfilled', event => {
    options.poolOnFulfilled(event, accountMap);
  });

  logAttributePool.addEventListener('fulfilled', event => {
    options.logAttributePoolOnFulfilled(event, accountMap);
  });

  try {
    await pool.start();
  } catch (err) {
      console.log('PromisePool error', err); // eslint-disable-line no-console, prettier/prettier
  }
  try {
    await logAttributePool.start();
  } catch (err) {
      console.log('PromisePool error', err); // eslint-disable-line no-console, prettier/prettier
  }
}

function _onFulFilledHandler(event, accountMap) {
  if (event.data.result.length > 0) {
    const { accountId } = event.data.result[0];
    const account = accountMap.get(accountId);
    if (!account.apmApps) account.apmApps = new Map();

    for (const entity of event.data.result) {
      let application = new Application(entity, account);

      // if logging attribute was added to apmApps map first, merge it with "application"
      const appLogAttribute = account.apmApps.get(application.guid);
      if (appLogAttribute !== undefined) {
        application = { ...application, ...appLogAttribute };
      }

      account.apmApps.set(application.guid, application);
    }
  }
}

function _onLogAttributeFulFilledHandler(event, accountMap) {
  if (event.data.result.length > 1) {
    const { accountId } = event.data.result[0];
    const account = accountMap.get(accountId);

    event.data.result.shift();
    for (const item of event.data.result) {
      let appLoggingEnabled = false;
      if (item.attributes.length) {
        appLoggingEnabled = JSON.parse(item.attributes[0].value.toLowerCase());
        if (appLoggingEnabled) {
          const app = account.apmApps.get(item.applicationGuids[0]);
          app.appLoggingEnabled = appLoggingEnabled;
        }
      }
    }
  }
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

  if (!logAttributes.length) {
    logAttributes.push({
      accountId: account.id
    });
  }

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
