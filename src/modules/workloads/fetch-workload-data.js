import { Workload } from './Workload';
import PromisePool from 'es6-promise-pool';
import { WORKLOAD_ENTITIES_SUBSCRIBER_ID_GQL } from './workload-gql';

export async function fetchWorkloadData(
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

async function _onFulFilledHandler(event, accountMap) {
  if (event.data.result.length > 0) {
    const { accountId } = event.data.result[0];
    const account = accountMap.get(accountId);

    for (const entity of event.data.result) {
      entity.id = parseFloat(`${accountId}${entity.indexedAt}`);
      const workload = new Workload(entity, account);

      if (!account.workloadMap) {
        account.workloadMap = new Map();
      }
      account.workloadMap.set(workload.guid, workload);
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
    ...WORKLOAD_ENTITIES_SUBSCRIBER_ID_GQL,
    variables: {
      cursor,
      nrql: `type IN ('WORKLOAD') and accountId=${accountId}`
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

export const WorkloadModel = {
  scoreWeights: {
    reportingWorkloadsPercentage: 0.5,
    workloadsWithOwnerPercentage: 0.25,
    workloadsWithRelatedDashboardsPercentage: 0.25
  },
  rowDataEnricher: null
};
