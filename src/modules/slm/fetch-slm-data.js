import { SLM } from './SLM';
import PromisePool from 'es6-promise-pool';
import { SLI_USED_COUNT_GQL, SLM_ENTITIES_SUBSCRIBER_ID_GQL } from './slm-gql';

export async function fetchSLMData(
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

  pool.addEventListener('fulfilled', data => {
    options.poolOnFulfilled(data, accountMap);
  });
  await pool.start().then(() => {
    // eslint-disable-next-line no-console
    console.log('### SK >>> accountMap: ', accountMap);
  });
}

async function _onFulFilledHandler(data, accountMap) {
  if (data.data.result.event.length > 0) {
    const { accountId } = data.data.result.event[0];
    const account = accountMap.get(accountId);
    account.sliNrqlConditions =
      data.data.result.sliUsed.data.actor.account.alerts.nrqlConditionsSearch;
    if (!account.slmMap) account.slmMap = new Map();
    for (const entity of data.data.result.event) {
      entity.id = entity.guid;
      const slmEntity = new SLM(entity, account);
      account.slmMap.set(slmEntity.guid, slmEntity);
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

  const searchCriteria = {
    ...SLI_USED_COUNT_GQL,
    variables: {
      accountId,
      searchCriteria: 'newrelic.sli'
    }
  };
  const sliUsed = await gqlAPI(searchCriteria);

  const query = {
    ...SLM_ENTITIES_SUBSCRIBER_ID_GQL,
    variables: {
      cursor,
      nrql: `accountId=${accountId} and type = 'SERVICE_LEVEL'`
    }
  };

  const response = await gqlAPI(query);

  if (
    !response.data.actor.entitySearch ||
    !response.data.actor.entitySearch.results
  ) {
    return { sliUsed, event: entityArr };
  }

  const { entities, nextCursor } = response.data.actor.entitySearch.results;

  entityArr = entityArr.concat(entities);

  if (nextCursor === null || (nextCursor != null && nextCursor.length === 0)) {
    return { sliUsed, event: entityArr };
  } else {
    return _fetchEntitiesWithAcctIdGQL(gqlAPI, account, entityArr, nextCursor);
  }
}

export const SLMModel = {
  scoreWeights: {
    isUsingSLI: 0.5,
    hasSLIAlerting: 0.25,
    getOwnerPercentage: 0.25
  },
  rowDataEnricher: null
};
