import { Kubernetes } from './Kubernetes';
import PromisePool from 'es6-promise-pool';
import { KUBERNETES_ENTITIES_SUBSCRIBER_ID_GQL } from './kubernetes-gql';

export async function fetchKubernetesData(
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

    if (!account.kubernetesMap) account.kubernetesMap = new Map();
    for (const entity of event.data.result) {
      // entity.id = entity.guid; // entity.id not used
      const k8sEntity = new Kubernetes(entity, account);
      account.kubernetesMap.set(k8sEntity.guid, k8sEntity);
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
    ...KUBERNETES_ENTITIES_SUBSCRIBER_ID_GQL,
    variables: {
      cursor,
      nrql: `accountId=${accountId} and domain = 'INFRA' and type = 'KUBERNETESCLUSTER'`
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

export const KubernetesModel = {
  scoreWeights: {
    clustersUsingPixiePercentage: 0.1,
    infraAgentsInstalledPercentage: 0.1,
    infraK8sEventsPercentage: 0.15,
    prometheusLabelsPercentage: 0.15,
    apmAgentsInsideK8sClustersPercentage: 0.25,
    // alertingClustersPercentage: 0.15,
    // pixieUniqueServices: 0.05,
    nrLogsEventsPercentage: 0.25
  },
  rowDataEnricher: null
};
