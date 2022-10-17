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
  await pool.start();
}

async function _onFulFilledHandler(data, accountMap) {
  if (data.data.result.event.length > 0) {
    const { accountId } = data.data.result.event[0];
    const account = accountMap.get(accountId);
    account.sliNrqlConditions =
      data.data.result.sliUsed && data.data.result.sliUsed.totalCount
        ? data.data.result.sliUsed
        : { totalCount: 0, nrqlConditions: [] };

    if (!account.slmMap) account.slmMap = new Map();
    for (const entity of data.data.result.event) {
      entity.id = entity.guid;
      const slmEntity = new SLM(entity, account);
      account.slmMap.set(slmEntity.guid, slmEntity);
    }
  }
}

async function _fetchNrqlConditions(
  gqlAPI,
  gql,
  responseObject = {
    nrqlConditions: [],
    totalCount: 0
  },
  cursor = null
) {
  const query = { ...gql };
  query.variables.cursor = cursor;

  const response = await gqlAPI(query);

  if (
    !response.data.actor.account.alerts ||
    !response.data.actor.account.alerts.nrqlConditionsSearch
  ) {
    return responseObject;
  }

  const { nrqlConditionsSearch } = response.data.actor.account.alerts;

  responseObject.nrqlConditions = responseObject.nrqlConditions.concat(
    nrqlConditionsSearch.nrqlConditions
  );

  responseObject.totalCount = responseObject.nrqlConditions.length;

  if (
    nrqlConditionsSearch.nextCursor === null ||
    (nrqlConditionsSearch.nextCursor != null &&
      nrqlConditionsSearch.nextCursor.length === 0)
  ) {
    return responseObject;
  } else {
    return _fetchNrqlConditions(
      gqlAPI,
      query,
      responseObject,
      nrqlConditionsSearch.nextCursor
    );
  }
}

async function _fetchEntities(gqlAPI, gql, responseArray = [], cursor = null) {
  const query = { ...gql };
  query.variables.cursor = cursor;

  const response = await gqlAPI(query);

  if (
    !response.data.actor.entitySearch ||
    !response.data.actor.entitySearch.results
  ) {
    return responseArray;
  }

  const { entities, nextCursor } = response.data.actor.entitySearch.results;

  responseArray = responseArray.concat(entities);

  if (nextCursor === null || (nextCursor != null && nextCursor.length === 0)) {
    return responseArray;
  } else {
    return _fetchEntities(gqlAPI, query, responseArray, nextCursor);
  }
}

async function _fetchEntitiesWithAcctIdGQL(gqlAPI, account) {
  const accountId = account.id;

  const searchCriteria = {
    ...SLI_USED_COUNT_GQL,
    variables: {
      cursor: null,
      accountId,
      searchCriteria: 'newrelic.sli'
    }
  };
  const sliUsed = await _fetchNrqlConditions(gqlAPI, searchCriteria);

  const entityQuery = {
    ...SLM_ENTITIES_SUBSCRIBER_ID_GQL,
    variables: {
      cursor: null,
      nrql: `accountId=${accountId} and type = 'SERVICE_LEVEL'`
    }
  };
  const entityArr = await _fetchEntities(gqlAPI, entityQuery);

  return { sliUsed, event: entityArr };
}

export const SLMModel = {
  scoreWeights: {
    isUsingSLI: 0.5,
    hasSLIAlerting: 0.25,
    getOwnerPercentage: 0.25
  },
  rowDataEnricher: null
};
