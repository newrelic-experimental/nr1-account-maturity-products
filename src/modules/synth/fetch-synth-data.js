import { Monitor } from './Monitor';
import PromisePool from 'es6-promise-pool';
import { SYNTH_ENTITIES_SUBSCRIBER_ID_GQL } from './synth-gql';

export async function fetchSynthData(
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
    const monitor = new Monitor(entity);

    if (!account.synthMonitors) {
      account.synthMonitors = new Map();
    }

    account.synthMonitors.set(monitor.guid, monitor);
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
    ...SYNTH_ENTITIES_SUBSCRIBER_ID_GQL,
    variables: {
      cursor,
      nrql: `domain IN ('SYNTH') AND type IN ('MONITOR') and accountId=${accountId}`
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

export const SynthModel = {
  scoreWeights: {
    api: {
      reportingMonitorPercentage: 0.2,
      monitorsWithAlertsPercentage: 0.2,
      usingLabelsPercentage: 0.2,
      syntheticsMonitorTypesPercentage: 0.2,
      syntheticsMonitorWithMultipleLocationsPercentage: 0.1,
      syntheticsUsingPrivateLocationsPercentage: 0.1
    },
    nonApi: {
      reportingMonitorPercentage: 0.2,
      monitorsWithAlertsPercentage: 0.2,
      usingLabelsPercentage: 0.2,
      syntheticsMonitorTypesPercentage: 0.2,
      syntheticsMonitorWithMultipleLocationsPercentage: 0.1,
      syntheticsUsingPrivateLocationsPercentage: 0.1
    }
  },
  rowDataEnricher: null
};
