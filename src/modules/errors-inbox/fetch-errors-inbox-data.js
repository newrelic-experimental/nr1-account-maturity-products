/* eslint-disable prettier/prettier */
import { ErrorsInbox } from './ErrorsInbox';
import PromisePool from 'es6-promise-pool';
import { ERRORSINBOX_ENTITIES_SUBSCRIBER_ID_GQL } from './errors-inbox-gql';

export async function fetchErrorsInboxData(
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

function _onFulFilledHandler(event, accountMap) {
  for (const entity of event.data.result.entityArr) {
    const { accountId } = event.data.result;
    const account = accountMap.get(accountId);
    account.assignedErrorGroupCount =
      event.data.result.assignedErrorGroupCount;
    account.totalErrorGroupCount = event.data.result.totalErrorGroupCount;
    const application = new ErrorsInbox(entity, account);

    if (!account.errorsInbox) {
      account.errorsInbox = new Map();
    }

    if (!account.errorsInbox.has(entity.id)) {
      account.errorsInbox.set(application.id, application);
    }
  }
}

async function _fetchEntitiesWithAcctIdGQL(
  gqlAPI,
  account,
  queryResult = {
    entityArr: [],
    accountId: account.id,
    assignedErrorGroupCount: 0
  },
  cursor = null
) {
  const accountId = account.id;
  const endTime = new Date().getTime(); // current time
  const startTime = endTime - (7 * 24 * 60 * 60 * 1000) // current time - 7 days
  const query = {
    ...ERRORSINBOX_ENTITIES_SUBSCRIBER_ID_GQL,
    variables: {
      cursor,
      startTime,
      endTime,
      accountIds: [accountId]
    }
  };

  const response = await gqlAPI(query);
 
  if (
    !response.data.actor.errorsInbox ||
    !response.data.actor.errorsInbox.errorGroups
  ) {
    return queryResult;
  }

  const {
    results,
    nextCursor
  } = response.data.actor.errorsInbox.errorGroups;

  queryResult.entityArr = queryResult.entityArr.concat(results);
  queryResult.totalErrorGroupCount =
    response.data.actor.errorsInbox &&
    response.data.actor.errorsInbox.errorGroups &&
    response.data.actor.errorsInbox.errorGroups.totalCount
      ? response.data.actor.errorsInbox.errorGroups.totalCount
      : 0;
  queryResult.assignedErrorGroupCount =
    response.data.actor.errorsInbox &&
    response.data.actor.errorsInbox.assignedErrorGroupCount &&
    response.data.actor.errorsInbox.assignedErrorGroupCount.totalCount
      ? response.data.actor.errorsInbox.assignedErrorGroupCount.totalCount
      : 0;
  
  if (nextCursor === null || (nextCursor != null && nextCursor.length === 0)) {
    return queryResult;
  } else {
    return _fetchEntitiesWithAcctIdGQL(
      gqlAPI,
      account,
      queryResult,
      nextCursor
    );
  }
}

export const ErrorsInboxModel = {
  scoreWeights: {
    errorGroupAssignedPercentage: 0.5,
    errorGroupResolvedPercentage: 0.25,
    errorGroupIgnoredPercentage: 0.25,
    // errorGroupCommentsPercentage: 0.2 // distributed among other score percentages
  },
  rowDataEnricher: null
};
