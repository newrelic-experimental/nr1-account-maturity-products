import { Monitor } from './Monitor';
import PromisePool from 'es6-promise-pool';
import { SYNTH_ENTITIES_SUBSCRIBER_ID_GQL } from './synth-gql';

export async function fetchSynthData(
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
    const monitor = new Monitor(entity);

    if (!account.synthMonitors) {
      account.synthMonitors = new Map();
    }

    account.synthMonitors.set(monitor.guid, monitor);
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
    ...SYNTH_ENTITIES_SUBSCRIBER_ID_GQL,
    variables: {
      cursor,
      nrql: `domain IN ('SYNTH') AND type IN ('MONITOR') and accountId=${accountId}`
    }
  };

  if (tag !== null) {
    let split = tag.split(":");
    const key = split[0];
    const value = split[1];
    query = {
      ...SYNTH_ENTITIES_SUBSCRIBER_ID_GQL,
      variables: {
        cursor,
        nrql: `domain IN ('SYNTH') AND type IN ('MONITOR') and accountId=${accountId} AND tags.${key} = '${value}'`
      }
    };
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
    return _fetchEntitiesWithAcctIdGQL(gqlAPI, account, tag, entityArr, nextCursor);
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
