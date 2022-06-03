import { Workload } from './Workload'
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
  // console.log('### SK >>> fetch-workload-data.fetchWorkloadData-overrides: ', overrides);
  // console.log('### SK >>> fetch-workload-data.fetchWorkloadData-accountMap: ', accountMap);
  const options = {
    fetchEntities: overrides.fetchEntities || _fetchEntitiesWithAcctIdGQL,
    poolOnFulfilled: overrides.poolOnFulfilled || _onFulFilledHandler,
    poolMaxConcurreny: overrides.poolMaxConcurreny || 50
  };
  // console.log('### SK >>> fetch-workload-data.fetchWorkloadData-options: ', options);

  const _getEntities = function*() {
    console.log('### SK >>> fetch-workload-data.pool._getEntities-accountMap.values: ', accountMap.values());
    for (const account of accountMap.values()) {
      yield options.fetchEntities(gqlAPI, account);
    }
  };

  const pool = new PromisePool(_getEntities(), options.poolMaxConcurreny);

  pool.addEventListener('fulfilled', event => {
    // console.log('### SK >>> fetch-workload-data.pool.addEventListener(event,accountMap): ', event, accountMap);
    options.poolOnFulfilled(event, accountMap);
    // console.log('### SK >>> fetch-workload-data >>>>>>>>>>>>>> after poolOnFulfilled: ');
  });

  await pool.start();
  // console.log('### SK >>> fetch-workload-data >>>>>>>>>>>>>> after await pool.start(): ');
}

function _onFulFilledHandler(event, accountMap) {
  // console.log('### SK >>> fetch-workload-data.EVENT: ', event);
  // console.log('### SK >>> fetch-workload-data.accountMap-before-loop: ',accountMap);
  for (const entity of event.data.result) {
    const { accountId } = entity;
    const account = accountMap.get(accountId);
    const workload = new Workload(entity, account);
    // workload.id = workload.guid;
    workload.id = parseFloat(`${accountId}${entity.indexedAt}`);

    if (!account.workloadViews) {
      account.workloadViews = new Map();
    }

    account.workloadViews.set(workload.guid, workload);
    // console.log('### SK >>> fetch-workload-data._onFulFilledHandler >>  ', account.workloadViews.get(workload.guid).accountId, " of ", account.workloadViews.size,  account.workloadViews);
  }

  // console.log('### SK >>> fetch-workload-data._onFulFilledHandler:accountMap-after-loop: ', accountMap);
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
      accountId,
      entityQuery: "type = 'WORKLOAD'",
      nrql: `type IN ('WORKLOAD') and accountId=${accountId}`
    }
  };
  // console.log('### SK >>> fetch-workload-data.NERDGRAPH.query: ', JSON.stringify(query, 2, null));

  const response = await gqlAPI(query);
  // console.log('### SK >>> fetch-workload-data._fetchEntitiesWithAcctIdGQL.response: ', accountId, response.data.actor.entitySearch.results.entities);

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
    reportingWorkloadsPercentage: 0.2,
    // workloadsWithAlertsPercentage: 0.2,
    alertingWorkloadsPercentage: 0.2,
    workloadsWithRelatedDashboardsPercentage: 0.2,
    workloadsWithOwnerPercentage: 0.2,
    usingLabelsPercentage: 0.2
  },
  rowDataEnricher: null
};
