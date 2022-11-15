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
    account.totalAssignedErrorGroupCount =
      event.data.result.totalAssignedErrorGroupCount;
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
    totalAssignedErrorGroupCount: 0
  },
  cursor = null
) {
  const accountId = account.id;
  const query = {
    ...ERRORSINBOX_ENTITIES_SUBSCRIBER_ID_GQL,
    variables: {
      cursor,
      accountIds: [accountId]
    }
  };

  let attemptsLeft = 3; // ### SK - try 3 attempts for each gql call
  let response = {};
  while (attemptsLeft) {
    response = await gqlAPI(query);
    if (attemptsLeft && (response.error || response.errors)) {
      // eslint-disable-next-line no-loop-func
      setTimeout(() => { attemptsLeft--; }, 200);
    } else {
      // eslint-disable-next-line require-atomic-updates
      attemptsLeft = 0;
    }
  }

  if (
    !response.data.actor.errorsInbox ||
    !response.data.actor.errorsInbox.totalErrorGroups
  ) {
    return queryResult;
  }

  const {
    results,
    nextCursor
  } = response.data.actor.errorsInbox.totalErrorGroups;

  queryResult.entityArr = queryResult.entityArr.concat(results);
  queryResult.totalErrorGroupCount =
    response.data.actor.errorsInbox &&
    response.data.actor.errorsInbox.totalErrorGroups &&
    response.data.actor.errorsInbox.totalErrorGroups.totalCount
      ? response.data.actor.errorsInbox.totalErrorGroups.totalCount
      : 0;
  queryResult.totalAssignedErrorGroupCount =
    response.data.actor.errorsInbox &&
    response.data.actor.errorsInbox.totalAssignedErrorGroupCount &&
    response.data.actor.errorsInbox.totalAssignedErrorGroupCount.totalCount
      ? response.data.actor.errorsInbox.totalAssignedErrorGroupCount.totalCount
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
    errorGroupAssignedPercentage: 0.4,
    errorGroupUnresolvedPercentage: 0.2,
    errorGroupIgnoredPercentage: 0.2,
    errorGroupCommentsPercentage: 0.2
  },
  rowDataEnricher: null
};
